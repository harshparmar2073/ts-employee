import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useToast } from "../context/ToastContext";
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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
    .test("phone-format", "Please enter a valid phone number", (value) => {
      if (!value) return false;
      // Basic validation for international phone numbers
      return /^\+[1-9]\d{1,14}$/.test(value);
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
    .min(8, "Password must be at least 8 characters")
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
  const [phoneValue, setPhoneValue] = useState("");



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
      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Here you would typically make an API call like:
      // const response = await axiosService.post('/user/create', data);
      
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
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        py: { xs: 2, sm: 4, md: 6, lg: 8 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
        <Card
          elevation={4}
          sx={{
            mx: 'auto',
            borderRadius: { xs: 2, sm: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            p: { xs: 3, sm: 4, md: 6 },
            maxWidth: { xs: '100%', sm: 800, md: 1000, lg: 1200 },
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          <CardContent sx={{ p: 0 }}>


            <form onSubmit={handleSubmit(onSubmit, handleFormError)}>
              {/* Customer Information Section */}
              <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 2, fontSize: { xs: 18, sm: 20, md: 22 } }}>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />
              
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ flex: "1 1 48%" }}>
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
                <Box sx={{ flex: "1 1 48%" }}>
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
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary, fontSize: '14px' }}>
                      Phone Number
                    </Typography>
                    <Box
                      sx={{
                        '& .react-tel-input': {
                          fontFamily: theme.typography.fontFamily,
                        },
                        '& .form-control': {
                          width: '100%',
                          height: '56px',
                          fontSize: '16px',
                          border: errors.phone ? '1px solid #d32f2f' : '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '8px 12px 8px 50px',
                          fontFamily: theme.typography.fontFamily,
                          '&:focus': {
                            borderColor: errors.phone ? '#d32f2f' : theme.palette.primary.main,
                            boxShadow: errors.phone ? '0 0 0 2px rgba(211, 47, 47, 0.2)' : `0 0 0 2px ${theme.palette.primary.main}20`,
                            outline: 'none',
                          },
                        },
                        '& .flag-dropdown': {
                          backgroundColor: 'transparent',
                          border: 'none',
                        },
                        '& .selected-flag': {
                          backgroundColor: 'transparent',
                          borderRadius: '8px 0 0 8px',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.04)',
                          },
                        },
                        '& .country-list': {
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          maxHeight: '200px',
                        },
                        '& .country': {
                          padding: '8px 12px',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.04)',
                          },
                        },
                        '& .dial-code': {
                          color: theme.palette.text.secondary,
                        },
                      }}
                    >
                      <PhoneInput
                        country="us"
                        value={field.value}
                        onChange={(phone, country) => {
                          field.onChange(phone);
                          setPhoneValue(phone);
                        }}
                        placeholder="Enter phone number"
                        enableSearch={true}
                        searchPlaceholder="Search country..."
                        inputProps={{
                          required: true,
                          autoFocus: false,
                        }}
                      />
                    </Box>
                    {errors.phone && (
                      <FormHelperText error sx={{ mt: 0.5 }}>
                        {errors.phone.message}
                      </FormHelperText>
                    )}
                  </Box>
                )}
              />

              {/* Address Information Section */}
              <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 2, fontSize: { xs: 18, sm: 20, md: 22 } }}>
                Address Information
              </Typography>
              <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />
              
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
                    sx={{ mb: 2 }}
                  />
                )}
              />
              
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mb: 2,
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
                  gap: 2,
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
              <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 2, fontSize: { xs: 18, sm: 20, md: 22 } }}>
                Login Information
              </Typography>
              <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />
              
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
                    label="Password"
                    type="password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{ mb: 4 }}
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
                  size="small"
                  sx={{
                    fontSize: { xs: 12, sm: 14 },
                    py: { xs: 0.75, sm: 1 },
                    px: { xs: 2, sm: 3 },
                    borderRadius: '25px',
                    textTransform: 'none',
                    minWidth: 'auto',
                    height: 'auto',
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
                  size="small"
                  sx={{
                    fontSize: { xs: 12, sm: 14 },
                    py: { xs: 0.75, sm: 1 },
                    px: { xs: 2, sm: 3 },
                    borderRadius: '25px',
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    minWidth: 'auto',
                    height: 'auto',
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