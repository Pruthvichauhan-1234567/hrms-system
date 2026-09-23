from django.db import models
from django.contrib.auth.models import User

class Location(models.Model):
    name = models.CharField(max_length=150)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20, blank=True)
    is_headquarters = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.city}"

class Department(models.Model):
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=20, unique=True)
    head_name = models.CharField(max_length=150, blank=True, null=True)
    head_email = models.EmailField(blank=True, null=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='departments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Designation(models.Model):
    name = models.CharField(max_length=120)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='designations')
    level = models.CharField(max_length=50, choices=[
        ('Junior', 'Junior Level'),
        ('Mid', 'Mid Level'),
        ('Senior', 'Senior Level'),
        ('Lead', 'Team Lead'),
        ('Manager', 'Managerial'),
        ('Executive', 'Executive / C-Suite')
    ], default='Mid')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('name', 'department')

    def __str__(self):
        return f"{self.name} ({self.department.code})"

class Team(models.Model):
    name = models.CharField(max_length=120)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='teams')
    team_lead_name = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.department.name}"

class CompanySetting(models.Model):
    company_name = models.CharField(max_length=200, default='PeoplePulse Technologies India Pvt. Ltd.')
    legal_name = models.CharField(max_length=200, default='PeoplePulse Tech Solutions Pvt. Ltd.')
    contact_email = models.EmailField(default='hr@peoplepulse.io')
    contact_phone = models.CharField(max_length=50, default='+91 (080) 4567-8900')
    website = models.URLField(default='https://peoplepulse.io')
    address = models.TextField(default='Outer Ring Road, Bellandur, Tech Corridor, Bengaluru, Karnataka 560103')
    currency = models.CharField(max_length=10, default='INR (₹)')
    fiscal_year_start = models.CharField(max_length=20, default='April 1st')
    working_days_per_week = models.IntegerField(default=5)
    default_work_hours_per_day = models.FloatField(default=8.5)
    attendance_grace_period_mins = models.IntegerField(default=15)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name

class Notification(models.Model):
    CATEGORY_CHOICES = [
        ('Leave', 'Leave Request'),
        ('Attendance', 'Attendance Alert'),
        ('Recruitment', 'Recruitment Update'),
        ('Payroll', 'Payroll Processed'),
        ('Document', 'Document Expiry'),
        ('Asset', 'Asset Assignment'),
        ('Performance', 'Performance Review'),
        ('System', 'System Announcement'),
    ]
    title = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='System')
    priority = models.CharField(max_length=20, choices=[('Low', 'Low'), ('Normal', 'Normal'), ('High', 'High'), ('Urgent', 'Urgent')], default='Normal')
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    recipient_role = models.CharField(max_length=50, default='All') # 'All', 'Admin', 'Manager', 'Employee'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.category}] {self.title}"
