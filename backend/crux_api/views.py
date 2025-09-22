import requests
import logging
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import CruxReport, AnalysisSession
from datetime import datetime
import uuid
import json

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def debug_multiple_urls(request):
    """Debug endpoint to test multiple URL analysis"""
    test_urls = ['https://example.com', 'https://test.com', 'https://demo.com']
    
    try:
        # Simulate the same logic as analyze_urls
        results = []
        for i, url in enumerate(test_urls):
            base_lcp = 2000.0 + (i * 200.0)  # Ensure float
            base_inp = 50.0 + (i * 25.0)     # Ensure float
            base_cls = 0.05 + (i * 0.02)     # Ensure float
            
            results.append({
                'url': url,
                'form_factor': 'ALL_FORM_FACTORS',
                'metrics': [
                    {
                        'metric_name': 'Largest Contentful Paint (LCP)',
                        'p75_value': base_lcp,
                        'good_ratio': 0.8 - (i * 0.1),
                        'needs_improvement_ratio': 0.15,
                        'poor_ratio': 0.05 + (i * 0.1)
                    },
                    {
                        'metric_name': 'Interaction to Next Paint (INP)',
                        'p75_value': base_inp,
                        'good_ratio': 0.85 - (i * 0.05),
                        'needs_improvement_ratio': 0.10,
                        'poor_ratio': 0.05 + (i * 0.05)
                    }
                ],
                'overall_performance': 'Good' if i == 0 else 'Needs Improvement',
                'created_at': datetime.now().isoformat()
            })
        
        # Test summary calculation
        summary = calculate_summary_statistics(results)
        
        return Response({
            'debug': True,
            'message': 'Multiple URL analysis test',
            'results': results,
            'summary': summary,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            'debug': True,
            'error': str(e),
            'message': 'Debug test failed',
            'timestamp': datetime.now().isoformat()
        }, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_mock_data(request):
    """Debug endpoint to test mock data generation"""
    test_urls = ['https://example.com', 'https://test.com']
    mock_results = []
    
    for i, url in enumerate(test_urls):
        base_lcp = 2000 + (i * 200)
        performance_rating = 'Good' if i % 3 == 0 else 'Needs Improvement'
        
        mock_results.append({
            'url': url,
            'form_factor': 'ALL_FORM_FACTORS',
            'metrics': [
                {
                    'metric_name': 'Largest Contentful Paint (LCP)',
                    'p75_value': base_lcp,
                    'good_ratio': 0.8 - (i * 0.1),
                    'needs_improvement_ratio': 0.15,
                    'poor_ratio': 0.05 + (i * 0.1)
                },
                {
                    'metric_name': 'First Input Delay (FID)', 
                    'p75_value': 50 + (i * 25),
                    'good_ratio': 0.85 - (i * 0.05),
                    'needs_improvement_ratio': 0.10,
                    'poor_ratio': 0.05 + (i * 0.05)
                }
            ],
            'overall_performance': performance_rating,
            'created_at': datetime.now().isoformat()
        })
    
    return Response({
        'debug': True,
        'message': 'Mock data generation test',
        'results': mock_results,
        'timestamp': datetime.now().isoformat()
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_analysis_history(request):
    """Get historical analysis data"""
    try:
        reports = CruxReport.objects.all()[:50]  # Last 50 reports
        data = []
        for report in reports:
            data.append({
                'id': report.id,
                'url': report.url,
                'form_factor': report.form_factor,
                'overall_performance': 'Good' if report.largest_contentful_paint and report.largest_contentful_paint < 2500 else 'Needs Improvement',
                'created_at': report.created_at.isoformat()
            })
        return Response(data)
    except Exception as e:
        logger.error(f"Error fetching analysis history: {str(e)}")
        return Response({'error': 'Failed to fetch history'}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_urls(request):
    """Analyze one or more URLs using CrUX API"""
    try:
        # Get request data
        urls = request.data.get('urls', [])
        form_factor = request.data.get('form_factor', 'ALL_FORM_FACTORS')
        
        # Validate input
        if not urls or not isinstance(urls, list):
            return Response({'error': 'URLs are required and must be a list'}, status=400)
        
        if len(urls) > 10:
            return Response({'error': 'Maximum 10 URLs allowed'}, status=400)
        
        # Validate URLs
        valid_urls = []
        for url in urls:
            if isinstance(url, str) and (url.startswith('http://') or url.startswith('https://')):
                valid_urls.append(url)
        
        if not valid_urls:
            return Response({'error': 'No valid URLs provided'}, status=400)
        
        results = []
        session_id = str(uuid.uuid4())
        
        # Enable real API data now that we have valid metrics
        USE_MOCK_DATA = False  # Set to True to use mock data
        
        # Check if API key is configured and working
        api_key_valid = settings.CRUX_API_KEY and len(settings.CRUX_API_KEY) > 20 and not USE_MOCK_DATA
        
        if not api_key_valid:
            # Return mock data for testing
            logger.info("Using mock data - API disabled for testing")
            for i, url in enumerate(valid_urls):
                # Generate varied mock data for different URLs
                base_lcp = 2000 + (i * 200)  # Vary between 2000-2800ms
                base_fid = 50 + (i * 25)     # Vary between 50-125ms 
                base_cls = 0.05 + (i * 0.02) # Vary between 0.05-0.13
                
                performance_rating = 'Good' if i % 3 == 0 else 'Needs Improvement' if i % 3 == 1 else 'Poor'
                
                results.append({
                    'url': url,
                    'form_factor': form_factor,
                    'metrics': [
                        {
                            'metric_name': 'Largest Contentful Paint (LCP)',
                            'p75_value': base_lcp,
                            'good_ratio': 0.8 - (i * 0.1),
                            'needs_improvement_ratio': 0.15,
                            'poor_ratio': 0.05 + (i * 0.1)
                        },
                        {
                            'metric_name': 'Interaction to Next Paint (INP)',
                            'p75_value': base_fid,  # Reuse FID value for INP
                            'good_ratio': 0.85 - (i * 0.05),
                            'needs_improvement_ratio': 0.10,
                            'poor_ratio': 0.05 + (i * 0.05)
                        },
                        {
                            'metric_name': 'Cumulative Layout Shift (CLS)',
                            'p75_value': base_cls,
                            'good_ratio': 0.75 - (i * 0.08),
                            'needs_improvement_ratio': 0.15,
                            'poor_ratio': 0.10 + (i * 0.08)
                        },
                        {
                            'metric_name': 'First Contentful Paint (FCP)',
                            'p75_value': 1500 + (i * 100),
                            'good_ratio': 0.78 - (i * 0.06),
                            'needs_improvement_ratio': 0.12,
                            'poor_ratio': 0.10 + (i * 0.06)
                        }
                    ],
                    'overall_performance': performance_rating,
                    'created_at': datetime.now().isoformat()
                })
            
            # Save mock data to database
            for i, url in enumerate(valid_urls):
                CruxReport.objects.create(
                    url=url,
                    form_factor=form_factor,
                    largest_contentful_paint=2000.0 + (i * 200.0),
                    first_input_delay=50.0 + (i * 25.0),  # Keep for database compatibility
                    cumulative_layout_shift=0.05 + (i * 0.02),
                    first_contentful_paint=1500.0 + (i * 100.0),
                    interaction_to_next_paint=150.0 + (i * 50.0),
                    time_to_first_byte=600.0 + (i * 100.0),  # Keep for database compatibility
                    api_response={'mock': True, 'generated_at': datetime.now().isoformat()}
                )
            
            response_data = {
                'session_id': session_id,
                'results': results,
                'note': 'Mock data for testing - Set USE_MOCK_DATA=False for real API data'
            }
            
            # Add summary for multiple URLs
            if len(valid_urls) > 1:
                try:
                    response_data['summary'] = calculate_summary_statistics(results)
                except Exception as e:
                    logger.error(f"Error calculating mock summary statistics: {e}")
                    # Provide fallback summary for mock data
                    response_data['summary'] = [
                        {
                            'metric_name': 'Largest Contentful Paint (LCP)',
                            'average_p75': 2200.0,
                            'best_url': valid_urls[0] if valid_urls else '',
                            'worst_url': valid_urls[-1] if valid_urls else '',
                            'best_value': 2000.0,
                            'worst_value': 2400.0
                        }
                    ]
            
            return Response(response_data)
        
        # Real API implementation (when API key is provided)
        client = CruxAPIClient()
        
        for url in valid_urls:
            try:
                # Fetch data from CrUX API
                api_response = client.get_url_metrics(url, form_factor)
                processed_data = client.process_metrics(api_response, url, form_factor)
                results.append(processed_data)
                
                # Save to database
                crux_report = CruxReport(
                    url=url,
                    form_factor=form_factor,
                    api_response=api_response
                )
                
                # Extract specific metrics
                for metric in processed_data['metrics']:
                    metric_name = metric['metric_name'].lower()
                    if 'largest contentful paint' in metric_name:
                        crux_report.largest_contentful_paint = metric['p75_value']
                    elif 'first input delay' in metric_name:
                        crux_report.first_input_delay = metric['p75_value']
                    elif 'cumulative layout shift' in metric_name:
                        crux_report.cumulative_layout_shift = metric['p75_value']
                
                crux_report.save()
                
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 400:
                    logger.warning(f"No CrUX data available for {url} - using fallback data")
                    # Return fallback data for URLs without CrUX data
                    results.append({
                        'url': url,
                        'form_factor': form_factor,
                        'metrics': [
                            {
                                'metric_name': 'Largest Contentful Paint (LCP)',
                                'p75_value': None,
                                'good_ratio': None,
                                'needs_improvement_ratio': None,
                                'poor_ratio': None
                            }
                        ],
                        'overall_performance': 'No data available',
                        'created_at': datetime.now().isoformat()
                    })
                elif e.response.status_code == 403:
                    logger.error(f"API key permission denied for {url}")
                    results.append({
                        'url': url,
                        'form_factor': form_factor,
                        'metrics': [],
                        'overall_performance': 'API key error - check permissions',
                        'created_at': datetime.now().isoformat()
                    })
                else:
                    logger.error(f"HTTP error analyzing URL {url}: {str(e)}")
                    results.append({
                        'url': url,
                        'form_factor': form_factor,
                        'metrics': [],
                        'overall_performance': f'API Error: {e.response.status_code}',
                        'created_at': datetime.now().isoformat()
                    })
            except Exception as e:
                logger.error(f"Error analyzing URL {url}: {str(e)}")
                results.append({
                    'url': url,
                    'form_factor': form_factor,
                    'metrics': [],
                    'overall_performance': f'Error: {str(e)}',
                    'created_at': datetime.now().isoformat()
                })
        
        # Create analysis session
        AnalysisSession.objects.create(
            session_id=session_id,
            urls=valid_urls
        )
        
        response_data = {
            'session_id': session_id,
            'results': results
        }
        
        # Add summary statistics for multiple URLs
        if len(valid_urls) > 1:
            try:
                response_data['summary'] = calculate_summary_statistics(results)
            except Exception as e:
                logger.error(f"Error calculating summary statistics: {e}")
                response_data['summary'] = []
                response_data['summary_error'] = 'Failed to calculate summary statistics'
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error in analyze_urls: {str(e)}")
        return Response({'error': f'Analysis failed: {str(e)}'}, status=500)

class CruxAPIClient:
    """Client for interacting with Chrome UX Report API"""
    
    def __init__(self):
        self.api_key = settings.CRUX_API_KEY
        self.base_url = settings.CRUX_API_URL
    
    def get_url_metrics(self, url, form_factor='ALL_FORM_FACTORS'):
        """Fetch CrUX metrics following official Chrome Developers documentation"""
        if not self.api_key:
            raise ValueError("CrUX API key not configured")
        
        # Clean up the URL according to CrUX API requirements
        clean_url = url.rstrip('/').split('#')[0].split('?')[0]
        
        # Valid metrics as of 2024/2025 - FID is deprecated, replaced by INP
        valid_metrics = [
            "largest_contentful_paint",         # LCP - Loading
            "cumulative_layout_shift",          # CLS - Visual Stability  
            "interaction_to_next_paint",        # INP - Interactivity (replaces FID)
            "first_contentful_paint"            # FCP - Loading
            # Note: time_to_first_byte and first_input_delay are no longer available
        ]
        
        # Try both origin and URL approaches as per official docs
        payloads = [
            {
                "description": "URL-based query",
                "payload": {
                    "url": clean_url,
                    "formFactor": form_factor,
                    "metrics": valid_metrics
                }
            },
            {
                "description": "Origin-based query",
                "payload": {
                    "origin": clean_url,
                    "formFactor": form_factor,
                    "metrics": valid_metrics
                }
            }
        ]
        
        logger.info(f"Making CrUX API request for {clean_url} with form factor {form_factor}")
        logger.info(f"Using metrics: {valid_metrics}")
        
        # Try URL first, then origin
        for attempt in payloads:
            try:
                response = requests.post(
                    f"{self.base_url}?key={self.api_key}",
                    json=attempt["payload"],
                    timeout=30,
                    headers={
                        'Content-Type': 'application/json'
                    }
                )
                
                logger.info(f"CrUX API response status: {response.status_code} for {attempt['description']}")
                
                if response.status_code == 200:
                    logger.info("✅ Successfully received CrUX data")
                    return response.json()
                elif response.status_code == 400:
                    try:
                        error_details = response.json()
                        logger.warning(f"400 error details: {error_details}")
                    except:
                        pass
                    logger.warning(f"400 error for {attempt['description']}, trying next approach...")
                    continue
                else:
                    response.raise_for_status()
                    
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 400:
                    continue  # Try next approach
                logger.error(f"CrUX API HTTP error for {clean_url}: {str(e)}")
                raise
            except requests.exceptions.RequestException as e:
                logger.error(f"CrUX API request failed for {clean_url}: {str(e)}")
                raise
        
        # If both approaches failed with 400, raise an exception
        raise requests.exceptions.HTTPError(f"No CrUX data available for {clean_url}")
    
    def process_metrics(self, api_response, url, form_factor):
        """Process API response into structured format"""
        metrics = []
        
        if 'record' not in api_response or 'metrics' not in api_response['record']:
            return {
                'url': url,
                'form_factor': form_factor,
                'metrics': [],
                'overall_performance': 'No data available',
                'created_at': datetime.now().isoformat()
            }
        
        raw_metrics = api_response['record']['metrics']
        
        # Updated metric mapping for current CrUX API
        metric_mapping = {
            'largest_contentful_paint': 'Largest Contentful Paint (LCP)',
            'cumulative_layout_shift': 'Cumulative Layout Shift (CLS)',
            'interaction_to_next_paint': 'Interaction to Next Paint (INP)',
            'first_contentful_paint': 'First Contentful Paint (FCP)',
            # Deprecated metrics (kept for backward compatibility)
            'first_input_delay': 'First Input Delay (FID)',
            'time_to_first_byte': 'Time to First Byte (TTFB)'
        }
        
        for metric_key, metric_name in metric_mapping.items():
            if metric_key in raw_metrics:
                metric_data = raw_metrics[metric_key]
                
                # Extract P75 value
                p75_value = None
                if 'percentiles' in metric_data and 'p75' in metric_data['percentiles']:
                    p75_value = metric_data['percentiles']['p75']
                
                # Extract histogram data for user experience ratios
                good_ratio = needs_improvement_ratio = poor_ratio = None
                if 'histogram' in metric_data and metric_data['histogram']:
                    histogram = metric_data['histogram']
                    total_samples = sum(bucket.get('density', 0) for bucket in histogram)
                    
                    if total_samples > 0:
                        for i, bucket in enumerate(histogram):
                            density = bucket.get('density', 0)
                            ratio = density / total_samples
                            
                            # First bucket is typically "good"
                            if i == 0:
                                good_ratio = ratio
                            # Last bucket is typically "poor"
                            elif i == len(histogram) - 1:
                                poor_ratio = ratio
                            # Middle bucket(s) are "needs improvement"
                            else:
                                if needs_improvement_ratio is None:
                                    needs_improvement_ratio = ratio
                                else:
                                    needs_improvement_ratio += ratio
                
                metrics.append({
                    'metric_name': metric_name,
                    'p75_value': p75_value,
                    'good_ratio': good_ratio,
                    'needs_improvement_ratio': needs_improvement_ratio,
                    'poor_ratio': poor_ratio
                })
        
        # Determine overall performance based on Core Web Vitals
        overall_performance = self.calculate_overall_performance(metrics)
        
        return {
            'url': url,
            'form_factor': form_factor,
            'metrics': metrics,
            'overall_performance': overall_performance,
            'created_at': datetime.now().isoformat()
        }
    
    def calculate_overall_performance(self, metrics):
        """Calculate overall performance rating based on Core Web Vitals"""
        # Core Web Vitals: LCP, CLS, and INP (replaced FID)
        core_vitals = [
            'Largest Contentful Paint (LCP)', 
            'Cumulative Layout Shift (CLS)', 
            'Interaction to Next Paint (INP)'
        ]
        
        good_scores = 0
        total_scores = 0
        
        for metric in metrics:
            if metric['metric_name'] in core_vitals and metric['good_ratio'] is not None:
                total_scores += 1
                # Good threshold: 75% of users should have good experience
                if metric['good_ratio'] >= 0.75:
                    good_scores += 1
        
        if total_scores == 0:
            return 'Insufficient data'
        
        ratio = good_scores / total_scores
        if ratio >= 0.67:  # At least 2 out of 3 Core Web Vitals are good
            return 'Good'
        elif ratio >= 0.33:  # At least 1 out of 3 Core Web Vitals are good
            return 'Needs Improvement'
        else:
            return 'Poor'

def calculate_summary_statistics(results):
    """Calculate summary statistics across multiple URL results"""
    if not results:
        return []
    
    # Group metrics by name
    metric_groups = {}
    for result in results:
        metrics = result.get('metrics', [])
        if not metrics:
            continue
            
        for metric in metrics:
            if not isinstance(metric, dict):
                continue
                
            metric_name = metric.get('metric_name')
            p75_value = metric.get('p75_value')
            
            if metric_name and p75_value is not None:
                try:
                    # Ensure p75_value is a number
                    p75_value = float(p75_value)
                    
                    if metric_name not in metric_groups:
                        metric_groups[metric_name] = []
                    
                    metric_groups[metric_name].append({
                        'value': p75_value,
                        'url': result.get('url', '')
                    })
                except (ValueError, TypeError) as e:
                    logger.warning(f"Invalid p75_value for {metric_name}: {p75_value} - {e}")
                    continue
    
    summary = []
    for metric_name, values in metric_groups.items():
        if not values:
            continue
        
        try:
            # Calculate average
            total_value = sum(float(item['value']) for item in values)
            avg_value = total_value / len(values)
            
            # Find best and worst (lower values are typically better for performance metrics)
            best_item = min(values, key=lambda x: float(x['value']))
            worst_item = max(values, key=lambda x: float(x['value']))
            
            summary.append({
                'metric_name': metric_name,
                'average_p75': round(avg_value, 2),
                'best_url': best_item['url'],
                'worst_url': worst_item['url'], 
                'best_value': round(float(best_item['value']), 2),
                'worst_value': round(float(worst_item['value']), 2)
            })
            
        except (ValueError, TypeError, ZeroDivisionError) as e:
            logger.error(f"Error calculating summary for {metric_name}: {e}")
            continue
    
    return summary