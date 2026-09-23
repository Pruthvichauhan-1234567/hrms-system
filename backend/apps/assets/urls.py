from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, MaintenanceRecordViewSet

router = DefaultRouter()
router.register(r'inventory', AssetViewSet)
router.register(r'maintenance', MaintenanceRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
