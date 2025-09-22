# Chrome UX Report Analyzer - Design Document

## Overview

The Chrome UX Report Analyzer is a full-stack web application that helps users analyze website performance using Google's Chrome User Experience Report (CrUX) API. The application provides comprehensive insights into Core Web Vitals and other performance metrics for one or multiple URLs, with advanced filtering, sorting, and comparison capabilities.

## Architecture

### System Architecture
```
Frontend (React + Material-UI) ←→ Backend (Django + DRF) ←→ Chrome UX Report API
              ↓                              ↓
         Local Storage                SQLite Database
```

### Technology Stack

**Frontend:**
- React 18.2.0 with Hooks and Context
- Material-UI (MUI) 5.x for modern UI components
- Axios for HTTP client with interceptors
- Material-UI Data Grid for advanced table functionality
- Responsive design with mobile-first approach

**Backend:**
- Django 5.0.0 with REST Framework 3.14.0
- SQLite database for development
- CORS middleware for cross-origin requests
- Python 3.12.10 with modern async capabilities
- Comprehensive logging and error handling

**External APIs:**
- Google Chrome User Experience Report API v1
- RESTful API design following HTTP standards

## Performance Metrics & Core Web Vitals

### Current Metrics (2024/2025)
The application analyzes the following performance metrics based on the latest Core Web Vitals standards:

**Core Web Vitals:**
- **Largest Contentful Paint (LCP)** - Loading performance
  - Good: ≤ 2.5s, Poor: > 4s
- **Cumulative Layout Shift (CLS)** - Visual stability
  - Good: ≤ 0.1, Poor: > 0.25
- **Interaction to Next Paint (INP)** - Responsiveness (replaces FID)
  - Good: ≤ 200ms, Poor: > 500ms

**Additional Metrics:**
- **First Contentful Paint (FCP)** - Loading
  - Good: ≤ 1.8s, Poor: > 3s

### Deprecated Metrics
- First Input Delay (FID) - Replaced by INP
- Time to First Byte (TTFB) - Removed from current API

## Component Design

### Frontend Architecture

#### 1. App.js (Main Container)
- **Purpose**: Central application orchestration and state management
- **State Management**: 
  - `analysisData`: Raw API response data
  - `filteredData`: Processed data after filters/sorting
  - `loading`: Global loading states
  - `error`: Error handling and user notifications
- **Key Features**:
  - Global error boundary and notification system
  - Responsive layout management
  - Integration between all child components
  - Real-time data flow coordination

#### 2. URLInput.js (Input Management)
- **Purpose**: Multi-URL input with comprehensive validation
- **Features**:
  - Dynamic URL addition/removal (up to 10 URLs)
  - Real-time URL validation (HTTP/HTTPS required)
  - Duplicate URL detection and prevention
  - Form factor selection (All, Desktop, Mobile, Tablet)
  - Input sanitization and error feedback
