from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Employee
from .serializers import EmployeeListSerializer, EmployeeDetailSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('-id')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeDetailSerializer

    def get_queryset(self):
        qs = Employee.objects.all().select_related('department', 'designation', 'location', 'manager', 'team')
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(emp_id__icontains=search) |
                Q(email__icontains=search) |
                Q(designation__name__icontains=search)
            )
            
        # Department filter
        department = self.request.query_params.get('department', None)
        if department and department != 'All':
            qs = qs.filter(department__name=department)
            
        # Status filter
        emp_status = self.request.query_params.get('status', None)
        if emp_status and emp_status != 'All':
            qs = qs.filter(status=emp_status)

        # Employment type filter
        emp_type = self.request.query_params.get('employment_type', None)
        if emp_type and emp_type != 'All':
            qs = qs.filter(employment_type=emp_type)

        return qs

    @action(detail=True, methods=['get'])
    def full_profile(self, request, pk=None):
        """Aggregate 360-degree Employee Profile Data"""
        employee = self.get_object()
        
        # Attendance records
        attendance_logs = [{
            'id': a.id,
            'date': a.date,
            'check_in': a.check_in.strftime('%H:%M') if a.check_in else '-',
            'check_out': a.check_out.strftime('%H:%M') if a.check_out else '-',
            'work_hours': a.work_hours,
            'status': a.status
        } for a in employee.attendance_records.order_by('-date')[:15]]

        # Leave Balances
        leave_balances = [{
            'id': b.id,
            'type_name': b.leave_type.name,
            'type_code': b.leave_type.code,
            'total': b.total_allocated,
            'used': b.used,
            'pending': b.pending,
            'available': b.available,
            'color': b.leave_type.color_code
        } for b in employee.leave_balances.all()]

        # Leave Requests
        leave_requests = [{
            'id': r.id,
            'type_name': r.leave_type.name,
            'start_date': r.start_date,
            'end_date': r.end_date,
            'days': r.days_count,
            'reason': r.reason,
            'status': r.status,
            'created_at': r.created_at.strftime('%Y-%m-%d')
        } for r in employee.leave_requests.order_by('-created_at')[:10]]

        # Payslips
        payslips = [{
            'id': p.id,
            'number': p.payslip_number,
            'period': f"{p.month}/{p.year}",
            'gross': float(p.gross_earnings),
            'deductions': float(p.total_deductions),
            'net': float(p.net_salary),
            'status': p.payment_status,
            'payment_date': p.payment_date
        } for p in employee.payslips.order_by('-year', '-month')[:6]]

        # Assigned Assets
        assigned_assets = [{
            'id': ast.id,
            'asset_id': ast.asset_id,
            'name': ast.name,
            'category': ast.category,
            'brand_model': ast.brand_model,
            'serial_number': ast.serial_number,
            'condition': ast.condition,
            'assigned_date': ast.assigned_date,
            'status': ast.status
        } for ast in employee.assigned_assets.all()]

        # Documents
        documents = [{
            'id': doc.id,
            'title': doc.title,
            'type': doc.document_type,
            'size_kb': doc.file_size_kb,
            'format': doc.file_format,
            'status': doc.status,
            'expiry_date': doc.expiry_date,
            'uploaded_at': doc.uploaded_at.strftime('%Y-%m-%d')
        } for doc in employee.documents.all()]

        # Goals & Reviews
        goals = [{
            'id': g.id,
            'title': g.title,
            'category': g.category,
            'progress': g.progress,
            'status': g.status,
            'due_date': g.due_date
        } for g in employee.goals.all()]

        reviews = [{
            'id': rev.id,
            'cycle_title': rev.cycle.title,
            'overall_rating': rev.overall_rating,
            'status': rev.status,
            'review_date': rev.review_date,
            'manager_feedback': rev.manager_feedback
        } for rev in employee.performance_reviews.all()]

        detail_data = EmployeeDetailSerializer(employee).data
        detail_data['attendance_logs'] = attendance_logs
        detail_data['leave_balances'] = leave_balances
        detail_data['leave_requests'] = leave_requests
        detail_data['payslips'] = payslips
        detail_data['assigned_assets'] = assigned_assets
        detail_data['documents'] = documents
        detail_data['goals'] = goals
        detail_data['reviews'] = reviews

        return Response(detail_data)
