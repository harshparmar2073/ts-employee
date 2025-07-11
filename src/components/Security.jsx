import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Switch,
  CircularProgress,
} from "@mui/material";
import {
  EmailOutlined,
  SmsOutlined,
  QrCodeScannerOutlined,
  SecurityOutlined,
} from "@mui/icons-material";
import axiosService from "../services/axiosService";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Schema
const factorSchema = yup.object().shape({
  email: yup.string().test({
    name: "email-validation",
    message: "Invalid email address",
    test: (value) =>
      !value || value.includes("*") || yup.string().email().isValidSync(value),
  }),
  sms: yup.string().test({
    name: "sms-validation",
    message: "Enter a valid phone number",
    test: (value) =>
      !value || value.includes("*") || /^\+?[0-9]{7,15}$/.test(value),
  }),
  authenticatorCode: yup.string().when("$showAuthenticator", {
    is: true,
    then: yup
      .string()
      .required("Code required")
      .matches(/^\d{6}$/, "Must be 6 digits"),
  }),
});

const MFASettingsDialog = ({ open, onClose, factors, setFactors }) => {
  const [localFactors, setLocalFactors] = useState([]);
  const [qrImage, setQrImage] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);

  const defaultValues = { email: "", sms: "", authenticatorCode: "" };
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(factorSchema),
    defaultValues,
    context: { showAuthenticator: false },
  });

  useEffect(() => {
    setLocalFactors(factors);
    factors.forEach((f) => {
      const type = f.factorType.toLowerCase();
      if (type === "email") setValue("email", f.deliveryAddress);
      if (type === "sms") setValue("sms", f.deliveryAddress);
    });
  }, [factors, setValue]);

  const isEnabled = (type) =>
    localFactors.some((f) => f.factorType.toLowerCase() === type);

  const handleToggle = async (type) => {
    const updated = [...localFactors];
    const index = updated.findIndex((f) => f.factorType.toLowerCase() === type);

    if (index !== -1) {
      updated.splice(index, 1);
      if (type === "authenticator") {
        setQrImage(null); // clear if turned off
      }
    } else {
      if (type === "authenticator") {
        try {
          setLoadingQR(true);
          const res = await axiosService.post("/mfa/authenticator"); // your setup endpoint
          if (res.data?.data?.qrCodeUrl) {
            setQrImage(res.data.data.qrCodeUrl);
          }
        } catch (e) {
          console.error("QR fetch error", e);
        } finally {
          setLoadingQR(false);
        }
      }
      updated.push({ factorType: type.toUpperCase(), deliveryAddress: "" });
    }
    setLocalFactors(updated);
  };

  const onSubmit = (data) => {
    const updated = localFactors.map((f) => {
      const type = f.factorType.toLowerCase();
      return {
        ...f,
        deliveryAddress: data[type] || f.deliveryAddress,
      };
    });
    setFactors(updated);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage MFA Settings</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {[
            { type: "email", icon: <EmailOutlined /> },
            { type: "sms", icon: <SmsOutlined /> },
            { type: "authenticator", icon: <QrCodeScannerOutlined /> },
          ].map(({ type, icon }) => {
            const enabled = isEnabled(type);
            return (
              <Box
                key={type}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {icon}
                    <Typography>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Typography>
                  </Box>
                  <Switch
                    checked={enabled}
                    onChange={() => handleToggle(type)}
                    disabled={type === "email"}
                  />
                </Box>

                {enabled && type !== "authenticator" && (
                  <Controller
                    name={type}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={type === "email" ? "Email" : "Phone Number"}
                        fullWidth
                        size="small"
                        margin="normal"
                        error={Boolean(errors[type])}
                        helperText={errors[type]?.message}
                      />
                    )}
                  />
                )}

                {enabled && type === "authenticator" && (
                  <Box sx={{ mt: 2 }}>
                    {loadingQR ? (
                      <CircularProgress size={28} />
                    ) : (
                      qrImage && (
                        <>
                          {/* <img src={qrImage} alt="Scan QR" style={{ maxWidth: '100%', marginBottom: 12 }} /> */}
                          <img
                            src={`data:image/png;base64,${qrImage}`}
                            alt="QR Code"
                            style={{
                              marginTop: "20px",
                              width: 200,
                              height: 200,
                            }}
                          />
                          <Controller
                            name="authenticatorCode"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Enter Authenticator Code"
                                fullWidth
                                size="small"
                                margin="normal"
                                error={Boolean(errors.authenticatorCode)}
                                helperText={errors.authenticatorCode?.message}
                              />
                            )}
                          />
                        </>
                      )
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Security = () => {
  const [enabledFactors, setEnabledFactors] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMfaFactors();
  }, []);

  const fetchMfaFactors = async () => {
    try {
      const res = await axiosService.get("/mfa/list-factors");
      setEnabledFactors(res.data?.data || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to load MFA factors.",
        severity: "error",
      });
    }
  };

  const getFactorIcon = (type) => {
    switch (type.toLowerCase()) {
      case "sms":
        return <SmsOutlined fontSize="small" />;
      case "authenticator":
        return <QrCodeScannerOutlined fontSize="small" />;
      default:
        return <EmailOutlined fontSize="small" />;
    }
  };

  const getChipColor = (type) => {
    switch (type.toLowerCase()) {
      case "sms":
        return "secondary";
      case "authenticator":
        return "primary";
      default:
        return "success";
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SecurityOutlined /> Security Settings
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Two-Factor Authentication Enabled:
          </Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {enabledFactors.map((factor, index) => (
              <Tooltip key={index} title={factor.deliveryAddress || ""} arrow>
                <Chip
                  icon={getFactorIcon(factor.factorType)}
                  label={
                    factor.factorType.charAt(0).toUpperCase() +
                    factor.factorType.slice(1).toLowerCase()
                  }
                  color={getChipColor(factor.factorType)}
                  variant="outlined"
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Manage MFA Settings
        </Button>
      </Paper>

      <MFASettingsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        factors={enabledFactors}
        setFactors={setEnabledFactors}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Security;
