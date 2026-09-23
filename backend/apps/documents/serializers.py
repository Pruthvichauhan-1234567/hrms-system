from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    emp_id = serializers.ReadOnlyField(source='employee.emp_id')
    department_name = serializers.ReadOnlyField(source='employee.department.name')

    class Meta:
        model = Document
        fields = '__all__'
