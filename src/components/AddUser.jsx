import React, { useState } from "react";
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
  Divider,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import { ArrowBack, ArrowForward, Phone } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import theme from "../theme/theme";
import ReactFlagsSelect from "react-flags-select";

// Validation schema
const validationSchema = yup.object({
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
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 6 characters")
    .max(50, "Password must not exceed 50 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
});

const AddUser = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("US");

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
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



  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      country: "",
      postcode: "",
      email: "",
      password: "",
    },
  });

  const handleBack = () => {
    showToast("Changes discarded", "info");
    navigate(-1);
  };

  const handleFormError = (errors) => {
    console.log('Form validation errors:', errors);
    showToast("Please fix the form errors before submitting", "warning");
  };



  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare the payload for the API
      const payload = {
        authName: `${data.firstName} ${data.lastName}`,
        authUserName: data.email,
        authPassword: data.password,
        authStatus: "auth-active",
        timeZone: "Asia/Calcutta",
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          postcode: data.postcode,
        },
        // Additional fields for reference
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        password: data.password,
      };

      // Make API call to create user
      const response = await axiosService.post('/user/create', payload);
      
      console.log('User created successfully:', response.data);
      showToast("User added successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error('Error adding user:', error);
      showToast(
        error.response?.data?.message || "Failed to add user. Please try again.", 
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        minHeight: '100vh',
        px: { xs: 1, sm: 2, md: 4, lg: 6 },
        py: { xs: 1, sm: 2, md: 4, lg: 6 },
                backgroundColor: '#f5f5f5',
        '& .flag-select-button-small': {
          height: '100%',
          border: 'none',
          borderRadius: '0',
          backgroundColor: 'transparent',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          minWidth: 'auto',
          marginRight: '0',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
        '& .flag-select-options-small': {
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          maxHeight: '250px',
          backgroundColor: '#fff',
          fontSize: '15px',
          padding: '12px 0',
          minWidth: '200px',
        },
        '& .flag-selected-label-small': {
          fontSize: '14px',
          fontWeight: 500,
          color: theme.palette.text.primary,
        },
        '& .flag-secondary-label-small': {
          fontSize: '13px',
          color: theme.palette.text.primary,
          fontWeight: 600,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
        <Card
          elevation={8}
          sx={{
            mx: 'auto',
            borderRadius: { xs: 3, sm: 4, md: 6 },
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            p: { xs: 4, sm: 6, md: 8, lg: 10 },
            maxWidth: { xs: '100%', sm: 900, md: 1100, lg: 1400 },
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            minHeight: { xs: 'auto', sm: '600px' },
          }}
        >
          <CardContent sx={{ p: 0 }}>


            <form onSubmit={handleSubmit(onSubmit, handleFormError)}>
              {/* Customer Information Section */}
              <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 3, fontSize: { xs: 20, sm: 24, md: 28 } }}>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />
              
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 2, sm: 3 },
                  mb: 3,
                }}
              >
                <Box sx={{ flex: "1 1 48%", minWidth: { xs: '100%', sm: '300px' } }}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="First Name"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: "1 1 48%", minWidth: { xs: '100%', sm: '300px' } }}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Last Name"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                      />
                    )}
                  />
                </Box>
              </Box>
              
                                <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone Number"
                        placeholder="(555) 123-4567"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        sx={{ mb: 3 }}
                        inputProps={{
                          maxLength: 14, // (XXX) XXX-XXXX = 14 characters
                        }}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                <Phone sx={{ color: 'action.active' }} />
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

              {/* Address Information Section */}
              <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 3,mt: 3, fontSize: { xs: 20, sm: 24, md: 28 } }}>
                Address Information
              </Typography>
              <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />
              
              <Controller
                name="street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Street"
                    multiline
                    rows={3}
                    error={!!errors.street}
                    helperText={errors.street?.message}
                    sx={{ mb: 3 }}
                  />
                )}
              />
              
               <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: { xs: 2, sm: 3 },
                    mb: 3,
                  }}
                >
                <Box sx={{ flex: "1 1 48%" }}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="City"
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: "1 1 48%" }}>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="State"
                        error={!!errors.state}
                        helperText={errors.state?.message}
                      />
                    )}
                  />
                </Box>
              </Box>
              
                              <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: { xs: 2, sm: 3 },
                    mb: 4,
                  }}
                >
                <Box sx={{ flex: "1 1 48%" }}>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Country"
                        error={!!errors.country}
                        helperText={errors.country?.message}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: "1 1 48%" }}>
                  <Controller
                    name="postcode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Postcode"
                        error={!!errors.postcode}
                        helperText={errors.postcode?.message}
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Login Information Section */}
              <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 3, fontSize: { xs: 20, sm: 24, md: 28 } }}>
                Login Information
              </Typography>
              <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />
              
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 3 }}
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
                    label="Password"
                    type="password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{ mb: 5 }}
                  />
                )}
              />

              {/* Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 2 },
                  mt: { xs: 2, sm: 4 },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  size="medium"
                  sx={{
                    fontSize: { xs: 14, sm: 16 },
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 3, sm: 4 },
                    borderRadius: '8px',
                    textTransform: 'none',
                    minWidth: '120px',
                    height: '48px',
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  size="medium"
                  sx={{
                    fontSize: { xs: 14, sm: 16 },
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 3, sm: 4 },
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '120px',
                    height: '48px',
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </Box>


            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AddUser; 