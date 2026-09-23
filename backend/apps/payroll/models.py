from django.db import models
from apps.employees.models import Employee

class PayrollRun(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Processing', 'Processing'),
        ('Calculated', 'Calculated / Reviewed'),
        ('Approved', 'Approved'),
        ('Disbursed', 'Disbursed / Completed')
    ]
    month = models.IntegerField() # 1 to 12
    year = models.IntegerField(default=2026)
    title = models.CharField(max_length=100)
    total_employees = models.IntegerField(default=0)
    total_gross = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_net = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Draft')
    processed_date = models.DateField(null=True, blank=True)
    disbursement_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('month', 'year')

    def __str__(self):
        return f"Payroll {self.title} - {self.status}"

class Payslip(models.Model):
    STATUS_CHOICES = [
        ('Generated', 'Generated'),
        ('Paid', 'Paid / Credited'),
        ('On Hold', 'On Hold')
    ]
    payslip_number = models.CharField(max_length=50, unique=True)
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='payslips')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')
    month = models.IntegerField()
    year = models.IntegerField()
    
    # Earnings (Monthly)
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    hra = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    special_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    performance_bonus = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    overtime_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    gross_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Deductions
    provident_fund = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    professional_tax = models.DecimalField(max_digits=12, decimal_places=2, default=200.00)
    income_tax_tds = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Net
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Generated')
    payment_date = models.DateField(null=True, blank=True)
    working_days = models.IntegerField(default=22)
    paid_days = models.FloatField(default=22.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payslip_number} - {self.employee.full_name} ({self.month}/{self.year})"
