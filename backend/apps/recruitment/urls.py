from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobOpeningViewSet, CandidateViewSet, InterviewViewSet

router = DefaultRouter()
router.register(r'jobs', JobOpeningViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'interviews', InterviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
