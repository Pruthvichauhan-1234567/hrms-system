from rest_framework import serializers
from .models import LeaveType, LeaveBalance, LeaveRequest

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.ReadOnlyField(source='leave_type.name')
    leave_type_code = serializers.ReadOnlyField(source='leave_type.code')
    color_code = serializers.ReadOnlyField(source='leave_type.color_code')
    available = serializers.ReadOnlyField()

    class Meta:
        model = LeaveBalance
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    emp_id = serializers.ReadOnlyField(source='employee.emp_id')
    avatar_url = serializers.ReadOnlyField(source='employee.avatar_url')
    department_name = serializers.ReadOnlyField(source='employee.department.name')
    leave_type_name = serializers.ReadOnlyField(source='leave_type.name')
    leave_type_code = serializers.ReadOnlyField(source='leave_type.code')
    color_code = serializers.ReadOnlyField(source='leave_type.color_code')

    class Meta:
        model = LeaveRequest
        fields = '__all__'
