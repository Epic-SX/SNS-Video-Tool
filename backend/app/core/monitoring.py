"""
Monitoring and metrics collection
"""

from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
from fastapi.routing import APIRoute
from typing import Callable
import time

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
ACTIVE_USERS = Gauge('active_users_total', 'Number of active users')
API_CALLS_COUNT = Counter('api_calls_total', 'Total API calls to external services', ['platform', 'endpoint'])
COLLECTION_ERRORS = Counter('collection_errors_total', 'Total collection errors', ['platform', 'error_type'])
AI_PROCESSING_DURATION = Histogram('ai_processing_duration_seconds', 'AI processing duration', ['task_type'])

def setup_monitoring(app):
    """Setup monitoring for the application"""
    
    @app.middleware("http")
    async def metrics_middleware(request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        # Record metrics
        duration = time.time() - start_time
        method = request.method
        endpoint = request.url.path
        status = response.status_code
        
        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
        REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
        
        return response
    
    @app.get("/metrics")
    async def metrics():
        """Prometheus metrics endpoint"""
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

class MetricsCollector:
    """Helper class for collecting custom metrics"""
    
    @staticmethod
    def record_api_call(platform: str, endpoint: str):
        """Record an API call to external service"""
        API_CALLS_COUNT.labels(platform=platform, endpoint=endpoint).inc()
    
    @staticmethod
    def record_collection_error(platform: str, error_type: str):
        """Record a collection error"""
        COLLECTION_ERRORS.labels(platform=platform, error_type=error_type).inc()
    
    @staticmethod
    def record_ai_processing_time(task_type: str, duration: float):
        """Record AI processing time"""
        AI_PROCESSING_DURATION.labels(task_type=task_type).observe(duration)
    
    @staticmethod
    def update_active_users(count: int):
        """Update active users count"""
        ACTIVE_USERS.set(count)

# Instance for easy import
metrics = MetricsCollector()