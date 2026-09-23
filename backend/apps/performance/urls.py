from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerformanceCycleViewSet, GoalViewSet, PerformanceReviewViewSet

router = DefaultRouter()
router.register(r'cycles', PerformanceCycleViewSet)
router.register(r'goals', GoalViewSet)
router.register(r'reviews', PerformanceReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
