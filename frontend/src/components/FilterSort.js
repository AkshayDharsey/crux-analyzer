import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Sort as SortIcon
} from '@mui/icons-material';

const FilterSort = ({ data, onFilterChange }) => {
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [metricThreshold, setMetricThreshold] = useState({
    metric: '',
    value: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: '',
    direction: 'asc'
  });

  // Get unique metrics from data
  const availableMetrics = React.useMemo(() => {
    if (!data?.length) return [];
    
    const metrics = new Set();
    data.forEach(result => {
      result.metrics?.forEach(metric => {
        if (metric.p75_value !== null) {
          metrics.add(metric.metric_name);
        }
      });
    });
    
    return Array.from(metrics).sort();
  }, [data]);

  // Get unique performance ratings
  const availablePerformanceRatings = React.useMemo(() => {
    if (!data?.length) return [];
    
    const ratings = new Set();
    data.forEach(result => {
      if (result.overall_performance) {
        ratings.add(result.overall_performance);
      }
    });
    
    return Array.from(ratings).sort();
  }, [data]);

  // Sort field options
  const sortFieldOptions = React.useMemo(() => {
    const options = [
      { value: 'url', label: 'URL' },
      { value: 'overall_performance', label: 'Overall Performance' }
    ];
    
    availableMetrics.forEach(metric => {
      options.push({
        value: metric,
        label: metric
      });
    });
    
    return options;
  }, [availableMetrics]);

  // Apply filters and sorting whenever any filter changes
  useEffect(() => {
    const filters = {
      performanceFilter: performanceFilter === 'all' ? null : performanceFilter,
      metricThreshold: metricThreshold.metric && metricThreshold.value ? {
        metric: metricThreshold.metric,
        value: parseFloat(metricThreshold.value)
      } : null
    };

    const sorting = {
      field: sortConfig.field || null,
      direction: sortConfig.direction || 'asc'
    };

    onFilterChange(filters, sorting);
  }, [performanceFilter, metricThreshold, sortConfig, onFilterChange]);

  const handlePerformanceFilterChange = useCallback((event) => {
    setPerformanceFilter(event.target.value);
  }, []);

  const handleMetricThresholdChange = useCallback((field, value) => {
    setMetricThreshold(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSortChange = useCallback((field, value) => {
    setSortConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setPerformanceFilter('all');
    setMetricThreshold({ metric: '', value: '' });
    setSortConfig({ field: '', direction: 'asc' });
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (performanceFilter !== 'all') count++;
    if (metricThreshold.metric && metricThreshold.value) count++;
    if (sortConfig.field) count++;
    return count;
  }, [performanceFilter, metricThreshold, sortConfig]);

  const getMetricThresholdRecommendation = useCallback((metricName) => {
    const recommendations = {
      'Largest Contentful Paint (LCP)': '2500ms (Good threshold)',
      'First Input Delay (FID)': '100ms (Good threshold)',
      'Cumulative Layout Shift (CLS)': '0.1 (Good threshold)',
      'First Contentful Paint (FCP)': '1800ms (Good threshold)',
      'Interaction to Next Paint (INP)': '200ms (Good threshold)',
      'Time to First Byte (TTFB)': '800ms (Good threshold)'
    };
    
    return recommendations[metricName] || '';
  }, []);

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography variant="h6" color="primary">
              Filters & Sorting
            </Typography>
            {getActiveFilterCount() > 0 && (
              <Chip 
                label={`${getActiveFilterCount()} active`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            )}
          </Box>
          
          {getActiveFilterCount() > 0 && (
            <Button
              startIcon={<ClearIcon />}
              onClick={clearAllFilters}
              variant="outlined"
              size="small"
              color="primary"
            >
              Clear All
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Performance Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Performance Rating</InputLabel>
              <Select
                value={performanceFilter}
                label="Performance Rating"
                onChange={handlePerformanceFilterChange}
              >
                <MenuItem value="all">All Ratings</MenuItem>
                {availablePerformanceRatings.map(rating => (
                  <MenuItem key={rating} value={rating}>
                    {rating}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {performanceFilter !== 'all' && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Showing only URLs with "{performanceFilter}" performance
              </Typography>
            )}
          </Grid>

          {/* Metric Threshold Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Metric to Filter</InputLabel>
              <Select
                value={metricThreshold.metric}
                label="Metric to Filter"
                onChange={(e) => handleMetricThresholdChange('metric', e.target.value)}
              >
                <MenuItem value="">No Metric Filter</MenuItem>
                {availableMetrics.map(metric => (
                  <MenuItem key={metric} value={metric}>
                    {metric}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Maximum Value"
              type="number"
              value={metricThreshold.value}
              onChange={(e) => handleMetricThresholdChange('value', e.target.value)}
              disabled={!metricThreshold.metric}
              placeholder="e.g., 2500"
              inputProps={{ min: 0, step: 0.1 }}
            />
            
            {metricThreshold.metric && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Recommended: {getMetricThresholdRecommendation(metricThreshold.metric)}
              </Typography>
            )}
          </Grid>

          {/* Sort Configuration */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortConfig.field}
                label="Sort By"
                onChange={(e) => handleSortChange('field', e.target.value)}
              >
                <MenuItem value="">No Sorting</MenuItem>
                {sortFieldOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Sort Direction</InputLabel>
              <Select
                value={sortConfig.direction}
                label="Sort Direction"
                onChange={(e) => handleSortChange('direction', e.target.value)}
                disabled={!sortConfig.field}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
            
            {sortConfig.field && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Sorting by {sortFieldOptions.find(opt => opt.value === sortConfig.field)?.label} 
                ({sortConfig.direction === 'asc' ? 'lowest first' : 'highest first'})
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {performanceFilter !== 'all' && (
                  <Chip
                    label={`Performance: ${performanceFilter}`}
                    onDelete={() => setPerformanceFilter('all')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                
                {metricThreshold.metric && metricThreshold.value && (
                  <Chip
                    label={`${metricThreshold.metric} ≤ ${metricThreshold.value}`}
                    onDelete={() => setMetricThreshold({ metric: '', value: '' })}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                
                {sortConfig.field && (
                  <Chip
                    label={`Sorted by ${sortFieldOptions.find(opt => opt.value === sortConfig.field)?.label} (${sortConfig.direction})`}
                    onDelete={() => setSortConfig({ field: '', direction: 'asc' })}
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<SortIcon />}
                  />
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Help Text */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="textSecondary">
          <strong>Tips:</strong> Use performance rating filters to find URLs that need attention. 
          Set metric thresholds to identify URLs exceeding recommended values. 
          Sort by metrics to see which URLs perform best or worst for specific measurements.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FilterSort;