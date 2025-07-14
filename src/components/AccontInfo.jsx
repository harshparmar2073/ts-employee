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
      const payload = {
        accountName: data.accountName,
        firstName: data.firstName,
        lastName: data.lastName,
        timeZone: data.timezone,
      };
      if (data.showAddress) {
        payload.address = {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          county: data.county,
          postcode: data.postcode,
          country: data.country,
        };
      }
      const response = await axiosService.post("/account/update", payload);
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.default,
        padding: isMobile ? 1 : 2,
        // Removed gradient and ::before overlay
      }}
    >
      {/* Back arrow */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: isMobile ? 8 : 16,
          left: isMobile ? 8 : 16,
          color: "#000",
          bgcolor: "rgba(255,255,255,0.7)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
          zIndex: 1,
        }}
      >
        <ArrowBack />
      </IconButton>

      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
        <Card
          elevation={0}
          sx={{
            mx: "auto",
            borderRadius: isMobile ? 1 : 2,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
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
                    height: isMobile ? 60 : 80,
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

            <form onSubmit={handleSubmit(onSubmit)}>
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
                    sx={{ fontWeight: 600, mb: 1.5, fontSize: isMobile ? 14 : 16 }}
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
                  flexDirection: "row",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={isSubmitting}
                  sx={{ flex: 1 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  disabled={!isValid || isSubmitting}
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
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: 600,
                  }}
                >
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

export default AccountInfo;
