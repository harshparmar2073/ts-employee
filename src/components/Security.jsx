import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
    Container,
    Paper,
    Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
    TextField,
    Snackbar,
    Alert,
  useTheme,
  useMediaQuery,
    Radio,
    RadioGroup,
    CircularProgress
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
    LockOutlined,
    SecurityOutlined,
    VisibilityOffOutlined,
    NotificationsActiveOutlined,
    CheckCircleOutline,
    ErrorOutline,
    SmsOutlined,
    EmailOutlined,
    QrCodeScannerOutlined // For Authenticator App
} from '@mui/icons-material';

// Keyframes for subtle animations
const pulseAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
`;

// Custom styled components for a modern look
const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    minHeight: '100vh',
    backgroundColor: '#f0f2f5', // Light background for the page
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start', // Align to top
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)', // Soft, modern shadow
    width: '100%',
    maxWidth: '800px', // Max width for desktop
    backgroundColor: '#ffffff', // White background for the card
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2.5),
        borderRadius: '12px',
    },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    fontSize: '1.8rem',
    marginBottom: theme.spacing(3),
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
        marginBottom: theme.spacing(2),
    },
}));

const OptionBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2.5, 0),
    borderBottom: `1px solid ${theme.palette.divider}`, // Subtle divider
    '&:last-child': {
        borderBottom: 'none', // No divider after the last item
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: theme.spacing(2, 0),
    },
}));

const OptionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '1.1rem',
    color: '#444',
    [theme.breakpoints.down('sm')]: {
        marginBottom: theme.spacing(1),
        fontSize: '1rem',
    },
}));

const OptionDescription = styled(Typography)(({ theme }) => ({
    fontSize: '0.9rem',
    color: '#777',
    marginTop: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.85rem',
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '8px',
    padding: theme.spacing(1, 2),
    minWidth: '100px',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        marginTop: theme.spacing(1.5),
        padding: theme.spacing(1.2, 2),
    },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        padding: theme.spacing(2),
        maxWidth: '500px',
        [theme.breakpoints.down('sm')]: {
            margin: theme.spacing(2),
        },
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
    '& .MuiTypography-root': {
        fontWeight: 700,
        fontSize: '1.5rem',
        color: '#333',
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
    },
}));

// UPDATED: Styled Dialog for Two-Factor Setup (Lighter Glassmorphism)
const StyledTwoFactorDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        // Changed background to a lighter, slightly translucent white
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 255, 0.95))',
        backdropFilter: 'blur(8px)', // Subtle blur for glass effect
        borderRadius: '20px',
        border: '1px solid rgba(220, 220, 230, 0.7)', // Lighter border
        boxShadow: '0 10px 30px 0 rgba(0, 0, 0, 0.15)', // Lighter, softer shadow
        color: '#333', // Darker text color for readability
        padding: theme.spacing(3),
        maxWidth: '700px', // Increased width
        width: '100%',
        textAlign: 'center',
        [theme.breakpoints.down('sm')]: {
            margin: theme.spacing(2),
            padding: theme.spacing(2),
        },
    },
}));

const TwoFactorDialogHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    '& .MuiSvgIcon-root': {
        fontSize: '60px',
        color: '#1976d2', // Changed to blue
        background: 'linear-gradient(45deg, #1976d2, #64b5f6)', // Blue gradient
        borderRadius: '50%',
        padding: theme.spacing(1.5),
        boxShadow: '0 4px 15px rgba(25, 118, 210, 0.25)', // Blue shadow
        animation: `${pulseAnimation} 2s infinite ease-in-out`,
    },
    '& .MuiTypography-h5': {
        fontWeight: 700,
        color: '#333', // Changed to dark for readability
        marginTop: theme.spacing(2),
    },
    '& .MuiTypography-body2': {
        color: '#666', // Changed to dark for readability
        marginTop: theme.spacing(1),
        lineHeight: 1.5,
    },
}));

// UPDATED: TwoFactorOptionBox for better alignment and appearance
const TwoFactorOptionBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5), // More padding for better touch targets
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.08)', // Subtle border
    marginBottom: theme.spacing(1.5), // Space between options
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.03)', // Light hover effect
        borderColor: theme.palette.primary.light,
    },
    '& .MuiRadio-root': {
        padding: theme.spacing(0.5), // Smaller padding for radio button itself
        color: theme.palette.primary.main, // Radio button color
    },
    '& .MuiSvgIcon-root': {
        color: '#666', // Darker icon color
        marginRight: theme.spacing(1.5),
        fontSize: '28px', // Slightly larger icons
    },
    '& .MuiTypography-body1': {
        fontWeight: 600,
        color: '#333', // Darker text color
    },
    '& .MuiTypography-body2': {
        color: '#777', // Darker description color
        fontSize: '0.85rem',
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'row', // Keep row direction for better layout on small screens
        alignItems: 'flex-start', // Align items to start
        padding: theme.spacing(1.5),
        '& .MuiSvgIcon-root': {
            marginBottom: 0,
            marginRight: theme.spacing(1),
        },
        '& .MuiRadio-root': {
            alignSelf: 'flex-start', // Align radio to top
            marginTop: theme.spacing(0.5), // Adjust margin to align with text
        },
    },
}));


const TwoFactorActionButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '10px',
    padding: theme.spacing(1.2, 3),
    minWidth: '120px',
    backgroundColor: '#673ab7', // Purple button (kept vibrant)
    color: '#fff',
    boxShadow: '0 4px 15px rgba(103, 58, 183, 0.4)',
    '&:hover': {
        backgroundColor: '#5e35b1',
        boxShadow: '0 6px 20px rgba(103, 58, 183, 0.6)',
    },
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        marginTop: theme.spacing(2),
    },
}));


const Security = () => {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
    const [twoFactorSetupDialogOpen, setTwoFactorSetupDialogOpen] = useState(false); // Renamed for clarity
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // State for Change Password Dialog
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // State for Two-Factor Setup Dialog
    const [twoFactorMethod, setTwoFactorMethod] = useState('none'); // 'none', 'authenticator', 'sms', 'email'
    const [mobileNumber, setMobileNumber] = useState('');
    const [emailAddressFor2FA, setEmailAddressFor2FA] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false); // To control if code input is shown
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false); // Loading state for sending code
    const [isVerifyingCode, setIsVerifyingCode] = useState(false); // Loading state for verifying code


    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleSnackbarOpen = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Change Password Logic
    const handleChangePassword = () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            handleSnackbarOpen('All password fields are required.', 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            handleSnackbarOpen('New passwords do not match.', 'error');
      return;
    }
        if (newPassword.length < 6) {
            handleSnackbarOpen('New password must be at least 6 characters long.', 'error');
      return;
    }
        // Simulate API call
        setTimeout(() => {
            console.log('Password changed successfully!');
            handleSnackbarOpen('Password changed successfully!', 'success');
            setChangePasswordDialogOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }, 1000);
    };

    // Two-Factor Authentication Setup Logic
    const handleSendCode = async () => {
        setIsSendingCode(true);
        // Simulate sending code
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSendingCode(false);
        setIsCodeSent(true);
        handleSnackbarOpen(`Verification code sent to your ${twoFactorMethod === 'sms' ? 'mobile number' : 'email'}!`, 'info');
    };

    const handleTwoFactorVerifyCode = async () => {
        setIsVerifyingCode(true);
        if (twoFactorCode.length !== 6) { // Assuming a 6-digit code
            handleSnackbarOpen('Please enter the 6-digit code.', 'error');
            setIsVerifyingCode(false);
            return;
        }
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsVerifyingCode(false);

        if (twoFactorCode === '123456') { // Mock correct code
            setTwoFactorEnabled(true);
            setTwoFactorSetupDialogOpen(false);
            setTwoFactorCode('');
            setIsCodeSent(false); // Reset for next time
            handleSnackbarOpen('Two-step authentication verified and enabled!', 'success');
    } else {
            handleSnackbarOpen('Invalid verification code. Please try again.', 'error');
        }
    };

    const resetTwoFactorDialog = () => {
        setTwoFactorMethod('none');
        setMobileNumber('');
        setEmailAddressFor2FA('');
        setIsCodeSent(false);
        setTwoFactorCode('');
        setIsSendingCode(false);
        setIsVerifyingCode(false);
    };

    return (
        <StyledContainer maxWidth="md">
            <StyledPaper elevation={0}>
                <SectionHeader>
                    <SecurityOutlined fontSize="large" />
                    Security Settings
                </SectionHeader>

                {/* Change Password Option */}
                <OptionBox>
                    <Box>
                        <OptionTitle>Change Password</OptionTitle>
                        <OptionDescription>Update your account password regularly to keep your account secure.</OptionDescription>
                    </Box>
                    <ActionButton variant="contained" onClick={() => setChangePasswordDialogOpen(true)}>
                        Change
                    </ActionButton>
                </OptionBox>

                {/* Two-Step Authentication Option */}
                <OptionBox>
                    <Box>
                        <OptionTitle>Two-Step Authentication</OptionTitle>
                        <OptionDescription>
                            {twoFactorEnabled
                                ? 'Two-step authentication is currently enabled.'
                                : 'Add an extra layer of security to your account with a verification code.'}
                        </OptionDescription>
          </Box>
                    {!twoFactorEnabled ? (
                        <ActionButton variant="contained" onClick={() => setTwoFactorSetupDialogOpen(true)}>
                            Verify
                        </ActionButton>
                    ) : (
                        <ActionButton variant="outlined" color="error" onClick={() => {
                            setTwoFactorEnabled(false);
                            handleSnackbarOpen('Two-step authentication disabled.', 'info');
                        }}>
                            Disable
                        </ActionButton>
                    )}
                </OptionBox>

                {/* Security Alerts Option */}
                <OptionBox>
                    <Box>
                        <OptionTitle>Security Alerts</OptionTitle>
                        <OptionDescription>Receive email notifications for suspicious activity on your account.</OptionDescription>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={securityAlerts}
                                onChange={(e) => setSecurityAlerts(e.target.checked)}
                                name="securityAlerts"
                                color="primary"
                            />
                        }
                        label="" // Empty label as text is in OptionTitle/Description
                        sx={{ margin: 0 }} // Remove default margin from FormControlLabel
                    />
                </OptionBox>

            </StyledPaper>

            {/* Change Password Dialog */}
            <StyledDialog open={changePasswordDialogOpen} onClose={() => setChangePasswordDialogOpen(false)}>
                <StyledDialogTitle>Change Your Password</StyledDialogTitle>
                <DialogContent>
                    <StyledTextField
                        autoFocus
                        margin="dense"
                        label="Current Password"
                        type="password"
                  fullWidth
                  variant="outlined"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <StyledTextField
                        margin="dense"
                        label="New Password"
                        type="password"
                  fullWidth
                  variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <StyledTextField
                        margin="dense"
                        label="Confirm New Password"
                        type="password"
                  fullWidth
                  variant="outlined"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', padding: theme.spacing(0, 3, 3) }}>
                    <Button onClick={() => setChangePasswordDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                  Cancel
                </Button>
                    <Button variant="contained" onClick={handleChangePassword} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                        Update Password
                    </Button>
                </DialogActions>
            </StyledDialog>

            {/* NEW: Two-Factor Authentication Setup Dialog */}
            <StyledTwoFactorDialog open={twoFactorSetupDialogOpen} onClose={() => { setTwoFactorSetupDialogOpen(false); resetTwoFactorDialog(); }}>
                <TwoFactorDialogHeader>
                    <LockOutlined />
                    <Typography variant="h5">Two-factor Authentication</Typography>
                    <Typography variant="body2">
                        Enhance your security by setting up two-factor authentication (2FA)
                        using an authenticator app, SMS, or email.
          </Typography>
                </TwoFactorDialogHeader>

                <DialogContent sx={{ px: isMobile ? 1 : 3, py: 0 }}>
                    {!isCodeSent ? (
                        <RadioGroup
                            aria-label="two-factor-method"
                            name="two-factor-method-group"
                            value={twoFactorMethod}
                            onChange={(event) => {
                                setTwoFactorMethod(event.target.value);
                                setMobileNumber(''); // Clear previous inputs
                                setEmailAddressFor2FA('');
                            }}
                        >
                            <TwoFactorOptionBox onClick={() => setTwoFactorMethod('authenticator')}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Radio
                                        value="authenticator"
                                        checked={twoFactorMethod === 'authenticator'}
                                        sx={{ color: '#673ab7' }} // Primary color for radio
                                    />
                                    <QrCodeScannerOutlined />
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="body1">Authenticator App <span style={{ fontSize: '0.8em', opacity: 0.7 }}>TOTP</span></Typography>
                                        <Typography variant="body2">Receive a temporary one-time passcode using an app.</Typography>
                                    </Box>
                                </Box>
                            </TwoFactorOptionBox>

                            <TwoFactorOptionBox onClick={() => setTwoFactorMethod('sms')}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Radio
                                        value="sms"
                                        checked={twoFactorMethod === 'sms'}
                                        sx={{ color: '#673ab7' }} // Primary color for radio
                                    />
                                    <SmsOutlined />
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="body1">Text Message <span style={{ fontSize: '0.8em', opacity: 0.7 }}>SMS</span></Typography>
                                        <Typography variant="body2">Get a one-time passcode through text message.</Typography>
                                    </Box>
                                </Box>
                            </TwoFactorOptionBox>
                            {twoFactorMethod === 'sms' && (
                                <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
                                    <StyledTextField
                                        label="Mobile Number"
                                        variant="outlined"
              fullWidth
                                        size="small"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} // Only digits
                                        inputProps={{ maxLength: 15 }} // Typical phone number length
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(0,0,0,0.05)', // Light background for input
                                                color: '#333', // Dark text
                                                '& fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                                                '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.4)' },
                                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                                            },
                                            '& .MuiInputLabel-root': { color: '#777' }, // Dark label
                                            '& .MuiInputBase-input': { color: '#333' }, // Dark input text
                                        }}
                                    />
                                </Box>
                            )}

                            <TwoFactorOptionBox onClick={() => setTwoFactorMethod('email')}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Radio
                                        value="email"
                                        checked={twoFactorMethod === 'email'}
                                        sx={{ color: '#673ab7' }} // Primary color for radio
                                    />
                                    <EmailOutlined />
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="body1">Email</Typography>
                                        <Typography variant="body2">Receive a one-time passcode via email.</Typography>
                                    </Box>
                                </Box>
                            </TwoFactorOptionBox>
                            {twoFactorMethod === 'email' && (
                                <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
                                    <StyledTextField
                                        label="Email Address"
                                        variant="outlined"
              fullWidth
                                        size="small"
                                        type="email"
                                        value={emailAddressFor2FA}
                                        onChange={(e) => setEmailAddressFor2FA(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(0,0,0,0.05)', // Light background for input
                                                color: '#333', // Dark text
                                                '& fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                                                '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.4)' },
                                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                                            },
                                            '& .MuiInputLabel-root': { color: '#777' }, // Dark label
                                            '& .MuiInputBase-input': { color: '#333' }, // Dark input text
                                        }}
                                    />
                                </Box>
                            )}
                        </RadioGroup>
                    ) : (
                        // Code input section
                        <Box sx={{ mt: 3, mb: 2 }}>
                            <Typography variant="body2" color="#666" sx={{ mb: 2 }}> {/* Darker text */}
                                Please enter the 6-digit code sent to your {twoFactorMethod === 'sms' ? 'mobile number' : 'email'}.
                            </Typography>
                            <StyledTextField
                                autoFocus
                                margin="dense"
                                label="Verification Code"
                                type="text"
                                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '8px', color: '#333' } }} // Dark text
              fullWidth
                                variant="outlined"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(0,0,0,0.05)', // Light background for input
                                        color: '#333', // Dark text
                                        '& fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                                        '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.4)' },
                                        '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                                    },
                                    '& .MuiInputLabel-root': { color: '#777' }, // Dark label
              }}
            />
            <Button
                                variant="text"
                                onClick={handleSendCode} // Resend code
                                disabled={isSendingCode}
                                sx={{
                                    textTransform: 'none',
                                    color: '#673ab7', // Primary color for resend
                                    fontSize: '0.8rem',
                                    mt: 1,
                                    '&:hover': { color: '#5e35b1' }
                                }}
                            >
                                {isSendingCode ? <CircularProgress size={16} sx={{ mr: 1, color: '#673ab7' }} /> : 'Resend Code'}
            </Button>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'space-between', padding: theme.spacing(0, 3, 3) }}>
                    <Button onClick={() => { setTwoFactorSetupDialogOpen(false); resetTwoFactorDialog(); }} sx={{ textTransform: 'none', color: '#777', borderRadius: '8px' }}> {/* Darker cancel button */}
                        Cancel
                </Button>
                    {!isCodeSent ? (
                        <TwoFactorActionButton
                            onClick={twoFactorMethod === 'authenticator' ? handleTwoFactorVerifyCode : handleSendCode}
                            disabled={
                                twoFactorMethod === 'none' ||
                                (twoFactorMethod === 'sms' && !mobileNumber) ||
                                (twoFactorMethod === 'email' && !emailAddressFor2FA) ||
                                isSendingCode
                            }
                        >
                            {isSendingCode ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (twoFactorMethod === 'authenticator' ? 'Set Up' : 'Send Code')}
                        </TwoFactorActionButton>
                    ) : (
                        <TwoFactorActionButton
                            onClick={handleTwoFactorVerifyCode}
                            disabled={twoFactorCode.length !== 6 || isVerifyingCode}
                        >
                            {isVerifyingCode ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Verify Code'}
                        </TwoFactorActionButton>
                    )}
                </DialogActions>
            </StyledTwoFactorDialog>

            {/* Snackbar for alerts */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
};

export default Security;