import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  Collapse
} from '@mui/material';
import { ArrowBack, ArrowForward, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo2.png';
import companyLogo from '../assets/12springslogo.png';

// Validation schema
const validationSchema = yup.object({
  invitationCode: yup
    .string()
    .required('Invitation code is required')
    .min(6, 'Invitation code must be at least 6 characters'),
  tenantName: yup
    .string()
    .required('Tenant name is required')
    .min(2, 'Tenant name must be at least 2 characters'),
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
  // Address fields - conditionally required
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

const Signup = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      invitationCode: '',
      tenantName: '',
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

  const showAddress = watch('showAddress');

  // World timezones
  const timezones = [
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
    setSubmitError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove address fields if not needed
      if (!data.showAddress) {
        const { addressLine1, addressLine2, addressLine3, county, city, postcode, country, ...cleanData } = data;
        console.log('Signup data:', cleanData);
      } else {
        console.log('Signup data:', data);
      }
      
      // Handle successful signup
      alert('Account created successfully!');
      reset();
      
    } catch (error) {
      setSubmitError('An error occurred during signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponsiveStyles = () => ({
    container: {
      px: isMobile ? 1 : 2,
      maxWidth: isMobile ? 'sm' : isTablet ? 'md' : 'lg'
    },
    card: {
      mx: isMobile ? 1 : 'auto',
      borderRadius: isMobile ? 1 : 2
    },
    cardContent: {
      p: isMobile ? 2 : isTablet ? 3 : 4
    },
    logoHeight: isMobile ? 35 : 49,
    companyLogoHeight: isMobile ? 35 : 45,
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 2 : 3,
      mt: 3
    },
    button: {
      height: isMobile ? 45 : 52.5,
      width: isMobile ? '100%' : 175,
      fontSize: isMobile ? 16 : 18.2
    }
  });

  const styles = getResponsiveStyles();

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

      <Container maxWidth={styles.container.maxWidth} sx={styles.container}>
        <Card elevation={0} sx={{ ...styles.card, position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={styles.cardContent}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
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
                variant={isMobile ? "h6" : "h5"} 
                sx={{ mt: 2, fontWeight: 700 }}
              >
                Create your Account
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Tenant Signup
              </Typography>
            </Box>

            {/* Error Alert */}
            <Collapse in={!!submitError}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            </Collapse>

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
                    sx={{ mb: 3, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}
                  />
                )}
              />

              {/* Personal Information */}
              <Typography sx={{ fontWeight: 600, mb: 2, fontSize: isMobile ? 14 : 16 }}>
                Personal Information
              </Typography>
              
              <Controller
                name="tenantName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Tenant Name"
                    error={!!errors.tenantName}
                    helperText={errors.tenantName?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={12} sm={6}>
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
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Login */}
              <Typography sx={{ fontWeight: 600, mb: 2, fontSize: isMobile ? 14 : 16 }}>
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
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
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
                    sx={{ mb: 2 }}
                  />
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
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.timezone} sx={{ mb: 3 }}>
                    <InputLabel>Timezone</InputLabel>
                    <Select {...field} label="Timezone">
                      {timezones.map((tz) => (
                        <MenuItem key={tz.value} value={tz.value}>
                          {tz.label}
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
                      />
                    }
                    label="Provide Address"
                    sx={{ mb: showAddress ? 2 : 0 }}
                  />
                )}
              />

              {/* Address Information */}
              <Collapse in={showAddress}>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, mb: 2, fontSize: isMobile ? 14 : 16 }}>
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
                        sx={{ mb: 2 }}
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
                        placeholder="Address Line 2"
                        sx={{ mb: 2 }}
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
                        placeholder="Address Line 3"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                  
                  <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="county"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="County"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={isMobile ? 1 : 2}>
                    <Grid item xs={12} sm={6}>
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
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>

              {/* Buttons */}
              <Box sx={styles.buttonContainer}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  sx={{
                    ...styles.button,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: 'rgb(0, 0, 0)',
                    borderColor: 'rgb(0, 0, 0)',
                    borderRadius: '20px',
                    textTransform: 'capitalize',
                    transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderColor: 'rgb(0, 0, 0)',
                    }
                  }}
                >
                  Back
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  disabled={isSubmitting}
                  sx={{
                    ...styles.button,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    backgroundColor: 'rgb(0, 0, 0)',
                    color: 'rgb(255, 255, 255)',
                    borderRadius: '20px',
                    textTransform: 'capitalize',
                    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgb(30, 30, 30)',
                      boxShadow: 'rgba(0, 0, 0, 0.3) 0px 4px 2px -2px, rgba(0, 0, 0, 0.2) 0px 3px 3px 0px, rgba(0, 0, 0, 0.15) 0px 2px 6px 0px',
                    },
                    '&:active': {
                      transform: 'translateY(1px)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    }
                  }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Signup'}
                </Button>
              </Box>
            </form>

            {/* Footer */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 2, 
              mt: isMobile ? 4 : 6,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Typography sx={{ 
                m: 0, 
                fontFamily: 'Poppins, sans-serif', 
                lineHeight: 1.5, 
                fontSize: isMobile ? 16 : 20, 
                fontWeight: 600 
              }}>
                Powered by
              </Typography>
              <Box 
                component="img" 
                src={companyLogo} 
                alt="Twelve Springs" 
                height={styles.companyLogoHeight} 
              />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Signup;