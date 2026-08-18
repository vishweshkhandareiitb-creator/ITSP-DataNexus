from django.db import models

class StudentOverview(models.Model):
    # Django will automatically create an auto-incrementing id field as the primary key
    code_module = models.CharField(max_length=20)
    code_presentation = models.CharField(max_length=20)
    id_student = models.CharField(max_length=50)
    risk_level = models.CharField(max_length=20)   # Low, Medium, High, Critical
    cluster_name = models.CharField(max_length=50) # High Achievers, Early Dropouts, etc.
    risk_score = models.FloatField()               # e.g., 1.20
    key_risk_factors = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.id_student} ({self.code_module})"