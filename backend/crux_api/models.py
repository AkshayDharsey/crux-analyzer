from django.db import models
from django.utils import timezone

class CruxReport(models.Model):
    """Model to store CrUX report data"""
    url = models.URLField(max_length=500)
    form_factor = models.CharField(max_length=20, default='ALL_FORM_FACTORS')
    
    # Core Web Vitals
    largest_contentful_paint = models.FloatField(null=True, blank=True)
    first_input_delay = models.FloatField(null=True, blank=True)
    cumulative_layout_shift = models.FloatField(null=True, blank=True)
    
    # Additional metrics
    first_contentful_paint = models.FloatField(null=True, blank=True)
    interaction_to_next_paint = models.FloatField(null=True, blank=True)
    time_to_first_byte = models.FloatField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(default=timezone.now)
    api_response = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"CrUX Report for {self.url} - {self.form_factor}"

class AnalysisSession(models.Model):
    """Model to group multiple URL analyses together"""
    session_id = models.CharField(max_length=100, unique=True)
    urls = models.JSONField(default=list)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Analysis Session {self.session_id}"