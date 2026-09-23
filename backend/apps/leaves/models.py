from django.db import models
from apps.employees.models import Employee

class LeaveType(models.Model):
    name = models.CharField(max_length=60, unique=True)
    code = models.CharField(max_length=20, unique=True)
    days_allowed_per_year = models.IntegerField(default=12)
    is_paid = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    color_code = models.CharField(max_length=20, default='#4F46E5')

    def __str__(self):
        return f"{self.name} ({self.code})"

class LeaveBalance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year = models.IntegerField(default=2026)
    total_allocated = models.FloatField(default=12.0)
    used = models.FloatField(default=0.0)
    pending = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('employee', 'leave_type', 'year')

    @property
    def available(self):
        return max(0.0, self.total_allocated - self.used - self.pending)

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.code}: {self.available} left"

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled')
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    days_count = models.FloatField(default=1.0)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    manager_remarks = models.TextField(blank=True)
    action_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_leaves')
    action_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.full_name} ({self.leave_type.code}): {self.start_date} to {self.end_date} [{self.status}]"
