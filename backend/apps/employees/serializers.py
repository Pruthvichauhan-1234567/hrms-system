from rest_framework import serializers
from .models import Employee
from apps.core.models import Department, Designation, Location, Team

class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    designation_name = serializers.ReadOnlyField(source='designation.name')
    location_name = serializers.ReadOnlyField(source='location.name')
    manager_name = serializers.ReadOnlyField(source='manager.full_name')

    class Meta:
        model = Employee
        fields = [
            'id', 'emp_id', 'first_name', 'last_name', 'full_name', 'email',
            'phone', 'avatar_url', 'department', 'department_name',
            'designation', 'designation_name', 'location', 'location_name',
            'manager', 'manager_name', 'joining_date', 'employment_type',
            'status', 'work_mode', 'annual_ctc'
        ]

class EmployeeDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    designation_name = serializers.ReadOnlyField(source='designation.name')
    location_name = serializers.ReadOnlyField(source='location.name')
    team_name = serializers.ReadOnlyField(source='team.name')
    manager_name = serializers.ReadOnlyField(source='manager.full_name')
    direct_reports_count = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'

    def get_direct_reports_count(self, obj):
        return obj.subordinates.count()
