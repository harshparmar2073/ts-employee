// Updated VerificationCodePage.jsx to align with 2-step MFA flow

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Fade,
  Zoom,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Mail,
  Security,
  CheckCircle,
  Refresh,
  AccessTime,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyMfaCode, authenticatePreMfa } from "../services/authService";
import theme from "../theme/theme";

const VerificationCodePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const username = state?.username;
  const password = state?.password;
  const selectedMfa = state?.mfaType;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [maskedLabel, setMaskedLabel] = useState(state?.maskedLabel);
  const [mfaSessionId, setMfaSessionId] = useState(state?.mfaSessionId);
  const [timeLeft, setTimeLeft] = useState((state?.verificationCodeExpMinutes || 5) * 60);

  const inputRefs = useRef([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const timerRef = useRef(null);
  useEffect(() => {
    if (success || timeLeft === 0) return;
  
    if (timerRef.current) clearInterval(timerRef.current);
  
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setError("Verification code has expired. Please request a new code.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(timerRef.current);
  }, [success, timeLeft]);

  
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    const typedChar = value.slice(-1);
    newCode[index] = typedChar;
    setCode(newCode);
    if (typedChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const newCode = [...code];
      if (newCode[index] !== "") {
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        newCode[index - 1] = "";
        setCode(newCode);
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "");
    if (pasted.length === 6) {
      setCode(pasted.split("").slice(0, 6));
      setTimeout(() => inputRefs.current[5]?.focus(), 0);
      e.preventDefault();
    }
  };

  const handleVerify = async () => {
    const mfaCode = code.join("").trim();
    if (timeLeft === 0) {
      setError("Verification code has expired. Please request a new code.");
      return;
    }
    if (mfaCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const response = await verifyMfaCode({
        username,
        password,
        mfaCode,
        mfaSessionId,
        mfaType: selectedMfa,
        authRememberMeExpDays: state?.rememberDuration || "1",
        authRememberMe: state?.rememberMe || false,
      });
      const token = response.data.data?.authorizationToken;
      if (token) localStorage.setItem("authToken", token);
      localStorage.setItem("authResponse", JSON.stringify(response.data));
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await authenticatePreMfa(username, password, selectedMfa);
      const data = response.data.data;
      setMfaSessionId(data?.mfaSessionId);
      setMaskedLabel(data?.maskedLabel);
      setTimeLeft((data?.verificationCodeExpMinutes || 5) * 60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.gradientBackground,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        overflow: "hidden",
        position: "relative",
        px: 2,
      }}
    >
      <Fade in timeout={1000}>
        <Paper
          sx={{
            p: 4,
            borderRadius: theme.shape ? theme.shape.borderRadius * 2 : 8,
            maxWidth: 520,
            width: "100%",
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows ? theme.shadows[8] : "0 12px 32px rgba(0,0,0,0.15)",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <Zoom in timeout={1200}>
            <Box sx={{ mb: 3 }}>
              {success ? (
                <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
              ) : (
                <Security sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              )}
            </Box>
          </Zoom>

          <Fade in timeout={1400}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: theme.typography.fontWeightBold, mb: 1, color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily }}>
                {success ? "Verification was successful!" : "Verify Your Account"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                <Mail sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily }}>
                  A verification code was sent to <strong>{maskedLabel}</strong>
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 3 }}>
                <AccessTime fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Code expires in {formatTime(timeLeft)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily }}>
                Enter the code below to continue
              </Typography>
            </Box>
          </Fade>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mb: 3 }}>
            {code.map((digit, idx) => (
              <TextField
                key={idx}
                inputRef={(el) => (inputRefs.current[idx] = el)}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: "center", fontSize: "20px" },
                }}
                sx={{ width: 48 }}
                disabled={loading || success || timeLeft === 0}
              />
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            disabled={loading || success || code.join("").length !== 6 || timeLeft === 0}
            sx={{ mb: 2, ...theme.components.MuiButton.styleOverrides.root, ...theme.components.MuiButton.styleOverrides.containedPrimary }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} /> : success ? "Verified!" : "Verify"}
          </Button>

          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: theme.typography.fontFamily }}>
            Didn’t get a code?
            <Button onClick={handleResend} disabled={resendLoading} sx={{ ml: 1, ...theme.components.MuiButton.styleOverrides.root, ...theme.components.MuiButton.styleOverrides.outlinedPrimary }}>
              {resendLoading ? <CircularProgress size={16} /> : <><Refresh fontSize="small" sx={{ mr: 0.5 }} /> Resend</>}
            </Button>
          </Typography>
        </Paper>
      </Fade>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationCodePage;