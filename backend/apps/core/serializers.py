from rest_framework import serializers
from .models import Location, Department, Designation, Team, CompanySetting, Notification

class LocationSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = '__all__'

    def get_employee_count(self, obj):
        return obj.employees.count() if hasattr(obj, 'employees') else 0

class DesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Designation
        fields = '__all__'

    def get_employee_count(self, obj):
        return obj.employees.count() if hasattr(obj, 'employees') else 0

class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()
    designations = DesignationSerializer(many=True, read_only=True)
    location_name = serializers.ReadOnlyField(source='location.name')

    class Meta:
        model = Department
        fields = '__all__'

    def get_employee_count(self, obj):
        return obj.employees.count() if hasattr(obj, 'employees') else 0

class TeamSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = '__all__'

    def get_member_count(self, obj):
        return obj.members.count() if hasattr(obj, 'members') else 0

class CompanySettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySetting
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
