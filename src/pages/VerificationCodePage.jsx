import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Container,
    Paper,
    Fade,
    Zoom,
    IconButton,
    Snackbar,
    Alert,
    useTheme,
    useMediaQuery,
    CircularProgress
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Mail, Security, CheckCircle, Refresh, AccessTime } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Animated gradient background
const gradientAnimation = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const floatingAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const pulseAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
`;

// Floating particles animation
const floatParticle = keyframes`
    0% { transform: translateY(0) scale(1); opacity: 0.7; }
    50% { transform: translateY(-40px) scale(1.15); opacity: 1; }
    100% { transform: translateY(0) scale(1); opacity: 0.7; }
`;

// Shimmering gradient across the button
const shimmer = keyframes`
  0%   { background-position: -150% 0; }
  50%  { background-position: 150% 0; }
  100% { background-position: -150% 0; }
`;

// Timer pulse animation
const timerPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Add modern font stack globally for this page
const fontFamilyModern = 'Inter, Montserrat, Poppins, "Segoe UI", Arial, sans-serif';

const StyledContainer = styled(Container)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    background: 'linear-gradient(to right, #7e5b72 0%, #2d3e65 100%)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    padding: theme.spacing(2),
    overflow: 'hidden',
    zIndex: 0,
    fontFamily: fontFamilyModern,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, #f093fb88 0%, transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 0,
    },
    // Remove ::after and any other floating particle code
}));

// Floating particles (bokeh dots, smaller, softer)
const Particle = styled('div')(({ size, top, left, color, duration, delay }) => ({
    position: 'absolute',
    top: top,
    left: left,
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    opacity: 0.12,
    filter: 'blur(6px)',
    zIndex: 0,
    animation: `${floatParticle} ${duration} linear infinite` + (delay ? ` ${delay}` : ''),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: '32px',
    background: 'rgba(244, 246, 255, 0.92)',
    border: '1.5px solid rgba(224, 230, 247, 0.6)',
    boxShadow: '0 12px 48px 0 rgba(120, 80, 220, 0.15), 0 2px 16px 0 rgba(180,180,255,0.1)',
    textAlign: 'center',
    maxWidth: '520px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
    animation: 'fadeInSlideUp 1.1s cubic-bezier(.4,0,.2,1)',
    '@keyframes fadeInSlideUp': {
        '0%': { opacity: 0, transform: 'translateY(40px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    fontFamily: fontFamilyModern,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #b8c6ff, #f093fb, #a1c4fd, #f5576c)',
        backgroundSize: '300% 100%',
        animation: `${gradientAnimation} 3s ease infinite`,
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        zIndex: 2,
        opacity: 0.7,
    },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #b8c6ff, #f093fb)',
    margin: '0 auto 24px',
    animation: `${floatingAnimation} 3s ease-in-out infinite, ${pulseAnimation} 2s ease-in-out infinite alternate`, // Added a subtle pulse
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.18)',
    fontFamily: fontFamilyModern,
}));

const TimerContainer = styled(Box)(({ theme, timeLeft }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    margin: theme.spacing(2, 0),
    padding: theme.spacing(1, 2),
    borderRadius: '16px',
    background: timeLeft <= 60 ? 'rgba(255, 87, 108, 0.1)' : 'rgba(111, 126, 255, 0.1)',
    border: `1px solid ${timeLeft <= 60 ? 'rgba(255, 87, 108, 0.3)' : 'rgba(111, 126, 255, 0.3)'}`,
    animation: timeLeft <= 60 ? `${timerPulse} 1s ease-in-out infinite` : 'none',
    transition: 'all 0.3s ease',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '14px',
        fontSize: '24px',
        fontWeight: 700,
        textAlign: 'center',
        width: '54px',
        height: '54px',
        background: 'rgba(255,255,255,0.95)', // Very light background for inputs
        boxShadow: '0 4px 15px 0 rgba(120,80,220,0.08), inset 0 1px 3px rgba(0,0,0,0.05)', // Enhanced inner shadow
        border: '1px solid #e0e6f7',
        fontFamily: fontFamilyModern,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.1s ease', // Smooth transition for focus
        '& input': {
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 700,
            color: '#333333',
            fontFamily: fontFamilyModern,
            letterSpacing: '2px',
            padding: 0,
            textShadow: 'none',
            background: 'transparent',
            border: 'none',
        },
        '& fieldset': {
            border: 'none',
        },
        '&:hover fieldset': {
            border: 'none',
        },
        // Focus styles for the input box, making it pop
        '&.Mui-focused': {
            borderColor: '#a259e6',
            boxShadow: '0 0 0 4px rgba(162, 89, 230, 0.25), 0 4px 20px 0 rgba(120,80,220,0.15)',
            transform: 'scale(1.02)', // Slightly grow on focus
        },
        '&.Mui-disabled': {
            background: 'rgba(240,240,240,0.5)',
            color: '#aaaaaa',
            cursor: 'not-allowed',
        },
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    width: '100%',
      padding: theme.spacing(1.5, 0),
      borderRadius: 30,
      background: 'linear-gradient(90deg, #667ee2, #a259e6, #4f8cff)',
      backgroundSize: '300% 100%',           // make room for shimmer
      color: '#fff',
      fontSize: '1rem',
      fontWeight: 700,
      textTransform: 'none',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      animation: `${shimmer} 4s linear infinite`,  // animate gradient
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    
      '&:hover': {
        transform: 'translateY(-3px) scale(1.02)',  // bigger pop
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      },
    
      '&:active': {
        transform: 'translateY(0) scale(0.98)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      },
    
      '&:disabled': {
        background: 'rgba(200,200,200,0.5)',
        color: '#eee',
        animation: 'none',                        // stop shimmer
        boxShadow: 'none',
        transform: 'none',
      }
}));

const CodeInputContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(2),
    margin: theme.spacing(3, 0, 2),
    flexWrap: 'nowrap',
    overflow: 'visible',
    [theme.breakpoints.down('sm')]: {
        gap: theme.spacing(1), // Reduce gap on small screens
    }
}));

const floatDot = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(-18px); opacity: 1; }
`;

