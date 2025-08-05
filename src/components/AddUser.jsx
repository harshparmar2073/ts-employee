import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useToast } from "../context/ToastContext";
import axiosService from "../services/axiosService";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Collapse,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { 
  ArrowBack, 
  ArrowForward, 
  Phone, 
  LockReset,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Security,
  Warning,
  Email as EmailIcon
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import ReactFlagsSelect from "react-flags-select";

// Create dynamic validation schema based on edit mode
const createValidationSchema = (isEditMode) => {
  const baseSchema = {
    firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
    lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
    phone: yup
      .string()
      .required("Phone number is required")
      .test("phone-format", "Please enter exactly 10 digits", (value) => {
        if (!value) return false;
        // Remove all non-digit characters and check for exactly 10 digits
        const digitsOnly = value.replace(/\D/g, '');
        return digitsOnly.length === 10;
      }),
    street: yup
      .string()
      .required("Street address is required")
      .min(5, "Street address must be at least 5 characters")
      .max(200, "Street address must not exceed 200 characters"),
    city: yup
      .string()
      .required("City is required")
      .min(2, "City must be at least 2 characters")
      .max(50, "City must not exceed 50 characters")
      .matches(/^[a-zA-Z\s]+$/, "City can only contain letters and spaces"),
    state: yup
      .string()
      .required("State is required")
      .min(2, "State must be at least 2 characters")
      .max(50, "State must not exceed 50 characters")
      .matches(/^[a-zA-Z\s]+$/, "State can only contain letters and spaces"),
    country: yup
      .string()
      .required("Country is required")
      .min(2, "Country must be at least 2 characters")
      .max(50, "Country must not exceed 50 characters")
      .matches(/^[a-zA-Z\s]+$/, "Country can only contain letters and spaces"),
    postcode: yup
      .string()
      .required("Postcode is required")
      .min(3, "Postcode must be at least 3 characters")
      .max(10, "Postcode must not exceed 10 characters")
      .matches(/^[a-zA-Z0-9\s-]+$/, "Postcode can only contain letters, numbers, spaces, and hyphens"),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address")
      .max(100, "Email must not exceed 100 characters"),
  };

  // Only add password validation if not in edit mode
  if (!isEditMode) {
    baseSchema.password = yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must not exceed 50 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain an uppercase, a lowercase, a number, and a special character"
      );
  }

  return yup.object(baseSchema);
};

