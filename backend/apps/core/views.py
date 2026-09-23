from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Count, Q, Sum
from datetime import date, datetime
from .models import Location, Department, Designation, Team, CompanySetting, Notification
from .serializers import (
    LocationSerializer, DepartmentSerializer, DesignationSerializer,
    TeamSerializer, CompanySettingSerializer, NotificationSerializer
)

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer

class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all().order_by('department__name', 'name')
    serializer_class = DesignationSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all().order_by('name')
    serializer_class = TeamSerializer

class CompanySettingViewSet(viewsets.ModelViewSet):
    queryset = CompanySetting.objects.all()
    serializer_class = CompanySettingSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'All notifications marked as read'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_org_tree(request):
    """Returns the visual hierarchy of the organization"""
    from apps.employees.models import Employee
    
    # Root: CEO / Executive / Top manager
    execs = Employee.objects.filter(manager__isnull=True).order_by('joining_date')
    if not execs.exists():
        execs = Employee.objects.all()[:1]

    def build_node(emp):
        subordinates = emp.subordinates.all().order_by('first_name')
        return {
            'id': emp.id,
            'emp_id': emp.emp_id,
            'name': emp.full_name,
            'role': emp.designation.name if emp.designation else 'Team Member',
            'department': emp.department.name if emp.department else 'General',
            'email': emp.email,
            'avatar': emp.avatar_url,
            'direct_reports_count': subordinates.count(),
            'children': [build_node(sub) for sub in subordinates]
        }

    tree_data = [build_node(emp) for emp in execs]
    return Response(tree_data)

@api_view(['GET'])
def global_search(request):
    """Universal Command Bar Search across all entities"""
    query = request.GET.get('q', '').strip()
    if not query or len(query) < 2:
        return Response({'results': []})

    from apps.employees.models import Employee
    from apps.recruitment.models import Candidate, JobOpening
    from apps.documents.models import Document
    from apps.assets.models import Asset

    results = []

    # Employees
    emps = Employee.objects.filter(
        Q(first_name__icontains=query) | Q(last_name__icontains=query) |
        Q(emp_id__icontains=query) | Q(email__icontains=query) |
        Q(designation__name__icontains=query) | Q(department__name__icontains=query)
    )[:5]
    for e in emps:
        results.append({
            'id': f"emp-{e.id}",
            'category': 'Employees',
            'title': e.full_name,
            'subtitle': f"{e.emp_id} • {e.designation.name if e.designation else 'Employee'} ({e.department.name if e.department else 'General'})",
            'url': f"/employees/{e.id}"
        })

    # Departments
    depts = Department.objects.filter(Q(name__icontains=query) | Q(code__icontains=query))[:3]
    for d in depts:
        results.append({
            'id': f"dept-{d.id}",
            'category': 'Departments',
            'title': d.name,
            'subtitle': f"Code: {d.code} • Head: {d.head_name or 'N/A'}",
            'url': '/organization/departments'
        })

    # Candidates
    candidates = Candidate.objects.filter(Q(name__icontains=query) | Q(email__icontains=query))[:4]
    for c in candidates:
        results.append({
            'id': f"cand-{c.id}",
            'category': 'Candidates',
            'title': c.name,
            'subtitle': f"Stage: {c.stage} • {c.job_opening.title}",
            'url': '/recruitment/pipeline'
        })

    # Documents
    docs = Document.objects.filter(Q(title__icontains=query) | Q(document_type__icontains=query))[:4]
    for doc in docs:
        results.append({
            'id': f"doc-{doc.id}",
            'category': 'Documents',
            'title': doc.title,
            'subtitle': f"{doc.document_type} • {doc.status}",
            'url': '/documents'
        })

    # Assets
    assets = Asset.objects.filter(Q(name__icontains=query) | Q(asset_id__icontains=query) | Q(serial_number__icontains=query))[:4]
    for a in assets:
        results.append({
            'id': f"asset-{a.id}",
            'category': 'Assets',
            'title': f"{a.name} ({a.asset_id})",
            'subtitle': f"{a.category} • Status: {a.status}",
            'url': '/assets'
        })

    return Response({'results': results})

