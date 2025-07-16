// Updated Two-Factor Authentication Page (Posh, Colorful & HD Look)
import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import {
  EmailOutlined,
  SmsOutlined,
  QrCodeScannerOutlined,
  SecurityOutlined,
  EditOutlined,
} from "@mui/icons-material";
import axiosService from "../services/axiosService";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const factorSchema = yup.object({
  email: yup.string().email("Invalid email").required("Required"),
  sms: yup
    .string()
    .matches(
      /^(?:\+44\d{10}|\+1\d{10}|\d{10})$/, "Invalid phone number"),
  authenticatorCode: yup.string().matches(/^\d{6}$/, "Must be 6 digits"),
});

const Security = () => {
  const [factors, setFactors] = useState([]);
  const [editType, setEditType] = useState(null);
  const [qr, setQr] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "info",
  });
  const { showToast } = useToast();
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ resolver: yupResolver(factorSchema) });

  useEffect(() => {
    axiosService
      .get("/mfa/list-factors")
      .then((res) => setFactors(res.data.data || []));
  }, []);

  const toggleFactor = async (type) => {
    let updated = [...factors];
    const idx = updated.findIndex((f) => f.factorType.toLowerCase() === type);
    if (idx !== -1) {
      updated.splice(idx, 1);
    } else {
      if (type === "authenticator") {
        setLoadingQR(true);
        const res = await axiosService.post("/mfa/authenticator");
        setQr(res.data.data.qrCodeUrl);
        setLoadingQR(false);
      }
      updated.push({ factorType: type.toUpperCase(), deliveryAddress: "" });
    }
    setFactors(updated);
  };

  const handleSave = async (data) => {

    console.log("Saving data:", data);
    const factorToUpdate = factors.find(
      (f) => f.factorType.toLowerCase() === editType
    );
    console.error("Factor to update:", factorToUpdate);

    if (!factorToUpdate) return;

    const updatedAddress = data[editType];
    console.log("Updated address:", updatedAddress);

    try {
      await axiosService.post("/mfa/update-delivery-address", {
        factorType: factorToUpdate.factorType,
        deliveryAddress: updatedAddress,
        password: data.password, 
      });

      const updated = factors.map((f) => {
        if (f.factorType.toLowerCase() === editType) {
          return { ...f, deliveryAddress: updatedAddress };
        }
        return f;
      });

      setFactors(updated);
      setEditType(null);
      setSnackbar({
        open: true,
        msg: "MFA Updated Successfully",
        severity: "success",
      });
    } 
    catch (error) {
      console.error("MFA update failed", error);
    
      const errorMsg =
        error?.response?.data?.message || "Failed to update MFA address";
    
      showToast(errorMsg, "error");
    
      setSnackbar({
        open: true,
        msg: errorMsg,
        severity: "error",
      });
    }
  };

  const renderFactor = (type, IconComponent) => {
    const enabled = factors.some((f) => f.factorType.toLowerCase() === type);
    const value =
      factors.find((f) => f.factorType.toLowerCase() === type)
        ?.deliveryAddress || "";

    return (
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 3,
          background: "linear-gradient(to right, #f7f8fa, #e3f2fd)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <IconComponent color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Typography>
          </Box>
          <Switch
            checked={enabled}
            onChange={() => toggleFactor(type)}
            disabled={type === "email"}
            color="success"
          />
        </Box>

        {enabled && (
          <Box mt={2} display="flex" alignItems="center" gap={2}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ flexGrow: 1 }}
            >
              {value || "Not configured"}
            </Typography>
            <IconButton color="primary" onClick={() => setEditType(type)}>
              <EditOutlined />
            </IconButton>
          </Box>
        )}

        {enabled && type === "authenticator" && qr && (
          <Box mt={3} textAlign="center">
            {loadingQR ? (
              <CircularProgress size={28} />
            ) : (
              <img
                src={`data:image/png;base64,${qr}`}
                alt="QR Code"
                width={200}
                height={200}
                style={{
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              />
            )}
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h4"
        fontWeight={700}
        mb={4}
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          background: "linear-gradient(to right, #42a5f5, #478ed1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        <SecurityOutlined color="action" /> Two-Factor Authentication
      </Typography>

      {renderFactor("email", EmailOutlined)}
      {renderFactor("sms", SmsOutlined)}
      {renderFactor("authenticator", QrCodeScannerOutlined)}

      <Dialog
        open={Boolean(editType)}
        onClose={() => setEditType(null)}
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Edit {editType?.toUpperCase()}
        </DialogTitle>
        <DialogContent>
  {editType && (
    <>
      <Controller
        name={editType}
        control={control}
        defaultValue={
          factors.find((f) => f.factorType.toLowerCase() === editType)
            ?.deliveryAddress || ""
        }
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            margin="normal"
            label={`Enter ${editType}`}
            error={Boolean(errors[editType])}
            helperText={errors[editType]?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        defaultValue=""
        rules={{
          required: "Password is required",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            margin="normal"
            label="Password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
           
          />
        )}
      />
    </>
  )}
</DialogContent>
        <DialogActions>
          <Button onClick={() => setEditType(null)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit(handleSave)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Security;
