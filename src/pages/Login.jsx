// Login.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Fade,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  ArrowForward
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import logo from '../assets/logo2.png';
import companyLogo from '../assets/12springslogo.png';
// Validation schema
const validationSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});
const CustomTextField = ({ control, name, label, type, errorMessage, icon, ...rest }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          error={!!errorMessage}
          helperText={errorMessage}
          label={label}
          placeholder={label}
          disabled={rest.isSubmitting}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {icon}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: { xs: '48px', sm: '44px', md: '48px' }, 
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '2px solid transparent',
              transition: 'all 0.3s ease',
              fontSize: { xs: '1rem', sm: '0.9rem', md: '1rem' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                transform: { sm: 'translateY(-1px)' },
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
              },
              '&.Mui-focused': {
                backgroundColor: '#fff',
                border: '2px solid #667eea',
                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }
            },
            '& .MuiInputBase-input': {
              padding: { xs: '12px 14px', sm: '10px 14px', md: '12px 16px' },
              fontSize: { xs: '1rem', sm: '0.9rem', md: '1rem' }
            },
            mb: 4 // Add this for spacing
          }}
        />
      )}
    />
  );
};
const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const handleShowPassword = () => setShowPassword(!showPassword);
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        'https://api.12s.uk/v1/auth',
        { username: data.email, password: data.password },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      // … success logic …
    } catch (err) {
      // 1. Log the entire response payload so you know what your API is actually sending
      console.log('Full error response:', err.response);
  
      // 2. Drill into the common fields
      let apiMsg;
      if (axios.isAxiosError(err) && err.response?.data) {
        const d = err.response.data;
        // check a handful of likely properties:
        apiMsg = d.message ?? d.error ?? d.msg ?? null;
      }
  
      // 3. Fallback to axios’s own message
      const finalMsg = apiMsg ?? err.message ?? 'Login failed. Please try again.';
  
      setSnackbar({
        open: true,
        message: finalMsg,
        severity: 'error',
      });
    }
  };
  const handleCreateAccount = () => {
    navigate('/signup');
  };
  const handleResetPassword = () => {
    navigate('/reset-password');
  };
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '0', sm: '16px', md: '24px' }, 
        background: 'linear-gradient(90deg, #7e5b72 0%, #2d3e65 100%)',
        backgroundAttachment: 'fixed',
        position: 'relative',
        boxSizing: 'border-box',
        overflowY: 'hidden',
      }}
    >
      <Fade in={true} timeout={1000}>
        <Paper
          elevation={3}
          sx={{
            mx: { xs: 2, sm: 'auto' }, // <-- Add this line
            width: '100%',
            maxWidth: {
              xs: '100%', 
              sm: '400px',
              md: '450px',
              lg: '500px',
            },
            minHeight: { xs: 'auto', sm: 'auto' }, 
            borderRadius: { xs: '0', sm: '16px' }, 
            backgroundColor: 'rgba(255,255,255,0.97)',
            p: { xs: '24px 20px', sm: '24px', md: '32px' }, 
            boxShadow: { xs: 'none', sm: '0 8px 32px rgba(0,0,0,0.10)' }, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-start' }, 
            position: 'relative',
            zIndex: 1,
            boxSizing: 'border-box',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              borderTopLeftRadius: { xs: '0', sm: '16px' },
              borderTopRightRadius: { xs: '0', sm: '16px' },
              background: 'linear-gradient(90deg, transparent 0%, #667eea88 20%, #764ba288 50%, #667eea88 80%, transparent 100%)',
              zIndex: 2,
              animation: 'slideLine 2s linear infinite',
              backgroundSize: '200% 100%',
              backgroundPosition: '0% 0%',
              '@keyframes slideLine': {
                '0%': { backgroundPosition: '0% 0%' },
                '100%': { backgroundPosition: '200% 0%' }
              }
            }
          }}
        >
          {/* Logo Section */}
          <Box sx={{ mb: { xs: '32px', sm: '24px', md: '32px' }, textAlign: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="logo"
              sx={{
                width: { xs: '80px', sm: '70px', md: '80px', lg: '90px' }, 
                height: 'auto',
                objectFit: 'contain',
                boxShadow: '0 4px 24px rgba(102,126,234,0.10)',
                borderRadius: '8px',
                p: '8px',
              }}
            />
          </Box>
          {/* Title Section */}
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: { xs: '32px', sm: '24px', md: '32px' },
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.375rem', md: '1.5rem', lg: '1.75rem' }, 
              textAlign: 'center',
              color: '#1a1a1a',
              lineHeight: 1.2
            }}
          >
            Login
          </Typography>
          {/* Form Section */}
          <Fade in={true} timeout={1200}>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ width: '100%' }}
            >
              <CustomTextField
                control={control}
                name="email"
                label="Email"
                type="email"
                errorMessage={errors.email?.message}
                icon={<Person sx={{ 
                  color: '#667eea', 
                  fontSize: { xs: '1.2rem', sm: '1.1rem', md: '1.2rem' } 
                }} />}
                
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    label="Password"
                    placeholder="Password"
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#667eea', fontSize: { xs: '1.2rem', sm: '1.1rem', md: '1.2rem' } }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleShowPassword}
                            edge="end"
                            size="small"
                            sx={{
                              color: '#667eea',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                transform: 'scale(1.1)'
                              }
                            }}
                            disabled={isSubmitting}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: { xs: '48px', sm: '44px', md: '48px' }, 
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '2px solid transparent',
                        transition: 'all 0.3s ease',
                        fontSize: { xs: '1rem', sm: '0.9rem', md: '1rem' },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          transform: { sm: 'translateY(-1px)' },
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#fff',
                          border: '2px solid #667eea',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }
                      },
                      '& .MuiInputBase-input': {
                        padding: { xs: '12px 14px', sm: '10px 14px', md: '12px 16px' },
                        fontSize: { xs: '1rem', sm: '0.9rem', md: '1rem' }
                      },
                      mb: 3// Add this for spacing
                    }}
                  />
                )}
              />
              <Box sx={{ textAlign: 'right', mb: { xs: '32px', sm: '24px', md: '32px' } }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={handleResetPassword}
                  disabled={isSubmitting}
                  sx={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.8rem', md: '0.875rem' },
                    transition: 'all 0.3s ease',
                    '&:hover': { color: '#764ba2', transform: 'translateY(-1px)' },
                    '&:disabled': { opacity: 0.6, cursor: 'not-allowed' }
                  }}
                >
                  Reset Password
                </Link>
              </Box>
              <Box sx={{ mb: { xs: '24px', sm: '20px', md: '24px' } }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  endIcon={<ArrowForward sx={{ fontSize: { xs: '1.1rem', sm: '1.1rem' } }} />}
                  fullWidth
                  sx={{
                    height: { xs: '48px', sm: '44px', md: '48px' }, 
                    borderRadius: '24px',
                    backgroundColor: '#000',
                    color: '#fff',
                    fontSize: { xs: '1rem', sm: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'skewX(-25deg)',
                      transition: 'all 0.5s ease-out',
                      zIndex: 0,
                    },
                    '&:hover:before': { left: '100%' },
                    '& > *': { position: 'relative', zIndex: 1 },
                    '&:hover': { 
                      backgroundColor: '#111', 
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                      transform: { sm: 'translateY(-2px)' }
                    },
                    '&:active': { transform: 'scale(0.98)' },
                    '&:disabled': { 
                      backgroundColor: '#ccc', 
                      color: '#666', 
                      cursor: 'not-allowed' 
                    }
                  }}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Box>
              <Box sx={{ textAlign: 'center', mb: { xs: '24px', sm: '16px' } }}>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: '#666', 
                    fontSize: { xs: '0.875rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.4
                  }}
                >
                  Not a member?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={isSubmitting}
                    sx={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': { color: '#764ba2', transform: 'translateY(-1px)' },
                      '&:disabled': { opacity: 0.6, cursor: 'not-allowed' }
                    }}
                  >
                    Create Account
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Fade>
          <Fade in={true} timeout={1500}>
            <Box sx={{ textAlign: 'center', width: '100%', mt: { xs: '12px', sm: '8px' } }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { xs: 0.5, sm: 1 },
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  fontSize: { xs: '0.75rem', sm: '0.7rem', md: '0.75rem' },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                POWERED BY
                <Box
                  component="img"
                  src={companyLogo}
                  alt="Twelve Springs"
                  sx={{
                    height: { xs: 20, sm: 22, md: 26 },
                    maxWidth: '100%',
                    filter: 'brightness(0.8) saturate(1.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      filter: 'brightness(1) saturate(1.5)', 
                      transform: 'scale(1.05)' 
                    }
                  }}
                />
              </Typography>
            </Box>
          </Fade>
        </Paper>
      </Fade>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default Login;
