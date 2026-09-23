from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date
from .models import Asset, MaintenanceRecord
from .serializers import AssetSerializer, MaintenanceRecordSerializer
from apps.employees.models import Employee

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by('-created_at')
    serializer_class = AssetSerializer

    def get_queryset(self):
        qs = Asset.objects.all().select_related('assigned_to')
        status_filter = self.request.query_params.get('status', None)
        category_filter = self.request.query_params.get('category', None)
        emp_id = self.request.query_params.get('employee_id', None)

        if status_filter and status_filter != 'All':
            qs = qs.filter(status=status_filter)
        if category_filter and category_filter != 'All':
            qs = qs.filter(category=category_filter)
        if emp_id:
            qs = qs.filter(assigned_to__id=emp_id)

        return qs

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        asset = self.get_object()
        employee_id = request.data.get('employee_id')
        if not employee_id:
            return Response({'error': 'Employee ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        emp = Employee.objects.filter(id=employee_id).first()
        if not emp:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

        asset.assigned_to = emp
        asset.assigned_date = date.today()
        asset.status = 'Assigned'
        asset.save()

        return Response({'status': 'Asset assigned', 'asset': AssetSerializer(asset).data})

    @action(detail=True, methods=['post'])
    def return_asset(self, request, pk=None):
        asset = self.get_object()
        asset.assigned_to = None
        asset.assigned_date = None
        asset.status = 'Available'
        asset.save()

        return Response({'status': 'Asset returned to inventory', 'asset': AssetSerializer(asset).data})

class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all().order_by('-service_date')
    serializer_class = MaintenanceRecordSerializer
