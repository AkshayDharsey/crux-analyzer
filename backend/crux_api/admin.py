from django.contrib import admin
from .models import CruxReport, AnalysisSession

@admin.register(CruxReport)
class CruxReportAdmin(admin.ModelAdmin):
    list_display = ['url', 'form_factor', 'largest_contentful_paint', 'created_at']
    list_filter = ['form_factor', 'created_at']
    search_fields = ['url']
    readonly_fields = ['created_at']

@admin.register(AnalysisSession)
class AnalysisSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'created_at']
    readonly_fields = ['created_at']