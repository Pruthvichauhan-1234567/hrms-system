from django.db import models
from apps.core.models import Department, Designation, Location, Team

class Employee(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Non-Binary', 'Non-Binary'),
        ('Prefer Not to Say', 'Prefer Not to Say')
    ]
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Probation', 'Probation'),
        ('On Notice', 'On Notice'),
        ('Resigned', 'Resigned'),
        ('Terminated', 'Terminated')
    ]
    TYPE_CHOICES = [
        ('Full-Time', 'Full-Time'),
        ('Part-Time', 'Part-Time'),
        ('Contract', 'Contract'),
        ('Intern', 'Intern')
    ]
    WORK_MODE_CHOICES = [
        ('On-Site', 'On-Site'),
        ('Hybrid', 'Hybrid'),
        ('Remote', 'Remote')
    ]

    # Primary Identification
    emp_id = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30)
    avatar_url = models.CharField(max_length=500, blank=True)
    
    # Personal Info
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=30, choices=GENDER_CHOICES, default='Prefer Not to Say')
    marital_status = models.CharField(max_length=30, blank=True, default='Single')
    blood_group = models.CharField(max_length=10, blank=True, default='O+')
    
    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=80, default='Bengaluru')
    state = models.CharField(max_length=80, default='Karnataka')
    country = models.CharField(max_length=80, default='India')
    postal_code = models.CharField(max_length=20, blank=True, default='560001')

    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_relation = models.CharField(max_length=60, blank=True)
    emergency_contact_phone = models.CharField(max_length=30, blank=True)

    # Work & Organization
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    
    joining_date = models.DateField()
    employment_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='Full-Time')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    work_mode = models.CharField(max_length=30, choices=WORK_MODE_CHOICES, default='Hybrid')
    
    # Compensation details (in INR)
    annual_ctc = models.DecimalField(max_digits=12, decimal_places=2, default=900000.00)
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=450000.00)
    hra = models.DecimalField(max_digits=12, decimal_places=2, default=225000.00)
    special_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=225000.00)

    # Banking & Statutory
    bank_name = models.CharField(max_length=100, default='HDFC Bank')
    account_number = models.CharField(max_length=50, blank=True, default='50100492819283')
    ifsc_code = models.CharField(max_length=30, blank=True, default='HDFC0001234')
    pan_number = models.CharField(max_length=20, blank=True, default='ABCDE1234F')
    uan_number = models.CharField(max_length=30, blank=True, default='101293847561')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.emp_id} - {self.full_name}"
