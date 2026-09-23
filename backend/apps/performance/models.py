from django.db import models
from apps.employees.models import Employee

class PerformanceCycle(models.Model):
    STATUS_CHOICES = [
        ('Upcoming', 'Upcoming'),
        ('Active', 'Active Goal Setting'),
        ('Review Phase', 'Mid/Annual Review'),
        ('Closed', 'Closed & Calibrated')
    ]
    title = models.CharField(max_length=150)
    cycle_type = models.CharField(max_length=50, choices=[('Annual', 'Annual Review'), ('Half-Yearly', 'Half-Yearly'), ('Quarterly', 'Quarterly Q1-Q4')], default='Annual')
    start_date = models.DateField()
    end_date = models.DateField()
    review_due_date = models.DateField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class Goal(models.Model):
    CATEGORY_CHOICES = [
        ('Engineering', 'Engineering & Tech Excellence'),
        ('Business', 'Business Impact & Revenue'),
        ('Leadership', 'Team Leadership & Mentorship'),
        ('Process', 'Process & Quality Improvement'),
        ('Personal Development', 'Skill Growth & Learning')
    ]
    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('On Track', 'On Track'),
        ('At Risk', 'At Risk'),
        ('Completed', 'Completed')
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='goals')
    cycle = models.ForeignKey(PerformanceCycle, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Engineering')
    metric_target = models.CharField(max_length=150, blank=True)
    progress = models.IntegerField(default=0) # 0 to 100
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='In Progress')
    due_date = models.DateField()
    weightage = models.IntegerField(default=25) # %
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.full_name} - {self.title} ({self.progress}%)"

class PerformanceReview(models.Model):
    STATUS_CHOICES = [
        ('Self Assessment Pending', 'Self Assessment Pending'),
        ('Manager Review Pending', 'Manager Review Pending'),
        ('Under Discussion', 'Under Discussion'),
        ('Finalized', 'Finalized & Signed Off')
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='conducted_reviews')
    cycle = models.ForeignKey(PerformanceCycle, on_delete=models.CASCADE, related_name='reviews')
    
    # Content
    key_achievements = models.TextField(blank=True)
    core_strengths = models.TextField(blank=True)
    improvement_areas = models.TextField(blank=True)
    manager_feedback = models.TextField(blank=True)
    self_assessment_notes = models.TextField(blank=True)
    
    # Ratings (1.0 to 5.0)
    technical_skills_rating = models.FloatField(default=4.0)
    communication_rating = models.FloatField(default=4.0)
    teamwork_rating = models.FloatField(default=4.0)
    overall_rating = models.FloatField(default=4.2)
    
    promotion_recommended = models.BooleanField(default=False)
    salary_hike_recommended_percent = models.FloatField(default=12.0)
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='Finalized')
    review_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review: {self.employee.full_name} ({self.cycle.title}) - Rating: {self.overall_rating}"
