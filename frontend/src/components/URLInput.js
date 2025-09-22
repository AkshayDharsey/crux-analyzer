import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  IconButton,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { validateURL, getFormFactorDisplayName } from '../services/api';

const URLInput = ({ onAnalyze, disabled = false }) => {
  const [urls, setUrls] = useState(['']);
  const [formFactor, setFormFactor] = useState('ALL_FORM_FACTORS');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const formFactorOptions = [
    { value: 'ALL_FORM_FACTORS', label: 'All Devices' },
    { value: 'DESKTOP', label: 'Desktop' },
    { value: 'PHONE', label: 'Mobile' },
    { value: 'TABLET', label: 'Tablet' }
  ];

  const validateUrls = useCallback(() => {
    const newErrors = {};
    const validUrls = [];

    urls.forEach((url, index) => {
      if (url.trim()) {
        if (!validateURL(url.trim())) {
          newErrors[index] = 'Please enter a valid URL (must include http:// or https://)';
        } else {
          validUrls.push(url.trim());
        }
      } else if (urls.length === 1) {
        newErrors[index] = 'At least one URL is required';
      }
    });

    // Check for duplicate URLs
    const uniqueUrls = [...new Set(validUrls)];
    if (uniqueUrls.length !== validUrls.length) {
      // Find duplicates
      const duplicates = validUrls.filter((url, index) => validUrls.indexOf(url) !== index);
      urls.forEach((url, index) => {
        if (duplicates.includes(url.trim())) {
          newErrors[index] = 'Duplicate URL detected';
        }
      });
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, validUrls: uniqueUrls };
  }, [urls]);

  const handleUrlChange = useCallback((index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);

    // Mark this field as touched
    setTouched(prev => ({ ...prev, [index]: true }));

    // Clear error for this field if it becomes valid
    if (errors[index] && value.trim() && validateURL(value.trim())) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  }, [urls, errors]);

  const handleAddUrl = useCallback(() => {
    if (urls.length < 10) {
      setUrls([...urls, '']);
    }
  }, [urls]);

  const handleRemoveUrl = useCallback((index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);

      // Clean up errors and touched state
      const newErrors = {};
      const newTouched = {};
      Object.keys(errors).forEach(key => {
        const keyIndex = parseInt(key);
        if (keyIndex < index) {
          newErrors[keyIndex] = errors[key];
        } else if (keyIndex > index) {
          newErrors[keyIndex - 1] = errors[key];
        }
      });
      Object.keys(touched).forEach(key => {
        const keyIndex = parseInt(key);
        if (keyIndex < index) {
          newTouched[keyIndex] = touched[key];
        } else if (keyIndex > index) {
          newTouched[keyIndex - 1] = touched[key];
        }
      });

      setErrors(newErrors);
      setTouched(newTouched);
    }
  }, [urls, errors, touched]);

  const handleAnalyze = useCallback(() => {
    const { isValid, validUrls } = validateUrls();
    
    if (isValid && validUrls.length > 0) {
      onAnalyze(validUrls, formFactor);
    } else {
      // Mark all fields as touched to show validation errors
      const newTouched = {};
      urls.forEach((_, index) => {
        newTouched[index] = true;
      });
      setTouched(newTouched);
    }
  }, [validateUrls, onAnalyze, formFactor, urls]);

  const handleKeyPress = useCallback((event, index) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (index === urls.length - 1 && urls.length < 10) {
        handleAddUrl();
      } else {
        handleAnalyze();
      }
    }
  }, [urls.length, handleAddUrl, handleAnalyze]);

  const getValidUrlCount = useCallback(() => {
    return urls.filter(url => url.trim() && validateURL(url.trim())).length;
  }, [urls]);

  return (
    <Box>
      {/* Form Factor Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="form-factor-label">Device Type</InputLabel>
        <Select
          labelId="form-factor-label"
          value={formFactor}
          label="Device Type"
          onChange={(e) => setFormFactor(e.target.value)}
          disabled={disabled}
        >
          {formFactorOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ mb: 3 }} />

      {/* URL Input Fields */}
      <Typography variant="h6" gutterBottom color="primary">
        URLs to Analyze
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Enter up to 10 URLs for performance analysis. Each URL must include http:// or https://
      </Typography>

      <Box sx={{ mb: 3 }}>
        {urls.map((url, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label={`URL ${index + 1}`}
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              error={Boolean(errors[index] && touched[index])}
              helperText={touched[index] ? errors[index] : ''}
              disabled={disabled}
              placeholder="https://example.com"
              variant="outlined"
              sx={{ flexGrow: 1 }}
            />
            
            {urls.length > 1 && (
              <IconButton
                onClick={() => handleRemoveUrl(index)}
                disabled={disabled}
                color="error"
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>

      {/* Add URL Button */}
      {urls.length < 10 && (
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddUrl}
            disabled={disabled}
            variant="outlined"
            color="primary"
          >
            Add Another URL
          </Button>
          
          <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
            {urls.length}/10 URLs
          </Typography>
        </Box>
      )}

      {/* URL Summary */}
      {getValidUrlCount() > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Valid URLs to analyze ({getValidUrlCount()}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {urls.filter(url => url.trim() && validateURL(url.trim())).map((url, index) => (
              <Chip
                key={index}
                label={url.length > 40 ? `${url.substring(0, 40)}...` : url}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Analysis Settings Summary */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Analysis Configuration:</strong><br/>
          Device Type: {getFormFactorDisplayName(formFactor)}<br/>
          URLs: {getValidUrlCount()} valid URL{getValidUrlCount() !== 1 ? 's' : ''}
          {getValidUrlCount() > 1 && ' (summary statistics will be included)'}
        </Typography>
      </Alert>

      {/* Analyze Button */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AnalyticsIcon />}
          onClick={handleAnalyze}
          disabled={disabled || getValidUrlCount() === 0}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
            }
          }}
        >
          {disabled ? 'Analyzing...' : `Analyze Performance`}
        </Button>
        
        {getValidUrlCount() > 0 && (
          <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
            This will analyze {getValidUrlCount()} URL{getValidUrlCount() !== 1 ? 's' : ''} using Chrome UX Report data
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default URLInput;