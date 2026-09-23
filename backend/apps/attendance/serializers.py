from rest_framework import serializers
from .models import Shift, Holiday, AttendanceRecord, AttendanceCorrection

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'

class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    emp_id = serializers.ReadOnlyField(source='employee.emp_id')
    department_name = serializers.ReadOnlyField(source='employee.department.name')
    avatar_url = serializers.ReadOnlyField(source='employee.avatar_url')
    shift_name = serializers.ReadOnlyField(source='shift.name')

    class Meta:
        model = AttendanceRecord
        fields = '__all__'

class AttendanceCorrectionSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    emp_id = serializers.ReadOnlyField(source='employee.emp_id')

    class Meta:
        model = AttendanceCorrection
        fields = '__all__'
