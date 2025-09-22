from rest_framework import serializers
from .models import CruxReport, AnalysisSession

class CruxReportSerializer(serializers.ModelSerializer):
    """Serializer for CruxReport model"""
    class Meta:
        model = CruxReport
        fields = '__all__'

class AnalysisSessionSerializer(serializers.ModelSerializer):
    """Serializer for AnalysisSession model"""
    class Meta:
        model = AnalysisSession
        fields = '__all__'

class URLAnalysisSerializer(serializers.Serializer):
    """Serializer for URL analysis request"""
    urls = serializers.ListField(
        child=serializers.URLField(),
        min_length=1,
        max_length=10,  # Limit to 10 URLs to prevent abuse
        help_text="List of URLs to analyze (1-10 URLs)"
    )
    form_factor = serializers.ChoiceField(
        choices=['ALL_FORM_FACTORS', 'PHONE', 'DESKTOP', 'TABLET'],
        default='ALL_FORM_FACTORS',
        help_text="Device type to analyze"
    )

    def validate_urls(self, value):
        """Custom validation for URLs"""
        if not value:
            raise serializers.ValidationError("At least one URL is required")
        
        # Validate each URL
        validated_urls = []
        for url in value:
            if not (url.startswith('http://') or url.startswith('https://')):
                raise serializers.ValidationError(f"Invalid URL: {url}. URLs must start with http:// or https://")
            validated_urls.append(url)
        
        # Check for duplicates
        if len(set(validated_urls)) != len(validated_urls):
            raise serializers.ValidationError("Duplicate URLs are not allowed")
        
        return validated_urls

class MetricDataSerializer(serializers.Serializer):
    """Serializer for individual metric data"""
    metric_name = serializers.CharField(help_text="Name of the performance metric")
    p75_value = serializers.FloatField(
        allow_null=True, 
        help_text="75th percentile value for this metric"
    )
    good_ratio = serializers.FloatField(
        allow_null=True,
        help_text="Percentage of users with good experience (0-1)"
    )
    needs_improvement_ratio = serializers.FloatField(
        allow_null=True,
        help_text="Percentage of users with needs improvement experience (0-1)"
    )
    poor_ratio = serializers.FloatField(
        allow_null=True,
        help_text="Percentage of users with poor experience (0-1)"
    )

class CruxAnalysisResultSerializer(serializers.Serializer):
    """Serializer for formatted CrUX analysis results"""
    url = serializers.URLField(help_text="The analyzed URL")
    form_factor = serializers.CharField(help_text="Device type used for analysis")
    metrics = MetricDataSerializer(many=True, help_text="Performance metrics data")
    overall_performance = serializers.CharField(help_text="Overall performance rating")
    created_at = serializers.DateTimeField(help_text="Timestamp of analysis")

class SummaryStatisticsSerializer(serializers.Serializer):
    """Serializer for summary statistics across multiple URLs"""
    metric_name = serializers.CharField(help_text="Name of the performance metric")
    average_p75 = serializers.FloatField(
        allow_null=True,
        help_text="Average P75 value across all analyzed URLs"
    )
    best_url = serializers.URLField(
        allow_null=True,
        help_text="URL with the best performance for this metric"
    )
    worst_url = serializers.URLField(
        allow_null=True,
        help_text="URL with the worst performance for this metric"
    )
    best_value = serializers.FloatField(
        allow_null=True,
        help_text="Best P75 value for this metric"
    )
    worst_value = serializers.FloatField(
        allow_null=True,
        help_text="Worst P75 value for this metric"
    )

class AnalysisResponseSerializer(serializers.Serializer):
    """Serializer for the complete analysis response"""
    session_id = serializers.CharField(help_text="Unique session identifier")
    results = CruxAnalysisResultSerializer(many=True, help_text="Analysis results for each URL")
    summary = SummaryStatisticsSerializer(
        many=True, 
        required=False,
        help_text="Summary statistics (only for multiple URLs)"
    )
    note = serializers.CharField(
        required=False,
        help_text="Additional notes about the analysis"
    )

class ErrorResponseSerializer(serializers.Serializer):
    """Serializer for error responses"""
    error = serializers.CharField(help_text="Error message")
    details = serializers.CharField(
        required=False,
        help_text="Additional error details"
    )

class HealthCheckSerializer(serializers.Serializer):
    """Serializer for health check response"""
    status = serializers.CharField(help_text="Service status")
    timestamp = serializers.DateTimeField(help_text="Current timestamp")
    version = serializers.CharField(help_text="API version")