from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollRunViewSet, PayslipViewSet

router = DefaultRouter()
router.register(r'runs', PayrollRunViewSet)
router.register(r'payslips', PayslipViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
