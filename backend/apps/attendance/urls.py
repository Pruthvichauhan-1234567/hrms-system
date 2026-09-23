from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShiftViewSet, HolidayViewSet, AttendanceRecordViewSet, AttendanceCorrectionViewSet

router = DefaultRouter()
router.register(r'shifts', ShiftViewSet)
router.register(r'holidays', HolidayViewSet)
router.register(r'records', AttendanceRecordViewSet)
router.register(r'corrections', AttendanceCorrectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
