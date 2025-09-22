from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_urls, name='analyze_urls'),
    path('history/', views.get_analysis_history, name='analysis_history'),
    path('health/', views.health_check, name='health_check'),
    path('debug/mock/', views.debug_mock_data, name='debug_mock_data'),
    path('debug/multiple/', views.debug_multiple_urls, name='debug_multiple_urls'),
]