import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosService from "../services/axiosService";
import PasswordStrengthBar from "react-password-strength-bar";
import { useToast } from "../context/ToastContext";
import {
  Autocomplete,
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
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo2.png";
import companyLogo from "../assets/12springslogo.png";
import FlagsSelect from "react-flags-select";
import { SIGNUP_TYPE_OAUTH } from "../const";

function getValidationSchema({ signupType }) {
  return yup.object({
    accountName: yup
      .string()
      .required("Account name is required")
      .min(2, "Account name must be at least 2 characters"),

    invitationCode: yup
      .string()
      .required("Invitation code is required")
      .min(6, "Invitation code must be at least 6 characters"),

    firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
    lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address"),
    password: signupType !== SIGNUP_TYPE_OAUTH && yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: signupType !== SIGNUP_TYPE_OAUTH && yup.string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
    timezone: yup.string().required("Please select a timezone"),
    showAddress: yup.boolean(),
    addressLine1: yup.string().when("showAddress", {
      is: true,
      then: (schema) => schema.required("Address line 1 is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    city: yup.string().when("showAddress", {
      is: true,
      then: (schema) => schema.required("City is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    postcode: yup.string().when("showAddress", {
      is: true,
      then: (schema) => schema.required("Postcode is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    country: yup.string().when("showAddress", {
      is: true,
      then: (schema) => schema.required("Country is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
}

const Signup = () => {
  const [params] = useSearchParams();
  const signupType = params.get("signupType");

  console.log(params);
  const [oauthSignupDetails, setOAuthSignupDetails] = useState(null);

  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md")); // isTablet is already defined, keep it.
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultTimezone, setDefaultTimezone] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(getValidationSchema({
      signupType: signupType
    })),
    mode: "onChange",
    defaultValues: {
      invitationCode: "",
      accountName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      timezone: "",
      showAddress: false,
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      county: "",
      city: "",
      postcode: "",
      country: "",
    },
  });

  const showAddress = watch("showAddress");
  const currentPassword = watch("password");

  const [timezones, setTimezones] = useState([]);
  const [defaultTz, setDefaultTz] = useState("");

  // Load timezones and detect browser timezone
  useEffect(() => {
    const tzList = Intl.supportedValuesOf("timeZone");
    setTimezones(tzList);

    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDefaultTz(browserTz);

    // Set the default timezone in form after load
    setValue("timezone", browserTz);
  }, [setValue]);

  const handleBack = () => {
    sessionStorage.removeItem("oauthSignupDetails");
    navigate("/")
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Prepare the payload according to API requirements
      const timezoneValue =
        data.timezone === "auto" ? defaultTimezone : data.timezone;

      const payload = {
        invitationCode: data.invitationCode,
        accountName: data.accountName,
        firstName: data.firstName,
        lastName: data.lastName,
        accountStatus: "active", // Default status
        // for signupType = oauth
        signupToken: oauthSignupDetails?.signupToken,
        auth: {
          authName: `${data.firstName} ${data.lastName}`,
          authUserName: signupType === SIGNUP_TYPE_OAUTH
          ? oauthSignupDetails.email
          : data.email,
          authPassword: signupType !== SIGNUP_TYPE_OAUTH && data.password,
          authStatus: "active", // Default status
          timeZone: timezoneValue,
        },
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
          addressType: "primary", // Default address type
        };
      }

      // Make API call
      let response;
      if (signupType === SIGNUP_TYPE_OAUTH) {
        response = await axiosService.post("/oauth2/signup", payload);
      } else {
        response = await axiosService.post("/account/signup", payload);
      }

      if (response.status === 200 || response.status === 201) {
        showToast(
          "Account created successfully! Redirecting to login page...",
          "success"
        );

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response received
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // load oauth signup details from session storage
  useEffect(() => {
    if (signupType === SIGNUP_TYPE_OAUTH) {
      const signupDetailsJSON = sessionStorage.getItem("oauthSignupDetails");
      if (!signupDetailsJSON)
        return;
      try {
        const signupDetails = JSON.parse(signupDetailsJSON);
        setOAuthSignupDetails(signupDetails);
        reset({
          firstName: signupDetails.firstName,
          lastName: signupDetails.lastName,
          email: signupDetails.email
        }, { keepDefaultValues: true });
      } catch (error) {
        console.log("Error parsing oauth signup details json", error);
      }
    }
  }, [signupType]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.gradientBackground,
        padding: { xs: 1, sm: 2 }, // Responsive padding
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
      {/* Back arrow */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: { xs: 8, sm: 16 }, // Responsive top
          left: { xs: 8, sm: 16 }, // Responsive left
          color: theme.palette.primary.main,
          bgcolor: "rgba(255,255,255,0.9)",
          "&:hover": {
            bgcolor: theme.palette.background.paper,
            color: theme.palette.secondary.main,
          },
          zIndex: 1,
        }}
      >
        <ArrowBack />
      </IconButton>

      <Container
        maxWidth="md"
        sx={{
          px: { xs: 1, sm: 2, md: 4 }, // Responsive horizontal padding
        }}
      >
        <Card
          elevation={0}
          sx={{
            mx: "auto",
            borderRadius: { xs: 1, sm: 2 }, // Responsive border radius
            position: "relative",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}> {/* Responsive padding */}
            {/* Logo & Title */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                  width: "100%",
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="logo"
                  sx={{
                    height: { xs: 60, sm: 80 }, // Responsive height
                    maxWidth: "60%",
                    objectFit: "contain",
                    mx: "auto",
                    display: "block",
                    boxShadow: "0 4px 24px rgba(102,126,234,0.10)",
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.9)",
                    p: 1,
                  }}
                />
              </Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  mt: 1,
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 0.5
                }}
              >
                Create your Account
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
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
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#ede7f6",
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />

              {/* Account Information */}
              <Typography
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 1.5,
                  fontSize: { xs: 14, sm: 16 } // Responsive font size
                }}
              >
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
              <Typography
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 1.5,
                  fontSize: { xs: 14, sm: 16 } // Responsive font size
                }}
              >
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
              <Typography
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 1.5,
                  fontSize: { xs: 14, sm: 16 } // Responsive font size
                }}
              >
                Login
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    Two-factor authentication is enabled by default. A security
                    code will be emailed to your username (<strong>email</strong>)
                    when logging in.
                  </Typography>
                </Alert>
              </Box>
              <Controller
                name="email"
                control={control}
                disabled={signupType === SIGNUP_TYPE_OAUTH}
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

              {signupType !== SIGNUP_TYPE_OAUTH && (
                <>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ mb: 1.5 }}>
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Password"
                          type={showPassword ? "text" : "password"}
                          error={!!errors.password}
                          helperText={errors.password?.message}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{
                                  color: theme.palette.secondary.main,
                                  "&:hover": {
                                    color: theme.palette.primary.main,
                                  },
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            ),
                          }}
                        />
                        {/* Password Strength Bar */}
                        {currentPassword && (
                          <Box sx={{ mt: 1 }}>
                            <PasswordStrengthBar
                              password={currentPassword}
                              minLength={8}
                              scoreWords={[
                                "Very Weak",
                                "Weak",
                                "Fair",
                                "Good",
                                "Strong",
                              ]}
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
                        type={showConfirmPassword ? "text" : "password"}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              sx={{
                                color: theme.palette.secondary.main,
                                "&:hover": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          ),
                        }}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />
                </>
              )}

              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 3 }}>
                    <Autocomplete
                      options={timezones}
                      value={field.value}
                      onChange={(e, newValue) => field.onChange(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Timezone"
                          error={!!errors.timezone}
                          helperText={errors.timezone?.message}
                        />
                      )}
                      disableClearable
                      sx={{
                        "& .MuiAutocomplete-inputRoot": {
                          fontFamily: theme.typography.fontFamily,
                        },
                      }}
                    />
                  </Box>
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
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: theme.typography.fontWeightMedium,
                          color: theme.palette.text.primary,
                        }}
                      >
                        Provide Address (Optional)
                      </Typography>
                    }
                    sx={{ mb: showAddress ? 1.5 : 0 }}
                  />
                )}
              />

              {/* Address Information */}
              <Collapse in={showAddress}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontWeight: theme.typography.fontWeightBold,
                      fontFamily: theme.typography.fontFamily,
                      color: theme.palette.text.primary,
                      mb: 1.5,
                      fontSize: { xs: 14, sm: 16 }, // Responsive font size
                    }}
                  >
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
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Responsive flex basis */}
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
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Responsive flex basis */}
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
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Responsive flex basis */}
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
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Responsive flex basis */}
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Box sx={{ mb: 1.5 }}>
                            <FlagsSelect
                              selected={field.value}
                              onSelect={field.onChange}
                              placeholder="Select Country"
                              searchable
                              alignOptionsToRight={false}
                              showSelectedLabel={true}
                              showOptionLabel={true}
                              fullWidth
                              selectedSize={theme.typography.fontSize}
                              optionsSize={theme.typography.fontSize}
                              className="mui-flags-select"
                              style={{
                                width: '100%',
                                height: 56,
                                borderRadius: 8,
                                fontFamily: theme.typography.fontFamily,
                                fontSize: theme.typography.fontSize,
                                fontWeight: theme.typography.fontWeightRegular,
                                background: '#fff',
                                border: errors.country ? '1.5px solid #d32f2f' : '1.5px solid #c4c4c4',
                                paddingLeft: 14,
                                paddingRight: 14,
                                display: 'flex',
                                alignItems: 'center',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                              }}
                            />
                            <style>{`
                              .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7 {
                                font-family: ${theme.typography.fontFamily} !important;
                                font-size: ${theme.typography.fontSize}px !important;
                                font-weight: ${theme.typography.fontWeightRegular} !important;
                                height: 56px !important;
                                min-height: 56px !important;
                                color: ${theme.palette.text.primary} !important;
                                background: #fff !important;
                                border-radius: 8px !important;
                                /* Remove border: none to allow outer border to show */
                                box-shadow: none !important;
                                outline: none !important;
                                padding-left: 0 !important;
                                transition: border-color 0.2s !important;
                              }
                              .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7:focus {
                                border: 1.5px solid #5E35B1 !important;
                                box-shadow: 0 0 0 2px rgba(94,53,177,0.15) !important;
                              }
                              .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7::placeholder {
                                font-family: ${theme.typography.fontFamily} !important;
                                font-size: ${theme.typography.fontSize}px !important;
                                color: #888 !important;
                                opacity: 1 !important;
                              }
                            `}</style>
                            {errors.country && (
                              <FormHelperText error>{errors.country.message}</FormHelperText>
                            )}
                          </Box>
                        )}
                      />
                    </Box>
                  </Box>
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
                  flexDirection: { xs: "column", sm: "row" }, // Responsive flex direction
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={isSubmitting}
                  sx={{
                    width: { xs: "100%", sm: 140 }, // Responsive width
                    height: theme.components.MuiButton.styleOverrides.root.height,
                    fontSize: theme.components.MuiButton.styleOverrides.root.fontSize,
                    fontFamily: theme.components.MuiButton.styleOverrides.root.fontFamily,
                    fontWeight: theme.components.MuiButton.styleOverrides.root.fontWeight,
                    borderRadius: theme.components.MuiButton.styleOverrides.root.borderRadius,
                    textTransform: theme.components.MuiButton.styleOverrides.root.textTransform,
                    order: { xs: 2, sm: 1 }, // Order for mobile vs desktop
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
                    width: { xs: "100%", sm: 140 }, // Responsive width
                    height: theme.components.MuiButton.styleOverrides.root.height,
                    fontSize: theme.components.MuiButton.styleOverrides.root.fontSize,
                    fontFamily: theme.components.MuiButton.styleOverrides.root.fontFamily,
                    fontWeight: theme.components.MuiButton.styleOverrides.root.fontWeight,
                    borderRadius: theme.components.MuiButton.styleOverrides.root.borderRadius,
                    textTransform: theme.components.MuiButton.styleOverrides.root.textTransform,
                    order: { xs: 1, sm: 2 }, // Order for mobile vs desktop
                  }}
                >
                  {isSubmitting ? "Creating..." : "Signup"}
                </Button>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mt: 4,
                  flexDirection: { xs: "column", sm: "row" }, // Responsive flex direction
                }}
              >
                <Typography
                  sx={{
                    m: 0,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: 14, sm: 16 }, // Responsive font size
                    fontWeight: theme.typography.fontWeightBold,
                    color: theme.palette.text.primary,
                  }}
                >
                  Powered by
                </Typography>
                <Box
                  component="img"
                  src={companyLogo}
                  alt="Twelve Springs"
                  sx={{ height: { xs: 30, sm: 35 } }} // Responsive height
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
