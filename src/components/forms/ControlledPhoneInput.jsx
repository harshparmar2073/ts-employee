import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Box,
  FormHelperText,
  useTheme
} from '@mui/material';
import { Controller } from 'react-hook-form';
import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const ControlledPhoneInput = ({ name, label, control, errors, disabled, defaultCountry, onCountryChange }) => {
  const theme = useTheme();
  console.log(`ControlledPhoneInput: defaultCountry prop received: ${defaultCountry}`); // Debug log
  const [currentCountry, setCurrentCountry] = useState(defaultCountry || 'GB');

  React.useEffect(() => {
    if (defaultCountry && defaultCountry !== currentCountry) {
      setCurrentCountry(defaultCountry);
      console.log(`ControlledPhoneInput: currentCountry updated to: ${defaultCountry}`); // Debug log
    }
  }, [defaultCountry, currentCountry]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        const handlePhoneChange = (inputValue, countryData) => {
          if (!inputValue) {
            onChange('');
            if (onCountryChange) onCountryChange(''); // Also clear country if phone number is cleared
            return;
          }
          // Only update the country state if the library suggests a change AND it's different from what's selected by FlagsSelect
          if (countryData && countryData.country && countryData.country !== currentCountry) {
            // If the library tries to change the country and it's not the one we set, re-assert our country.
            // The actual visual country flag is driven by PhoneInput's `country` prop, which is `currentCountry`
            // So, we don't update `currentCountry` here unless we want to allow the library to change it.
            // Instead, we will notify the parent form via onCountryChange
            if (onCountryChange) onCountryChange(countryData.country);
          }

          const phoneNumber = parsePhoneNumber(inputValue);
          const nationalNumber = phoneNumber ? phoneNumber.nationalNumber : inputValue.replace(/\D/g, '');
          if (nationalNumber && nationalNumber.length > 10) {
            return; // Ignore input if national number has more than 10 digits
          }
          onChange(inputValue);
        };

        return (
          <FormControl fullWidth error={!!errors[name]} sx={{ mb: 2, minWidth: 0 }}>
            <InputLabel shrink>{label}</InputLabel>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                borderColor: errors[name] ? 'error.main' : '#c4c4c4',
                borderRadius: 1,
                px: 1,
                bgcolor: disabled ? '#f5f5f5' : '#fff',
                minHeight: 56,
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(94,53,177,0.15)'
                }
              }}
            >
             <PhoneInput
                key={name} // Use name as key for stability
                international
                defaultCountry={defaultCountry || 'GB'}
                value={value || ''}
                onChange={handlePhoneChange}
                disabled={disabled}
                countryCallingCodeEditable={true}
                placeholder="Enter 10 digits"
                onKeyDown={(e) => {
                  const phoneNumber = parsePhoneNumber(value || '');
                  const nationalDigits = phoneNumber ? phoneNumber.nationalNumber : (value || '').replace(/\D/g, '');
                  
                  if (nationalDigits.length >= 10 && 
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Box>
            {errors[name] && <FormHelperText>{errors[name]?.message}</FormHelperText>}
            {console.log(`ControlledPhoneInput: Rendering PhoneInput with country: ${currentCountry}, value: ${value}`)} {/* Debug log */}
            <style>{`
              .PhoneInput { width: 100%; display: flex; align-items: center; }
              .PhoneInputInput {
                flex: 1;
                border: none;
                outline: none;
                font-size: 0.95rem;
                padding: 14px 12px;
                background: transparent;
                font-family: ${theme.typography.fontFamily};
              }
            `}</style>
          </FormControl>
        );
      }}
    />
  );
};

export default ControlledPhoneInput;
