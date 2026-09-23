from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

@api_view(['GET'])
def api_root(request):
    return Response({
        'system': 'PeoplePulse Enterprise HRMS REST API',
        'version': '1.0.0',
        'status': 'Healthy',
        'modules': [
            '/api/v1/core/',
            '/api/v1/employees/',
            '/api/v1/recruitment/',
            '/api/v1/attendance/',
            '/api/v1/leaves/',
            '/api/v1/payroll/',
            '/api/v1/performance/',
            '/api/v1/documents/',
            '/api/v1/assets/',
        ]
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api_root),
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Domain APIs
    path('api/v1/core/', include('apps.core.urls')),
    path('api/v1/employees/', include('apps.employees.urls')),
    path('api/v1/recruitment/', include('apps.recruitment.urls')),
    path('api/v1/attendance/', include('apps.attendance.urls')),
    path('api/v1/leaves/', include('apps.leaves.urls')),
    path('api/v1/payroll/', include('apps.payroll.urls')),
    path('api/v1/performance/', include('apps.performance.urls')),
    path('api/v1/documents/', include('apps.documents.urls')),
    path('api/v1/assets/', include('apps.assets.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
