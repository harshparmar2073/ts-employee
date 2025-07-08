// ✅ VerificationCodePage.jsx with full background, particles, animations, and MFA support

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
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
import { verifyMfaCode, login } from '../services/authService';

const VerificationCodePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const username = state?.username;
  const password = state?.password;
  const mfaSessionId =
    state?.mfaSessionId ||
    JSON.parse(localStorage.getItem("authResponse") || "{}")?.sessionId;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const initialSeconds = (state?.verificationCodeExpMinutes || 5) * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  
  const inputRefs = useRef([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  

  const timerRef = useRef(null);

useEffect(() => {
  if (success) return;

  if (timerRef.current) clearInterval(timerRef.current);

  timerRef.current = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timerRef.current);
        setError("Verification code has expired. Please request a new code.");
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timerRef.current);
}, [success, timeLeft]); // note: timeLeft included here so effect reruns on reset


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
      });
      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.authToken;
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
      const response = await login(username, password);
      const newSessionId = response.data.data?.mfaSessionId;
      const newMaskedLabel = response.data.data?.maskedLabel;
      const newExpMinutes = response.data.data?.verificationCodeExpMinutes || 5;
  
      setTimeLeft(newExpMinutes * 60); // ⏱️ this now triggers the effect and interval reset
  
      setCode(['', '', '', '', '', '']);
      if (newSessionId) localStorage.setItem('sessionId', newSessionId);
  
      if (newSessionId) state.mfaSessionId = newSessionId;
      if (newMaskedLabel) state.maskedLabel = newMaskedLabel;
      state.expMinutes = newExpMinutes;
  
      inputRefs.current[0]?.focus();
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend code.');
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
        background: "linear-gradient(to right, #7e5b72, #2d3e65)",
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
            borderRadius: 4,
            maxWidth: 520,
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.95)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <Zoom in timeout={1200}>
            <Box sx={{ mb: 3 }}>
              {success ? (
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              ) : (
                <Security color="primary" sx={{ fontSize: 40 }} />
              )}
            </Box>
          </Zoom>

          <Fade in timeout={1400}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {success ? "Verified Successfully!" : "Verify Your Account"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Mail sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body1">
                  A verification code was sent to{" "}
                  <strong>{state?.maskedLabel}</strong>
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <AccessTime fontSize="small" />
                <Typography variant="body2">
                  Code expires in {formatTime(timeLeft)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Enter the code below to continue
              </Typography>
            </Box>
          </Fade>

          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 1.5, mb: 3 }}
          >
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
            disabled={
              loading || success || code.join("").length !== 6 || timeLeft === 0
            }
            sx={{ mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : success ? (
              "Verified!"
            ) : (
              "Verify"
            )}
          </Button>

          <Typography variant="body2">
            Didn’t get a code?
            <Button
              onClick={handleResend}
              disabled={resendLoading}
              sx={{ ml: 1 }}
            >
              {resendLoading ? (
                <CircularProgress size={16} />
              ) : (
                <>
                  <Refresh fontSize="small" sx={{ mr: 0.5 }} /> Resend
                </>
              )}
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
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationCodePage;