- **Validation Rules**:
  - URLs must include protocol (http:// or https://)
  - Maximum 10 URLs per analysis
  - No duplicate URLs allowed
  - Real-time validation feedback

#### 3. DataTable.js (Results Visualization)
- **Purpose**: Advanced data presentation with rich interactivity
- **Features**:
  - Performance summary cards with statistics
  - Sortable data grid with custom comparators
  - Rich tooltips with metric descriptions
  - Color-coded performance indicators
  - URL linking with external navigation
  - Responsive design for mobile devices
- **Data Visualization**:
  - Performance rating chips with trend icons
  - Progress bars for user experience distribution
  - Metric values with units and formatting
  - Summary statistics with comparative analysis

#### 4. FilterSort.js (Data Manipulation)
- **Purpose**: Advanced filtering and sorting capabilities
- **Features**:
  - Performance rating filters
  - Metric threshold filtering with recommendations
  - Multi-field sorting with direction control
  - Active filter indicators and management
  - Clear all filters functionality
  - Real-time filter application

### Backend Architecture

#### 1. Models (models.py)
```python
class CruxReport:
    - url: URLField (max 500 chars)
    - form_factor: CharField (device type)
    - largest_contentful_paint: FloatField
    - cumulative_layout_shift: FloatField
    - interaction_to_next_paint: FloatField
    - first_contentful_paint: FloatField
    - created_at: DateTimeField
    - api_response: JSONField (raw API data)

class AnalysisSession:
    - session_id: CharField (UUID)
    - urls: JSONField (list of analyzed URLs)
    - created_at: DateTimeField
```

#### 2. CruxAPIClient (API Integration)
- **Purpose**: Robust Chrome UX Report API communication
- **Features**:
  - Dual-approach querying (URL and origin-based)
  - Comprehensive error handling and retry logic
  - Request/response logging and monitoring
  - Automatic URL cleaning and normalization
- **API Handling**:
  - Handles 400 errors (no data available)
  - Manages 403 errors (API key issues)
  - Implements timeout and retry mechanisms
  - Validates API responses and data integrity

#### 3. Views (API Endpoints)
- **analyze_urls**: Main analysis endpoint with batch processing
- **get_analysis_history**: Historical data retrieval
- **health_check**: System health monitoring
- **debug endpoints**: Development and testing utilities

#### 4. Advanced Features
- **Mock Data System**: Comprehensive fallback for development/testing
- **Batch Processing**: Efficient multi-URL analysis
- **Error Recovery**: Graceful handling of partial failures
- **Data Validation**: Input sanitization and validation

## Data Flow & Processing

### Analysis Workflow
1. **Input Validation**: URL format checking and deduplication
2. **API Request**: Dual-approach querying for maximum data availability
3. **Data Processing**: Metric extraction and performance calculation
4. **Database Storage**: Persistent storage for historical analysis
5. **Response Formatting**: Structured data for frontend consumption
6. **Summary Generation**: Comparative statistics for multiple URLs

### API Request/Response Format

**Request:**
```json
{
  "urls": ["https://example.com", "https://example2.com"],
  "form_factor": "ALL_FORM_FACTORS"
}
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "results": [
    {
      "url": "https://example.com",
      "form_factor": "ALL_FORM_FACTORS",
      "metrics": [
        {
          "metric_name": "Largest Contentful Paint (LCP)",
          "p75_value": 2500.5,
          "good_ratio": 0.75,
          "needs_improvement_ratio": 0.15,
          "poor_ratio": 0.10
        }
      ],
      "overall_performance": "Good",
      "created_at": "2025-01-01T12:00:00Z"
    }
  ],
  "summary": [
    {
      "metric_name": "Largest Contentful Paint (LCP)",
      "average_p75": 2250.0,
      "best_url": "https://example.com",
      "worst_url": "https://example2.com",
      "best_value": 2000.0,
      "worst_value": 2500.0
    }
  ]
}
```

## Error Handling & Resilience

### Frontend Error Management
- **Network Errors**: Retry suggestions and offline detection
- **Validation Errors**: Real-time field-specific feedback
- **API Errors**: User-friendly error translation
- **Timeout Handling**: Progressive timeout with user feedback
- **State Recovery**: Graceful error state management

### Backend Error Handling
- **CrUX API Issues**: Intelligent fallback and retry strategies
- **Database Errors**: Transaction management and data integrity
- **Input Validation**: Comprehensive request sanitization
- **Rate Limiting**: API quota management and throttling
- **Partial Failures**: Individual URL error isolation

### Mock Data System
- **Development Support**: Comprehensive test data generation
- **API Fallback**: Automatic fallback when API is unavailable
- **Varied Data**: Realistic performance metric variations
- **Complete Workflow**: End-to-end testing without API dependency

## Performance & Optimization

### Frontend Optimization
- **React Optimization**: Memoization with React.memo and useMemo
- **Bundle Splitting**: Code splitting for faster initial loads
- **Caching Strategy**: Intelligent data caching and invalidation
- **Virtual Scrolling**: Efficient large dataset handling
- **Debounced Operations**: Input validation and API calls

### Backend Optimization
- **Database Indexing**: Optimized queries for large datasets
- **API Response Caching**: Intelligent caching strategies
- **Batch Processing**: Efficient multi-URL handling
- **Connection Pooling**: Database connection optimization
- **Async Processing**: Non-blocking operations where possible

## Security & Privacy

### API Security
- **Input Sanitization**: Comprehensive validation and cleaning
- **Rate Limiting**: Protection against abuse and DoS
- **CORS Configuration**: Strict cross-origin policies
- **Environment Variables**: Secure API key management
- **Request Size Limits**: Protection against oversized requests

### Data Privacy
- **No Personal Data**: Only public website performance metrics
- **Session Management**: Temporary analysis session tracking
- **Secure Storage**: Environment-based sensitive data handling
- **HTTPS Enforcement**: Secure communication protocols

## Scalability & Deployment

### Horizontal Scaling
- **Frontend**: CDN deployment with global distribution
- **Backend**: Load-balanced Django instances
- **Database**: PostgreSQL with read replicas for production
- **Caching**: Redis for session and response caching
- **Monitoring**: Comprehensive application performance monitoring

### Development Workflow
- **Local Development**: SQLite with hot-reloading
- **Testing**: Comprehensive test coverage with mock data
- **CI/CD**: Automated testing and deployment pipelines
- **Environment Management**: Separate dev/staging/prod configurations

## Testing Strategy

### Frontend Testing
- **Component Testing**: React Testing Library for UI components
- **Integration Testing**: API integration and data flow
- **E2E Testing**: Complete user workflows
- **Performance Testing**: Bundle size and rendering performance
- **Accessibility Testing**: WCAG compliance verification

### Backend Testing
- **Unit Testing**: Model and utility function coverage
- **API Testing**: Endpoint functionality and error handling
- **Integration Testing**: Database operations and external API calls
- **Load Testing**: Performance under concurrent users
- **Security Testing**: Input validation and vulnerability assessment

## Deployment & Operations

### Production Deployment
- **Frontend**: Static hosting (Vercel, Netlify, CloudFlare)
- **Backend**: Cloud platform (AWS, Google Cloud, Heroku)
- **Database**: Managed PostgreSQL with backups
- **Monitoring**: Application performance and error tracking
- **SSL/TLS**: Certificate management and secure connections

### Monitoring & Analytics
- **Application Health**: Uptime monitoring and alerting
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Comprehensive error logging and alerting
- **User Analytics**: Usage patterns and feature adoption
- **API Monitoring**: Chrome UX Report API quota and performance

## Future Enhancements

### Planned Features
- **Historical Analysis**: Trend tracking over time
- **Performance Budgets**: Automated threshold monitoring
- **Competitive Analysis**: Multi-site comparison tools
- **Report Generation**: PDF/Excel export functionality
- **Webhook Integration**: Real-time notifications
- **Custom Dashboards**: Personalized analytics views

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Caching**: Multi-layer cache optimization
- **Machine Learning**: Performance prediction and recommendations
- **API Rate Optimization**: Intelligent request batching
- **Mobile App**: Native mobile application
- **Enterprise Features**: Multi-user and team collaboration

## Maintenance & Support

### Regular Maintenance
- **API Updates**: Chrome UX Report API evolution tracking
- **Dependency Updates**: Security patches and version upgrades
- **Performance Review**: Regular optimization and profiling
- **Data Cleanup**: Historical data management
- **Security Audits**: Regular vulnerability assessments

### Documentation
- **API Documentation**: Comprehensive endpoint documentation
- **User Guide**: End-user feature documentation
- **Developer Guide**: Setup and contribution guidelines
- **Deployment Guide**: Production deployment instructions
- **Troubleshooting**: Common issues and solutions