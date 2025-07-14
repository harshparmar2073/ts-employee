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
  DialogActions,
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
import { useToast } from "../context/ToastContext";

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

// Helper to format phone numbers
function formatPhoneNumber(number) {
  if (!number) return '';
  // US: +1XXXXXXXXXX or XXXXXXXXXX
  let n = number;
  if (/^\+1\d{10}$/.test(number)) {
    n = number.slice(2);
  }
  if (/^\d{10}$/.test(n)) {
    return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
  }
  // UK: +44XXXXXXXXXX
  if (/^\+44\d{10}$/.test(number)) {
    const uk = number.slice(3);
    return `(+44) ${uk.slice(0, 4)} ${uk.slice(4)}`;
  }
  return number;
}

// Change Contact Dialog
const ChangeContactDialog = ({ open, onClose, type, currentValue, onSave }) => {
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setOldValue(currentValue || "");
    }
  }, [open, currentValue]);

  // Regex for UK/US phone numbers
  const phoneRegex = /^(\+44\d{10}|\+1\d{10}|\d{10})$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Helper to remove formatting for editing
  function parsePhoneInput(input) {
    // Remove all non-digit except leading +
    if (input.startsWith("+")) {
      return "+" + input.replace(/[^\d]/g, "").slice(0, input.startsWith("+44") || input.startsWith("+1") ? 12 : 11);
    }
    return input.replace(/\D/g, "").slice(0, 10);
  }

  const handleSave = () => {
    if (type === "sms") {
      if (!phoneRegex.test(newValue)) {
        setError("Enter a valid UK or US phone number (10 digits, or +44/+1 country code)");
        return;
      }
    }
    if (type === "email") {
      if (!emailRegex.test(newValue)) {
        setError("Enter a valid email address");
        return;
      }
    }
    setError("");
    onSave({ old: oldValue, new: newValue });
    setOldValue("");
    setNewValue("");
    onClose();
  };

  const handleInput = (e) => {
    let value = e.target.value;
    if (type === "sms") {
      value = parsePhoneInput(value);
    }
    setNewValue(value);
    setError("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Change {type === "email" ? "Email" : "Phone Number"}</DialogTitle>
      <DialogContent>
        <TextField
          label={`Current ${type === "email" ? "Email" : "Phone Number"}`}
          value={type === "sms" && oldValue ? formatPhoneNumber(oldValue) : oldValue}
          onChange={(e) => setOldValue(type === "sms" ? parsePhoneInput(e.target.value) : e.target.value)}
          fullWidth
          margin="normal"
          InputProps={type === "email" ? { readOnly: true } : undefined}
        />
        <TextField
          label={`New ${type === "email" ? "Email" : "Phone Number"}`}
          value={type === "sms" && newValue ? formatPhoneNumber(newValue) : newValue}
          onChange={handleInput}
          fullWidth
          margin="normal"
          error={!!error}
          helperText={
            error ||
            (type === "sms"
              ? "Enter a valid phone number"
              : "Enter a valid email address")
          }
          inputProps={
            type === "sms"
              ? {
                  maxLength: newValue.startsWith("+44") || newValue.startsWith("+1") ? 13 : 10,
                  inputMode: "numeric",
                  pattern: "[0-9+]*",
                }
              : { type: "email" }
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MFASettingsDialog = ({ open, onClose, factors, setFactors }) => {
  const [localFactors, setLocalFactors] = useState([]);
  const [qrImage, setQrImage] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [changeDialog, setChangeDialog] = useState({ open: false, type: "", currentValue: "" });
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });
  const { showToast } = useToast();

  const defaultValues = { email: "", sms: "", authenticatorCode: "" };
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
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

  const getFactorValue = (type) => {
    const factor = localFactors.find((f) => f.factorType.toLowerCase() === type);
    return factor?.deliveryAddress || "";
  };

  const handleToggle = async (type) => {
    const updated = [...localFactors];
    const index = updated.findIndex((f) => f.factorType.toLowerCase() === type);

    if (index !== -1) {
      updated.splice(index, 1);
      if (type === "authenticator") {
        setQrImage(null);
      }
    } else {
      if (type === "authenticator") {
        try {
          setLoadingQR(true);
          const res = await axiosService.post("/mfa/authenticator");
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

  const handleChangeContact = (type) => {
    setChangeDialog({
      open: true,
      type,
      currentValue: getFactorValue(type),
    });
  };

  // Regex for UK/US phone numbers
  const phoneRegex = /^(\+44\d{10}|\+1\d{10}|\d{10})$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSaveContact = (data) => {
    if (changeDialog.type === "sms") {
      if (!phoneRegex.test(data.new)) {
        setAlert({
          open: true,
          message: "Enter a valid  phone number",
          severity: "error",
        });
        return;
      }
    }
    if (changeDialog.type === "email") {
      if (!emailRegex.test(data.new)) {
        setAlert({
          open: true,
          message: "Enter a valid email address",
          severity: "error",
        });
        return;
      }
    }
    const updated = localFactors.map((f) => {
      if (f.factorType.toLowerCase() === changeDialog.type) {
        return { ...f, deliveryAddress: data.new };
      }
      return f;
    });
    setLocalFactors(updated);
    setAlert({
      open: true,
      message: `${changeDialog.type === "email" ? "Email" : "Phone number"} updated successfully!`,
      severity: "success",
    });
  };

  const handleVerifyCode = () => {
    const code = getValues("authenticatorCode");
    if (!/^[0-9]{6}$/.test(code)) {
      alert("Please enter a valid 6-digit code");
      return;
    }
    alert("Authenticator code verified successfully!");
    reset({ authenticatorCode: "" });
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
    <>
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
              const value = getFactorValue(type);
              
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
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {type === "email" ? "Email Address:" : "Phone Number:"}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="body1" sx={{ flex: 1 }}>
       {type === "sms" && value
         ? formatPhoneNumber(value)
         : value || `No ${type} configured`}
    </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleChangeContact(type)}
                        >
                          Change {type === "email" ? "Email" : "Phone"}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {enabled && type === "authenticator" && (
                    <Box sx={{ mt: 2 }}>
                      {loadingQR ? (
                        <CircularProgress size={28} />
                      ) : (
                        qrImage && (
                          <>
                            <img
                              src={`data:image/png;base64,${qrImage}`}
                              alt="QR Code"
                              style={{
                                marginTop: "20px",
                                width: 200,
                                height: 200,
                              }}
                            />
                            <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
                              <Controller
                                name="authenticatorCode"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Enter 6-digit code"
                                    size="small"
                                    sx={{ width: "200px" }}
                                    error={Boolean(errors.authenticatorCode)}
                                    helperText={errors.authenticatorCode?.message}
                                    inputProps={{
                                      maxLength: 6,
                                      inputMode: "numeric",
                                      pattern: "[0-9]*",
                                      onInput: (e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                        field.onChange(e);
                                      },
                                    }}
                                  />
                                )}
                              />
                              <Button
                                variant="contained"
                                type="button"
                                onClick={handleVerifyCode}
                                sx={{ mt: 0.5 }}
                              >
                                Verify
                              </Button>
                            </Box>
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
                Close
              </Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      <ChangeContactDialog
        open={changeDialog.open}
        onClose={() => setChangeDialog({ open: false, type: "", currentValue: "" })}
        type={changeDialog.type}
        currentValue={changeDialog.currentValue}
        onSave={handleSaveContact}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
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