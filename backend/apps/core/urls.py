from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet, DepartmentViewSet, DesignationViewSet,
    TeamViewSet, CompanySettingViewSet, NotificationViewSet,
    get_org_tree, global_search, get_dashboard_stats
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'designations', DesignationViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'settings', CompanySettingViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('org-tree/', get_org_tree, name='org-tree'),
    path('global-search/', global_search, name='global-search'),
    path('dashboard-stats/', get_dashboard_stats, name='dashboard-stats'),
    path('', include(router.urls)),
]
