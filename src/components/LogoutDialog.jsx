import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Typography,
  Button,
  Box,
  useTheme // Import useTheme
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LogoutDialog = ({ open, onClose, onConfirm }) => {
  const theme = useTheme(); // Access the theme object

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: theme.typography.fontWeightBold, // Using theme fontWeight
          color: theme.palette.text.primary // Using theme text color
        }}
      >
        <LogoutIcon color="error" /> Confirm Logout
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body1"
          sx={{
            mt: 1,
            fontFamily: theme.typography.fontFamily, // Using theme fontFamily
            color: theme.palette.text.primary // Using theme text color
          }}
        >
          Are you sure you want to log out? You’ll need to sign in again to continue.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            ...theme.components.MuiButton.styleOverrides.root,
            ...theme.components.MuiButton.styleOverrides.outlinedPrimary,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            ...theme.components.MuiButton.styleOverrides.root,
            ...theme.components.MuiButton.styleOverrides.containedPrimary,
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
