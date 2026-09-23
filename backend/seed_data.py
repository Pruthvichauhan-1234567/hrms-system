import os
import sys
import django
from datetime import date, datetime, time, timedelta
from decimal import Decimal
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms_core.settings')
django.setup()

from apps.core.models import Location, Department, Designation, Team, CompanySetting, Notification
from apps.employees.models import Employee
from apps.recruitment.models import JobOpening, Candidate, Interview
from apps.attendance.models import Shift, Holiday, AttendanceRecord
from apps.leaves.models import LeaveType, LeaveBalance, LeaveRequest
from apps.payroll.models import PayrollRun, Payslip
from apps.performance import models as perf_models
from apps.documents.models import Document
from apps.assets.models import Asset, MaintenanceRecord

def run_seed():
    print("[+] Starting PeoplePulse HRMS Database Seeding...")

    # 1. Company Settings
    setting, _ = CompanySetting.objects.get_or_create(
        id=1,
        defaults={
            'company_name': 'PeoplePulse Technologies India Pvt. Ltd.',
            'legal_name': 'PeoplePulse Tech Solutions India Private Limited',
            'contact_email': 'peopleops@peoplepulse.io',
            'contact_phone': '+91 (080) 4920-8800',
            'website': 'https://peoplepulse.io',
            'address': 'Level 6, Tech Park Horizon, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103',
            'currency': 'INR (₹)',
            'fiscal_year_start': 'April 1st',
            'working_days_per_week': 5,
            'default_work_hours_per_day': 8.5,
            'attendance_grace_period_mins': 15
        }
    )

    # 2. Locations
    locations_data = [
        {'name': 'Bengaluru HQ Campus', 'address': 'Tech Park Horizon, Bellandur', 'city': 'Bengaluru', 'state': 'Karnataka', 'postal_code': '560103', 'is_headquarters': True},
        {'name': 'Hyderabad R&D Hub', 'address': 'Mindspace Cyberabad, HITEC City', 'city': 'Hyderabad', 'state': 'Telangana', 'postal_code': '500081', 'is_headquarters': False},
        {'name': 'Mumbai Financial Center', 'address': 'Bandra Kurla Complex (BKC)', 'city': 'Mumbai', 'state': 'Maharashtra', 'postal_code': '400051', 'is_headquarters': False},
        {'name': 'Pune Innovation Center', 'address': 'EON Free Zone, Kharadi', 'city': 'Pune', 'state': 'Maharashtra', 'postal_code': '411014', 'is_headquarters': False},
        {'name': 'Delhi NCR Corporate Office', 'address': 'Cyber City, Phase II, Sector 24', 'city': 'Gurugram', 'state': 'Haryana', 'postal_code': '122002', 'is_headquarters': False},
    ]
    locations = {}
    for loc_d in locations_data:
        loc, _ = Location.objects.get_or_create(name=loc_d['name'], defaults=loc_d)
        locations[loc.city] = loc

    # 3. Departments
    departments_data = [
        {'name': 'Engineering & Technology', 'code': 'ENG', 'head_name': 'Aarav Sharma', 'head_email': 'aarav.sharma@peoplepulse.io', 'city': 'Bengaluru', 'desc': 'Core software development, cloud infrastructure, AI/ML and architecture.'},
        {'name': 'Product & Design', 'code': 'PRD', 'head_name': 'Sneha Kulkarni', 'head_email': 'sneha.kulkarni@peoplepulse.io', 'city': 'Bengaluru', 'desc': 'Product roadmap, UI/UX design research, prototyping and user journeys.'},
        {'name': 'Human Resources & People Ops', 'code': 'HR', 'head_name': 'Priya Venkatesh', 'head_email': 'priya.venkatesh@peoplepulse.io', 'city': 'Bengaluru', 'desc': 'Talent acquisition, employee engagement, payroll, benefits and performance.'},
        {'name': 'Sales & Business Development', 'code': 'SLS', 'head_name': 'Vikram Malhotra', 'head_email': 'vikram.malhotra@peoplepulse.io', 'city': 'Mumbai', 'desc': 'Enterprise sales, client solutions, global account expansions.'},
        {'name': 'Marketing & Brand Strategy', 'code': 'MKT', 'head_name': 'Ananya Patel', 'head_email': 'ananya.patel@peoplepulse.io', 'city': 'Mumbai', 'desc': 'Digital marketing, corporate communications, content and events.'},
        {'name': 'Finance & Accounting', 'code': 'FIN', 'head_name': 'Rohan Iyer', 'head_email': 'rohan.iyer@peoplepulse.io', 'city': 'Bengaluru', 'desc': 'Financial planning, statutory audits, tax compliance and treasury.'},
        {'name': 'Operations & Infrastructure', 'code': 'OPS', 'head_name': 'Aditya Verma', 'head_email': 'aditya.verma@peoplepulse.io', 'city': 'Hyderabad', 'desc': 'IT asset management, facility operations, security and administrative services.'},
        {'name': 'Customer Success & Support', 'code': 'CSS', 'head_name': 'Neha Joshi', 'head_email': 'neha.joshi@peoplepulse.io', 'city': 'Pune', 'desc': 'Client onboarding, technical support, retention and SLA delivery.'},
    ]
    departments = {}
    for dep_d in departments_data:
        loc = locations.get(dep_d['city'], list(locations.values())[0])
        dept, _ = Department.objects.get_or_create(
            code=dep_d['code'],
            defaults={
                'name': dep_d['name'],
                'head_name': dep_d['head_name'],
                'head_email': dep_d['head_email'],
                'description': dep_d['desc'],
                'location': loc,
                'status': 'Active'
            }
        )
        departments[dep_d['code']] = dept

    # 4. Designations
    designations_map = [
        ('ENG', 'Chief Technology Officer', 'Executive'),
        ('ENG', 'VP of Engineering', 'Executive'),
        ('ENG', 'Principal Software Engineer', 'Lead'),
        ('ENG', 'Staff Software Engineer', 'Senior'),
        ('ENG', 'Senior Full-Stack Engineer', 'Senior'),
        ('ENG', 'Frontend Engineer II', 'Mid'),
        ('ENG', 'Backend Developer II', 'Mid'),
        ('ENG', 'DevOps & Cloud Engineer', 'Senior'),
        ('ENG', 'Junior Software Engineer', 'Junior'),
        ('PRD', 'VP of Product', 'Executive'),
        ('PRD', 'Lead UI/UX Designer', 'Lead'),
        ('PRD', 'Senior Product Designer', 'Senior'),
        ('PRD', 'Product Manager', 'Mid'),
        ('HR', 'Head of People & Culture', 'Executive'),
        ('HR', 'Senior Talent Partner', 'Senior'),
        ('HR', 'HR Operations Executive', 'Mid'),
        ('HR', 'Employee Relations Specialist', 'Mid'),
        ('SLS', 'VP of Global Enterprise Sales', 'Executive'),
        ('SLS', 'Enterprise Account Director', 'Senior'),
        ('SLS', 'Sales Development Representative', 'Junior'),
        ('MKT', 'Head of Brand & Growth', 'Lead'),
        ('MKT', 'Senior Content Strategist', 'Mid'),
        ('FIN', 'Financial Controller & Tax Lead', 'Lead'),
        ('FIN', 'Senior Accountant', 'Senior'),
        ('OPS', 'IT Infrastructure Lead', 'Lead'),
        ('OPS', 'System & Asset Administrator', 'Mid'),
        ('CSS', 'Director of Customer Experience', 'Lead'),
        ('CSS', 'Senior Solutions Specialist', 'Mid'),
    ]
    designations = {}
    for dept_code, desig_name, level in designations_map:
        dept = departments[dept_code]
        desig, _ = Designation.objects.get_or_create(
            name=desig_name,
            department=dept,
            defaults={'level': level, 'description': f'{level} role in {dept.name}'}
        )
        designations[desig_name] = desig

    # 5. Teams
    teams_data = [
        ('Platform Core Architecture', 'ENG', 'Aarav Sharma'),
        ('Cloud Infrastructure & DevOps', 'ENG', 'Karthik Nair'),
        ('Web Experience & Design System', 'ENG', 'Arjun Kapoor'),
        ('Product Design & User Research', 'PRD', 'Sneha Kulkarni'),
        ('Talent Acquisition & Sourcing', 'HR', 'Priya Venkatesh'),
        ('Employee Relations & Payroll', 'HR', 'Ritu Sen'),
        ('Enterprise North America & APAC', 'SLS', 'Vikram Malhotra'),
        ('Performance Marketing & SEO', 'MKT', 'Ananya Patel'),
        ('Financial Audit & Compliance', 'FIN', 'Rohan Iyer'),
        ('IT Operations & Helpdesk', 'OPS', 'Aditya Verma'),
        ('Global Enterprise Support', 'CSS', 'Neha Joshi'),
    ]
    teams = {}
    for t_name, d_code, lead in teams_data:
        team, _ = Team.objects.get_or_create(
            name=t_name,
            department=departments[d_code],
            defaults={'team_lead_name': lead, 'description': f'Core team under {departments[d_code].name}'}
        )
        teams[t_name] = team

    # 6. Shifts & Holidays
    shifts_data = [
        ('General Day Shift', 'GS-01', time(9, 0), time(18, 0), True),
        ('Morning Early Shift', 'MS-02', time(8, 0), time(17, 0), False),
        ('Evening Mid Shift', 'ES-03', time(13, 0), time(22, 0), False),
    ]
    shifts = []
    for s_name, s_code, st, et, is_def in shifts_data:
        sh, _ = Shift.objects.get_or_create(
            code=s_code,
            defaults={'name': s_name, 'start_time': st, 'end_time': et, 'is_default': is_def}
        )
        shifts.append(sh)

    holidays_data = [
        ('New Year Day', date(2026, 1, 1), 'Thursday', 'National'),
        ('Republic Day', date(2026, 1, 26), 'Monday', 'National'),
        ('Maha Shivratri', date(2026, 2, 16), 'Monday', 'Gazetted'),
        ('Holi Festival of Colors', date(2026, 3, 4), 'Wednesday', 'Gazetted'),
        ('Ugadi / Gudi Padwa', date(2026, 3, 20), 'Friday', 'Restricted'),
        ('Eid-ul-Fitr', date(2026, 3, 21), 'Saturday', 'Gazetted'),
        ('Good Friday', date(2026, 4, 3), 'Friday', 'Gazetted'),
        ('May Day / Labor Day', date(2026, 5, 1), 'Friday', 'National'),
        ('Bakrid / Eid al-Adha', date(2026, 5, 28), 'Thursday', 'Gazetted'),
        ('Independence Day', date(2026, 8, 15), 'Saturday', 'National'),
        ('Ganesh Chaturthi', date(2026, 9, 14), 'Monday', 'Gazetted'),
        ('Gandhi Jayanti', date(2026, 10, 2), 'Friday', 'National'),
        ('Dussehra (Vijayadashami)', date(2026, 10, 20), 'Tuesday', 'Gazetted'),
        ('Diwali (Deepavali)', date(2026, 11, 8), 'Sunday', 'National'),
        ('Guru Nanak Jayanti', date(2026, 11, 24), 'Tuesday', 'Gazetted'),
        ('Christmas Day', date(2026, 12, 25), 'Friday', 'National'),
    ]
    for h_name, h_date, h_day, h_type in holidays_data:
        Holiday.objects.get_or_create(
            date=h_date,
            defaults={'name': h_name, 'day_of_week': h_day, 'holiday_type': h_type}
        )

    # 7. Leave Types
    leave_types_data = [
        ('Casual Leave', 'CL', 12, True, '#4F46E5', 'For personal emergencies and short breaks.'),
        ('Sick Leave', 'SL', 10, True, '#EF4444', 'For illness and medical appointments.'),
        ('Earned / Privilege Leave', 'EL', 18, True, '#10B981', 'Annual accrued privilege leaves for vacations.'),
        ('Work From Home', 'WFH', 24, True, '#06B6D4', 'Remote work day allocations.'),
        ('Unpaid / Loss of Pay', 'LWP', 30, False, '#64748B', 'Unpaid emergency leave allowance.'),
    ]
    leave_types = {}
    for lt_name, lt_code, lt_days, lt_paid, lt_color, lt_desc in leave_types_data:
        lt, _ = LeaveType.objects.get_or_create(
            code=lt_code,
            defaults={'name': lt_name, 'days_allowed_per_year': lt_days, 'is_paid': lt_paid, 'color_code': lt_color, 'description': lt_desc}
        )
        leave_types[lt_code] = lt

    # 8. Seed 55 Realistic Indian Employees
    # High-quality avatars using realistic portrait placeholders
    avatars_pool = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&fit=crop&crop=faces",
    ]

    employees_seed_spec = [
        # Executives & Department Heads
        ('EMP-1001', 'Aarav', 'Sharma', 'aarav.sharma@peoplepulse.io', '+91 98450 11001', 'Male', 'ENG', 'Chief Technology Officer', 'Bengaluru', 4200000, '2021-02-01', None, 'Platform Core Architecture'),
        ('EMP-1002', 'Priya', 'Venkatesh', 'priya.venkatesh@peoplepulse.io', '+91 98450 11002', 'Female', 'HR', 'Head of People & Culture', 'Bengaluru', 3400000, '2021-03-15', None, 'Talent Acquisition & Sourcing'),
        ('EMP-1003', 'Vikram', 'Malhotra', 'vikram.malhotra@peoplepulse.io', '+91 98450 11003', 'Male', 'SLS', 'VP of Global Enterprise Sales', 'Mumbai', 3800000, '2021-04-10', None, 'Enterprise North America & APAC'),
        ('EMP-1004', 'Sneha', 'Kulkarni', 'sneha.kulkarni@peoplepulse.io', '+91 98450 11004', 'Female', 'PRD', 'VP of Product', 'Bengaluru', 3600000, '2021-05-20', None, 'Product Design & User Research'),
        ('EMP-1005', 'Rohan', 'Iyer', 'rohan.iyer@peoplepulse.io', '+91 98450 11005', 'Male', 'FIN', 'Financial Controller & Tax Lead', 'Bengaluru', 3200000, '2021-06-01', None, 'Financial Audit & Compliance'),
        ('EMP-1006', 'Aditya', 'Verma', 'aditya.verma@peoplepulse.io', '+91 98450 11006', 'Male', 'OPS', 'IT Infrastructure Lead', 'Hyderabad', 2800000, '2021-08-15', None, 'IT Operations & Helpdesk'),
        ('EMP-1007', 'Neha', 'Joshi', 'neha.joshi@peoplepulse.io', '+91 98450 11007', 'Female', 'CSS', 'Director of Customer Experience', 'Pune', 2900000, '2021-09-01', None, 'Global Enterprise Support'),
        ('EMP-1008', 'Ananya', 'Patel', 'ananya.patel@peoplepulse.io', '+91 98450 11008', 'Female', 'MKT', 'Head of Brand & Growth', 'Mumbai', 3000000, '2021-10-15', None, 'Performance Marketing & SEO'),

        # Engineering Team
        ('EMP-1009', 'Karthik', 'Nair', 'karthik.nair@peoplepulse.io', '+91 98450 11009', 'Male', 'ENG', 'Principal Software Engineer', 'Bengaluru', 2800000, '2022-01-10', 'EMP-1001', 'Cloud Infrastructure & DevOps'),
        ('EMP-1010', 'Arjun', 'Kapoor', 'arjun.kapoor@peoplepulse.io', '+91 98450 11010', 'Male', 'ENG', 'Staff Software Engineer', 'Bengaluru', 2500000, '2022-02-15', 'EMP-1001', 'Web Experience & Design System'),
        ('EMP-1011', 'Divya', 'Sundaram', 'divya.sundaram@peoplepulse.io', '+91 98450 11011', 'Female', 'ENG', 'Senior Full-Stack Engineer', 'Bengaluru', 2100000, '2022-04-01', 'EMP-1009', 'Platform Core Architecture'),
        ('EMP-1012', 'Siddharth', 'Gupta', 'siddharth.gupta@peoplepulse.io', '+91 98450 11012', 'Male', 'ENG', 'Senior Full-Stack Engineer', 'Hyderabad', 2000000, '2022-05-10', 'EMP-1009', 'Platform Core Architecture'),
        ('EMP-1013', 'Meera', 'Reddy', 'meera.reddy@peoplepulse.io', '+91 98450 11013', 'Female', 'ENG', 'DevOps & Cloud Engineer', 'Bengaluru', 1900000, '2022-06-15', 'EMP-1009', 'Cloud Infrastructure & DevOps'),
        ('EMP-1014', 'Rahul', 'Menon', 'rahul.menon@peoplepulse.io', '+91 98450 11014', 'Male', 'ENG', 'Backend Developer II', 'Bengaluru', 1500000, '2022-08-01', 'EMP-1010', 'Platform Core Architecture'),
        ('EMP-1015', 'Pooja', 'Deshmukh', 'pooja.deshmukh@peoplepulse.io', '+91 98450 11015', 'Female', 'ENG', 'Frontend Engineer II', 'Pune', 1450000, '2022-09-10', 'EMP-1010', 'Web Experience & Design System'),
        ('EMP-1016', 'Varun', 'Bhattacharya', 'varun.b@peoplepulse.io', '+91 98450 11016', 'Male', 'ENG', 'Backend Developer II', 'Hyderabad', 1400000, '2022-11-01', 'EMP-1010', 'Platform Core Architecture'),
        ('EMP-1017', 'Shreya', 'Chakraborty', 'shreya.c@peoplepulse.io', '+91 98450 11017', 'Female', 'ENG', 'Frontend Engineer II', 'Bengaluru', 1350000, '2023-01-15', 'EMP-1010', 'Web Experience & Design System'),
        ('EMP-1018', 'Nikhil', 'Gowda', 'nikhil.gowda@peoplepulse.io', '+91 98450 11018', 'Male', 'ENG', 'Junior Software Engineer', 'Bengaluru', 850000, '2023-06-01', 'EMP-1011', 'Platform Core Architecture'),
        ('EMP-1019', 'Tanvi', 'Hegde', 'tanvi.hegde@peoplepulse.io', '+91 98450 11019', 'Female', 'ENG', 'Junior Software Engineer', 'Bengaluru', 800000, '2023-07-15', 'EMP-1011', 'Web Experience & Design System'),
        ('EMP-1020', 'Abhishek', 'Mishra', 'abhishek.m@peoplepulse.io', '+91 98450 11020', 'Male', 'ENG', 'Senior Full-Stack Engineer', 'Delhi', 2200000, '2022-07-01', 'EMP-1009', 'Platform Core Architecture'),

        # Product & Design Team
        ('EMP-1021', 'Ritu', 'Sen', 'ritu.sen@peoplepulse.io', '+91 98450 11021', 'Female', 'PRD', 'Lead UI/UX Designer', 'Bengaluru', 2300000, '2022-03-01', 'EMP-1004', 'Product Design & User Research'),
        ('EMP-1022', 'Kavya', 'Srinivasan', 'kavya.s@peoplepulse.io', '+91 98450 11022', 'Female', 'PRD', 'Senior Product Designer', 'Bengaluru', 1800000, '2022-07-15', 'EMP-1021', 'Product Design & User Research'),
        ('EMP-1023', 'Manoj', 'Tiwari', 'manoj.tiwari@peoplepulse.io', '+91 98450 11023', 'Male', 'PRD', 'Product Manager', 'Bengaluru', 2100000, '2022-09-01', 'EMP-1004', 'Product Design & User Research'),
        ('EMP-1024', 'Ananya', 'Rao', 'ananya.rao@peoplepulse.io', '+91 98450 11024', 'Female', 'PRD', 'Senior Product Designer', 'Hyderabad', 1750000, '2023-02-01', 'EMP-1021', 'Product Design & User Research'),

        # HR Team
        ('EMP-1025', 'Sunita', 'Rao', 'sunita.rao@peoplepulse.io', '+91 98450 11025', 'Female', 'HR', 'Senior Talent Partner', 'Bengaluru', 1600000, '2022-02-01', 'EMP-1002', 'Talent Acquisition & Sourcing'),
        ('EMP-1026', 'Deepak', 'Chopra', 'deepak.c@peoplepulse.io', '+91 98450 11026', 'Male', 'HR', 'HR Operations Executive', 'Bengaluru', 1100000, '2022-05-15', 'EMP-1002', 'Employee Relations & Payroll'),
        ('EMP-1027', 'Ishita', 'Bansal', 'ishita.b@peoplepulse.io', '+91 98450 11027', 'Female', 'HR', 'Employee Relations Specialist', 'Mumbai', 1200000, '2022-10-01', 'EMP-1002', 'Employee Relations & Payroll'),
        ('EMP-1028', 'Kunal', 'Shah', 'kunal.shah@peoplepulse.io', '+91 98450 11028', 'Male', 'HR', 'Senior Talent Partner', 'Hyderabad', 1550000, '2023-01-10', 'EMP-1002', 'Talent Acquisition & Sourcing'),

        # Sales & Marketing
        ('EMP-1029', 'Harsh', 'Vardhan', 'harsh.v@peoplepulse.io', '+91 98450 11029', 'Male', 'SLS', 'Enterprise Account Director', 'Mumbai', 2600000, '2022-01-20', 'EMP-1003', 'Enterprise North America & APAC'),
        ('EMP-1030', 'Rashmi', 'Nambiar', 'rashmi.n@peoplepulse.io', '+91 98450 11030', 'Female', 'SLS', 'Enterprise Account Director', 'Delhi', 2500000, '2022-04-15', 'EMP-1003', 'Enterprise North America & APAC'),
        ('EMP-1031', 'Gaurav', 'Saxena', 'gaurav.s@peoplepulse.io', '+91 98450 11031', 'Male', 'SLS', 'Sales Development Representative', 'Bengaluru', 950000, '2023-03-01', 'EMP-1029', 'Enterprise North America & APAC'),
        ('EMP-1032', 'Natasha', 'Fernandes', 'natasha.f@peoplepulse.io', '+91 98450 11032', 'Female', 'MKT', 'Senior Content Strategist', 'Mumbai', 1400000, '2022-08-15', 'EMP-1008', 'Performance Marketing & SEO'),

        # Finance, Ops & Support
        ('EMP-1033', 'Sanjay', 'Dutt', 'sanjay.dutt@peoplepulse.io', '+91 98450 11033', 'Male', 'FIN', 'Senior Accountant', 'Bengaluru', 1350000, '2022-03-10', 'EMP-1005', 'Financial Audit & Compliance'),
        ('EMP-1034', 'Pallavi', 'Kashyap', 'pallavi.k@peoplepulse.io', '+91 98450 11034', 'Female', 'OPS', 'System & Asset Administrator', 'Hyderabad', 1050000, '2022-11-20', 'EMP-1006', 'IT Operations & Helpdesk'),
        ('EMP-1035', 'Rohit', 'Bakshi', 'rohit.bakshi@peoplepulse.io', '+91 98450 11035', 'Male', 'CSS', 'Senior Solutions Specialist', 'Pune', 1300000, '2022-06-01', 'EMP-1007', 'Global Enterprise Support'),
        ('EMP-1036', 'Swati', 'Deshpande', 'swati.d@peoplepulse.io', '+91 98450 11036', 'Female', 'CSS', 'Senior Solutions Specialist', 'Pune', 1250000, '2022-10-15', 'EMP-1007', 'Global Enterprise Support'),

        # Additional Workforce for 50+ total
        ('EMP-1037', 'Vikas', 'Pandey', 'vikas.p@peoplepulse.io', '+91 98450 11037', 'Male', 'ENG', 'Backend Developer II', 'Bengaluru', 1400000, '2023-01-05', 'EMP-1010', 'Platform Core Architecture'),
        ('EMP-1038', 'Simran', 'Kaur', 'simran.kaur@peoplepulse.io', '+91 98450 11038', 'Female', 'ENG', 'Frontend Engineer II', 'Delhi', 1380000, '2023-02-10', 'EMP-1010', 'Web Experience & Design System'),
        ('EMP-1039', 'Naveen', 'Choudhary', 'naveen.c@peoplepulse.io', '+91 98450 11039', 'Male', 'ENG', 'DevOps & Cloud Engineer', 'Hyderabad', 1700000, '2023-03-15', 'EMP-1009', 'Cloud Infrastructure & DevOps'),
        ('EMP-1040', 'Aishwarya', 'Natarajan', 'aishwarya.n@peoplepulse.io', '+91 98450 11040', 'Female', 'PRD', 'Product Manager', 'Bengaluru', 2000000, '2023-04-01', 'EMP-1004', 'Product Design & User Research'),
        ('EMP-1041', 'Girish', 'Babu', 'girish.b@peoplepulse.io', '+91 98450 11041', 'Male', 'SLS', 'Sales Development Representative', 'Mumbai', 900000, '2023-05-15', 'EMP-1029', 'Enterprise North America & APAC'),
        ('EMP-1042', 'Monika', 'Rawat', 'monika.r@peoplepulse.io', '+91 98450 11042', 'Female', 'HR', 'HR Operations Executive', 'Bengaluru', 1050000, '2023-06-01', 'EMP-1002', 'Employee Relations & Payroll'),
        ('EMP-1043', 'Tarun', 'Jain', 'tarun.j@peoplepulse.io', '+91 98450 11043', 'Male', 'FIN', 'Senior Accountant', 'Bengaluru', 1250000, '2023-07-20', 'EMP-1005', 'Financial Audit & Compliance'),
        ('EMP-1044', 'Shruti', 'Aggarwal', 'shruti.a@peoplepulse.io', '+91 98450 11044', 'Female', 'CSS', 'Senior Solutions Specialist', 'Pune', 1200000, '2023-08-01', 'EMP-1007', 'Global Enterprise Support'),
        ('EMP-1045', 'Pranav', 'Kalyan', 'pranav.k@peoplepulse.io', '+91 98450 11045', 'Male', 'ENG', 'Junior Software Engineer', 'Bengaluru', 820000, '2023-09-10', 'EMP-1011', 'Platform Core Architecture'),
        ('EMP-1046', 'Geeta', 'Subramaniam', 'geeta.s@peoplepulse.io', '+91 98450 11046', 'Female', 'ENG', 'Junior Software Engineer', 'Hyderabad', 800000, '2023-10-01', 'EMP-1011', 'Platform Core Architecture'),
        ('EMP-1047', 'Ashwin', 'Prasad', 'ashwin.p@peoplepulse.io', '+91 98450 11047', 'Male', 'ENG', 'Backend Developer II', 'Bengaluru', 1450000, '2023-11-15', 'EMP-1010', 'Platform Core Architecture'),
        ('EMP-1048', 'Anjali', 'Menon', 'anjali.m@peoplepulse.io', '+91 98450 11048', 'Female', 'MKT', 'Senior Content Strategist', 'Mumbai', 1350000, '2024-01-10', 'EMP-1008', 'Performance Marketing & SEO'),
        ('EMP-1049', 'Suresh', 'Pillai', 'suresh.p@peoplepulse.io', '+91 98450 11049', 'Male', 'OPS', 'System & Asset Administrator', 'Hyderabad', 1000000, '2024-02-01', 'EMP-1006', 'IT Operations & Helpdesk'),
        ('EMP-1050', 'Bhavna', 'Mehta', 'bhavna.m@peoplepulse.io', '+91 98450 11050', 'Female', 'SLS', 'Sales Development Representative', 'Delhi', 920000, '2024-03-15', 'EMP-1030', 'Enterprise North America & APAC'),
        ('EMP-1051', 'Ramesh', 'Yadav', 'ramesh.y@peoplepulse.io', '+91 98450 11051', 'Male', 'ENG', 'Senior Full-Stack Engineer', 'Bengaluru', 2050000, '2024-04-01', 'EMP-1009', 'Platform Core Architecture'),
        ('EMP-1052', 'Namrata', 'Sethi', 'namrata.s@peoplepulse.io', '+91 98450 11052', 'Female', 'PRD', 'Senior Product Designer', 'Bengaluru', 1700000, '2024-05-10', 'EMP-1021', 'Product Design & User Research'),
    ]

    employees_created = {}

    # Create employees
    for idx, spec in enumerate(employees_seed_spec):
        emp_id, fname, lname, email, phone, gender, dept_code, desig_name, city, ctc, join_date, mgr_id, team_name = spec
        dept = departments.get(dept_code)
        desig = designations.get(desig_name)
        loc = locations.get(city, list(locations.values())[0])
        team = teams.get(team_name)
        avatar = avatars_pool[idx % len(avatars_pool)]

        # Compensation breakdown
        basic = Decimal(str(round(ctc * 0.50, 2)))
        hra = Decimal(str(round(ctc * 0.25, 2)))
        special = Decimal(str(round(ctc * 0.25, 2)))

        emp, _ = Employee.objects.get_or_create(
            emp_id=emp_id,
            defaults={
                'first_name': fname,
                'last_name': lname,
                'email': email,
                'phone': phone,
                'avatar_url': avatar,
                'date_of_birth': date(1990 + (idx % 10), 1 + (idx % 12), 1 + (idx % 25)),
                'gender': gender,
                'marital_status': 'Married' if idx % 2 == 0 else 'Single',
                'blood_group': ['A+', 'B+', 'O+', 'AB+'][idx % 4],
                'address': f'Flat #{101 + idx}, Prestige Greenwoods, Sector {idx % 8 + 1}',
                'city': city,
                'state': loc.state,
                'postal_code': loc.postal_code,
                'emergency_contact_name': f'Family Contact {lname}',
                'emergency_contact_relation': 'Spouse' if idx % 2 == 0 else 'Parent',
                'emergency_contact_phone': f'+91 98110 {22000 + idx}',
                'department': dept,
                'designation': desig,
                'location': loc,
                'team': team,
                'joining_date': datetime.strptime(join_date, '%Y-%m-%d').date(),
                'employment_type': 'Full-Time',
                'status': 'Probation' if idx > 48 else 'Active',
                'work_mode': ['Hybrid', 'On-Site', 'Remote'][idx % 3],
                'annual_ctc': Decimal(str(ctc)),
                'basic_salary': basic,
                'hra': hra,
                'special_allowances': special,
                'bank_name': ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'State Bank of India'][idx % 4],
                'account_number': f'501004{890000 + idx}',
                'ifsc_code': f'HDFC000{1000 + idx}',
                'pan_number': f'ABCDE{1000 + idx}F',
                'uan_number': f'1012938{40000 + idx}'
            }
        )
        employees_created[emp_id] = emp

    # Link Managers
    for spec in employees_seed_spec:
        emp_id, _, _, _, _, _, _, _, _, _, _, mgr_id, _ = spec
        if mgr_id and mgr_id in employees_created:
            emp = employees_created[emp_id]
            emp.manager = employees_created[mgr_id]
            emp.save()

    print(f"[+] Created {len(employees_created)} employees across {len(departments)} departments")

    # 9. Seed Leave Balances & Leave Requests
    for emp in employees_created.values():
        for lt in leave_types.values():
            used = random.choice([0, 1, 2, 3]) if lt.code in ['CL', 'SL'] else random.choice([0, 2, 4])
            pending = 1 if (emp.id % 7 == 0 and lt.code == 'CL') else 0
            LeaveBalance.objects.get_or_create(
                employee=emp,
                leave_type=lt,
                year=2026,
                defaults={
                    'total_allocated': lt.days_allowed_per_year,
                    'used': used,
                    'pending': pending
                }
            )

    # Some active / pending leave requests
    sample_requests = [
        (employees_created['EMP-1011'], leave_types['CL'], date(2026, 9, 28), date(2026, 9, 29), 2.0, 'Family function and travel to home town', 'Pending'),
        (employees_created['EMP-1014'], leave_types['SL'], date(2026, 9, 24), date(2026, 9, 24), 1.0, 'Viral fever recovery and doctor consultation', 'Approved'),
        (employees_created['EMP-1022'], leave_types['EL'], date(2026, 10, 5), date(2026, 10, 9), 5.0, 'Annual planned vacation leave', 'Pending'),
        (employees_created['EMP-1031'], leave_types['WFH'], date(2026, 9, 25), date(2026, 9, 25), 1.0, 'High speed broadband repair at home', 'Approved'),
        (employees_created['EMP-1018'], leave_types['CL'], date(2026, 10, 1), date(2026, 10, 2), 2.0, 'Attending college convocation ceremony', 'Pending'),
    ]
    for emp, lt, s_dt, e_dt, days, reason, req_status in sample_requests:
        LeaveRequest.objects.get_or_create(
            employee=emp,
            leave_type=lt,
            start_date=s_dt,
            defaults={
                'end_date': e_dt,
                'days_count': days,
                'reason': reason,
                'status': req_status,
                'manager_remarks': 'Approved based on team schedule coverage' if req_status == 'Approved' else ''
            }
        )

    # 10. Seed Attendance Records (Past 15 working days)
    today = date.today()
    all_emps = list(employees_created.values())
    
    for day_offset in range(15):
        cur_date = today - timedelta(days=day_offset)
        if cur_date.weekday() >= 5: # Skip weekends
            continue

        for emp in all_emps:
            # Deterministic status distribution
            rand_val = (emp.id * 17 + day_offset * 13) % 100
            if rand_val < 78:
                st = 'Present'
                chk_in = time(9, (emp.id * 2) % 30)
                chk_out = time(18, (emp.id * 3) % 45)
                work_hrs = 8.5 + round((emp.id % 5) * 0.2, 2)
            elif rand_val < 88:
                st = 'Work From Home'
                chk_in = time(9, 0)
                chk_out = time(18, 15)
                work_hrs = 8.5
            elif rand_val < 94:
                st = 'Late'
                chk_in = time(9, 40 + (emp.id % 15))
                chk_out = time(18, 30)
                work_hrs = 8.0
            elif rand_val < 97:
                st = 'On Leave'
                chk_in = None
                chk_out = None
                work_hrs = 0.0
            else:
                st = 'Absent'
                chk_in = None
                chk_out = None
                work_hrs = 0.0

            AttendanceRecord.objects.get_or_create(
                employee=emp,
                date=cur_date,
                defaults={
                    'check_in': chk_in,
                    'check_out': chk_out,
                    'work_hours': work_hrs,
                    'overtime_hours': max(0.0, work_hrs - 8.5),
                    'status': st,
                    'shift': shifts[0]
                }
            )

    print("[+] Seeded attendance records and leave requests")

    # 11. Recruitment Pipeline: Jobs, Candidates & Interviews
    jobs_seed = [
        ('Senior Full-Stack Engineer (React + Python)', 'JOB-ENG-2026-01', 'ENG', 'Senior Full-Stack Engineer', 'Bengaluru', 4, 8, 1800000, 2600000, 3, 'We are seeking a talented Senior Full-Stack Engineer to architect high-throughput services and build intuitive enterprise interfaces.', '5+ years experience with React, Django/FastAPI, PostgreSQL, Redis, Docker and cloud architecture.'),
        ('Lead Product Designer (UI/UX)', 'JOB-PRD-2026-02', 'PRD', 'Lead UI/UX Designer', 'Bengaluru', 6, 10, 2200000, 3000000, 1, 'Drive user research, enterprise design system evolution, and Figma design tokens.', 'Portfolio demonstrating enterprise SaaS products, design tokens, micro-interactions, Figma proficiency.'),
        ('DevOps & SRE Specialist', 'JOB-ENG-2026-03', 'ENG', 'DevOps & Cloud Engineer', 'Hyderabad', 3, 6, 1600000, 2400000, 2, 'Build scalable Kubernetes clusters, CI/CD automated pipelines, Terraform infrastructure as code.', 'Kubernetes, AWS/GCP, Terraform, Prometheus/Grafana, GitHub Actions.'),
        ('Enterprise Sales Executive', 'JOB-SLS-2026-04', 'SLS', 'Enterprise Account Director', 'Mumbai', 4, 8, 1500000, 2800000, 2, 'Generate qualified enterprise pipeline, conduct client demos, and close multi-year enterprise contracts.', 'B2B enterprise SaaS sales track record, high closing rate, outstanding communication.'),
        ('Senior Talent Partner (Tech Hiring)', 'JOB-HR-2026-05', 'HR', 'Senior Talent Partner', 'Bengaluru', 3, 6, 1200000, 1800000, 1, 'Manage end-to-end recruitment for engineering, product, and leadership talent.', 'Full-cycle tech hiring, candidate negotiation, LinkedIn Recruiter mastery.'),
    ]
    job_objects = []
    for title, code, d_code, desig_name, city, exp_min, exp_max, sal_min, sal_max, vac, desc, req in jobs_seed:
        job, _ = JobOpening.objects.get_or_create(
            job_code=code,
            defaults={
                'title': title,
                'department': departments[d_code],
                'designation': designations[desig_name],
                'location': locations[city],
                'experience_min': exp_min,
                'experience_max': exp_max,
                'salary_min': Decimal(str(sal_min)),
                'salary_max': Decimal(str(sal_max)),
                'vacancies': vac,
                'description': desc,
                'requirements': req,
                'hiring_manager': employees_created.get('EMP-1001'),
                'status': 'Open',
                'opened_date': date(2026, 8, 15)
            }
        )
        job_objects.append(job)

    candidates_seed = [
        ('Tanmay Deshmukh', 'tanmay.deshmukh@email.com', '+91 98200 45112', job_objects[0], 5.5, 'Swiggy', 1600000, 2400000, 30, 'Applied', 4, 'LinkedIn'),
        ('Ananya Ganguly', 'ananya.ganguly@email.com', '+91 98200 45113', job_objects[0], 6.0, 'Razorpay', 1800000, 2500000, 15, 'Screening', 5, 'Referral'),
        ('Adarsh Singhania', 'adarsh.s@email.com', '+91 98200 45114', job_objects[0], 4.5, 'PhonePe', 1500000, 2200000, 30, 'Shortlisted', 4, 'Naukri'),
        ('Meenakshi Sunder', 'meenakshi.s@email.com', '+91 98200 45115', job_objects[0], 7.0, 'Flipkart', 2100000, 2800000, 60, 'Interview', 5, 'LinkedIn'),
        ('Rajat Chhabra', 'rajat.chhabra@email.com', '+91 98200 45116', job_objects[0], 5.0, 'Zomato', 1700000, 2400000, 30, 'Technical Round', 4, 'AngelList'),
        ('Bhavya Nanda', 'bhavya.nanda@email.com', '+91 98200 45117', job_objects[1], 7.5, 'CRED', 2000000, 2900000, 30, 'HR Round', 5, 'Dribbble'),
        ('Karthik Venkat', 'karthik.v@email.com', '+91 98200 45118', job_objects[1], 8.0, 'Postman', 2200000, 3000000, 15, 'Selected', 5, 'LinkedIn'),
        ('Suraj Hegde', 'suraj.hegde@email.com', '+91 98200 45119', job_objects[2], 4.0, 'Freshworks', 1300000, 1900000, 30, 'Applied', 3, 'LinkedIn'),
        ('Deepa Menon', 'deepa.menon@email.com', '+91 98200 45120', job_objects[2], 5.2, 'Jio Platforms', 1450000, 2100000, 45, 'Interview', 4, 'Referral'),
        ('Abhay Trivedi', 'abhay.trivedi@email.com', '+91 98200 45121', job_objects[3], 6.0, 'Salesforce India', 1900000, 2700000, 30, 'Selected', 5, 'LinkedIn'),
    ]
    candidate_objs = []
    for c_name, c_email, c_phone, job, exp, cur_co, cur_ctc, exp_ctc, np, stg, rat, src in candidates_seed:
        cand, _ = Candidate.objects.get_or_create(
            email=c_email,
            job_opening=job,
            defaults={
                'name': c_name,
                'phone': c_phone,
                'experience_years': exp,
                'current_company': cur_co,
                'current_ctc': Decimal(str(cur_ctc)),
                'expected_ctc': Decimal(str(exp_ctc)),
                'notice_period_days': np,
                'stage': stg,
                'rating': rat,
                'source': src,
                'notes': f'Strong background at {cur_co} with {exp} years domain experience.'
            }
        )
        candidate_objs.append(cand)

    # Interviews
    Interview.objects.get_or_create(
        candidate=candidate_objs[3],
        scheduled_date=today + timedelta(days=1),
        defaults={
            'interviewer': employees_created['EMP-1009'],
            'interview_type': 'Technical',
            'scheduled_time': time(14, 30),
            'meeting_link': 'https://meet.google.com/pph-rec-arch',
            'result': 'Pending',
            'feedback': 'Deep dive into microservices scaling and distributed caching.'
        }
    )
    Interview.objects.get_or_create(
        candidate=candidate_objs[4],
        scheduled_date=today + timedelta(days=2),
        defaults={
            'interviewer': employees_created['EMP-1010'],
            'interview_type': 'System Design',
            'scheduled_time': time(16, 0),
            'meeting_link': 'https://meet.google.com/pph-rec-design',
            'result': 'Pending',
            'feedback': 'Evaluating design system tokenization and state synchronization.'
        }
    )

    print(f"[+] Created {len(job_objects)} job openings and {len(candidate_objs)} candidates in pipeline")

    # 12. Payroll Run & Payslips for active employees
    payroll_run, _ = PayrollRun.objects.get_or_create(
        month=today.month,
        year=today.year,
        defaults={
            'title': f"Payroll - {today.strftime('%B %Y')}",
            'status': 'Calculated',
            'processed_date': today,
            'total_employees': len(employees_created),
        }
    )
    
    total_g = Decimal('0.00')
    total_d = Decimal('0.00')
    total_n = Decimal('0.00')

    for emp in employees_created.values():
        basic = round(emp.basic_salary / Decimal('12.0'), 2)
        hra = round(emp.hra / Decimal('12.0'), 2)
        special = round(emp.special_allowances / Decimal('12.0'), 2)
        gross = basic + hra + special
        pf = round(min(basic * Decimal('0.12'), Decimal('1800.00')), 2)
        pt = Decimal('200.00')
        taxable = gross - pf - pt
        tds = round(max(Decimal('0.00'), taxable * Decimal('0.08')), 2) if gross > Decimal('50000.00') else Decimal('0.00')
        deductions = pf + pt + tds
        net = gross - deductions

        pno = f"PAY-{today.year}{today.month:02d}-{emp.emp_id}"
        Payslip.objects.get_or_create(
            payslip_number=pno,
            defaults={
                'payroll_run': payroll_run,
                'employee': emp,
                'month': today.month,
                'year': today.year,
                'basic_salary': basic,
                'hra': hra,
                'special_allowance': special,
                'performance_bonus': Decimal('0.00'),
                'overtime_pay': Decimal('0.00'),
                'gross_earnings': gross,
                'provident_fund': pf,
                'professional_tax': pt,
                'income_tax_tds': tds,
                'other_deductions': Decimal('0.00'),
                'total_deductions': deductions,
                'net_salary': net,
                'payment_status': 'Generated',
                'working_days': 22,
                'paid_days': 22.0
            }
        )
        total_g += gross
        total_d += deductions
        total_n += net

    payroll_run.total_gross = total_g
    payroll_run.total_deductions = total_d
    payroll_run.total_net = total_n
    payroll_run.save()

    print(f"[+] Generated monthly payroll run with INR {float(total_n):,.2f} total disbursement")

    # 13. Assets Inventory & Assignment
    asset_catalog = [
        ('AST-LAP-101', 'Apple MacBook Pro 16" M3 Max', 'Laptop', 'Apple Inc.', 'C02G1290XYZ1', 'Brand New', 285000, 'Assigned', 'EMP-1001'),
        ('AST-LAP-102', 'Apple MacBook Pro 14" M3 Pro', 'Laptop', 'Apple Inc.', 'C02G1290XYZ2', 'Excellent', 195000, 'Assigned', 'EMP-1002'),
        ('AST-LAP-103', 'Dell XPS 15 9530 OLED', 'Laptop', 'Dell Technologies', 'DLXPS9530A1', 'Excellent', 185000, 'Assigned', 'EMP-1003'),
        ('AST-LAP-104', 'Apple MacBook Air 15" M3', 'Laptop', 'Apple Inc.', 'C02G1290XYZ4', 'Brand New', 145000, 'Assigned', 'EMP-1004'),
        ('AST-LAP-105', 'Lenovo ThinkPad X1 Carbon Gen 12', 'Laptop', 'Lenovo', 'LNTPX1C1201', 'Excellent', 175000, 'Assigned', 'EMP-1005'),
        ('AST-LAP-106', 'Apple MacBook Pro 14" M3 Pro', 'Laptop', 'Apple Inc.', 'C02G1290XYZ6', 'Good', 195000, 'Assigned', 'EMP-1009'),
        ('AST-LAP-107', 'Apple MacBook Pro 14" M3 Pro', 'Laptop', 'Apple Inc.', 'C02G1290XYZ7', 'Excellent', 195000, 'Assigned', 'EMP-1010'),
        ('AST-LAP-108', 'Dell UltraSharp 32" 4K Monitor', 'Monitor', 'Dell Technologies', 'DLUS3223QE01', 'Brand New', 68000, 'Assigned', 'EMP-1001'),
        ('AST-LAP-109', 'LG UltraFine 27" 5K Display', 'Monitor', 'LG Electronics', 'LGUF27MD5KL01', 'Good', 85000, 'Assigned', 'EMP-1004'),
        ('AST-LAP-110', 'Apple MacBook Air 13" M2', 'Laptop', 'Apple Inc.', 'C02G1290XYZ8', 'Brand New', 115000, 'Available', None),
        ('AST-LAP-111', 'Dell Latitude 7440 Intel i7', 'Laptop', 'Dell Technologies', 'DLLAT744001', 'Brand New', 125000, 'Available', None),
        ('AST-LAP-112', 'Sony WH-1000XM5 ANC Headset', 'Peripherals', 'Sony Corporation', 'SNWH1000XM501', 'Excellent', 28000, 'Assigned', 'EMP-1009'),
        ('AST-LAP-113', 'Keychron Q1 Pro Wireless Keyboard', 'Peripherals', 'Keychron', 'KCQ1PRO9901', 'Brand New', 16500, 'Assigned', 'EMP-1010'),
        ('AST-LAP-114', 'Apple iPad Pro 12.9" M2', 'Mobile Phone', 'Apple Inc.', 'APIPADPRO129', 'Needs Service', 112000, 'Under Maintenance', None),
    ]

    for a_id, a_name, cat, brand, sno, cond, cost, st, emp_id in asset_catalog:
        assigned_emp = employees_created.get(emp_id) if emp_id else None
        Asset.objects.get_or_create(
            asset_id=a_id,
            defaults={
                'name': a_name,
                'category': cat,
                'brand_model': brand,
                'serial_number': sno,
                'purchase_date': date(2023, 1, 15),
                'warranty_expiry': date(2027, 1, 15),
                'purchase_cost': Decimal(str(cost)),
                'condition': cond,
                'status': st,
                'assigned_to': assigned_emp,
                'assigned_date': date(2023, 2, 1) if assigned_emp else None
            }
        )

    # 14. Performance Cycles, Goals & Reviews
    p_cycle, _ = perf_models.PerformanceCycle.objects.get_or_create(
        title='FY 2026-27 Annual Performance & OKR Calibration',
        defaults={
            'cycle_type': 'Annual',
            'start_date': date(2026, 4, 1),
            'end_date': date(2027, 3, 31),
            'review_due_date': date(2026, 10, 31),
            'status': 'Review Phase',
            'description': 'Company-wide annual performance evaluation, peer 360 feedback, OKR key results and compensation calibration.'
        }
    )

    sample_goals = [
        (employees_created['EMP-1001'], 'Architect next-gen Micro-frontend Platform', 'Engineering', 'Achieve <1.2s Core Web Vitals across all product modules', 85, 'On Track'),
        (employees_created['EMP-1009'], 'Achieve 99.99% Multi-region Cloud Availability', 'Engineering', 'Zero catastrophic downtime in Q2 with automated failovers', 90, 'On Track'),
        (employees_created['EMP-1010'], 'Implement Design Token Engine & Accessibility WCAG 2.1 AA', 'Engineering', '100% component compliance in design library', 75, 'On Track'),
        (employees_created['EMP-1021'], 'Deliver Enterprise HRMS 2.0 User Journey Research', 'Process', 'Complete 30 user interviews and usability studies', 100, 'Completed'),
        (employees_created['EMP-1002'], 'Scale Tech Engineering Headcount by 40%', 'Leadership', 'Reduce average hiring cycle turnaround to 22 days', 80, 'On Track'),
    ]
    for emp, g_title, cat, target, prog, g_stat in sample_goals:
        perf_models.Goal.objects.get_or_create(
            employee=emp,
            cycle=p_cycle,
            title=g_title,
            defaults={
                'category': cat,
                'metric_target': target,
                'progress': prog,
                'status': g_stat,
                'due_date': date(2026, 10, 31)
            }
        )

    # Performance Reviews
    perf_models.PerformanceReview.objects.get_or_create(
        employee=employees_created['EMP-1010'],
        cycle=p_cycle,
        defaults={
            'reviewer': employees_created['EMP-1001'],
            'key_achievements': 'Led the migration to Vite + Tailwind, reduced bundle size by 45%, and mentored 3 junior frontend engineers.',
            'core_strengths': 'Exceptional UI/UX intuition, modern web standards mastery, proactive team leadership.',
            'improvement_areas': 'Can delegate backend API schema design earlier in sprints.',
            'manager_feedback': 'Outstanding contributor who consistently elevates our product design quality.',
            'technical_skills_rating': 4.8,
            'communication_rating': 4.5,
            'teamwork_rating': 4.7,
            'overall_rating': 4.7,
            'promotion_recommended': True,
            'salary_hike_recommended_percent': 15.0,
            'status': 'Finalized',
            'review_date': date(2026, 9, 15)
        }
    )

    # 15. Company & Employee Documents
    docs_seed = [
        ('PeoplePulse Employee Handbook 2026', 'Company Policy', None, True, 1024, 'Verified'),
        ('Code of Conduct & Information Security Policy', 'Company Policy', None, True, 850, 'Verified'),
        ('Group Health Insurance Policy Benefits Booklet', 'Company Policy', None, True, 2048, 'Verified'),
        ('Employment Agreement - Aarav Sharma', 'Employment Agreement', employees_created['EMP-1001'], False, 512, 'Verified'),
        ('Aadhaar Card Verification - Priya Venkatesh', 'Aadhaar / ID Card', employees_created['EMP-1002'], False, 420, 'Verified'),
        ('Offer Letter Signed - Arjun Kapoor', 'Offer Letter', employees_created['EMP-1010'], False, 380, 'Verified'),
        ('Non-Disclosure Agreement (NDA) - Sneha Kulkarni', 'NDA', employees_created['EMP-1004'], False, 450, 'Verified'),
    ]
    for d_title, d_type, d_emp, is_cw, sz, d_stat in docs_seed:
        Document.objects.get_or_create(
            title=d_title,
            defaults={
                'document_type': d_type,
                'employee': d_emp,
                'is_company_wide': is_cw,
                'file_size_kb': sz,
                'file_format': 'PDF',
                'status': d_stat,
                'expiry_date': date(2027, 12, 31) if 'Insurance' in d_title else None
            }
        )

    # 16. Notifications
    notifications_data = [
        ('Leave Request from Divya Sundaram', 'Divya Sundaram has requested 2 days of Casual Leave (Sep 28 - Sep 29).', 'Leave', 'Normal', '/leave'),
        ('Payroll Calculated for Current Month', f"Payroll run for {today.strftime('%B %Y')} has been calculated for {len(employees_created)} active employees.", 'Payroll', 'High', '/payroll'),
        ('Upcoming Interview with Meenakshi Sunder', 'Technical Round interview scheduled tomorrow at 2:30 PM for Senior Full-Stack role.', 'Recruitment', 'Normal', '/recruitment'),
        ('Performance Review Cycle Active', 'Annual OKR & 360 Review submissions are open until October 31st.', 'Performance', 'High', '/performance'),
        ('New IT Asset Available', 'Dell Latitude 7440 laptops have been cataloged and ready for assignment.', 'Asset', 'Low', '/assets'),
    ]
    for n_title, n_msg, cat, prio, link in notifications_data:
        Notification.objects.get_or_create(
            title=n_title,
            defaults={
                'message': n_msg,
                'category': cat,
                'priority': prio,
                'link': link,
                'is_read': False,
                'recipient_role': 'All'
            }
        )

    print("[SUCCESS] Database successfully populated with realistic enterprise workforce data!")

if __name__ == '__main__':
    run_seed()
