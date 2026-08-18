from django.urls import path
from . import views

urlpatterns = [
    # This handles http://127.0.0.1:8000/api/overview/
    # path('overview/', views.get_overview_stats, name='overview_stats'),
    
    path('overview/', views.overview_dashboard_view, name='overview_dashboard'),
    path('analytics/<str:student_id>/', views.student_analytics_view, name='student_analytics'),

    path('prescriptive-ai/<int:student_id>/', views.prescriptive_ai_view, name='prescriptive_ai'),
    
]