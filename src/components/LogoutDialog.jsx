// components/LogoutDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LogoutDialog = ({ open, onClose, onConfirm }) => {
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
          fontWeight: 700,
          color: '#2d3e65'
        }}
      >
        <LogoutIcon color="error" /> Confirm Logout
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Are you sure you want to log out? You’ll need to sign in again to continue.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            background: 'linear-gradient(to right, #b2195b, #6c5ce7)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(to right, #a21856, #594fd8)'
            }
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;