const AddUser = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("GB");

  // Toggle states for collapsible sections
  const [isAddressCollapsed, setIsAddressCollapsed] = useState(false);

  // Reset Password states
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetConfirmDialog, setResetConfirmDialog] = useState(false);
  const [tempPasswordDialog, setTempPasswordDialog] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check if we're in edit mode
  const isEditMode = location.state?.isEditMode || false;
  const userData = location.state?.userData || null;
  const userId = location.state?.userId || null;

  // Phone number formatting function with better backspace handling
  const formatPhoneNumber = (value, isDeleting = false) => {
    // If user is deleting, don't reformat - let them delete naturally
    if (isDeleting) {
      return value;
    }
    
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // If empty, return empty string
    if (digitsOnly.length === 0) {
      return '';
    }
    
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (limitedDigits.length >= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    } else if (limitedDigits.length >= 3) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else if (limitedDigits.length > 0) {
      return `(${limitedDigits}`;
    }
    return limitedDigits;
  };

  // Parse user data for form
  const parseUserData = (data) => {
    if (!data) return {};
    
    console.log('Parsing user data for form:', data);
    
    // Extract name parts from authName
    const nameParts = (data.customerName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Extract email - prioritize email field, then website field, then originalData
    let email = '';
    if (data.email) {
      email = data.email;
    } else if (data.website) {
      email = data.website.replace('mailto:', '');
    } else if (data.originalData?.email) {
      email = data.originalData.email;
    } else if (data.originalData?.authUserName) {
      email = data.originalData.authUserName;
    } else if (data.authUserName) {
      email = data.authUserName;
    }
    
    // Parse address from originalData if available, otherwise from address field
    let address = {};
    if (data.originalData && data.originalData.address) {
      // Use the original address object from API
      address = data.originalData.address;
      console.log('Using original address data:', address);
    } else if (typeof data.address === 'string') {
      address.street = data.address;
      console.log('Using string address data:', address);
    } else if (data.address && typeof data.address === 'object') {
      address = data.address;
      console.log('Using object address data:', address);
    }
    
    const parsedData = {
      firstName,
      lastName,
      email,
      phone: data.originalData?.phone || data.phone || '', // Try to get phone from original data or direct field
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || '',
      postcode: address.postcode || '',
      password: '', // Don't pre-fill password for security
    };
    
    console.log('Parsed form data:', parsedData);
    return parsedData;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    clearErrors, // Make sure this is included
  } = useForm({
    resolver: yupResolver(createValidationSchema(isEditMode)),
    mode: "onChange",
    defaultValues: parseUserData(userData),
  });
  

  // Reset form when userData changes (for edit mode)
  useEffect(() => {
    if (userData && isEditMode) {
      reset(parseUserData(userData));
    }
  }, [userData, isEditMode, reset]);

  // Reset form when edit mode changes to update validation schema
  useEffect(() => {
    reset(parseUserData(userData));
  }, [isEditMode, reset]);

  // Clear address errors when toggle changes
  useEffect(() => {
    if (isAddressCollapsed) {
      // Clear all address field errors when collapsed
      const addressFields = ['street', 'city', 'state', 'country', 'postcode'];
      addressFields.forEach(field => clearErrors(field));
    }
  }, [isAddressCollapsed, clearErrors]);
  


  const handleBack = () => {
    showToast("Changes discarded", "info");
    navigate(-1);
  };



  // Professional Reset Password Functions
  const handleResetPasswordClick = () => {
    setResetConfirmDialog(true);
  };

  const handleResetPasswordConfirm = async () => {
    setIsResettingPassword(true);
    setResetConfirmDialog(false);
    
    try {
      // Mock API call - simulate sending reset password email
      console.log('Simulating reset password email for user:', userId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      const mockResponse = {
        success: true,
        message: 'Reset email sent successfully',
        email: userData?.website?.replace('mailto:', '') || 'user@example.com',
        resetLink: 'https://example.com/reset-password?token=mock-token'
      };

      console.log('Mock reset password email sent successfully:', mockResponse);
      setResetSuccess(true);
      setTempPasswordDialog(true);
      showToast("Password reset email sent successfully! (Mock)", "success");
      
    } catch (error) {
      console.error('Error in mock reset password:', error);
      showToast("Failed to send reset password email. Please try again.", "error");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCloseTempPasswordDialog = () => {
    setTempPasswordDialog(false);
    setResetSuccess(false);
  };

  const handleCloseResetConfirmDialog = () => {
    setResetConfirmDialog(false);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {

      if (isEditMode) {
        // Update existing user
        const payload = {
          id: userId,
          authName: `${data.firstName} ${data.lastName}`,
          authUserName: data.email,
          authStatus: "auth-active",
          timeZone: "Asia/Calcutta",
          // Only include address if address section is not collapsed AND has valid data
          ...(isAddressCollapsed ? {} : {
            address: (() => {
              const addressFields = ['street', 'city', 'state', 'country', 'postcode'];
              const hasValidAddress = addressFields.some(field => data[field] && data[field].trim() !== '');
              
              if (hasValidAddress) {
                return {
                  street: data.street || '',
                  city: data.city || '',
                  state: data.state || '',
                  country: data.country || '',
                  postcode: data.postcode || '',
                };
              }
              return null; // Don't include address if all fields are empty
            })(),
          }),
          // Additional fields for reference
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
        };

        // Only include password if it was provided
        if (data.password) {
          payload.authPassword = data.password;
        }

        const response = await axiosService.put(`/user/update/${userId}`, payload);
        console.log('User updated successfully:', response.data);
        showToast("User updated successfully!", "success");
      } else {
        // Create new user
        const payload = {
          authName: `${data.firstName} ${data.lastName}`,
          authUserName: data.email,
          authPassword: data.password,
          authStatus: "auth-active",
          timeZone: "Asia/Calcutta",
          // Only include address if address section is not collapsed AND has valid data
          ...(isAddressCollapsed ? {} : {
            address: (() => {
              const addressFields = ['street', 'city', 'state', 'country', 'postcode'];
              const hasValidAddress = addressFields.some(field => data[field] && data[field].trim() !== '');
              
              if (hasValidAddress) {
                return {
                  street: data.street || '',
                  city: data.city || '',
                  state: data.state || '',
                  country: data.country || '',
                  postcode: data.postcode || '',
                };
              }
              return null; // Don't include address if all fields are empty
            })(),
          }),
          // Additional fields for reference
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          password: data.password,
        };

        const response = await axiosService.post('/user/create', payload);
        console.log('User created successfully:', response.data);
        showToast("User added successfully!", "success");
      }
      
      navigate(-1);
    } catch (error) {
      console.error('Error saving user:', error);
      showToast(
        error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} user. Please try again.`, 
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // background: theme.palette.background.gradientBackground,
        padding: { xs: 1, sm: 2 },
        position: "relative",
        overflow: "auto",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          px: { xs: 1, sm: 2, md: 4 },
        }}
      >
        <Card
          elevation={3}
          sx={{
            mx: "auto",
            borderRadius: { xs: 1, sm: 2 },
            position: "relative",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Title */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 0.5
                }}
              >
                {isEditMode ? "Edit User" : "Add New User"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {isEditMode ? "Update user information" : "User Management"}
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit, (errors) => {
              console.log('Form validation errors:', errors);
              
              // If address is collapsed, ignore address errors and proceed
              if (isAddressCollapsed) {
                console.log('Address collapsed - proceeding with submission');
                onSubmit(getValues());
                return;
              }
              
              // If there are any errors, show warning
              if (Object.keys(errors).length > 0) {
                showToast("Please fix the form errors before submitting", "warning");
                return;
              }
              
              // If no errors, proceed with submission
              console.log('Proceeding with submission (no errors)');
              onSubmit(getValues());
            })}>
              {/* Customer Information Section */}
              <Typography
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 1.5,
                  fontSize: { xs: 14, sm: 16 }
                }}
              >
                User Information
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
              
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Phone Number"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={{ mb: 2.5 }}
                    inputProps={{
                      maxLength: 14,
                    }}
                    onChange={(e) => {
                      const currentValue = e.target.value;
                      const previousValue = field.value || '';
                      
                      // Check if user is deleting (backspace)
                      const isDeleting = currentValue.length < previousValue.length;
                      
                      const formatted = formatPhoneNumber(currentValue, isDeleting);
                      field.onChange(formatted);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              '& .flag-select-button-small': {
                                border: 'none',
                                backgroundColor: 'transparent',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  border: '1px solid #e0e0e0',
                                },
                                '&:focus': {
                                  border: '1px solid #1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                  outline: 'none',
                                }
                              },
                              '& .flag-select-options-small': {
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                backgroundColor: 'white',
                              }
                            }}>
                              <ReactFlagsSelect
                                selected={selectedCountry}
                                onSelect={(countryCode) => setSelectedCountry(countryCode)}
                                searchable={true}
                                searchPlaceholder="Search..."
                                customLabels={{
                                  US: { primary: "US", secondary: "+1" },
                                  GB: { primary: "GB", secondary: "+44" },
                                  CA: { primary: "CA", secondary: "+1" },
                                  AU: { primary: "AU", secondary: "+61" },
                                  IN: { primary: "IN", secondary: "+91" },
                                  DE: { primary: "DE", secondary: "+49" },
                                  FR: { primary: "FR", secondary: "+33" },
                                  JP: { primary: "JP", secondary: "+81" },
                                  BR: { primary: "BR", secondary: "+55" },
                                  CN: { primary: "CN", secondary: "+86" },
                                }}
                                selectButtonClassName="flag-select-button-small"
                                optionsClassName="flag-select-options-small"
                                selectedSize={18}
                                showSelectedLabel={true}
                                showSecondarySelectedLabel={true}
                                selectedLabelClassName="flag-selected-label-small"
                                secondarySelectedLabelClassName="flag-secondary-label-small"
                              />
                            </Box>
                            <Phone sx={{ color: 'action.active' }} />
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Login Information Section - Always Visible */}
              <Typography
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 1.5,
                  fontSize: { xs: 14, sm: 16 }
                }}
              >
                Login Information
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
              
              {/* Reset Password Button - Only show in edit mode */}
              {isEditMode && (
                <Box sx={{ mb: 2.5 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<LockReset />}
                    onClick={handleResetPasswordClick}
                    disabled={isResettingPassword}
                    sx={{
                      // borderColor: '#6c5ce7',
                      // color: '#6c5ce7',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      // '&:hover': {
                      //   backgroundColor: 'rgba(108, 92, 231, 0.1)',
                      //   borderColor: '#5f4dd0',
                      //   color: '#5f4dd0',
                      // },
                      '&:disabled': {
                        borderColor: '#ccc',
                        color: '#666',
                      }
                    }}
                  >
                    {isResettingPassword ? (
                      <>
                        <CircularProgress size={16} sx={{ mr: 1, color: 'inherit' }} />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Email'
                    )}
                  </Button>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontStyle: 'italic'
                    }}
                  >
                    Send password reset link to user's email
                  </Typography>
                </Box>
              )}
              
              {/* Only show password field when not in edit mode */}
              {!isEditMode && (
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Password"
                      type="password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      sx={{ mb: 2.5 }}
                    />
                  )}
                />
              )}

              {/* Address Information Section */}
              <FormControlLabel
                control={
                  <Switch
                    checked={!isAddressCollapsed}
                    onChange={() => setIsAddressCollapsed(!isAddressCollapsed)}
                    sx={{
                      transform: "scale(1.2)",
                      mx: 1,
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: theme.palette.background.paper,
                        "& + .MuiSwitch-track": {
                          backgroundColor: theme.palette.secondary.main,
                        },
                      },
                      "& .MuiSwitch-track": {
                        backgroundColor: "rgba(0, 0, 0, 0.38)",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontWeight: theme.typography.fontWeightBold,
                     fontFamily: theme.typography.fontFamily,
                     color: theme.palette.text.primary,
                     mb: 1,
                  fontSize: { xs: 14, sm: 16 }
                    }}
                  >
                    Address Information
                  </Typography>
                }
                sx={{ mb: !isAddressCollapsed ? 1.5 : 0 }}
              />
              
              <Collapse in={!isAddressCollapsed}>
                <Box sx={{ mb: 2 }}>
                  <Controller
                    name="street"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Street Address"
                        multiline
                        rows={3}
                        error={!!errors.street}
                        helperText={errors.street?.message}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />
                  
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
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />

                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="State"
                        error={!!errors.state}
                        helperText={errors.state?.message}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />

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
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />

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
                        sx={{ mb: 2.5 }}
                      />
                    )}
                  />
                </Box>
              </Collapse>

              {/* Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 4,
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={isSubmitting}
                  sx={{
                    width: { xs: "100%", sm: 140 },
                    height: theme.components.MuiButton.styleOverrides.root.height,
                    fontSize: theme.components.MuiButton.styleOverrides.root.fontSize,
                    fontFamily: theme.components.MuiButton.styleOverrides.root.fontFamily,
                    fontWeight: theme.components.MuiButton.styleOverrides.root.fontWeight,
                    borderRadius: theme.components.MuiButton.styleOverrides.root.borderRadius,
                    textTransform: theme.components.MuiButton.styleOverrides.root.textTransform,
                    order: { xs: 2, sm: 1 },
                  }}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  endIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <ArrowForward />
                    )
                  }
                  disabled={isSubmitting}
                  sx={{
                    width: { xs: "100%", sm: 140 },
                    height: theme.components.MuiButton.styleOverrides.root.height,
                    fontSize: theme.components.MuiButton.styleOverrides.root.fontSize,
                    fontFamily: theme.components.MuiButton.styleOverrides.root.fontFamily,
                    fontWeight: theme.components.MuiButton.styleOverrides.root.fontWeight,
                    borderRadius: theme.components.MuiButton.styleOverrides.root.borderRadius,
                    textTransform: theme.components.MuiButton.styleOverrides.root.textTransform,
                    order: { xs: 1, sm: 2 },
                  }}
                >
                  {isSubmitting ? "Saving..." : (isEditMode ? "Update" : "Save")}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>

      {/* Reset Password Confirmation Dialog */}
      <Dialog
        open={resetConfirmDialog}
        onClose={handleCloseResetConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 4,
            py: 3,
            fontSize: '1.25rem',
          }}
        >
          <LockReset sx={{ fontSize: 28 }} />
          Reset User Password
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, pt: 4, pb: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2, color: '#333', fontSize: '1rem' }}>
              Send a password reset email to <strong>{userData?.customerName || 'this user'}</strong>?
            </Typography>
            
            <Box sx={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: 3, 
              p: 3,
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#495057', display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 18, color: '#667eea' }} />
                What will happen:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
                <Typography component="li" variant="body2" sx={{ color: '#6c757d', mb: 1, fontSize: '0.9rem' }}>
                  Secure reset link sent to user's email
                </Typography>
                <Typography component="li" variant="body2" sx={{ color: '#6c757d', mb: 1, fontSize: '0.9rem' }}>
                  User can set their own new password
                </Typography>
                <Typography component="li" variant="body2" sx={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  Link expires in 24 hours for security
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
          <Button
            onClick={handleCloseResetConfirmDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              px: 4,
              py: 1.5,
              // borderColor: '#dee2e6',
              // color: '#6c757d',
              fontWeight: 500,
              // '&:hover': {
              //   borderColor: '#adb5bd',
              //   backgroundColor: '#f8f9fa',
              // }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResetPasswordConfirm}
            variant="contained"
            startIcon={<LockReset />}
            sx={{ 
              borderRadius: 2, 
              px: 4,
              py: 1.5,
              // backgroundColor: '#667eea',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              // '&:hover': {
              //   backgroundColor: '#5e35b1',
              //   transform: 'translateY(-1px)',
              //   boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              // }
            }}
          >
            Send Reset Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Temporary Password Display Dialog */}
      <Dialog
        open={tempPasswordDialog}
        onClose={handleCloseTempPasswordDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 10,
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: resetSuccess ? '#e8f5e8' : '#fff3e0',
            color: resetSuccess ? '#2e7d32' : '#bf360c',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 2,
          }}
        >
          <Security sx={{ fontSize: 24 }} />
          Password Reset Email Sent
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
          <Alert severity="success" sx={{ mb: 2 ,mt: 2}}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              Password reset email sent successfully! (Mock)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              A secure password reset link has been sent to the user's email address.
            </Typography>
          </Alert>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              Email Details:
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>To:</strong> {userData?.website?.replace('mailto:', '') || 'user@example.com'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Subject:</strong> Password Reset Request (Mock)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Link Expiry:</strong> 24 hours from now
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> Mock email sent successfully
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              What happens next (Mock):
            </Typography>
            <Box component="ul" sx={{ mt: 0.5, pl: 2, mb: 0 }}>
              <Typography component="li" variant="body2" sx={{ fontSize: '0.875rem' }}>
                User receives email with secure reset link (Mock)
              </Typography>
              <Typography component="li" variant="body2" sx={{ fontSize: '0.875rem' }}>
                User clicks link and sets their own new password (Mock)
              </Typography>
              <Typography component="li" variant="body2" sx={{ fontSize: '0.875rem' }}>
                Reset link expires after 24 hours for security
              </Typography>
              <Typography component="li" variant="body2" sx={{ fontSize: '0.875rem' }}>
                All password changes are logged for audit purposes
              </Typography>
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseTempPasswordDialog}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 3,
              // backgroundColor: '#2e7d32',
              // '&:hover': {
              //   backgroundColor: '#1b5e20',
              // }
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddUser; 