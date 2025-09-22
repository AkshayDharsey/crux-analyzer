# Chrome UX Report Analyzer

A comprehensive full-stack web application for analyzing website performance using Google's Chrome User Experience Report (CrUX) API. Built with React and Django, this tool provides detailed insights into Core Web Vitals and other performance metrics with advanced filtering, sorting, and comparison capabilities.

## 🚀 Features

### Core Functionality
- **Single & Multiple URL Analysis** - Analyze up to 10 URLs simultaneously
- **Real-time Performance Metrics** - Latest Core Web Vitals data from Chrome UX Report
- **Advanced Data Visualization** - Interactive tables, charts, and performance indicators
- **Comprehensive Filtering** - Filter by performance ratings and metric thresholds
- **Multi-dimensional Sorting** - Sort by any metric or performance indicator
- **Comparative Analysis** - Summary statistics across multiple URLs
- **Historical Data** - Track and store analysis results over time

### Performance Metrics (2024/2025 Standards)
- **Largest Contentful Paint (LCP)** - Loading performance
- **Cumulative Layout Shift (CLS)** - Visual stability
- **Interaction to Next Paint (INP)** - Responsiveness (replaces FID)
- **First Contentful Paint (FCP)** - Initial content loading

### Device-Specific Analysis
- All Form Factors (combined data)
- Desktop-specific metrics
- Mobile-specific metrics  
- Tablet-specific metrics

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - Modern React with Hooks and Context
- **Material-UI 5.x** - Professional UI components and theming
- **Material-UI Data Grid** - Advanced table with sorting, filtering, pagination
- **Axios** - HTTP client with interceptors and error handling
- **Responsive Design** - Mobile-first approach with breakpoint optimization

### Backend
- **Django 5.0.0** - Robust web framework with admin interface
- **Django REST Framework 3.14.0** - API development with serialization
- **SQLite/PostgreSQL** - Development/Production database options
- **CORS Support** - Cross-origin request handling
- **Comprehensive Logging** - Request/response tracking and error monitoring

### External APIs
- **Chrome UX Report API** - Google's official web performance data
- **RESTful Architecture** - Standard HTTP methods and status codes

## 📋 Prerequisites

Ensure you have the following installed:

- **Python 3.12.10** or higher
- **Node.js 22.19.0** or higher  
- **npm 10.9.3** or higher
- **Chrome UX Report API Key** (optional - app works with mock data)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crux-analyzer
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
echo "CRUX_API_KEY=your_api_key_here" > .env

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Start Django development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/api/

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```bash
CRUX_API_KEY=your_chrome_ux_report_api_key_here
```

**Frontend (.env):**
```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api
GENERATE_SOURCEMAP=false
```

### Google Cloud Setup for Chrome UX Report API

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing

2. **Enable Chrome UX Report API**
   - Navigate to APIs & Services → Library
   - Search "Chrome UX Report API"
   - Click ENABLE

3. **Create API Key**
   - Go to APIs & Services → Credentials
   - Click CREATE CREDENTIALS → API key
   - Copy the generated key

4. **Configure API Key**
   - Edit the API key
   - Set Application restrictions (optional)
   - Add API restrictions → Select "Chrome UX Report API"
   - Save configuration

5. **Enable Billing** (Required)
   - Chrome UX Report API requires billing to be enabled
   - Set up billing account in Google Cloud Console

## 🚀 Usage

### Basic Analysis
1. **Enter URLs** - Add one or more URLs (up to 10)
2. **Select Device Type** - Choose All Devices, Desktop, Mobile, or Tablet
3. **Click "Analyze Performance"** - Wait for results
4. **View Results** - Examine performance metrics and ratings

### Advanced Features
1. **Filtering** - Use performance rating or metric threshold filters
2. **Sorting** - Sort by any column (URL, performance rating, or metrics)
3. **Comparison** - Analyze multiple URLs to see relative performance
4. **Export** - Copy or save analysis results

### Example URLs for Testing
```
https://www.google.com
https://www.youtube.com  
https://www.wikipedia.org
https://www.github.com
https://www.stackoverflow.com
```

## 📊 Understanding the Data

### Performance Ratings
- **Good** - Meets recommended thresholds (green)
- **Needs Improvement** - Close to thresholds (yellow) 
- **Poor** - Exceeds thresholds (red)

### Core Web Vitals Thresholds
| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4s | > 4s |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| INP | ≤ 200ms | 200ms - 500ms | > 500ms |
| FCP | ≤ 1.8s | 1.8s - 3s | > 3s |

