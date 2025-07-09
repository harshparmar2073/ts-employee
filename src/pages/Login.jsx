// Updated Login.jsx with refined UI/UX for Remember Me and MFA options
import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
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
  Switch,
  MenuItem,
  Select,
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
import { authenticate, authenticatePreMfa } from "../services/authService";

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
  const [supportedMfa, setSupportedMfa] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedMfa, setSelectedMfa] = useState("EMAIL");
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberDuration, setRememberDuration] = useState("1");
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleShowPassword = () => setShowPassword(!showPassword);
 
  const handleInitialLogin = async () => {
    const { email, password } = getValues();      // only form fields
    try {
      // pass the remember-me flag from state, not from form
      const { data } = await authenticate(email, password, rememberMe);
      const payload = data.data;
  
      /* ── 1)  Skip-MFA branch  ───────────────────────────────────────── */
      // compare tokenType case-insensitively OR use the exact string
      if (
        payload.tokenType?.toLowerCase() === "express-bearer" &&
        payload.authorizationToken
      ) {
        localStorage.setItem("authToken", payload.authorizationToken);
        navigate("/dashboard");
        return;                                   // stop here
      }
  
      /* ── 2)  Normal MFA branch  ─────────────────────────────────────── */
      const mfaTypes = payload.supportedMfaTypes ?? [];
      if (mfaTypes.length === 0) {
        throw new Error("No MFA methods available.");
      }
  
      setSupportedMfa(mfaTypes);
      setSelectedMfa(mfaTypes[0]);
      setStep(2);
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? err.message ?? "Login failed.",
        "error"
      );
    }
  };


  const handleSendCode = async () => {
    const { email, password } = getValues();
    try {
      const response = await authenticatePreMfa(email, password, selectedMfa);
      const data = response?.data?.data;
      showToast("Verification code sent.", "success");
      navigate("/verification-code", {
        state: {
          username: email,
          password,
          mfaSessionId: data?.mfaSessionId,
          maskedLabel: data?.maskedLabel,
          verificationCodeExpMinutes: data?.verificationCodeExpMinutes,
          mfaType: selectedMfa,
          rememberMe: rememberMe,
          rememberDuration: rememberDuration,
        },
      });
    } catch (err) {
      console.error("Error sending code:", err);
      showToast(
        err?.response?.data?.message || "Failed to send code.",
        "error"
      );
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

          <form
            onSubmit={handleSubmit(
              step === 1 ? handleInitialLogin : handleSendCode
            )}
            style={{ width: "100%" }}
          >
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

            {step === 2 && (
              <>
                <FormControl component="fieldset" sx={{ mt: 3, width: "100%" }}>
                  <FormLabel component="legend">Select MFA Method</FormLabel>
                  <RadioGroup
                    value={selectedMfa}
                    onChange={(e) => setSelectedMfa(e.target.value)}
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    {supportedMfa.includes("EMAIL") && (
                      <FormControlLabel
                        value="EMAIL"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <EmailOutlined fontSize="small" />
                            <Typography>Email</Typography>
                          </Box>
                        }
                      />
                    )}
                    {supportedMfa.includes("SMS") && (
                      <FormControlLabel
                        value="SMS"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <SmsOutlined fontSize="small" />
                            <Typography>SMS</Typography>
                          </Box>
                        }
                      />
                    )}
                    {supportedMfa.includes("TOTP") && (
                      <FormControlLabel
                        value="TOTP"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <VerifiedUserOutlined fontSize="small" />
                            <Typography>Authenticator</Typography>
                          </Box>
                        }
                      />
                    )}
                  </RadioGroup>
                </FormControl>

                <Box
                  sx={{ display: "flex", alignItems: "center", mt: 3, gap: 2 }}
                >
                  <Typography variant="body2">Remember Me</Typography>
                  <Switch
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {rememberMe && (
                    <Select
                      size="small"
                      value={rememberDuration}
                      onChange={(e) => setRememberDuration(e.target.value)}
                      sx={{ ml: 1, width: 100 }}
                    >
                      {[...Array(7)].map((_, i) => (
                        <MenuItem key={i + 1} value={(i + 1).toString()}>{`${
                          i + 1
                        } day${i === 0 ? "" : "s"}`}</MenuItem>
                      ))}
                    </Select>
                  )}
                </Box>
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              endIcon={<ArrowForward />}
              sx={{ mt: 3 }}
              disabled={isSubmitting}
            >
              {step === 1
                ? "Next"
                : isSubmitting
                ? "Sending Code..."
                : "Send Code"}
            </Button>
          </form>

          <Box sx={{ textAlign: "right", mt: 2, width: "100%" }}>
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
    </Box>
  );
};

export default Login;
