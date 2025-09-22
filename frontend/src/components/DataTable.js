import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  Link,
  Card,
  CardContent,
  Grid,
  Divider,
  LinearProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Speed as SpeedIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { 
  getPerformanceColor, 
  formatMetricValue, 
  formatURL,
  getMetricDescription 
} from '../services/api';

const DataTable = ({ data }) => {
  // Performance rating helper component
  const PerformanceChip = ({ performance }) => {
    let icon, color, bgColor;
    
    switch (performance?.toLowerCase()) {
      case 'good':
        icon = <TrendingUp sx={{ fontSize: 16 }} />;
        color = 'success';
        bgColor = '#e8f5e8';
        break;
      case 'needs improvement':
        icon = <TrendingFlat sx={{ fontSize: 16 }} />;
        color = 'warning';
        bgColor = '#fff3e0';
        break;
      case 'poor':
        icon = <TrendingDown sx={{ fontSize: 16 }} />;
        color = 'error';
        bgColor = '#ffebee';
        break;
      default:
        icon = <SpeedIcon sx={{ fontSize: 16 }} />;
        color = 'default';
        bgColor = '#f5f5f5';
    }
    
    return (
      <Chip
        icon={icon}
        label={performance || 'Unknown'}
        color={color}
        size="small"
        variant="filled"
        sx={{
          fontWeight: 600,
          backgroundColor: bgColor,
          '& .MuiChip-icon': {
            color: getPerformanceColor(performance)
          }
        }}
      />
    );
  };

  // Metric value display component
  const MetricValue = ({ metric, metricName }) => {
    if (!metric) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          N/A
        </Typography>
      );
    }

    const value = metric.p75_value;
    const goodRatio = metric.good_ratio;
    
    return (
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
              {metricName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.9)' }}>
              {getMetricDescription(metricName)}
            </Typography>
            {value !== null && (
              <Typography variant="body2" sx={{ color: 'white' }}>
                <strong>P75 Value:</strong> {formatMetricValue(value)}
              </Typography>
            )}
            {goodRatio !== null && (
              <>
                <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
                  <strong>User Experience Distribution:</strong>
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>Good</Typography>
                    <Typography variant="caption" sx={{ color: 'white' }}>
                      {(goodRatio * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={goodRatio * 100}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#4caf50',
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
                {metric.needs_improvement_ratio !== null && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#ff9800' }}>Needs Improvement</Typography>
                      <Typography variant="caption" sx={{ color: 'white' }}>
                        {(metric.needs_improvement_ratio * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={metric.needs_improvement_ratio * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#ff9800',
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                )}
                {metric.poor_ratio !== null && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#f44336' }}>Poor</Typography>
                      <Typography variant="caption" sx={{ color: 'white' }}>
                        {(metric.poor_ratio * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={metric.poor_ratio * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#f44336',
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        }
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              maxWidth: 350,
              fontSize: '0.875rem'
            }
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          cursor: 'help'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'medium',
              fontFamily: 'monospace',
              color: value !== null ? 'text.primary' : 'text.secondary',
              fontSize: '0.9rem'
            }}
          >
            {value !== null ? formatMetricValue(value) : 'N/A'}
          </Typography>
          {goodRatio !== null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: goodRatio >= 0.75 ? '#4caf50' : 
                                 goodRatio >= 0.5 ? '#ff9800' : '#f44336'
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: goodRatio >= 0.75 ? 'success.main' : 
                         goodRatio >= 0.5 ? 'warning.main' : 'error.main',
                  fontWeight: 'medium',
                  fontSize: '0.75rem'
                }}
              >
                {(goodRatio * 100).toFixed(0)}% good
              </Typography>
            </Box>
          )}
        </Box>
      </Tooltip>
    );
  };

  // Generate columns dynamically based on available data
  const columns = useMemo(() => {
    if (!data?.results?.length) return [];

    // Base columns
    const baseColumns = [
      {
        field: 'url',
        headerName: 'URL',
        width: 350,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`Open ${params.value} in new tab`}>
              <Link
                href={params.value}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  maxWidth: '300px'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formatURL(params.value, 40)}
                </Typography>
                <LaunchIcon sx={{ fontSize: 14, opacity: 0.7 }} />
              </Link>
            </Tooltip>
          </Box>
        ),
        sortable: true
      },
      {
        field: 'form_factor',
        headerName: 'Device',
        width: 120,
        renderCell: (params) => {
          const displayName = params.value === 'ALL_FORM_FACTORS' ? 'All Devices' : 
                             params.value === 'PHONE' ? 'Mobile' :
                             params.value === 'DESKTOP' ? 'Desktop' : 
                             params.value === 'TABLET' ? 'Tablet' : params.value;
          
          return (
            <Chip
              label={displayName}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 500 }}
            />
          );
        },
        sortable: true
      },
      {
        field: 'overall_performance',
        headerName: 'Overall Rating',
        width: 180,
        renderCell: (params) => <PerformanceChip performance={params.value} />,
        sortable: true
      }
    ];

    // Get all unique metrics from the data
    const allMetrics = new Set();
    data.results.forEach(result => {
      result.metrics?.forEach(metric => {
        allMetrics.add(metric.metric_name);
      });
    });

    // Create columns for each metric
    const metricColumns = Array.from(allMetrics).map(metricName => ({
      field: metricName.replace(/[^a-zA-Z0-9]/g, '_'), // Safe field name
      headerName: metricName,
      width: 200,
      renderCell: (params) => {
        const metric = params.row.metrics?.find(m => m.metric_name === metricName);
        return <MetricValue metric={metric} metricName={metricName} />;
      },
      sortable: true,
      sortComparator: (v1, v2, param1, param2) => {
        const metric1 = param1.row.metrics?.find(m => m.metric_name === metricName);
        const metric2 = param2.row.metrics?.find(m => m.metric_name === metricName);
        const value1 = metric1?.p75_value || 0;
        const value2 = metric2?.p75_value || 0;
        return value1 - value2;
      }
    }));

    return [...baseColumns, ...metricColumns];
  }, [data]);

  // Transform data for DataGrid
  const rows = useMemo(() => {
    if (!data?.results?.length) return [];

    return data.results.map((result, index) => ({
      id: index,
      url: result.url,
      form_factor: result.form_factor,
      overall_performance: result.overall_performance,
      metrics: result.metrics,
      created_at: result.created_at,
      // Add metric data for easy access
      ...result.metrics?.reduce((acc, metric) => {
        const fieldName = metric.metric_name.replace(/[^a-zA-Z0-9]/g, '_');
        acc[fieldName] = metric;
        return acc;
      }, {})
    }));
  }, [data]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!data?.results?.length) return null;

    const totalUrls = data.results.length;
    const goodCount = data.results.filter(r => r.overall_performance === 'Good').length;
    const needsImprovementCount = data.results.filter(r => r.overall_performance === 'Needs Improvement').length;
    const poorCount = data.results.filter(r => r.overall_performance === 'Poor').length;
    const unknownCount = totalUrls - goodCount - needsImprovementCount - poorCount;

    return {
      totalUrls,
      goodCount,
      needsImprovementCount,
      poorCount,
      unknownCount,
      goodPercentage: ((goodCount / totalUrls) * 100).toFixed(1),
      needsImprovementPercentage: ((needsImprovementCount / totalUrls) * 100).toFixed(1),
      poorPercentage: ((poorCount / totalUrls) * 100).toFixed(1)
    };
  }, [data]);

  // Handle empty state
  if (!data?.results?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <AssessmentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No Performance Data Available
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Analysis results will appear here after you submit URLs for analysis
        </Typography>
      </Box>
    );
  }

