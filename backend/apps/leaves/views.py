from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import LeaveType, LeaveBalance, LeaveRequest
from .serializers import LeaveTypeSerializer, LeaveBalanceSerializer, LeaveRequestSerializer

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer

class LeaveBalanceViewSet(viewsets.ModelViewSet):
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer

    def get_queryset(self):
        qs = LeaveBalance.objects.all()
        emp_id = self.request.query_params.get('employee_id', None)
        if emp_id:
            qs = qs.filter(employee__id=emp_id)
        return qs

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().order_by('-created_at')
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        qs = LeaveRequest.objects.all().select_related('employee', 'leave_type')
        status_filter = self.request.query_params.get('status', None)
        emp_id = self.request.query_params.get('employee_id', None)

        if status_filter and status_filter != 'All':
            qs = qs.filter(status=status_filter)
        if emp_id:
            qs = qs.filter(employee__id=emp_id)

        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave_req = self.get_object()
        remarks = request.data.get('remarks', 'Approved by manager')
        leave_req.status = 'Approved'
        leave_req.manager_remarks = remarks
        leave_req.action_at = timezone.now()
        leave_req.save()

        # Update balance
        bal = LeaveBalance.objects.filter(employee=leave_req.employee, leave_type=leave_req.leave_type).first()
        if bal:
            bal.used += float(leave_req.days_count)
            bal.pending = max(0.0, bal.pending - float(leave_req.days_count))
            bal.save()

        return Response({'status': 'Approved', 'data': LeaveRequestSerializer(leave_req).data})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave_req = self.get_object()
        remarks = request.data.get('remarks', 'Rejected due to business requirements')
        leave_req.status = 'Rejected'
        leave_req.manager_remarks = remarks
        leave_req.action_at = timezone.now()
        leave_req.save()

        # Clear pending balance
        bal = LeaveBalance.objects.filter(employee=leave_req.employee, leave_type=leave_req.leave_type).first()
        if bal:
            bal.pending = max(0.0, bal.pending - float(leave_req.days_count))
            bal.save()

        return Response({'status': 'Rejected', 'data': LeaveRequestSerializer(leave_req).data})
