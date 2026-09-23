from rest_framework import serializers
from .models import Asset, MaintenanceRecord

class MaintenanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'

class AssetSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.full_name')
    assigned_to_emp_id = serializers.ReadOnlyField(source='assigned_to.emp_id')
    assigned_to_department = serializers.ReadOnlyField(source='assigned_to.department.name')
    maintenance_logs = MaintenanceRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'