return (
    <Box>
        {/* Summary Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
                    <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                        <AssessmentIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {summaryStats?.totalUrls}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            URLs Analyzed
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)' }}>
                    <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                        <TrendingUp sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {summaryStats?.goodCount}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Good Performance ({summaryStats?.goodPercentage}%)
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' }}>
                    <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                        <TrendingFlat sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {summaryStats?.needsImprovementCount}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Needs Improvement ({summaryStats?.needsImprovementPercentage}%)
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)' }}>
                    <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                        <TrendingDown sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {summaryStats?.poorCount}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Poor Performance ({summaryStats?.poorPercentage}%)
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Data Grid */}
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
                autoHeight={false}
                density="comfortable"
                sx={{
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f0f0f0',
                        padding: '12px',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#fafafa',
                        borderBottom: '2px solid #e0e0e0',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    },
                    '& .MuiDataGrid-row': {
                        '&:hover': {
                            backgroundColor: '#f8f9fa',
                        },
                        '&:nth-of-type(even)': {
                            backgroundColor: '#fcfcfc',
                        }
                    },
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                        }
                    },
                    border: 'none',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            />
        </Box>

        {/* Information Section */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon color="primary" fontSize="small" />
                <Typography variant="h6" color="primary">
                    Understanding Your Performance Data
                </Typography>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Performance Ratings Explained:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp sx={{ color: '#4caf50', fontSize: 16 }} />
                            <Typography variant="body2">
                                <strong>Good:</strong> Meets recommended performance thresholds
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingFlat sx={{ color: '#ff9800', fontSize: 16 }} />
                            <Typography variant="body2">
                                <strong>Needs Improvement:</strong> Close to thresholds, optimization recommended
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingDown sx={{ color: '#f44336', fontSize: 16 }} />
                            <Typography variant="body2">
                                <strong>Poor:</strong> Exceeds thresholds, immediate attention required
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Core Web Vitals Thresholds:
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        • <strong>LCP (Loading):</strong> Good ≤ 2.5s, Poor &gt; 4s<br/>
                        • <strong>FID (Interactivity):</strong> Good ≤ 100ms, Poor &gt; 300ms<br/>
                        • <strong>CLS (Visual Stability):</strong> Good ≤ 0.1, Poor &gt; 0.25<br/>
                        • <strong>INP (Responsiveness):</strong> Good ≤ 200ms, Poor &gt; 500ms
                    </Typography>
                </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                <strong>Data Source:</strong> Google Chrome User Experience Report (CrUX) &bull; 
                <strong> P75 Values:</strong> 75th percentile of real user experiences &bull; 
                <strong> Good %:</strong> Percentage of users with good experience
            </Typography>
        </Box>
    </Box>
);
};

export default DataTable;