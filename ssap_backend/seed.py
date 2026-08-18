import os
import csv
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ssap_backend.settings')
django.setup()

from analytics.models import StudentOverview

def load_data():
    print("Clearing old database entries...")
    StudentOverview.objects.all().delete()
    
    csv_file_path = '../data/processed/student_clustered.csv' 
    
    print("Reading CSV and seeding database...")
    students_to_create = []
    seen_ids = set() # Track IDs we have already processed
    duplicate_count = 0

    with open(csv_file_path, mode='r') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            s_id = row['id_student']
            
            # If we've already added this student ID, skip this row
            if s_id in seen_ids:
                duplicate_count += 1
                continue
                
            seen_ids.add(s_id)
            
            student = StudentOverview(
                id_student=s_id,
                risk_level=row['risk_level'],
                cluster_name=row['cluster_name'],
                risk_score=float(row['risk_score']),
                key_risk_factors="" 
            )
            students_to_create.append(student)
            
            if len(students_to_create) >= 1000:
                StudentOverview.objects.bulk_create(students_to_create)
                students_to_create = []
                
        if students_to_create:
            StudentOverview.objects.bulk_create(students_to_create)
            
    print(f"Database successfully seeded with {StudentOverview.objects.count()} unique students!")
    if duplicate_count > 0:
        print(f"Skipped {duplicate_count} duplicate rows found in the CSV.")

if __name__ == '__main__':
    load_data()