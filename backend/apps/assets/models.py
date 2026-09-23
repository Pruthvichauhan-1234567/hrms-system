from django.db import models
from apps.employees.models import Employee

class Asset(models.Model):
    CATEGORY_CHOICES = [
        ('Laptop', 'Laptop / MacBook'),
        ('Desktop', 'Desktop Workstation'),
        ('Monitor', 'External Monitor'),
        ('Mobile Phone', 'Company Smartphone'),
        ('Peripherals', 'Keyboard / Mouse / Headset'),
        ('Security Key', 'Security Key / Biometric Card'),
        ('Office Furniture', 'Ergonomic Chair / Desk')
    ]
    STATUS_CHOICES = [
        ('Available', 'Available in Stock'),
        ('Assigned', 'Assigned to Employee'),
        ('Under Maintenance', 'Under Maintenance / Repair'),
        ('Retired', 'Retired / Scrapped')
    ]
    CONDITION_CHOICES = [
        ('Brand New', 'Brand New'),
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
        ('Needs Service', 'Needs Service')
    ]

    asset_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default='Laptop')
    brand_model = models.CharField(max_length=150, default='Apple MacBook Pro M3')
    serial_number = models.CharField(max_length=100, unique=True)
    purchase_date = models.DateField()
    warranty_expiry = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=12, decimal_places=2, default=120000.00)
    condition = models.CharField(max_length=30, choices=CONDITION_CHOICES, default='Excellent')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Available')
    
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_assets')
    assigned_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.asset_id} - {self.name} ({self.status})"

class MaintenanceRecord(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenance_logs')
    service_provider = models.CharField(max_length=150, default='Official Brand Service Center')
    issue_description = models.TextField()
    service_date = models.DateField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    resolved_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=[('Open', 'Open'), ('In Progress', 'In Progress'), ('Resolved', 'Resolved')], default='Resolved')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Maintenance: {self.asset.asset_id} on {self.service_date}"
