// Security.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  EmailOutlined,
  SmsOutlined,
  QrCodeScannerOutlined,
  SecurityOutlined
} from '@mui/icons-material';
import axiosService from '../services/axiosService';

const MFASettingsDialog = ({ open, onClose, factors, setFactors }) => {
  const [localFactors, setLocalFactors] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLocalFactors(factors);
    setErrors({});
  }, [factors]);

  const validateInput = (type, value) => {
    if (type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (type === 'sms') {
      return /^[0-9+\s-]{7,20}$/.test(value);
    }
    return true;
  };

  const handleToggle = (type) => {
    const updated = [...localFactors];
    const index = updated.findIndex(f => f.factorType.toLowerCase() === type);
    if (index !== -1) {
      updated.splice(index, 1);
    } else {
      updated.push({ factorType: type.toUpperCase(), deliveryAddress: '' });
    }
    setLocalFactors(updated);
    setErrors(prev => ({ ...prev, [type]: '' }));
  };

  const handleAddressChange = (type, value) => {
    const updated = localFactors.map(f => {
      if (f.factorType.toLowerCase() === type) {
        return { ...f, deliveryAddress: value };
      }
      return f;
    });
    setLocalFactors(updated);

    const isValid = validateInput(type, value);
    setErrors(prev => ({ ...prev, [type]: isValid ? '' : `Invalid ${type === 'sms' ? 'phone number' : 'email'} format` }));
  };

  const handleSave = () => {
    const tempErrors = {};
    localFactors.forEach(f => {
      const type = f.factorType.toLowerCase();
      const value = f.deliveryAddress || '';
      if (!validateInput(type, value)) {
        tempErrors[type] = `Invalid ${type === 'sms' ? 'phone number' : 'email'} format`;
      }
    });

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setFactors(localFactors);
    onClose();
  };

  const renderInput = (type) => {
    const factor = localFactors.find(f => f.factorType.toLowerCase() === type);
    if (!factor) return null;
    return (
      <TextField
        fullWidth
        size="small"
        type={type === 'email' ? 'email' : 'text'}
        label={type === 'email' ? 'Email' : 'Phone Number'}
        value={factor.deliveryAddress || ''}
        onChange={(e) => handleAddressChange(type, e.target.value)}
        error={Boolean(errors[type])}
        helperText={errors[type] || ' '}
        sx={{ mt: 1, mb: 2 }}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage MFA Settings</DialogTitle>
      <DialogContent>
        {[{ type: 'email', icon: <EmailOutlined /> }, { type: 'sms', icon: <SmsOutlined /> }, { type: 'authenticator', icon: <QrCodeScannerOutlined /> }].map(({ type, icon }) => {
          const isEnabled = localFactors.some(f => f.factorType.toLowerCase() === type);
          const factor = localFactors.find(f => f.factorType.toLowerCase() === type);

          return (
            <Box
              key={type}
              sx={{
                border: '1px solid #ddd',
                borderRadius: 2,
                p: 2,
                mb: 2,
                backgroundColor: '#f9f9f9'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {icon}
                  <Typography>{type.charAt(0).toUpperCase() + type.slice(1)} {isEnabled && factor?.deliveryAddress ? `(${factor.deliveryAddress})` : ''}</Typography>
                </Box>
                <Switch
                  checked={isEnabled}
                  onChange={() => handleToggle(type)}
                  disabled={type === 'email'}
                />
              </Box>
              {isEnabled && type !== 'authenticator' && renderInput(type)}
            </Box>
          );
        })}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MFASettingsDialog;