import os
import json
import pandas as pd
import numpy as np
import joblib
import shap
from django.http import JsonResponse
from django.conf import settings
from django.db.models import Count, Avg
from .models import StudentOverview  # Make sure this matches your models.py!
from django.http import JsonResponse
from .ml_engine import engine  # <--- This imports your new ML logic!

def prescriptive_ai_view(request, student_id):
    try:
        # Generate the dynamic data using your Random Forest model
        data = engine.generate_prescriptive_payload(student_id)
        
        return JsonResponse(data)
        
    except ValueError as e:
        # Catch "Student Not Found" errors
        return JsonResponse({"error": str(e)}, status=404)
    except Exception as e:
        # Catch unexpected ML crashes
        return JsonResponse({"error": str(e)}, status=500)

from django.http import JsonResponse
from .ml_engine import engine  # Make sure the engine is imported!

def overview_dashboard_view(request):
    try:
        # 1. Get the live SHAP calculated table rows
        live_queue = engine.get_high_risk_queue(limit=10)
        
        # 2. Get the live chart data we just wrote
        live_stats = engine.get_dashboard_stats()
        
        # 3. Combine them into the exact payload React expects
        data = {
            "cards": live_stats["cards"],
            "donut_chart": live_stats["donut_chart"],
            "bar_chart": live_stats["bar_chart"],
            "high_risk_queue": live_queue
        }
        
        return JsonResponse(data)
        
    except Exception as e:
        print("🚨 CRASH REASON:", repr(e))  # <--- ADD THIS LINE
        return JsonResponse({"error": str(e)}, status=500)

# 1. MACHINE LEARNING SETUP
# ==========================================
# Paths
MODEL_PATH = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'models', 'final_random_forest.pkl'))
DATA_PATH = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'data', 'processed', 'student_clustered.csv'))

# Load the model
rf_model = joblib.load(MODEL_PATH)

# Class mapping (0, 1, 2, 3)
CLASS_MAPPING = {
    0: "Fail",
    1: "Withdrawn",
    2: "Pass",
    3: "Distinction"
}

# The EXACT features required by the model
EXPECTED_FEATURES = [
    'total_clicks', 'active_days', 'avg_daily_clicks', 'engagement_span_days', 
    'activity_density', 'click_std', 'daily_click_mean', 'click_cv', 
    'unique_sites_visited', 'clicks_early', 'clicks_mid', 'clicks_late', 
    'early_engagement_ratio', 'assessment_mean_score', 'assessment_median_score', 
    'assessment_max_score', 'assessment_min_score', 'assessment_std_score', 
    'assessment_count', 'weighted_score_total', 'weighted_score_mean', 
    'avg_submission_day', 'first_submission_day', 'last_submission_day', 
    'submission_day_std'
]


