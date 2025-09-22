import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Fade,
  Divider
} from '@mui/material';
import { Speed as SpeedIcon } from '@mui/icons-material';
import URLInput from './components/URLInput';
import DataTable from './components/DataTable';
import FilterSort from './components/FilterSort';
import { analyzeURLs } from './services/api';
import './App.css';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const handleAnalyze = useCallback(async (urls, formFactor) => {
    setLoading(true);
    setError(null);
    setAnalysisData(null);
    setFilteredData(null);

    try {
      const response = await analyzeURLs(urls, formFactor);
      setAnalysisData(response);
      setFilteredData(response);
      setSessionId(response.session_id);
      setSuccess(true);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Failed to analyze URLs. Please check your API configuration and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback((filters, sortConfig) => {
    if (!analysisData) return;

    let filtered = { ...analysisData };
    
    // Apply filters to results
    if (filters.performanceFilter && filters.performanceFilter !== 'all') {
      filtered.results = filtered.results.filter(result => 
        result.overall_performance?.toLowerCase() === filters.performanceFilter.toLowerCase()
      );
    }

    if (filters.metricThreshold && filters.metricThreshold.metric && filters.metricThreshold.value) {
      filtered.results = filtered.results.filter(result => {
        const metric = result.metrics?.find(m => 
          m.metric_name === filters.metricThreshold.metric
        );
        return metric && metric.p75_value && metric.p75_value <= filters.metricThreshold.value;
      });
    }

    // Apply sorting
    if (sortConfig.field && sortConfig.direction) {
      filtered.results.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.field === 'url') {
          aValue = a.url;
          bValue = b.url;
        } else if (sortConfig.field === 'overall_performance') {
          aValue = a.overall_performance;
          bValue = b.overall_performance;
        } else {
          // Sorting by metric
          const aMetric = a.metrics?.find(m => m.metric_name === sortConfig.field);
          const bMetric = b.metrics?.find(m => m.metric_name === sortConfig.field);
          aValue = aMetric?.p75_value || 0;
          bValue = bMetric?.p75_value || 0;
        }

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
      });
    }

    setFilteredData(filtered);
  }, [analysisData]);

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="App">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <SpeedIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
                Chrome UX Report Analyzer
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Analyze website performance using Google's Chrome User Experience Report
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* URL Input Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Enter URLs to Analyze
          </Typography>
          <URLInput onAnalyze={handleAnalyze} disabled={loading} />
        </Paper>

        {/* Loading State */}
        {loading && (
          <Fade in={loading}>
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center', mb: 3 }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Analyzing Performance Data...
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                This may take a few moments while we fetch data from the Chrome UX Report API
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Results Section */}
        {filteredData && !loading && (
          <Fade in={Boolean(filteredData)}>
            <Box>
              {/* Summary Statistics (for multiple URLs) */}
              {filteredData.summary && (
                <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Summary Statistics
                  </Typography>
                  <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2}>
                    {filteredData.summary.map((stat, index) => (
                      <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {stat.metric_name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Average P75:</strong> {stat.average_p75?.toFixed(2)}ms
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Best:</strong> {stat.best_url} ({stat.best_value?.toFixed(2)}ms)
                        </Typography>
                        <Typography variant="body2">
                          <strong>Worst:</strong> {stat.worst_url} ({stat.worst_value?.toFixed(2)}ms)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Filter and Sort Controls */}
              <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Filter and Sort Results
                </Typography>
                <FilterSort 
                  data={analysisData?.results || []} 
                  onFilterChange={handleFilterChange}
                />
              </Paper>

              <Divider sx={{ mb: 3 }} />

              {/* Data Table */}
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Performance Analysis Results
                </Typography>
                <DataTable data={filteredData} />
              </Paper>

              {/* Session Info */}
              {sessionId && (
                <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="textSecondary">
                    Analysis Session ID: {sessionId}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Fade>
        )}

        {/* Empty State */}
        {!analysisData && !loading && (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
            <SpeedIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Ready to Analyze Performance
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Enter one or more URLs above to get started with Chrome UX Report analysis
            </Typography>
          </Paper>
        )}

        {/* Success/Error Notifications */}
        <Snackbar 
          open={success} 
          autoHideDuration={4000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
            Analysis completed successfully!
          </Alert>
        </Snackbar>

        <Snackbar 
          open={Boolean(error)} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}

export default App;