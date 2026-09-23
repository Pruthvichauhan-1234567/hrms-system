from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date
from decimal import Decimal
from .models import PayrollRun, Payslip
from .serializers import PayrollRunSerializer, PayslipSerializer
from apps.employees.models import Employee

class PayrollRunViewSet(viewsets.ModelViewSet):
    queryset = PayrollRun.objects.all().order_by('-year', '-month')
    serializer_class = PayrollRunSerializer

    @action(detail=False, methods=['post'])
    def process_month(self, request):
        """Calculate and generate payroll run and payslips for all active employees"""
        month = int(request.data.get('month', date.today().month))
        year = int(request.data.get('year', date.today().year))
        title = request.data.get('title', f"Payroll - {date(year, month, 1).strftime('%B %Y')}")

        payroll_run, created = PayrollRun.objects.get_or_create(
            month=month,
            year=year,
            defaults={
                'title': title,
                'status': 'Calculated',
                'processed_date': date.today()
            }
        )

        active_employees = Employee.objects.filter(status__in=['Active', 'Probation', 'On Notice'])
        total_gross = Decimal('0.00')
        total_ded = Decimal('0.00')
        total_net = Decimal('0.00')

        for emp in active_employees:
            monthly_ctc = emp.annual_ctc / Decimal('12.0')
            basic = round(emp.basic_salary / Decimal('12.0'), 2)
            hra = round(emp.hra / Decimal('12.0'), 2)
            special = round(emp.special_allowances / Decimal('12.0'), 2)
            bonus = Decimal('0.00')
            overtime = Decimal('0.00')

            gross = basic + hra + special + bonus + overtime

            # Deductions
            # Provident Fund: 12% of basic up to standard cap
            pf = round(min(basic * Decimal('0.12'), Decimal('1800.00')), 2)
            pt = Decimal('200.00')
            # Estimated Income Tax TDS
            taxable_monthly = gross - pf - pt
            tds = round(max(Decimal('0.00'), taxable_monthly * Decimal('0.08')), 2) if gross > Decimal('50000.00') else Decimal('0.00')
            deductions = pf + pt + tds
            net = gross - deductions

            payslip_no = f"PAY-{year}{month:02d}-{emp.emp_id}"
            
            Payslip.objects.update_or_create(
                payroll_run=payroll_run,
                employee=emp,
                defaults={
                    'payslip_number': payslip_no,
                    'month': month,
                    'year': year,
                    'basic_salary': basic,
                    'hra': hra,
                    'special_allowance': special,
                    'performance_bonus': bonus,
                    'overtime_pay': overtime,
                    'gross_earnings': gross,
                    'provident_fund': pf,
                    'professional_tax': pt,
                    'income_tax_tds': tds,
                    'other_deductions': Decimal('0.00'),
                    'total_deductions': deductions,
                    'net_salary': net,
                    'payment_status': 'Generated',
                    'working_days': 22,
                    'paid_days': 22.0
                }
            )

            total_gross += gross
            total_ded += deductions
            total_net += net

        payroll_run.total_employees = active_employees.count()
        payroll_run.total_gross = total_gross
        payroll_run.total_deductions = total_ded
        payroll_run.total_net = total_net
        payroll_run.status = 'Calculated'
        payroll_run.save()

        return Response({
            'status': 'success',
            'message': f"Processed payroll for {active_employees.count()} employees",
            'payroll_run': PayrollRunSerializer(payroll_run).data
        })

    @action(detail=True, methods=['post'])
    def approve_and_disburse(self, request, pk=None):
        payroll_run = self.get_object()
        payroll_run.status = 'Disbursed'
        payroll_run.disbursement_date = date.today()
        payroll_run.save()

        payroll_run.payslips.update(payment_status='Paid', payment_date=date.today())

        return Response({
            'status': 'success',
            'message': 'Payroll run approved and disbursed successfully',
            'payroll_run': PayrollRunSerializer(payroll_run).data
        })

class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.all().order_by('-year', '-month')
    serializer_class = PayslipSerializer

    def get_queryset(self):
        qs = Payslip.objects.all().select_related('employee', 'payroll_run')
        emp_id = self.request.query_params.get('employee_id', None)
        run_id = self.request.query_params.get('payroll_run_id', None)
        if emp_id:
            qs = qs.filter(employee__id=emp_id)
        if run_id:
            qs = qs.filter(payroll_run__id=run_id)
        return qs