const FloatingDot = styled('div')(({ size, top, left, right, color, duration, delay }) => ({
  position: 'absolute',
  top: top,
  left: left,
  right: right,
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  opacity: 0.10,
  filter: 'blur(4px)',
  zIndex: 1,
  animation: `${floatDot} ${duration} ease-in-out infinite` + (delay ? ` ${delay}` : ''),
}));

const VerificationCodePage = () => {
 const navigate = useNavigate();
  const { state } = useLocation();
const username = state?.username;
const password = state?.password;
let storedAuth = {};
try {
  storedAuth = JSON.parse(localStorage.getItem('authResponse') || '{}');
} catch (e) {
  console.error('Invalid authResponse in localStorage');
}
const mfaSessionId = location.state?.mfaSessionId || storedAuth.data?.mfaSessionId;

  
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const inputRefs = useRef([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Timer countdown effect
    useEffect(() => {
        if (timeLeft > 0 && !success) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setError('Verification code has expired. Please request a new code.');
        }
    }, [timeLeft, success]);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Automatically focus the first input on component mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        const typedChar = value.slice(-1); // Only last character
        newCode[index] = typedChar;
        setCode(newCode);
        if (typedChar && index < 5) {
            // Move to next input
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Support pasting a full code
    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('Text').replace(/\D/g, '');
        if (pasted.length === 6) {
            setCode(pasted.split('').slice(0, 6));
            setTimeout(() => {
                inputRefs.current[5]?.focus();
            }, 0);
            e.preventDefault();
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            event.preventDefault();
            const newCode = [...code];
            if (newCode[index] !== '') {
                newCode[index] = '';
                setCode(newCode);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                newCode[index - 1] = '';
                setCode(newCode);
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (event.key === 'ArrowRight' && index < 5) {
            event.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
        // Allow tab and digit keys to work as normal
    };

    const handleVerify = async () => {
        const mfaCode = code.join('').trim();
        
        // Check if code is expired
        if (timeLeft === 0) {
            setError('Verification code has expired. Please request a new code.');
            return;
        }
        
        if (mfaCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post(
                'https://api.antalyze.uk/v1/auth/authenticate-mfa',
                {
                    username,        // from router state
                    password,        // from router state
                    mfaType: 'EM',   // "EM" for email‐MFA
                    mfaSessionId,    // from state or localStorage
                    mfaCode,         // <-- the 6-digit code from user input
                },
                {
                    timeout: 10000,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            
            // Store the authorization token in localStorage
            const token = response.data?.token || response.data?.accessToken || response.data?.authToken;
            if (token) {
                localStorage.setItem('authToken', token);
                console.log('Authorization token stored successfully');
            }
            
            // Store complete response if needed for future reference
            localStorage.setItem('authResponse', JSON.stringify(response.data));
            
            // Set success state
            setSuccess(true);
            
            // Navigate to dashboard after a short delay to show success state
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
            
        } catch (err) {
            console.error('MFA error:', err.response || err);
            setError(
                err.response?.data?.message || 
                'Verification failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setTimeLeft(300); // Reset timer to 5 minutes
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResendLoading(false);
        setError('');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus(); // Re-focus first input after resend
    };

    return (
        <StyledContainer maxWidth={false}>
            {/* Floating dots on left */}
            <FloatingDot size="8px" top="12%" left="2%" color="#fff" duration="7s" />
            <FloatingDot size="6px" top="60%" left="4%" color="#b8c6ff" duration="9s" delay="-2s" />
            <FloatingDot size="10px" top="80%" left="1%" color="#f093fb" duration="8s" delay="-1s" />
            {/* Floating dots on right */}
            <FloatingDot size="8px" top="18%" right="2%" color="#a1c4fd" duration="10s" delay="-3s" />
            <FloatingDot size="6px" top="70%" right="3%" color="#f5576c" duration="8s" delay="-2.5s" />
            <FloatingDot size="10px" top="30%" right="5%" color="#b8c6ff" duration="11s" delay="-4s" />
            <Fade in={true} timeout={1000}>
                <StyledPaper elevation={0}>
                    <Zoom in={true} timeout={1200}>
                        <IconWrapper>
                            {success ? (
                                <CheckCircle sx={{ fontSize: 40, color: '#a259e6' }} />
                            ) : (
                                <Security sx={{ fontSize: 40, color: '#a259e6' }} />
                            )}
                        </IconWrapper>
                    </Zoom>

                    <Fade in={true} timeout={1500}>
                        <Box>
                            <Typography
                                variant={isMobile ? "h5" : "h4"}
                                gutterBottom
                                sx={{
                                    fontWeight: 800,
                                    fontSize: isMobile ? '1.15rem' : '1.8rem',
                                    mb: 2.5,
                                    fontFamily: fontFamilyModern,
                                    letterSpacing: '1.1px',
                                    background: 'linear-gradient(90deg, #4f8cff 10%, #a259e6 90%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: 'none',
                                    filter: 'none',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {success ? 'Verified Successfully!' : 'Verify Your Account'}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <Mail sx={{ mr: 1, color: '#6a7eff',  }} />
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontFamily: fontFamilyModern,
                                        fontWeight: 500,
                                        color: '#333333',
                                        textShadow: 'none',
                                        fontSize: isMobile ? '0.96rem' : '1.06rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    Please check your inbox for a six-digit verification code.
                                </Typography>
                            </Box>

                            {/* Timer Display */}
                            <TimerContainer timeLeft={timeLeft}>
                                <AccessTime sx={{ 
                                    fontSize: 18, 
                                    color: timeLeft <= 60 ? '#f5576c' : '#6f7eff' 
                                }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: fontFamilyModern,
                                        fontWeight: 600,
                                        color: timeLeft <= 60 ? '#f5576c' : '#6f7eff',
                                        fontSize: '0.95rem',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Code expires in {formatTime(timeLeft)}
                                </Typography>
                            </TimerContainer>

                            <Typography variant="body2" sx={{ mb: 3, fontFamily: fontFamilyModern, fontWeight: 400, color: '#666666', textShadow: 'none', fontSize: isMobile ? '0.98rem' : '1.08rem', letterSpacing: '0.5px', lineHeight: 1.6 }}>
                                Enter the code below to confirm your email address
                            </Typography>
                        </Box>
                    </Fade>

                    <Fade in={true} timeout={2000}>
                        <CodeInputContainer>
                            {code.map((digit, index) => (
                                <StyledTextField
                                    key={index}
                                    inputRef={el => (inputRefs.current[index] = el)}                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    variant="outlined"
                                    inputProps={{
                                        maxLength: 1, // Ensure only one character can be typed
                                        style: { textAlign: 'center' }
                                    }}
                                    disabled={loading || success || timeLeft === 0}
                                    sx={{
                                        animation: success ? `${pulseAnimation} 0.6s ease` : 'none',
                                    }}
                                />
                            ))}
                        </CodeInputContainer>
                    </Fade>

                    <Fade in={true} timeout={2500}>
                        <Box>
                            <StyledButton
                                fullWidth
                                variant="contained"
                                onClick={handleVerify}
                                disabled={loading || success || code.join('').length !== 6 || timeLeft === 0}
                                sx={{ mb: 3 }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                ) : success ? (
                                    'Verified!'
                                ) : (
                                    'Verify'
                                )}
                            </StyledButton>

                            <Typography variant="body2" sx={{ fontFamily: fontFamilyModern, fontWeight: 400, color: '#666666', textShadow: 'none', fontSize: isMobile ? '0.97rem' : '1.05rem', letterSpacing: '0.5px', lineHeight: 1.6 }}>
                                If you didn't receive a code,{' '}
                                <Button
                                    variant="text"
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        p: 0,
                                        minWidth: 'auto',
                                        color: '#a259e6',
                                        textShadow: 'none',
                                        fontFamily: fontFamilyModern,
                                        ml: 0.5,
                                        '&:hover': {
                                            textDecoration: 'underline',
                                            background: 'none',
                                        },
                                        '&.Mui-disabled': { // Resend button disabled style
                                            color: '#b0b0b0',
                                        }
                                    }}
                                >
                                    {resendLoading ? (
                                        <CircularProgress size={16} sx={{ mr: 1 }} />
                                    ) : (
                                        <Refresh sx={{ fontSize: 16, mr: 0.5 }} />
                                    )}
                                    RESEND
                                </Button>
                            </Typography>
                        </Box>
                    </Fade>
                </StyledPaper>
            </Fade>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
};

export default VerificationCodePage;