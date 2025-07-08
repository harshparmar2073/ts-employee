// ✅ Login.jsx (full UI version with authService)

import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Fade,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  ArrowForward,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import logo from "../assets/logo2.png";
import companyLogo from "../assets/12springslogo.png";
import { login } from "../services/authService";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleShowPassword = () => setShowPassword(!showPassword);
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const onSubmit = async ({ email, password }) => {
    try {
      const response = await login(email, password);
      const sessionId =
        response.data?.sessionId ||
        response.data?.token ||
        response.data?.accessToken;
      localStorage.setItem("authResponse", JSON.stringify(response.data));
      if (sessionId) localStorage.setItem("sessionId", sessionId);
      if (response.data?.user)
        localStorage.setItem("user", JSON.stringify(response.data.user));

      setSnackbar({
        open: true,
        message: "Login successful! Redirecting...",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/verification-code", {
          state: {
            username: email,
            password,
            mfaSessionId: sessionId,
            maskedLabel: response.data.data?.maskedLabel,
            verificationCodeExpMinutes: response.data.data?.verificationCodeExpMinutes,
          },
        });
      }, 1000);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Login failed. Please try again.";
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(90deg, #7e5b72 0%, #2d3e65 100%)",
        backgroundAttachment: "fixed",
        overflowY: "hidden",
      }}
    >
      <Fade in timeout={1000}>
        <Paper
          elevation={3}
          sx={{
            maxWidth: 520,
            p: 4,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <img src={logo} alt="logo" style={{ height: 80 }} />
          </Box>

          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
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
                  type={showPassword ? "text" : "password"}
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              endIcon={<ArrowForward />}
              sx={{ mt: 3 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Link
              component="button"
              onClick={() => navigate("/reset-password")}
            >
              Reset Password
            </Link>
          </Box>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2">
              Not a member?{" "}
              <Link component="button" onClick={() => navigate("/signup")}>
                Create Account
              </Link>
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="caption" display="block">
              POWERED BY
            </Typography>
            <img
              src={companyLogo}
              alt="12 Springs"
              style={{ height: 32, marginTop: 4 }}
            />
          </Box>
        </Paper>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.error}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
