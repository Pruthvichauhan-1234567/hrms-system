from django.db import models
from apps.employees.models import Employee

class Document(models.Model):
    TYPE_CHOICES = [
        ('Aadhaar / ID Card', 'Aadhaar / Passport / ID Card'),
        ('PAN Card', 'PAN Card Document'),
        ('Offer Letter', 'Offer Letter'),
        ('Employment Agreement', 'Employment Agreement / Contract'),
        ('Education Degree', 'Educational Certificate'),
        ('Experience Letter', 'Previous Experience Letter'),
        ('Company Policy', 'Company Policy Handbook'),
        ('NDA', 'Non-Disclosure Agreement'),
        ('Health Insurance', 'Health Insurance Card')
    ]
    STATUS_CHOICES = [
        ('Verified', 'Verified'),
        ('Pending Verification', 'Pending Verification'),
        ('Expired', 'Expired'),
        ('Rejected', 'Rejected')
    ]
    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Employment Agreement')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    is_company_wide = models.BooleanField(default=False)
    file_url = models.CharField(max_length=500, blank=True)
    file_size_kb = models.IntegerField(default=512)
    file_format = models.CharField(max_length=10, default='PDF')
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Verified')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        owner = self.employee.full_name if self.employee else "Company-Wide"
        return f"{self.title} ({owner})"
