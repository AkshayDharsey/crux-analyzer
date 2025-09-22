from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from datetime import datetime

def api_root(request):
    """API root endpoint"""
    return JsonResponse({
        'message': 'Chrome UX Report Analyzer API',
        'version': '1.0.0',
        'endpoints': {
            'analyze': '/api/analyze/',
            'history': '/api/history/',
            'health': '/api/health/'
        },
        'status': 'active',
        'timestamp': datetime.now().isoformat()
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('crux_api.urls')),
    path('', api_root, name='api_root'),
]