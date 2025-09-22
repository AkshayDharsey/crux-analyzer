import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Disable credentials to avoid CSRF issues
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response received:`, response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.response?.status === 400) {
      error.message = error.response.data?.error || 'Invalid request. Please check your input.';
    } else if (error.response?.status === 403) {
      error.message = 'Permission denied. Please try again.';
    } else if (error.response?.status === 500) {
      error.message = 'Server error. Please try again later.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection and try again.';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Analyze one or more URLs using the Chrome UX Report API
 * @param {string[]} urls - Array of URLs to analyze
 * @param {string} formFactor - Form factor to analyze ('ALL_FORM_FACTORS', 'PHONE', 'DESKTOP', 'TABLET')
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeURLs = async (urls, formFactor = 'ALL_FORM_FACTORS') => {
  try {
    // Validate inputs
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('At least one URL is required');
    }

    if (urls.length > 10) {
      throw new Error('Maximum 10 URLs allowed per request');
    }

    // Validate URLs
    const validUrls = urls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      throw new Error('No valid URLs provided');
    }

    if (validUrls.length !== urls.length) {
      console.warn(`${urls.length - validUrls.length} invalid URLs were filtered out`);
    }

    const response = await api.post('/analyze/', {
      urls: validUrls,
      form_factor: formFactor
    });

    return response.data;
  } catch (error) {
    console.error('Error analyzing URLs:', error);
    throw error;
  }
};

/**
 * Get analysis history
 * @returns {Promise<Object[]>} Array of historical analysis data
 */
export const getAnalysisHistory = async () => {
  try {
    const response = await api.get('/history/');
    return response.data;
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
};

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health/');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Validate a single URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export const validateURL = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Format URL for display (truncate if too long)
 * @param {string} url - URL to format
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Formatted URL
 */
export const formatURL = (url, maxLength = 50) => {
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search;
    
    if (domain.length + path.length <= maxLength) {
      return `${domain}${path}`;
    }
    
    if (path.length <= maxLength - domain.length - 3) {
      return `${domain}${path}`;
    }
    
    return `${domain}...${path.slice(-(maxLength - domain.length - 6))}`;
  } catch {
    return url.length > maxLength ? `${url.slice(0, maxLength - 3)}...` : url;
  }
};

/**
 * Get performance color based on rating
 * @param {string} performance - Performance rating
 * @returns {string} Color code
 */
export const getPerformanceColor = (performance) => {
  switch (performance?.toLowerCase()) {
    case 'good':
      return '#4caf50';
    case 'needs improvement':
      return '#ff9800';
    case 'poor':
      return '#f44336';
    default:
      return '#9e9e9e';
  }
};

/**
 * Format metric value for display
 * @param {number} value - Metric value
 * @param {string} unit - Unit of measurement
 * @returns {string} Formatted value
 */
export const formatMetricValue = (value, unit = 'ms') => {
  if (value === null || value === undefined) return 'N/A';
  
  if (typeof value !== 'number') return value.toString();
  
  // Format large numbers with commas
  if (value >= 1000) {
    return `${value.toLocaleString()}${unit}`;
  }
  
  // Format decimals appropriately
  if (value % 1 !== 0) {
    return `${value.toFixed(2)}${unit}`;
  }
  
  return `${value}${unit}`;
};

/**
 * Convert form factor to display name
 * @param {string} formFactor - Form factor code
 * @returns {string} Display name
 */
export const getFormFactorDisplayName = (formFactor) => {
  const mapping = {
    'ALL_FORM_FACTORS': 'All Devices',
    'PHONE': 'Mobile',
    'DESKTOP': 'Desktop',
    'TABLET': 'Tablet'
  };
  
  return mapping[formFactor] || formFactor;
};

/**
 * Get metric description
 * @param {string} metricName - Metric name
 * @returns {string} Metric description
 */
export const getMetricDescription = (metricName) => {
  const descriptions = {
    'Largest Contentful Paint (LCP)': 'Measures loading performance. Good LCP is 2.5s or less.',
    'First Input Delay (FID)': 'Measures interactivity. Good FID is 100ms or less.',
    'Cumulative Layout Shift (CLS)': 'Measures visual stability. Good CLS is 0.1 or less.',
    'First Contentful Paint (FCP)': 'Measures time to first content render. Good FCP is 1.8s or less.',
    'Interaction to Next Paint (INP)': 'Measures responsiveness. Good INP is 200ms or less.',
    'Time to First Byte (TTFB)': 'Measures server response time. Good TTFB is 0.8s or less.'
  };
  
  return descriptions[metricName] || 'Performance metric from Chrome UX Report';
};

export default api;