import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { ArrowBack, ArrowForward, Person, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import logo from '../assets/logo2.png';
import companyLogo from '../assets/12springslogo.png';

// Validation schema
const schema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
 
});

// API Configuration
const API_CONFIG = {
  baseURL: 'https://api.12s.uk',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Create axios instance
const apiClient = axios.create(API_CONFIG);

// API service
const authService = {
  initiatePasswordReset: async (username) => {
    try {
      const response = await apiClient.post('/v1/auth/reset-password-initiate', {
        username: username.trim()
      });
      return response.data;
    } catch (error) {
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        throw new Error(data?.message || `Server error: ${status}`);
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other errors
        throw new Error('An unexpected error occurred.');
      }
    }
  }
};

const ResetPassword = ({ onBack, onReset }) => {
  const navigate = useNavigate();
  const [resetStatus, setResetStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: ''
    }
  });

  const handleBack = () => {
    // Clear any existing state before navigating back
    setResetStatus({ loading: false, success: false, error: null });
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleReset = async (data) => {
    setResetStatus({ loading: true, success: false, error: null });
    
    try {
      // Call the API
      const response = await authService.initiatePasswordReset(data.username);
      
      // Handle successful response
      setResetStatus({ loading: false, success: true, error: null });
      showSnackbar('Password reset instructions have been sent to your email!', 'success');
      
      // Call parent callback if provided
      if (onReset) {
        await onReset(data.username, response);
      }
      
      // Optional: Clear form after successful submission
      // resetForm();
      
    } catch (error) {
      console.error('Reset password error:', error);
      
      setResetStatus({ 
        loading: false, 
        success: false, 
        error: error.message 
      });
      
      showSnackbar(error.message, 'error');
    }
  };

  const handleRetry = () => {
    setResetStatus({ loading: false, success: false, error: null });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
        padding: { xs: 1, sm: 2 },
        position: 'relative',
        overflow: 'auto',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            maxWidth: { xs: '100%', sm: '560px' },
            mx: 'auto'
          }}
        >
          <IconButton
            onClick={handleBack}
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 16 },
              left: { xs: 8, sm: 16 },
              color: '#000',
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 1,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
            }}
          >
            <ArrowBack />
          </IconButton>

          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img 
                src={logo} 
                alt="DuckAI Logo" 
                height={50} 
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '90px'
                }} 
              />
            </Box>

            <Typography
              variant="h5"
              align="center"
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Reset-Verify Password
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{ 
                color: 'text.secondary', 
                mb: 4,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Please Provide your username
            </Typography>

            {/* Success Message */}
            {resetStatus.success && (
              <Alert 
                severity="success" 
                icon={<CheckCircle />}
                sx={{ mb: 3 }}
              >
                Password reset initiated successfully! Please check your email for further instructions.
              </Alert>
            )}

            {/* Error Message */}
            {resetStatus.error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleRetry}
                  >
                    Retry
                  </Button>
                }
              >
                {resetStatus.error}
              </Alert>
            )}

            {/* Form */}
            {!resetStatus.success && (
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    disabled={resetStatus.loading}
                    InputProps={{
                      startAdornment: (
                        <Person sx={{ color: 'action.active', mr: 1 }} />
                      )
                    }}
                    sx={{ mb: 4 }}
                  />
                )}
              />
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mt: 4,
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: 'center'
              }}
            >
              <Typography 
                variant="body2"   
                sx={{
                  m: 0,
                  fontFamily: 'Poppins, sans-serif',
                  lineHeight: 1.5,
                  fontSize: { xs: '16px', sm: '20px' },
                  fontWeight: 600
                }}
              >
                Powered by
              </Typography>
              <Box 
                component="img" 
                src={companyLogo} 
                alt="Twelve Springs" 
                sx={{
                  height: { xs: 35, sm: 45 },
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                disabled={resetStatus.loading}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxSizing: 'border-box',
                  WebkitTapHighlightColor: 'transparent',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  verticalAlign: 'middle',
                  appearance: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  lineHeight: 1.75,
                  minWidth: '64px',
                  textTransform: 'capitalize',
                  height: { xs: '48px', sm: '52.5px' },
                  width: { xs: '100%', sm: '175px' },
                  fontSize: { xs: '16px', sm: '18.2px' },
                  fontWeight: 600,
                  color: 'rgb(0, 0, 0)',
                  alignSelf: 'center',
                  outline: 0,
                  margin: { xs: '20px 0 0', sm: '25px 0 0' },
                  textDecoration: 'none',
                  padding: '5px 15px',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgb(0, 0, 0)',
                  borderRadius: '20px',
                  transition: 'background-color 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1), border-color 250ms cubic-bezier(0.4,0,0.2,1)',
                  order: { xs: 2, sm: 1 },
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderColor: 'rgb(0, 0, 0)',
                  },
                  '&:active': {
                    backgroundColor: 'rgba(0,0,0,0.1)',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed',
                  }
                }}
              >
                Back
              </Button>

              {resetStatus.success ? (
                <Button
                  variant="contained"
                  onClick={handleBack}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxSizing: 'border-box',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                    userSelect: 'none',
                    verticalAlign: 'middle',
                    appearance: 'none',
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: 1.75,
                    minWidth: '64px',
                    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px',
                    textTransform: 'capitalize',
                    height: { xs: '48px', sm: '52.5px' },
                    width: { xs: '100%', sm: '175px' },
                    fontSize: { xs: '16px', sm: '18.2px' },
                    fontWeight: 600,
                    backgroundColor: 'rgb(76, 175, 80)',
                    color: 'rgb(255, 255, 255)',
                    alignSelf: 'center',
                    outline: 0,
                    borderWidth: 0,
                    borderStyle: 'initial',
                    borderColor: 'initial',
                    borderImage: 'initial',
                    margin: { xs: '20px 0 0', sm: '25px 0 0' },
                    textDecoration: 'none',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    order: { xs: 1, sm: 2 },
                    '&:hover': {
                      backgroundColor: 'rgb(69, 160, 73)',
                    }
                  }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={resetStatus.loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  onClick={handleSubmit(handleReset)}
                  disabled={resetStatus.loading}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxSizing: 'border-box',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                    userSelect: 'none',
                    verticalAlign: 'middle',
                    appearance: 'none',
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: 1.75,
                    minWidth: '64px',
                    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px',
                    textTransform: 'capitalize',
                    height: { xs: '48px', sm: '52.5px' },
                    width: { xs: '100%', sm: '175px' },
                    fontSize: { xs: '16px', sm: '18.2px' },
                    fontWeight: 600,
                    backgroundColor: 'rgb(0, 0, 0)',
                    color: 'rgb(255, 255, 255)',
                    alignSelf: 'center',
                    outline: 0,
                    borderWidth: 0,
                    borderStyle: 'initial',
                    borderColor: 'initial',
                    borderImage: 'initial',
                    margin: { xs: '20px 0 0', sm: '25px 0 0' },
                    textDecoration: 'none',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    order: { xs: 1, sm: 2 },
                    '&:hover': {
                      backgroundColor: resetStatus.loading ? 'rgb(0, 0, 0)' : 'rgb(30, 30, 30)',
                      boxShadow: resetStatus.loading ? 
                        'rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px' :
                        'rgba(0, 0, 0, 0.3) 0px 4px 2px -2px, rgba(0, 0, 0, 0.2) 0px 3px 3px 0px, rgba(0, 0, 0, 0.15) 0px 2px 6px 0px',
                    },
                    '&:active': {
                      transform: resetStatus.loading ? 'none' : 'translateY(1px)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      cursor: 'not-allowed',
                    }
                  }}
                >
                  {resetStatus.loading ? 'Sending...' : ' Reset '}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPassword;