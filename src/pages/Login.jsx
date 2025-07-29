// Updated Login.jsx with theme integration
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
import theme from "../theme/theme";
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
import { useGoogleLogin } from '@react-oauth/google';
import axiosService from "../services/axiosService";
import { SIGNUP_TYPE_OAUTH } from "../const";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

// generate oauth state
function generateOAuthState(length = 32) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  const state = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return state;
}

const oauthState = generateOAuthState();

// compare given oauth state with stored value
function checkOAuthState(state) {
  return state === oauthState;
}

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
    const { email, password } = getValues();
    try {
      const { data } = await authenticate(email, password, rememberMe);
      const payload = data.data;
  
      if (
        payload.tokenType?.toLowerCase() === "express-bearer" &&
        payload.authorizationToken
      ) {
        localStorage.setItem("authToken", payload.authorizationToken);
        navigate("/dashboard");
        return;
      }
  
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
    console.log("Selected MFA before sending:", selectedMfa);
    if (selectedMfa === "TOTP") {
      navigate("/verification-code", {
        state: {
          username: email,
          password,
          mfaSessionId: null,
          maskedLabel: "Authenticator App",
          verificationCodeExpMinutes: 5,
          mfaType: "TOTP",
          rememberMe: rememberMe,
          rememberDuration: rememberDuration,
        },
      });
      return;
    }
  
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

  async function getAuthTokenFromOAuthCode(code) {
    try {
      const r = await axiosService.post("/oauth2/token", { code });
      const data = r.data.data;

      if (data.type === "LOGIN") {
        const loginDetails = data.loginDetails;
        const token = loginDetails.authorizationToken;
        if (token) localStorage.setItem("authToken", token);
        localStorage.setItem("authResponse", JSON.stringify(loginDetails));
        navigate("/dashboard");
      } else if (data.type === "SIGNUP") {
        const signupDetails = data.signupDetails;
        const json = JSON.stringify(signupDetails);
        sessionStorage.setItem("oauthSignupDetails", json);
        navigate("/signup?signupType="+SIGNUP_TYPE_OAUTH);
      }
    } catch (error) {
      console.log(error);
      showToast("Error logging in. Please try again later.", "error");
    }
  }

  const loginGoogle = useGoogleLogin({
    flow: 'auth-code',
    scope: "email profile",
    state: oauthState,
    onSuccess: async codeResponse => {
      if (!checkOAuthState(codeResponse.state)) {
        console.log("OAuth state check failed");
        showToast("Error logging in. Please try again later.", "error");
        return;
      }

      getAuthTokenFromOAuthCode(codeResponse.code);
    },
  });

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.gradientBackground,
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
            backgroundColor: theme.palette.background.paper,
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
            <img src={logo} alt="logo" style={{ height: 200 }} />
          </Box>

          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{
              fontFamily: theme.typography.fontFamily,
              fontWeight: theme.typography.fontWeightBold,
              color: theme.palette.text.primary,
            }}
          >
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

          <Box sx={{ textAlign: "right", width: "100%" }}>
            <Link
              component="button"
              onClick={() => navigate("/reset-password")}
            >
              Reset Password
            </Link>
          </Box>

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
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: theme.typography.fontWeightRegular,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Remember Me
                  </Typography>
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
                        <MenuItem key={i + 1} value={(i + 1).toString()}>{`${i + 1
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
              sx={{ 
                mt: 3,
                ...theme.components.MuiButton.styleOverrides.root,
                ...theme.components.MuiButton.styleOverrides.containedPrimary,
              }}
              disabled={isSubmitting}
            >
              {step === 1
                ? "Next"
                : isSubmitting
                ? "Sending Code..."
                : "Send Code"}
            </Button>
          </form>

          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 2,
              fontFamily: theme.typography.fontFamily,
              fontWeight: theme.typography.fontWeightRegular,
              color: theme.palette.text.primary,
            }}
          >
            OR
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            sx={{
              mt: 2,
              textTransform: "none",
              borderColor: "#4285F4",
              color: "#4285F4",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "#4285F4",
              },
            }}
            onClick={() => loginGoogle()}
          >
            Continue with Google
          </Button>


          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: theme.typography.fontFamily,
                fontWeight: theme.typography.fontWeightRegular,
                color: theme.palette.text.primary,
              }}
            >
              Not a member?{" "}
              <Link component="button" onClick={() => navigate("/signup")}>
                Create Account
              </Link>
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography
              variant="caption"
              display="block"
              sx={{
                fontFamily: theme.typography.fontFamily,
                fontWeight: theme.typography.fontWeightRegular,
                color: theme.palette.text.secondary,
              }}
            >
              POWERED BY
            </Typography>
            <img
              src={companyLogo}
              alt="12 Springs"
              style={{ height: 32, marginTop: 4 }}
            />
          </Box>

          {/* Existing footer */}
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;