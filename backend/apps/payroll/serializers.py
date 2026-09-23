from rest_framework import serializers
from .models import PayrollRun, Payslip
from apps.employees.models import Employee

class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    emp_id = serializers.ReadOnlyField(source='employee.emp_id')
    department_name = serializers.ReadOnlyField(source='employee.department.name')
    designation_name = serializers.ReadOnlyField(source='employee.designation.name')
    joining_date = serializers.ReadOnlyField(source='employee.joining_date')
    bank_name = serializers.ReadOnlyField(source='employee.bank_name')
    account_number = serializers.ReadOnlyField(source='employee.account_number')
    pan_number = serializers.ReadOnlyField(source='employee.pan_number')
    uan_number = serializers.ReadOnlyField(source='employee.uan_number')
    avatar_url = serializers.ReadOnlyField(source='employee.avatar_url')

    class Meta:
        model = Payslip
        fields = '__all__'

class PayrollRunSerializer(serializers.ModelSerializer):
    payslips_count = serializers.SerializerMethodField()

    class Meta:
        model = PayrollRun
        fields = '__all__'

    def get_payslips_count(self, obj):
        return obj.payslips.count()
