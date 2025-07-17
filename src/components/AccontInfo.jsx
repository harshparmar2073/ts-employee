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
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png";
import FlagsSelect from "react-flags-select";

const validationSchema = yup.object({
  accountName: yup.string().required("Account name is required").min(2),
  firstName: yup
    .string()
    .required("First name is required")
    .min(2)
    .matches(/^[a-zA-Z\s]+$/),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2)
    .matches(/^[a-zA-Z\s]+$/),
  addressLine1: yup.string().required("Address line 1 is required"),
  city: yup.string().required("City is required"),
  postcode: yup.string().required("Postcode is required"),
  country: yup.string().required("Country is required"),
});

const AccountInfo = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      accountName: "",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      county: "",
      city: "",
      postcode: "",
      country: "GB", // Set default country to UK
    },
  });

  useEffect(() => {
    // Ensure default country is set if not changed
    setValue('country', (value) => value || 'GB');
  }, [setValue]);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      setIsLoading(true);
      try {
        const res = await axiosService.get("/account");
        const d = res.data.data;
        setValue("accountName", d.accountName || "");
        setValue("firstName", d.firstName || "");
        setValue("lastName", d.lastName || "");
        if (d.address) {
          setValue("addressLine1", d.address.addressLine1 || "");
          setValue("addressLine2", d.address.addressLine2 || "");
          setValue("addressLine3", d.address.addressLine3 || "");
          setValue("county", d.address.county || "");
          setValue("city", d.address.city || "");
          setValue("postcode", d.address.postcode || "");
          setValue("country", d.address.country || "");
        }
      } catch (e) {
        showToast(
          e.response?.data?.message || "Failed to fetch account info.",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccountInfo();
  }, [setValue, showToast]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        accountName: data.accountName,
        accountStatus: "active",
        firstName: data.firstName,
        lastName: data.lastName,
        address: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          addressLine3: data.addressLine3,
          county: data.county,
          city: data.city,
          postcode: data.postcode,
          country: data.country,
        },
      };
      const res = await axiosService.put("/account/update-account", payload);
      if (res.status < 300) {
        showToast(
          "Your account information has been updated successfully!",
          "success"
        );
      }
    } catch (e) {
      showToast(
        e.response?.data?.message || "Failed to save. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", position: "relative", minHeight: "100vh" }}>
      

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Outer Card */}
        <Paper
          elevation={4}
          sx={{ p: { xs: 1, sm: 2 }, borderRadius: 5, background: "#ffffff" }}
        >
          {/* Inner Glass Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 3, sm: 4 },
              backdropFilter: "blur(12px)",
              background: "#ffffff", // Changed background to white
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Box textAlign="center" mb={3}>
             
              <Typography variant="h5">Account Information</Typography>
              <Typography variant="body2" color="text.secondary">
                Update your account details
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Typography fontWeight={600} mb={1.5}>
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

              <Typography fontWeight={600} mb={1.5}>
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

              <Typography fontWeight={600} mb={1.5}>
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

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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
                          selectedSize={muiTheme.typography.fontSize}
                          optionsSize={muiTheme.typography.fontSize}
                          className="mui-flags-select"
                          style={{
                            width: '100%',
                            height: 56,
                            borderRadius: 8,
                            fontFamily: muiTheme.typography.fontFamily,
                            fontSize: muiTheme.typography.fontSize,
                            fontWeight: muiTheme.typography.fontWeightRegular,
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
                            font-family: ${muiTheme.typography.fontFamily} !important;
                            font-size: ${muiTheme.typography.fontSize}px !important;
                            font-weight: ${muiTheme.typography.fontWeightRegular} !important;
                            height: 56px !important;
                            min-height: 56px !important;
                            color: ${muiTheme.palette.text.primary} !important;
                            background: #fff !important;
                            border-radius: 8px !important;
                            box-shadow: none !important;
                            outline: none !important;
                            padding-left: 0 !important;
                            transition: border-color 0.2s !important;
                          }
                          .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7:hover {
                            border: 1.5px solid #5E35B1 !important;
                          }
                          .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7:focus {
                            border: 1.5px solid #5E35B1 !important;
                            box-shadow: 0 0 0 2px rgba(94,53,177,0.15) !important;
                          }
                          .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7::placeholder {
                            font-family: ${muiTheme.typography.fontFamily} !important;
                            font-size: ${muiTheme.typography.fontSize}px !important;
                            color: #888 !important;
                            opacity: 1 !important;
                          }
                        `}</style>
                        {errors.country && (
                          <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                            {errors.country.message}
                          </Typography>
                        )}
                      </Box>
                    )}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center", // Center the button horizontally
                  mt: 4, // Add margin-top for spacing
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null // Provide a fallback for the `endIcon`
                  }
                  disabled={isSubmitting} // Disable the button while submitting
                  sx={{
                    padding: "12px 24px", // Increase padding
                    fontSize: "16px", // Increase font size
                    height: "48px", // Set a larger height
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </Box>

              {/* <Box textAlign="center" mt={4}>
                <Typography variant="body2">Powered by</Typography>
                <Box
                  component="img"
                  src={companyLogo}
                  alt="Twelve Springs"
                  sx={{ height: 30, mt: 1 }}
                />
              </Box> */}
            </form>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
};

export default AccountInfo;
