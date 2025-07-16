// AccountInfo.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosService from "../services/axiosService";
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
  FormControlLabel,
  Switch,
  IconButton,
  Collapse,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png";
import companyLogo from "../assets/12springslogo.png";
import theme from "../theme/theme";

// Validation schema
const validationSchema = yup.object({
  accountName: yup
    .string()
    .required("Account name is required")
    .min(2, "Account name must be at least 2 characters"),
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
  timezone: yup.string().required("Please select a timezone"),
  showAddress: yup.boolean(),
  addressLine1: yup.string().when("showAddress", {
    is: true,
    then: (schema) => schema.required("Address line 1 is required"),
  }),
  city: yup.string().when("showAddress", {
    is: true,
    then: (schema) => schema.required("City is required"),
  }),
  postcode: yup.string().when("showAddress", {
    is: true,
    then: (schema) => schema.required("Postcode is required"),
  }),
  country: yup.string().when("showAddress", {
    is: true,
    then: (schema) => schema.required("Country is required"),
  }),
});

const AccountInfo = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timezones, setTimezones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      accountName: "",
      firstName: "",
      lastName: "",
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



  useEffect(() => {
    const fetchAccountInfo = async () => {
      setIsLoading(true);
      try {
        const response = await axiosService.get('/account');
        const data = response.data;

        // Set form values based on the API response
        setValue('accountName', data.accountName || '');
        setValue('firstName', data.firstName || '');
        setValue('lastName', data.lastName || '');
        setValue('timezone', data.timeZone || '');
        if (data.address) {
          setValue('showAddress', true);
          setValue('addressLine1', data.address.addressLine1 || '');
          setValue('addressLine2', data.address.addressLine2 || '');
          setValue('addressLine3', data.address.addressLine3 || '');
          setValue('county', data.address.county || '');
          setValue('city', data.address.city || '');
          setValue('postcode', data.address.postcode || '');
          setValue('country', data.address.country || '');
        } else {
          setValue('showAddress', false);
        }
      } catch (error) {
        showToast(
          error.response?.data?.message || "Failed to fetch account info.",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountInfo();
  }, [setValue, showToast]);


    // Load timezones
    useEffect(() => {
      const tzList = Intl.supportedValuesOf("timeZone");
      setTimezones(tzList);
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setValue("timezone", browserTz);
    }, [setValue]);

  const handleBack = () => navigate(-1);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Build payload using only existing fields, set accountStatus to 'active' by default
      const payload = {
        accountName: data.accountName,
        accountStatus: 'active', // default value, not shown in UI
        firstName: data.firstName,
        lastName: data.lastName,
        timeZone: data.timezone,
      };
      if (data.showAddress) {
        payload.address = {
          addressLine1: data.addressLine1,
          city: data.city,
          postcode: data.postcode,
          country: data.country,
        };
      }
      // Ensure device fingerprint exists
      
      const response = await axiosService.put(
        "/account/update-account",
        payload,
        
      );
      if (response.status < 300) {
        showToast("Account info saved successfully", "success");
        navigate("/dashboard");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', position: 'relative', minHeight: '100vh' }}>
      {/* Back arrow absolutely positioned relative to the full page */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: { xs: 2, sm: 2 },
          left: { xs: 6, sm: 14 },
          color: "#000",
          bgcolor: "rgba(255,255,255,0.7)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
          zIndex: 10,
        }}
      >
        <ArrowBack />
      </IconButton>
      {/* Main content Box */}
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: 800,
          mx: "auto",
          boxSizing: "border-box",
          position: "relative",
          overflow: "auto",
          width: "100%",
        }}
      >
        <Paper
          elevation={2}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            position: "relative",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
            p: { xs: 2, sm: 3 },
            maxWidth: "100%",
          }}
        >
          <CardContent sx={{ p: 0 }}>
              {/* Logo & Title */}
              <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: { xs: 1, sm: 2 },
                    width: "100%",
                  }}
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="logo"
                    sx={{
                      height: { xs: 50, sm: 60, md: 80 },
                      maxWidth: "60%",
                      objectFit: "contain",
                      mx: "auto",
                      display: "block",
                      boxShadow: "0 4px 24px rgba(102,126,234,0.10)",
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.7)",
                      p: 1,
                    }}
                  />
                </Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{ mt: 1, fontWeight: muiTheme.typography.fontWeightBold, mb: 0.5 }}
                >
                  Account Information
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Update your account details
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Account Information */}
                <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: { xs: 14, sm: 16 } }}>
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
                      FormHelperTextProps={{ style: { color: '#d32f2f' } }}
                    />
                  )}
                />

                {/* Personal Information */}
                <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: { xs: 14, sm: 16 } }}>
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
                      FormHelperTextProps={{ style: { color: '#d32f2f' } }}
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
                      FormHelperTextProps={{ style: { color: '#d32f2f' } }}
                    />
                  )}
                />

                {/* Timezone */}
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ mb: 5 }}>
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
                            FormHelperTextProps={{ style: { color: '#d32f2f' } }}
                          />
                        )}
                        disableClearable
                      />
                    </Box>
                  )}
                />

                {/* Address Toggle */}
                <Controller
                  name="showAddress"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="secondary"
                          sx={{
                            transform: "scale(1.4)",
                            mx: 1,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "& .MuiSwitch-switchBase": {
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            },
                            "& .MuiSwitch-thumb": {
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            },
                            "& .MuiSwitch-track": {
                              borderRadius: "20px",
                              transition: "background-color 0.3s",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#fff",
                              transform: "translateX(18px)",
                              "& + .MuiSwitch-track": {
                                background:
                                  "linear-gradient(45deg, #667eea, #764ba2)",
                                opacity: 1,
                              },
                            },
                          }}
                        />
                      }
                      label="Provide Address (Optional)"
                      sx={{ mb: showAddress ? 1.5 : 0 }}
                    />
                  )}
                />

                {/* Address Fields */}
                <Collapse in={showAddress}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      sx={{ fontWeight: 600, mb: 1.5, fontSize: { xs: 14, sm: 16 } }}
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
                          FormHelperTextProps={{ style: { color: '#d32f2f' } }}
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
                      <Box sx={{ flex: "1 1 48%" }}>
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
                      <Box sx={{ flex: "1 1 48%" }}>
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
                              FormHelperTextProps={{ style: { color: '#d32f2f' } }}
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
                              placeholder="Postcode"
                              error={!!errors.postcode}
                              helperText={errors.postcode?.message}
                              FormHelperTextProps={{ style: { color: '#d32f2f' } }}
                            />
                          )}
                        />
                      </Box>
                      <Box sx={{ flex: "1 1 48%" }}>
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
                              FormHelperTextProps={{ style: { color: '#d32f2f' } }}
                            />
                          )}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Collapse>

                {/* Actions */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 3,
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{ flex: 1, mb: { xs: 1, sm: 0 } }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                    sx={{ flex: 1 }}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
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
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <Typography
                    sx={{
                      m: 0,
                      fontFamily: "Poppins, sans-serif",
                      fontSize: { xs: 14, sm: 16 },
                      fontWeight: 600,
                    }}
                  >
                    Powered by
                  </Typography>
                  <Box
                    component="img"
                    src={companyLogo}
                    alt="Twelve Springs"
                    sx={{ height: { xs: 24, sm: 30, md: 35 } }}
                  />
                </Box>
              </form>
            </CardContent>
          </Paper>
        </Box>
      </Box>
  );
};

export default AccountInfo;