# ==========================================
# VIEW 1: OVERVIEW DASHBOARD (ORM)
# ==========================================
def get_overview_stats(request):
    try:
        # 1. Top Metric Cards
        total_records = StudentOverview.objects.count()
        high_risk = StudentOverview.objects.filter(risk_level='High').count()
        critical_risk = StudentOverview.objects.filter(risk_level='Critical').count()
        avg_score = StudentOverview.objects.aggregate(Avg('risk_score'))['risk_score__avg'] or 0

        # 2. Donut Chart (Sending BOTH sets of keys to satisfy Recharts and your Custom Legend)
        segments_qs = StudentOverview.objects.values('cluster_name').annotate(count=Count('cluster_name'))
        donut_chart = []
        for item in segments_qs:
            donut_chart.append({
                "name": item['cluster_name'],          # Used by Recharts PieChart
                "value": item['count'],                # Used by Recharts PieChart
                "cluster_name": item['cluster_name'],  # Used by your custom Legend UI
                "count": item['count']                 # Used by your custom Legend UI
            })
        
        # 3. Bar Chart 
        risk_overview = list(StudentOverview.objects.values('risk_level').annotate(count=Count('risk_level')))

        # 4. High Risk Queue
        queue_qs = StudentOverview.objects.filter(
            risk_level__in=['High', 'Critical']
        ).order_by('-risk_score')[:10].values(
            'id_student', 'code_module', 'risk_level', 'cluster_name', 'risk_score', 'key_risk_factors' 
        ) # <-- Added key_risk_factors here
        
        # Sanitize the queue data so React doesn't trip on Null values
        queue_students = []
        for item in queue_qs:
            student = dict(item)
            module_val = item.get('code_module') or ''
            student['code_module'] = module_val
            student['module'] = module_val # Backup key in case React expects 'item.module'
            queue_students.append(student)

        return JsonResponse({
            "cards": {
                "total_students": total_records,
                "high_risk": high_risk,
                "critical_risk": critical_risk,
                "avg_score": round(avg_score, 2),
                "at_risk_count": high_risk + critical_risk 
            },
            "donut_chart": donut_chart,
            "bar_chart": risk_overview,
            "queue": queue_students
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ==========================================
# VIEW 2: STUDENT ANALYTICS (MACHINE LEARNING)
# ==========================================
def student_analytics_view(request, student_id):
    try:
        student_id = int(student_id)
        df = pd.read_csv(DATA_PATH)
        
        # Find the student
        student_data = df[df['id_student'] == student_id]
        if student_data.empty:
            return JsonResponse({"error": "Student not found"}, status=404)
            
        student_series = student_data.iloc[0]

        # Filter the DataFrame to ONLY the expected features
        X_student = student_data[EXPECTED_FEATURES]
        
        # Predictions
        probabilities = rf_model.predict_proba(X_student)[0]
        predicted_class_idx = int(np.argmax(probabilities)) # <--- Forces sync with the pie chart
        predicted_outcome = CLASS_MAPPING.get(predicted_class_idx, "Unknown")
        
        # Calculate Entropy
        prediction_entropy = -np.sum([p * np.log2(p) for p in probabilities if p > 0])
        
        # Generate SHAP Values dynamically
        explainer = shap.TreeExplainer(rf_model)
        shap_values = explainer.shap_values(X_student)
        
        # Extract SHAP values for the predicted class
        if isinstance(shap_values, list):
            target_shap_values = shap_values[predicted_class_idx][0]
        elif len(shap_values.shape) == 3:
            target_shap_values = shap_values[0, :, predicted_class_idx]
        else:
            target_shap_values = shap_values[0]
            
        # Match features with their impacts and find top 5
        feature_impacts = []
        for i, feature in enumerate(EXPECTED_FEATURES):
            feature_impacts.append({
                "feature": feature.replace('_', ' ').title(),
                "impact": round(float(target_shap_values[i]), 3)
            })
            
        # Sort by absolute impact to get the top drivers
        feature_impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
        top_shap_factors = feature_impacts


        # ==========================================
        # DYNAMIC CLUSTER STATISTICS CALCULATION
        # ==========================================
        student_cluster = str(student_series.get('cluster_name', 'Standard Segment'))
        
        # 1. Map the custom descriptive sentences for each cluster
        cluster_descriptions = {
            "Early Dropouts": "Low early engagement and participation. Higher likelihood of withdrawal.",
            "Consistent Learners": "Steady engagement throughout the course. Stable and consistent learning patterns.",
            "High Achievers": "Strong academic performance and engagement. Consistently above-average outcomes.",
            "Struggling Learners": "Weak performance with inconsistent engagement. Requires focused intervention.",
            "Academically At-Risk Students": "Signs of academic difficulty despite participation. May require targeted academic support.",
            "Academically At-Risk": "Signs of academic difficulty despite participation. May require targeted academic support." 
        }
        
        # 2. Calculate REAL counts directly from the ML Engine CSV (Perfect Sync with Overview)
        total_all_students = len(engine.df)
        cluster_df = engine.df[engine.df['cluster_name'] == student_cluster]
        cluster_count = len(cluster_df)
        
        cluster_percentage = round((cluster_count / total_all_students) * 100, 2) if total_all_students > 0 else 0
        
        # 3. Calculate REAL average risk score from the ML Engine CSV
        if 'behavior_risk_index' in cluster_df.columns:
            avg_risk_score = round(float(cluster_df['behavior_risk_index'].mean()), 2)
        else:
            avg_risk_score = 0.0
            
        # 4. Determine Common Outcome
        cluster_outcome_map = {
            "High Achievers": "Distinction",
            "Consistent Learners": "Pass",
            "Struggling Learners": "Pass / Fail",
            "Academically At-Risk Students": "Fail",
            "Academically At-Risk": "Fail", 
            "Early Dropouts": "Fail / Withdraw"
        }
        common_outcome = cluster_outcome_map.get(student_cluster, "Unknown")

        # ==========================================
        # FORMAT FINAL JSON RESPONSE
        # ==========================================
        
        # 1. Fetch real digital twins and the similarity score
        real_twins, calculated_similarity_score = engine.get_digital_twins(student_series)

        # 2. Find successful peers in the EXACT SAME CLUSTER
        if 'final_result' in engine.df.columns:
            successful_peers = engine.df[
                (engine.df['cluster_name'] == student_cluster) & 
                (engine.df['final_result'].isin(['Pass', 'Distinction']))
            ]
            
            # Fallback: If no one in this specific cluster passed, use all passing students globally
            if successful_peers.empty:
                successful_peers = engine.df[engine.df['final_result'].isin(['Pass', 'Distinction'])]
        else:
            successful_peers = engine.df
            
        if successful_peers.empty:
            successful_peers = engine.df

        # 3. Safely calculate the mean for the peer group, scrubbing any NaN/Inf issues
        def get_peer_avg(col_name, default_val):
            if col_name in successful_peers.columns:
                val = successful_peers[col_name].replace([np.inf, -np.inf], np.nan).mean()
                return float(val) if not np.isnan(val) else default_val
            return default_val

        peer_assessment_mean = get_peer_avg('assessment_mean_score', 78.0)
        peer_total_clicks = get_peer_avg('total_clicks', 850.0)
        peer_early_eng = get_peer_avg('early_engagement_ratio', 0.43)
        peer_weighted_score = get_peer_avg('weighted_score_total', 520.0)
        
        response_data = {
            "student_id": str(student_id),
            "cluster": student_cluster,
            "risk_level": str(student_series.get('risk_level', 'Moderate')),
            "risk_score": str(student_series.get('risk_score', '2.5/4')),
            "predicted_outcome": predicted_outcome,
            "behavioral_risk_index": str(student_series.get('behavior_risk_index', '1.2/4')),
            "prediction_entropy": round(float(prediction_entropy), 3),
            
            "probabilities": [
                {"name": CLASS_MAPPING[0], "value": round(probabilities[0] * 100, 2), "fill": "#EF4444"},
                {"name": CLASS_MAPPING[1], "value": round(probabilities[1] * 100, 2), "fill": "#9CA3AF"},
                {"name": CLASS_MAPPING[2], "value": round(probabilities[2] * 100, 2), "fill": "#10B981"},
                {"name": CLASS_MAPPING[3], "value": round(probabilities[3] * 100, 2), "fill": "#3B82F6"}
            ],
            
            "shap_factors": top_shap_factors,
            
            # --- NEW DYNAMIC CLUSTER DATA INJECTED HERE ---
            "cluster_description": cluster_descriptions.get(student_cluster, "Students in this cluster exhibit specific behavioral patterns affecting their outcomes."),
            "cluster_student_count": cluster_count,
            "cluster_percentage": cluster_percentage,
            "cluster_avg_risk_score": avg_risk_score,
            "cluster_common_outcome": common_outcome,
            
            "similarity_score": calculated_similarity_score,
            "peer_comparison": [
                {"metric": "Assessment Mean Score", "student": float(student_series.get('assessment_mean_score', 0)), "peers": round(peer_assessment_mean, 1)},
                {"metric": "Total Clicks", "student": float(student_series.get('total_clicks', 0)), "peers": round(peer_total_clicks, 1)},
                {"metric": "Early Engagement Ratio", "student": float(student_series.get('early_engagement_ratio', 0)), "peers": round(peer_early_eng, 3)},
                {"metric": "Weighted Total Score", "student": float(student_series.get('weighted_score_total', 0)), "peers": round(peer_weighted_score, 1)}
            ],
            "digital_twins": real_twins,
            "improvement_gaps": [
                {"metric": "Weighted Score Total", "current": float(student_series.get('weighted_score_total', 0)), "target": round(peer_weighted_score, 1)},
                {"metric": "Assessment Mean Score", "current": float(student_series.get('assessment_mean_score', 0)), "target": round(peer_assessment_mean, 1)}
            ]
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)