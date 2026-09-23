from django.db import models
from apps.core.models import Department, Designation, Location
from apps.employees.models import Employee

class JobOpening(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Open', 'Open'),
        ('On Hold', 'On Hold'),
        ('Closed', 'Closed')
    ]
    title = models.CharField(max_length=150)
    job_code = models.CharField(max_length=30, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='job_openings')
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    employment_type = models.CharField(max_length=30, default='Full-Time')
    experience_min = models.IntegerField(default=2)
    experience_max = models.IntegerField(default=5)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, default=800000)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, default=1400000)
    vacancies = models.IntegerField(default=1)
    description = models.TextField()
    requirements = models.TextField()
    hiring_manager = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_jobs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    opened_date = models.DateField()
    closed_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.job_code})"

class Candidate(models.Model):
    STAGE_CHOICES = [
        ('Applied', 'Applied'),
        ('Screening', 'Screening'),
        ('Shortlisted', 'Shortlisted'),
        ('Interview', 'Interview Scheduled'),
        ('Technical Round', 'Technical Round'),
        ('HR Round', 'HR Round'),
        ('Selected', 'Selected / Offer'),
        ('Rejected', 'Rejected')
    ]
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    job_opening = models.ForeignKey(JobOpening, on_delete=models.CASCADE, related_name='candidates')
    experience_years = models.FloatField(default=3.0)
    current_company = models.CharField(max_length=150, blank=True)
    current_ctc = models.DecimalField(max_digits=12, decimal_places=2, default=700000)
    expected_ctc = models.DecimalField(max_digits=12, decimal_places=2, default=1000000)
    notice_period_days = models.IntegerField(default=30)
    source = models.CharField(max_length=60, default='LinkedIn')
    resume_url = models.CharField(max_length=500, blank=True)
    stage = models.CharField(max_length=30, choices=STAGE_CHOICES, default='Applied')
    rating = models.IntegerField(default=4) # 1 to 5
    notes = models.TextField(blank=True)
    applied_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.job_opening.title}"

class Interview(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='interviews')
    interviewer = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='conducted_interviews')
    interview_type = models.CharField(max_length=50, choices=[
        ('Screening', 'HR Screening'),
        ('Technical', 'Technical Evaluation'),
        ('System Design', 'System Architecture'),
        ('Managerial', 'Managerial Round'),
        ('Culture Fit', 'Culture & Leadership')
    ], default='Technical')
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    meeting_link = models.URLField(blank=True, default='https://meet.google.com/pph-rec-core')
    feedback = models.TextField(blank=True)
    rating = models.IntegerField(default=0) # 1 to 5
    result = models.CharField(max_length=30, choices=[
        ('Pending', 'Pending'),
        ('Passed', 'Passed'),
        ('Needs Second Opinion', 'Needs Second Opinion'),
        ('Rejected', 'Rejected')
    ], default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.candidate.name} - {self.interview_type} on {self.scheduled_date}"