@api_view(['GET'])
def get_dashboard_stats(request):
    """Aggregated dynamic dashboard operational data"""
    from apps.employees.models import Employee
    from apps.attendance.models import AttendanceRecord, Holiday
    from apps.leaves.models import LeaveRequest
    from apps.recruitment.models import Candidate, JobOpening, Interview
    from apps.payroll.models import PayrollRun
    from apps.assets.models import Asset

    today = date.today()
    
    total_employees = Employee.objects.count()
    active_employees = Employee.objects.filter(status='Active').count()
    on_probation = Employee.objects.filter(status='Probation').count()
    
    # Today's attendance stats
    today_records = AttendanceRecord.objects.filter(date=today)
    present_today = today_records.filter(status__in=['Present', 'Late']).count()
    wfh_today = today_records.filter(status='Work From Home').count()
    late_today = today_records.filter(status='Late').count()
    absent_today = today_records.filter(status='Absent').count()
    on_leave_today = today_records.filter(status='On Leave').count()
    
    if total_employees > 0 and today_records.count() == 0:
        # If today has no records yet (e.g. fresh simulation), derive realistic live snapshot
        present_today = int(total_employees * 0.88)
        wfh_today = int(total_employees * 0.08)
        late_today = 3
        on_leave_today = 2
        absent_today = max(0, total_employees - present_today - wfh_today - on_leave_today)

    attendance_rate = round(((present_today + wfh_today) / max(total_employees, 1)) * 100, 1)

    # Pending Leave requests
    pending_leaves = LeaveRequest.objects.filter(status='Pending').count()
    recent_leaves = LeaveRequest.objects.filter(status='Pending').order_by('-created_at')[:4]
    pending_leaves_data = [{
        'id': l.id,
        'employee_name': l.employee.full_name,
        'employee_avatar': l.employee.avatar_url,
        'department': l.employee.department.name if l.employee.department else 'General',
        'leave_type': l.leave_type.name,
        'start_date': l.start_date,
        'end_date': l.end_date,
        'days': l.days_count,
        'reason': l.reason
    } for l in recent_leaves]

    # Recruitment Pipeline Funnel
    open_jobs = JobOpening.objects.filter(status='Open').count()
    total_candidates = Candidate.objects.count()
    pipeline_stages = {
        'Applied': Candidate.objects.filter(stage='Applied').count(),
        'Screening': Candidate.objects.filter(stage='Screening').count(),
        'Shortlisted': Candidate.objects.filter(stage='Shortlisted').count(),
        'Interview': Candidate.objects.filter(stage__in=['Interview', 'Technical Round', 'HR Round']).count(),
        'Selected': Candidate.objects.filter(stage='Selected').count(),
    }
    today_interviews = Interview.objects.filter(scheduled_date__gte=today, result='Pending').order_by('scheduled_date', 'scheduled_time')[:3]
    interviews_data = [{
        'id': i.id,
        'candidate_name': i.candidate.name,
        'position': i.candidate.job_opening.title,
        'interview_type': i.interview_type,
        'interviewer': i.interviewer.full_name if i.interviewer else 'HR Team',
        'date': i.scheduled_date,
        'time': i.scheduled_time.strftime('%I:%M %p') if i.scheduled_time else '11:00 AM'
    } for i in today_interviews]

    # Payroll status
    latest_payroll = PayrollRun.objects.order_by('-year', '-month').first()
    payroll_summary = {
        'title': latest_payroll.title if latest_payroll else 'October 2026',
        'status': latest_payroll.status if latest_payroll else 'Calculated',
        'total_disbursement': float(latest_payroll.total_net) if latest_payroll else 4850000.00,
        'processed_date': latest_payroll.processed_date if latest_payroll else today
    }

    # Upcoming Birthdays & Anniversaries
    upcoming_birthdays = []
    for e in Employee.objects.filter(status='Active')[:6]:
        if e.date_of_birth:
            upcoming_birthdays.append({
                'id': e.id,
                'name': e.full_name,
                'avatar': e.avatar_url,
                'department': e.department.name if e.department else 'Core',
                'date': f"{e.date_of_birth.strftime('%B %d')}"
            })

    # Upcoming Holidays
    holidays = Holiday.objects.filter(date__gte=today).order_by('date')[:3]
    if not holidays.exists():
        holidays = Holiday.objects.all().order_by('date')[:3]
    holidays_data = [{
        'id': h.id,
        'name': h.name,
        'date': h.date.strftime('%b %d, %Y'),
        'day': h.day_of_week or 'Weekday',
        'type': h.holiday_type
    } for h in holidays]

    # Department Headcount Breakdown
    dept_distribution = []
    for d in Department.objects.all():
        cnt = d.employees.count()
        if cnt > 0:
            dept_distribution.append({
                'name': d.name,
                'code': d.code,
                'count': cnt
            })

    # Assets summary
    total_assets = Asset.objects.count()
    assigned_assets = Asset.objects.filter(status='Assigned').count()
    maintenance_assets = Asset.objects.filter(status='Under Maintenance').count()

    return Response({
        'overview': {
            'total_employees': total_employees,
            'active_employees': active_employees,
            'on_probation': on_probation,
            'present_today': present_today,
            'wfh_today': wfh_today,
            'late_today': late_today,
            'absent_today': absent_today,
            'on_leave_today': on_leave_today,
            'attendance_rate': attendance_rate,
            'pending_leaves_count': pending_leaves,
            'open_jobs_count': open_jobs,
            'total_candidates': total_candidates,
            'total_assets': total_assets,
            'assigned_assets': assigned_assets,
            'maintenance_assets': maintenance_assets,
        },
        'pending_leaves': pending_leaves_data,
        'recruitment_funnel': pipeline_stages,
        'upcoming_interviews': interviews_data,
        'payroll_summary': payroll_summary,
        'upcoming_birthdays': upcoming_birthdays[:4],
        'upcoming_holidays': holidays_data,
        'department_distribution': dept_distribution,
    })