### Data Sources
- **P75 Values** - 75th percentile of real user experiences
- **User Experience Ratios** - Percentage of users in each performance category
- **Real User Monitoring** - Actual Chrome browser data from millions of users

## 🔍 API Endpoints

### Main Endpoints
- `GET /api/health/` - System health check
- `POST /api/analyze/` - Analyze URLs for performance metrics
- `GET /api/history/` - Retrieve historical analysis data

### Debug Endpoints
- `GET /api/debug/mock/` - Test mock data generation
- `POST /api/debug/multiple/` - Test multiple URL analysis

### Request Format
```json
{
  "urls": [
    "https://example.com",
    "https://example2.com"
  ],
  "form_factor": "ALL_FORM_FACTORS"
}
```

### Response Format
```json
{
  "session_id": "uuid-string",
  "results": [
    {
      "url": "https://example.com",
      "form_factor": "ALL_FORM_FACTORS", 
      "overall_performance": "Good",
      "metrics": [
        {
          "metric_name": "Largest Contentful Paint (LCP)",
          "p75_value": 2400.5,
          "good_ratio": 0.75,
          "needs_improvement_ratio": 0.15,
          "poor_ratio": 0.10
        }
      ],
      "created_at": "2025-01-01T12:00:00Z"
    }
  ],
  "summary": [
    {
      "metric_name": "Largest Contentful Paint (LCP)",
      "average_p75": 2250.0,
      "best_url": "https://example.com",
      "worst_url": "https://example2.com"
    }
  ]
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run Django tests
python manage.py test

# Test API key setup
python test_official_crux.py

# Test multiple URL analysis  
python test_crux_api.py
```

### Frontend Testing
```bash
cd frontend

# Run React tests
npm test

# Run test coverage
npm run test:coverage

# Build for production
npm run build
```

### Manual Testing
1. **Single URL Analysis** - Test with known URLs
2. **Multiple URL Analysis** - Test comparative features
3. **Error Handling** - Test with invalid URLs
4. **Filtering & Sorting** - Test all filter combinations
5. **Responsive Design** - Test on different screen sizes

## 🚀 Deployment

### Development Mode
- **Frontend**: `npm start` (http://localhost:3000)
- **Backend**: `python manage.py runserver` (http://127.0.0.1:8000)
- **Database**: SQLite (automatic)

### Production Deployment

**Frontend Options:**
- Vercel, Netlify, AWS S3 + CloudFront
- Build: `npm run build`
- Deploy: Upload `build/` directory

**Backend Options:**
- Heroku, AWS EC2, Google Cloud Platform, DigitalOcean
- Database: PostgreSQL recommended
- Environment: Set production environment variables

**Environment Configuration:**
```bash
# Production settings
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://user:pass@host:port/dbname
CRUX_API_KEY=your_production_api_key
```

## 🛠 Development

### Project Structure
```
crux-analyzer/
├── backend/                 # Django backend
│   ├── crux_project/       # Django project settings
│   ├── crux_api/          # Main API application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend  
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── App.js         # Main application
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
├── docs/                  # Documentation
└── README.md             # This file
```

### Contributing Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use ESLint and Prettier for code formatting
- **Comments**: Document complex logic and API interactions
- **Testing**: Write tests for new features and bug fixes

## 🐛 Troubleshooting

### Common Issues

**Backend Issues:**
```bash
# Django server won't start
python manage.py check
python manage.py migrate

# API key not working  
python test_official_crux.py

# Database issues
python manage.py makemigrations
python manage.py migrate --run-syncdb
```

**Frontend Issues:**
```bash
# React app won't start
npm install
rm -rf node_modules package# Chrome UX Report Analyzer

A fullstack application that analyzes website performance using Google's Chrome User Experience Report (CrUX) API.

## Features

- Single and multiple URL analysis
- Performance metrics visualization
- Data filtering and sorting
- Material-UI design
- Django REST API backend
- React frontend

## Prerequisites

- Python 3.12.10
- Node.js v22.19.0
- npm 10.9.3
- Chrome UX Report API key

## Setup Instructions

### 1. Clone/Create Project Structure

Create the project folder structure as shown in the documentation.

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. Environment Variables

Create `.env` files in both backend and frontend directories with your API keys and configuration.

## Usage

1. Enter one or multiple URLs
2. Click "Analyze Performance" 
3. View results in the data table
4. Use filters and sorting to analyze data
5. Compare multiple URLs with summary statistics

## API Documentation

The backend provides RESTful endpoints for CrUX data retrieval and analysis.

## Technologies Used

- **Backend**: Django, Django REST Framework
- **Frontend**: React, Material-UI
- **API**: Google Chrome UX Report API
- **Database**: SQLite (default)