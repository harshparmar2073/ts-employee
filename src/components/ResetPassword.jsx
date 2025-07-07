import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { ArrowBack, ArrowForward, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import logo from '../assets/logo2.png';
import companyLogo from '../assets/12springslogo.png';

// Validation schema
const schema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores')
});

const ResetPassword = ({ onBack, onReset }) => {
    const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: ''
    }
  });

  const handleBack = () => navigate(-1);

  const handleReset = async (data) => {
    try {
      if (onReset) {
        await onReset(data.username);
      }
    } catch (error) {
      console.error('Reset password error:', error);
    }
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
          overflowX: 'hidden',
          overflowY: 'hidden',
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
            maxWidth: { xs: '100%', sm: '500px' },
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
          <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: { xs: 2, sm: 3, md: 4 },
                    width: '100%',
                  }}
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="logo"
                    sx={{
                      height: { xs: 56, sm: 72, md: 90, lg: 110, xl: 130 },
                      maxWidth: { xs: '70%', sm: '60%', md: '50%', lg: '40%', xl: '30%' },
                      minWidth: 80,
                      objectFit: 'contain',
                      mx: 'auto',
                      display: 'block',
                      boxShadow: '0 4px 24px rgba(102,126,234,0.10)',
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.7)',
                      p: 1,
                    }}
                  />
                </Box>
            <Typography
              variant="h5"
              align="center"
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
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
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Please Provide your username
            </Typography>

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
                  InputProps={{
                    startAdornment: (
                      <Person sx={{ color: 'action.active', mr: 1 }} />
                    )
                  }}
                  sx={{ mb: 6 }}
                />
              )}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mt: 6,
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
                  }
                }}
              >
                Back
              </Button>

              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={handleSubmit(handleReset)}
                disabled={isSubmitting}
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
                  boxShadow:
                    'rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px',
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
                  transition:
                    'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  order: { xs: 1, sm: 2 },

                  '&:hover': {
                    backgroundColor: isSubmitting ? 'rgb(0, 0, 0)' : 'rgb(30, 30, 30)',
                    boxShadow: isSubmitting ? 
                      'rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px' :
                      'rgba(0, 0, 0, 0.3) 0px 4px 2px -2px, rgba(0, 0, 0, 0.2) 0px 3px 3px 0px, rgba(0, 0, 0, 0.15) 0px 2px 6px 0px',
                  },
                  '&:active': {
                    transform: isSubmitting ? 'none' : 'translateY(1px)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'not-allowed',
                  }
                }}
              >
                {isSubmitting ? 'Resetting...' : 'Reset'}
              </Button>

            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPassword;