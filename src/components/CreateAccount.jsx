import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosService from '../services/axiosService';
import PasswordStrengthBar from 'react-password-strength-bar';
import { useToast } from '../context/ToastContext';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Grid,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Alert,
  Collapse,
  CircularProgress
} from '@mui/material';
import { ArrowBack, ArrowForward, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo2.png';
import companyLogo from '../assets/12springslogo.png';

// Enhanced validation schema
const validationSchema = yup.object({
  // invitationCode: yup
  //   .string()
  //   // .required('Invitation code is required')
  //   .min(6, 'Invitation code must be at least 6 characters'),
  accountName: yup
    .string()
    .required('Account name is required')
    .min(2, 'Account name must be at least 2 characters'),
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  timezone: yup
    .string()
    .required('Please select a timezone'),
  showAddress: yup.boolean(),
  addressLine1: yup.string().when('showAddress', {
    is: true,
    then: (schema) => schema.required('Address line 1 is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  city: yup.string().when('showAddress', {
    is: true,
    then: (schema) => schema.required('City is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  postcode: yup.string().when('showAddress', {
    is: true,
    then: (schema) => schema.required('Postcode is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  country: yup.string().when('showAddress', {
    is: true,
    then: (schema) => schema.required('Country is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

// Function to get browser timezone
const getBrowserTimezoneOffset = () => {
  const offset = -new Date().getTimezoneOffset(); // Invert the sign!
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const minutes = String(absOffset % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
};

const Signup = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultTimezone, setDefaultTimezone] = useState('');

  // Get browser timezone on component mount
  useEffect(() => {
    const browserTimezone = getBrowserTimezoneOffset();
    setDefaultTimezone(browserTimezone);
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
    getValues,
    setValue
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      invitationCode: '',
      accountName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      timezone: '',
      showAddress: false,
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      county: '',
      city: '',
      postcode: '',
      country: '',
    }
  });

  // Set default timezone when it's detected
  useEffect(() => {
    if (defaultTimezone) {
      setValue('timezone', defaultTimezone);
    }
  }, [defaultTimezone, setValue]);

  const showAddress = watch('showAddress');
  const currentPassword = watch('password');

  const timezones = [
    { value: 'auto', label: 'Auto-detect from browser' },
    { value: 'UTC-12:00', label: '(UTC-12:00) International Date Line West' },
    { value: 'UTC-11:00', label: '(UTC-11:00) Coordinated Universal Time-11' },
    { value: 'UTC-10:00', label: '(UTC-10:00) Hawaii' },
    { value: 'UTC-09:00', label: '(UTC-09:00) Alaska' },
    { value: 'UTC-08:00', label: '(UTC-08:00) Pacific Time (US & Canada)' },
    { value: 'UTC-07:00', label: '(UTC-07:00) Mountain Time (US & Canada)' },
    { value: 'UTC-06:00', label: '(UTC-06:00) Central Time (US & Canada)' },
    { value: 'UTC-05:00', label: '(UTC-05:00) Eastern Time (US & Canada)' },
    { value: 'UTC-04:00', label: '(UTC-04:00) Atlantic Time (Canada)' },
    { value: 'UTC-03:30', label: '(UTC-03:30) Newfoundland' },
    { value: 'UTC-03:00', label: '(UTC-03:00) Brasilia' },
    { value: 'UTC-02:00', label: '(UTC-02:00) Coordinated Universal Time-02' },
    { value: 'UTC-01:00', label: '(UTC-01:00) Azores' },
    { value: 'UTC+00:00', label: '(UTC+00:00) Greenwich Mean Time' },
    { value: 'UTC+01:00', label: '(UTC+01:00) Central European Time' },
    { value: 'UTC+02:00', label: '(UTC+02:00) Eastern European Time' },
    { value: 'UTC+03:00', label: '(UTC+03:00) Moscow' },
    { value: 'UTC+03:30', label: '(UTC+03:30) Tehran' },
    { value: 'UTC+04:00', label: '(UTC+04:00) Abu Dhabi, Muscat' },
    { value: 'UTC+04:30', label: '(UTC+04:30) Kabul' },
    { value: 'UTC+05:00', label: '(UTC+05:00) Karachi, Tashkent' },
    { value: 'UTC+05:30', label: '(UTC+05:30) India Standard Time' },
    { value: 'UTC+05:45', label: '(UTC+05:45) Kathmandu' },
    { value: 'UTC+06:00', label: '(UTC+06:00) Dhaka' },
    { value: 'UTC+06:30', label: '(UTC+06:30) Yangon' },
    { value: 'UTC+07:00', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
    { value: 'UTC+08:00', label: '(UTC+08:00) Beijing, Hong Kong, Singapore' },
    { value: 'UTC+08:45', label: '(UTC+08:45) Eucla' },
    { value: 'UTC+09:00', label: '(UTC+09:00) Tokyo, Seoul' },
    { value: 'UTC+09:30', label: '(UTC+09:30) Adelaide' },
    { value: 'UTC+10:00', label: '(UTC+10:00) Sydney, Melbourne' },
    { value: 'UTC+10:30', label: '(UTC+10:30) Lord Howe Island' },
    { value: 'UTC+11:00', label: '(UTC+11:00) Solomon Islands' },
    { value: 'UTC+12:00', label: '(UTC+12:00) Fiji, New Zealand' },
    { value: 'UTC+12:45', label: '(UTC+12:45) Chatham Islands' },
    { value: 'UTC+13:00', label: '(UTC+13:00) Tonga' },
    { value: 'UTC+14:00', label: '(UTC+14:00) Kiritimati' }
  ];

  const handleBack = () => navigate('/');

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Prepare the payload according to API requirements
      const timezoneValue = data.timezone === 'auto' ? defaultTimezone : data.timezone;
      
      const payload = {
        accountName: data.accountName,
        accountStatus: "active", // Default status
        auth: {
          authName: `${data.firstName} ${data.lastName}`,
          authUserName: data.email,
          authPassword: data.password,
          authStatus: "active", // Default status
          timeZone: timezoneValue
        }
      };

      // Add address only if showAddress is true
      if (data.showAddress) {
        payload.address = {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || "", // Optional field
          city: data.city,
          county: data.county || "", // Optional field
          postcode: data.postcode,
          country: data.country,
          addressType: "primary" // Default address type
        };
      }

      // Make API call
      const response = await axiosService.post('/account/signup', payload);

      if (response.status === 200 || response.status === 201) {
        showToast('Account created successfully! Redirecting to login page...', 'success');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }

    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
        padding: isMobile ? 1 : 2,
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
      {/* Back arrow */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: 'absolute',
          top: isMobile ? 8 : 16,
          left: isMobile ? 8 : 16,
          color: '#000',
          bgcolor: 'rgba(255,255,255,0.7)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          zIndex: 1
        }}
      >
        <ArrowBack />
      </IconButton>

      <Container
        maxWidth="md"
        sx={{
          px: { xs: 1, sm: 2, md: 4 },
        }}
      >
        <Card
          elevation={0}
          sx={{
            mx: 'auto',
            borderRadius: isMobile ? 1 : 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  width: '100%',
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="logo"
                  sx={{
                    height: isMobile ? 60 : 80,
                    maxWidth: '60%',
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
                variant={isMobile ? "h6" : "h5"}
                sx={{ mt: 1, fontWeight: 700, mb: 0.5 }}
              >
                Create your Account
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Account Signup
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Invitation Code */}
              <Controller
                name="invitationCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Invitation Code"
                    error={!!errors.invitationCode}
                    helperText={errors.invitationCode?.message}
                    sx={{
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(147, 112, 219, 0.1)',
                        borderRadius: 1
                      }
                    }}
                  />
                )}
              />

              {/* Account Information */}
              <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: isMobile ? 14 : 16 }}>
                Account Information
              </Typography>

              <Controller
                name="accountName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Account Name"
                    error={!!errors.accountName}
                    helperText={errors.accountName?.message}
                    sx={{ mb: 1.5 }}
                  />
                )}
              />

              {/* Personal Information */}
              <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: isMobile ? 14 : 16 }}>
                Personal Information
              </Typography>

              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="First Name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    sx={{ mb: 1.5 }}
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Last Name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    sx={{ mb: 1.5 }}
                  />
                )}
              />

              {/* Login */}
              <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: isMobile ? 14 : 16 }}>
                Login
              </Typography>

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 1.5 }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 1.5 }}>
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                    {/* Password Strength Bar */}
                    {currentPassword && (
                      <Box sx={{ mt: 1 }}>
                        <PasswordStrengthBar
                          password={currentPassword}
                          minLength={8}
                          scoreWords={['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']}
                          shortScoreWord="Too Short"
                        />
                      </Box>
                    )}
                  </Box>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                    sx={{ mb: 1.5 }}
                  />
                )}
              />

              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.timezone} sx={{ mb: 2 }}>
                    <InputLabel>Timezone</InputLabel>
                    <Select {...field} label="Timezone">
                      {timezones.map((tz) => (
                        <MenuItem key={tz.value} value={tz.value}>
                          {tz.value === 'auto' ? `${tz.label} (${defaultTimezone})` : tz.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.timezone && (
                      <FormHelperText>{errors.timezone.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="showAddress"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#667eea'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#667eea'
                          }
                        }}
                      />
                    }
                    label="Provide Address (Optional)"
                    sx={{ mb: showAddress ? 1.5 : 0 }}
                  />
                )}
              />

              {/* Address Information */}
              <Collapse in={showAddress}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: isMobile ? 14 : 16 }}>
                    Address Information
                  </Typography>

                  <Controller
                    name="addressLine1"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Address Line 1"
                        error={!!errors.addressLine1}
                        helperText={errors.addressLine1?.message}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />

                  <Controller
                    name="addressLine2"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Address Line 2 (Optional)"
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />

                  <Controller
                    name="addressLine3"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Address Line 3 (Optional)"
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />

                  {/* 2x2 Grid for County, City, Postcode, Country */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ flex: '1 1 48%' }}>
                      <Controller
                        name="county"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="County (Optional)"
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 48%' }}>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="City"
                            error={!!errors.city}
                            helperText={errors.city?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 48%' }}>
                      <Controller
                        name="postcode"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="Postcode"
                            error={!!errors.postcode}
                            helperText={errors.postcode?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 48%' }}>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="Country"
                            error={!!errors.country}
                            helperText={errors.country?.message}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </Collapse>

              {/* Buttons */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3,
                gap: 2,
                flexDirection: 'row'
              }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={isSubmitting}
                  sx={{
                    height: isMobile ? 45 : 50,
                    width: isMobile ? '100%' : 140,
                    fontSize: isMobile ? 14 : 16,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: 'rgb(0, 0, 0)',
                    borderColor: 'rgb(0, 0, 0)',
                    borderRadius: '25px',
                    textTransform: 'capitalize',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderColor: 'rgb(0, 0, 0)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderColor: 'rgba(0, 0, 0, 0.26)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    }
                  }}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  disabled={isSubmitting}
                  sx={{
                    height: isMobile ? 45 : 50,
                    width: isMobile ? '100%' : 140,
                    fontSize: isMobile ? 14 : 16,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    backgroundColor: 'rgb(0, 0, 0)',
                    color: 'rgb(255, 255, 255)',
                    borderRadius: '25px',
                    textTransform: 'capitalize',
                    '&:hover': {
                      backgroundColor: 'rgb(30, 30, 30)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    }
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Signup'}
                </Button>
              </Box>

              {/* Footer */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mt: 4,
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <Typography sx={{
                  m: 0,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 600
                }}>
                  Powered by
                </Typography>
                <Box
                  component="img"
                  src={companyLogo}
                  alt="Twelve Springs"
                  sx={{ height: isMobile ? 30 : 35 }}
                />
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Signup;