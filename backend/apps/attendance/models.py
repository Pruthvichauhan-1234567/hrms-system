from django.db import models
from apps.employees.models import Employee

class Shift(models.Model):
    name = models.CharField(max_length=80)
    code = models.CharField(max_length=20, unique=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    grace_time_minutes = models.IntegerField(default=15)
    break_duration_minutes = models.IntegerField(default=60)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

class Holiday(models.Model):
    name = models.CharField(max_length=150)
    date = models.DateField(unique=True)
    day_of_week = models.CharField(max_length=20, blank=True)
    holiday_type = models.CharField(max_length=30, choices=[
        ('National', 'National Holiday'),
        ('Gazetted', 'Gazetted Holiday'),
        ('Restricted', 'Restricted / Optional')
    ], default='National')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.date})"

class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Late', 'Late'),
        ('Half Day', 'Half Day'),
        ('Absent', 'Absent'),
        ('On Leave', 'On Leave'),
        ('Work From Home', 'Work From Home'),
        ('Holiday', 'Holiday')
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    work_hours = models.FloatField(default=0.0)
    overtime_hours = models.FloatField(default=0.0)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Present')
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True)
    check_in_location = models.CharField(max_length=100, blank=True, default='Bengaluru Campus')
    ip_address = models.CharField(max_length=50, blank=True, default='192.168.1.45')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.emp_id} - {self.date} ({self.status})"

class AttendanceCorrection(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_corrections')
    date = models.DateField()
    requested_check_in = models.TimeField()
    requested_check_out = models.TimeField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('Pending', 'Pending Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected')
    ], default='Pending')
    manager_remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.full_name} Correction for {self.date}"
