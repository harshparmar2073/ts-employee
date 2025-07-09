import React, { useState } from "react";
import { useToast } from "../context/ToastContext"; // ✅ Global Toast
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  ArrowForward,
  EmailOutlined,
  SmsOutlined,
  VerifiedUserOutlined,
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
  const [selectedMfa, setSelectedMfa] = useState("EMAIL");
  const { showToast } = useToast(); 

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleShowPassword = () => setShowPassword(!showPassword);

  const onSubmit = async ({ email, password }) => {
    try {
      const response = await login(email, password, selectedMfa);

      const sessionId =
        response.data.data?.mfaSessionId ||
        response.data.data?.token ||
        response.data.data?.accessToken;

      localStorage.setItem("authResponse", JSON.stringify(response.data));
      if (sessionId) localStorage.setItem("sessionId", sessionId);

      showToast("Login successful! Redirecting...", "success"); // ✅ global toast

      setTimeout(() => {
        navigate("/verification-code", {
          state: {
            username: email,
            password,
            mfaSessionId: response.data.data?.mfaSessionId,
            maskedLabel: response.data.data?.maskedLabel,
            verificationCodeExpMinutes:
              response.data.data?.verificationCodeExpMinutes,
            mfaType: selectedMfa,
          },
        });
      }, 1000);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Login failed. Please try again.";
      showToast(message, "error"); // ✅ global toast
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
          elevation={10}
          sx={{
            width: "100%",
            maxWidth: 700,
            px: 6,
            py: 5,
            backgroundColor: "white",
            borderRadius: 1.5,
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <img src={logo} alt="logo" style={{ height: 80 }} />
          </Box>

          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
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

            <FormControl component="fieldset" sx={{ mt: 3, width: "100%" }}>
              <FormLabel component="legend">Select MFA Method</FormLabel>
              <RadioGroup
                row
                value={selectedMfa}
                onChange={(e) => setSelectedMfa(e.target.value)}
                sx={{ justifyContent: "space-between", mt: 1 }}
              >
                <FormControlLabel
                  value="EMAIL"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailOutlined fontSize="small" />
                      <Typography>Email</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="SMS"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SmsOutlined fontSize="small" />
                      <Typography>SMS</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="TOTP"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <VerifiedUserOutlined fontSize="small" />
                      <Typography>Authenticator</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

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

          <Box sx={{ textAlign: "right", mt: 2, width: "100%" }}>
            <Link component="button" onClick={() => navigate("/reset-password")}>
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
    </Box>
  );
};

export default Login;