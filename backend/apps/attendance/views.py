from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from datetime import date, datetime, time
from .models import Shift, Holiday, AttendanceRecord, AttendanceCorrection
from .serializers import ShiftSerializer, HolidaySerializer, AttendanceRecordSerializer, AttendanceCorrectionSerializer
from apps.employees.models import Employee

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

class HolidayViewSet(viewsets.ModelViewSet):
    queryset = Holiday.objects.all().order_by('date')
    serializer_class = HolidaySerializer

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().order_by('-date')
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        qs = AttendanceRecord.objects.all().select_related('employee', 'shift')
        date_str = self.request.query_params.get('date', None)
        emp_id = self.request.query_params.get('employee_id', None)
        status_filter = self.request.query_params.get('status', None)

        if date_str:
            qs = qs.filter(date=date_str)
        if emp_id:
            qs = qs.filter(employee__id=emp_id)
        if status_filter and status_filter != 'All':
            qs = qs.filter(status=status_filter)

        return qs

    @action(detail=False, methods=['post'])
    def punch(self, request):
        """Simulate interactive check-in or check-out for current user/employee"""
        emp_id = request.data.get('employee_id')
        action_type = request.data.get('action') # 'check_in' or 'check_out'
        today = date.today()
        now_time = datetime.now().time()

        if not emp_id:
            emp = Employee.objects.first()
        else:
            emp = Employee.objects.filter(id=emp_id).first() or Employee.objects.first()

        record, created = AttendanceRecord.objects.get_or_create(
            employee=emp,
            date=today,
            defaults={
                'check_in': now_time,
                'status': 'Present' if now_time <= time(9, 30) else 'Late',
                'work_hours': 0.0
            }
        )

        if not created:
            if action_type == 'check_out':
                record.check_out = now_time
                # Compute approximate work hours
                if record.check_in:
                    dt_in = datetime.combine(today, record.check_in)
                    dt_out = datetime.combine(today, now_time)
                    diff_hours = (dt_out - dt_in).total_seconds() / 3600.0
                    record.work_hours = round(max(0.5, diff_hours), 2)
                    if record.work_hours > 8.5:
                        record.overtime_hours = round(record.work_hours - 8.5, 2)
                record.save()
            elif action_type == 'check_in' and not record.check_in:
                record.check_in = now_time
                record.status = 'Present' if now_time <= time(9, 30) else 'Late'
                record.save()

        return Response({
            'status': 'success',
            'message': f"Successfully recorded {action_type} for {emp.full_name}",
            'record': AttendanceRecordSerializer(record).data
        })

class AttendanceCorrectionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceCorrection.objects.all().order_by('-created_at')
    serializer_class = AttendanceCorrectionSerializer
