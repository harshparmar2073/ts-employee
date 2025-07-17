import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Container,
  Alert,
  Checkbox,
  FormHelperText,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Person,
  Badge,
  Work,
  Payment,
  Description,
  CheckCircle
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useToast } from '../context/ToastContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import FlagsSelect from "react-flags-select";
import ReactSignatureCanvas from 'react-signature-canvas';
import { keyframes } from '@mui/system';

// Validation schemas for each step
const phoneRegex = /^(\+44\d{10}|\+1\d{10}|\d{10})$/;
const stepSchemas = [
  // Step 1: Personal Details
  yup.object({
    fullName: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
    preferredName: yup.string(),
    dateOfBirth: yup.date().required('Date of birth is required'),
    gender: yup.string().required('Gender is required'),
    mobileNumber: yup
      .string()
      .required('Mobile number is required')
      .matches(phoneRegex, 'Enter a valid UK (+44), US (+1), or 10-digit mobile number'),
    emailAddress: yup.string().required('Email is required').email('Invalid email address'),
    currentAddress: yup.string().required('Current address is required').min(10, 'Address must be at least 10 characters'),
    countryOfResidence: yup.string().required('Country of residence is required'),
    emergencyContact: yup
      .string()
      .required('Emergency contact is required')
      .test('emergency-contact', 'Enter name and valid phone (e.g., John 1234567890 or John1234567890 or John+441234567890)', value => {
        if (!value) return false;
        // Must have at least one non-digit character and end with a valid phone number
        const match = value.match(/^(.*\D)(\+44\d{10}|\+1\d{10}|\d{10})$/);
        return !!match;
      }),

     
  }),
  
  // Step 2: Identification & Right to Work
  yup.object({
    ukNiOrPanNumber: yup
      .string()
      .required('NI/PAN number is required')
      .test('pan-or-ni', 'Enter a valid PAN (India: 10 chars, 5 letters, 4 digits, 1 letter) or NI (UK: min 8 chars)', value => {
        if (!value) return false;
        // PAN: 5 letters, 4 digits, 1 letter
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
        // NI: at least 8 chars (loose check)
        return panRegex.test(value) || value.length >= 8;
      }),
    rightToWorkDocumentType: yup.string().required('Right to work document type is required'),
    visaExpiryDate: yup.date().nullable().min(new Date(), 'Visa expiry date must be in the future'),
    taxId: yup
      .string()
      .required('Tax ID is required')
      .matches(/^[0-9]{5,15}$/, 'Tax ID must be 5-15 digits'),
  }),
  
  // Step 3: Engagement Information
  yup.object({
    engagementType: yup.string().required('Engagement type is required'),
    startDate: yup.date().required('Start date is required').min(new Date(), 'Start date must be in the future'),
    jobTitle: yup.string().required('Job title is required').min(2, 'Job title must be at least 2 characters'),
    weeklyHours: yup
      .string()
      .required('Weekly hours/scope is required')
      .matches(/^[0-9]+$/, 'Only numbers allowed'),
    workMode: yup.string().required('Work mode is required'),
    reportingManager: yup.string().required('Reporting manager is required').min(2, 'Manager name must be at least 2 characters')
  }),
  
  // Step 4: Payment Information
  yup.object({
    annualSalary: yup.string().when('engagementType', {
      is: 'Employee',
      then: (schema) => schema.required('Annual salary is required for employees').matches(/^[0-9]+(\.[0-9]{1,2})?$/, 'Only numbers allowed'),
      otherwise: (schema) => schema
    }),
    dayOrHourlyRate: yup.string().when('engagementType', {
      is: 'Contractor',
      then: (schema) => schema.required('Day/hourly rate is required for contractors').matches(/^[0-9]+(\.[0-9]{1,2})?$/, 'Only numbers allowed'),
      otherwise: (schema) => schema
    }),
    bankName: yup.string().required('Bank name is required'),
    accountNumber: yup
      .string()
      .required('Account number is required')
      .matches(/^[0-9]{8,18}$/, 'Account number must be 8-18 digits and only numbers'),
    sortCodeOrIfsc: yup.string().required('Sort code/IFSC is required'),
    contractorCompanyName: yup.string().when('engagementType', {
      is: 'Contractor',
      then: (schema) => schema,
      otherwise: (schema) => schema
    }),
    gstVatNumber: yup.string()
  }),
  
  // Step 5: Required Documents
  yup.object({
    proofOfIdentity: yup.string().required('Proof of identity status is required'),
    proofOfAddress: yup.string().required('Proof of address status is required'),
    signedOfferContract: yup.string().required('Signed offer/contract status is required'),
    companyRegistration: yup.string().when('engagementType', {
      is: 'Contractor',
      then: (schema) => schema,
      otherwise: (schema) => schema
    })
  }),
  
  // Step 6: Declaration & Consent
  yup.object({
    informationAccurate: yup.boolean().oneOf([true], 'You must confirm information accuracy'),
    consentDataProcessing: yup.boolean().oneOf([true], 'You must consent to data processing'),
    signature: yup.string().required('Signature is required'),
    signatureName: yup.string().required('Name is required'),
    signatureDate: yup.date().required('Date is required').max(new Date(), 'Date cannot be in the future')
  })
];

const steps = [
  'Personal Details',
  'Identification & Right to Work',
  'Engagement Information',
  'Payment Information',
  'Required Documents',
  'Declaration & Consent'
];

const stepIcons = [
  <Person />,
  <Badge />,
  <Work />,
  <Payment />,
  <Description />,
  <CheckCircle />
];

// Animation for form entrance
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Animation for completed step icon glow
const glow = keyframes`
  0% { box-shadow: 0 0 0 0 #a3f7bf; }
  70% { box-shadow: 0 0 12px 6px #a3f7bf; }
  100% { box-shadow: 0 0 0 0 #a3f7bf; }
`;

export default function EmployeeContractorForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const theme = useTheme();
  const { showToast } = useToast();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isVerticalStepper = useMediaQuery('(max-width:900px)');

  const defaultValues = {
    fullName: '',
    preferredName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    emailAddress: '',
    currentAddress: '',
    countryOfResidence: '',
    emergencyContact: '',
    ukNiOrPanNumber: '',
    rightToWorkDocumentType: '',
    visaExpiryDate: '',
    taxId: '',
    engagementType: '',
    startDate: '',
    jobTitle: '',
    weeklyHours: '',
    workMode: '',
    reportingManager: '',
    annualSalary: '',
    dayOrHourlyRate: '',
    bankName: '',
    accountNumber: '',
    sortCodeOrIfsc: '',
    contractorCompanyName: '',
    gstVatNumber: '',
    proofOfIdentity: '',
    proofOfAddress: '',
    signedOfferContract: '',
    companyRegistration: '',
    informationAccurate: false,
    consentDataProcessing: false,
    signature: '',
    signatureName: '',
    signatureDate: ''
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(stepSchemas[activeStep]),
    defaultValues,
    mode: 'onChange'
  });

  const watchedValues = watch();
  const engagementType = watch('engagementType');

  useEffect(() => {
    // Set default country if not already set
    if (!watch('countryOfResidence')) {
      // Use setValue from useForm
      setValue('countryOfResidence', 'GB');
    }
  }, [setValue, watch]);

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    } else {
      showToast('Please fill up all details then move further', 'error');
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitSuccess(true);
      setActiveStep(steps.length);
      showToast('Form submitted successfully! Your employee/contractor engagement form has been submitted and will be processed soon.', 'success');
    } catch (error) {
      showToast('Submission error. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setActiveStep(0);
    setSubmitSuccess(false);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography fontWeight={600} mb={1.5}>Personal Details</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name *"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Full Name *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="preferredName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Preferred Name (Optional)"
                    sx={{ mb: 1.5 }}
                    placeholder="Preferred Name (Optional)"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Date of Birth *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="mm/dd/yyyy"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ placeholder: 'mm/dd/yyyy' }}
                  />
                )}
              />
              
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender} sx={{ mb: 1.5 }}>
                    <InputLabel>Gender *</InputLabel>
                    <Select {...field} label="Gender *">
                      <MenuItem value="M">Male</MenuItem>
                      <MenuItem value="F">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              
              <Controller
                name="mobileNumber"
                control={control}
                render={({ field }) => {
                  let displayValue = field.value;
                  if (/^\d{10}$/.test(field.value)) {
                    displayValue = field.value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                  }
                  return (
                  <TextField
                    {...field}
                      value={displayValue}
                    fullWidth
                    label="Mobile Number *"
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Mobile Number *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                      onChange={e => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (e.target.value.startsWith('+44')) {
                          value = '+44' + value.slice(2, 12);
                        } else if (e.target.value.startsWith('+1')) {
                          value = '+1' + value.slice(1, 11);
                        } else {
                          value = value.slice(0, 10);
                        }
                        field.onChange(value);
                      }}
                    />
                  );
                }}
              />
              
              <Controller
                name="emailAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address *"
                    type="email"
                    error={!!errors.emailAddress}
                    helperText={errors.emailAddress?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Email Address *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="currentAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Current Address *"
                    multiline
                    rows={3}
                    error={!!errors.currentAddress}
                    helperText={errors.currentAddress?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Current Address *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="countryOfResidence"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 1.5 }}>
                    <FlagsSelect
                      selected={field.value || 'GB'}
                      onSelect={field.onChange}
                      placeholder="Select Country *"
                      searchable
                      alignOptionsToRight={false}
                      showSelectedLabel={true}
                      showOptionLabel={true}
                      fullWidth
                      selectedSize={theme.typography.fontSize}
                      optionsSize={theme.typography.fontSize}
                      className="mui-flags-select"
                      style={{
                        width: '100%',
                        height: 56,
                        borderRadius: 8,
                        fontFamily: theme.typography.fontFamily,
                        fontSize: theme.typography.fontSize,
                        fontWeight: theme.typography.fontWeightRegular,
                        background: '#fff',
                        border: errors.countryOfResidence ? '1.5px solid #d32f2f' : '1.5px solid #c4c4c4',
                        paddingLeft: 14,
                        paddingRight: 14,
                        display: 'flex',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        color: theme.palette.text.primary,
                      }}
                    />
                    <style>{`
                      .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7 {
                        font-family: ${theme.typography.fontFamily} !important;
                        font-size: ${theme.typography.fontSize}px !important;
                        font-weight: ${theme.typography.fontWeightRegular} !important;
                        height: 56px !important;
                        min-height: 56px !important;
                        color: ${theme.palette.text.primary} !important;
                        background: #fff !important;
                        border-radius: 8px !important;
                        box-shadow: none !important;
                        outline: none !important;
                        padding-left: 0 !important;
                        transition: border-color 0.2s !important;
                      }
                      .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7:hover {
                        border: 1.5px solid #5E35B1 !important;
                      }
                      .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7:focus {
                        border: 1.5px solid #5E35B1 !important;
                        box-shadow: 0 0 0 2px rgba(94,53,177,0.15) !important;
                      }
                      .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7::placeholder {
                        font-family: ${theme.typography.fontFamily} !important;
                        font-size: ${theme.typography.fontSize}px !important;
                        color: ${theme.palette.text.secondary} !important;
                        opacity: 1 !important;
                      }
                    `}</style>
                    {errors.countryOfResidence && (
                      <FormHelperText error>{errors.countryOfResidence.message}</FormHelperText>
                    )}
                  </Box>
                )}
              />
              
              <Controller
                name="emergencyContact"
                control={control}
                render={({ field }) => {
                  let displayValue = field.value;
                  const parts = field.value.trim().split(/\s+/);
                  if (parts.length > 1) {
                    const phone = parts[parts.length - 1];
                    if (/^\d{10}$/.test(phone)) {
                      parts[parts.length - 1] = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                      displayValue = parts.join(' ');
                    }
                  }
                  return (
                  <TextField
                    {...field}
                      value={displayValue}
                    fullWidth
                    label="Emergency Contact (Name & Phone) *"
                    error={!!errors.emergencyContact}
                    helperText={errors.emergencyContact?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Emergency Contact (Name & Phone) *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                      inputProps={{ maxLength: (() => {
                        if (parts.length > 1) {
                          const phone = parts[parts.length - 1];
                          if (phone.startsWith('+44') || phone.startsWith('+1')) return field.value.length + 1 > 14 ? 14 : 14;
                          return field.value.length + 1 > 15 ? 15 : 15;
                        }
                        return 30;
                      })(), inputMode: 'text' }}
                      onChange={e => {
                        let val = e.target.value;
                        const parts = val.trim().split(/\s+/);
                        if (parts.length > 1) {
                          let phone = parts[parts.length - 1].replace(/\D/g, '');
                          if (val.endsWith('+44') || val.endsWith('+1')) {
                            // Do not format yet
                          } else if (phone.length > 10) {
                            phone = phone.slice(0, 10);
                          }
                          parts[parts.length - 1] = phone;
                          val = parts.join(' ');
                        }
                        field.onChange(val);
                      }}
                    />
                  );
                }}
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography fontWeight={600} mb={1.5}>Identification & Right to Work</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Controller
                name="ukNiOrPanNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="UK - NI Number / India - PAN Number *"
                    error={!!errors.ukNiOrPanNumber}
                    helperText={errors.ukNiOrPanNumber?.message || 'PAN: 10 chars (5 letters, 4 digits, 1 letter)'}
                    sx={{ mb: 1.5 }}
                    placeholder="UK - NI Number / India - PAN Number *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ maxLength: 14, style: { textTransform: 'uppercase' } }}
                    onChange={e => field.onChange(e.target.value.toUpperCase())}
                  />
                )}
              />
              
              <Controller
                name="rightToWorkDocumentType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Right to Work Document Type *"
                    error={!!errors.rightToWorkDocumentType}
                    helperText={errors.rightToWorkDocumentType?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Right to Work Document Type *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="visaExpiryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Visa Expiry Date (if applicable)"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.visaExpiryDate}
                    helperText={errors.visaExpiryDate?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="mm/dd/yyyy"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ placeholder: 'mm/dd/yyyy' }}
                  />
                )}
              />
              
              <Controller
                name="taxId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tax ID (UTR or PAN) *"
                    error={!!errors.taxId}
                    helperText={errors.taxId?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Tax ID (UTR or PAN) *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 15 }}
                    onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))}
                  />
                )}
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography fontWeight={600} mb={1.5}>Engagement Information</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Controller
                name="engagementType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.engagementType} sx={{ mb: 1.5 }}>
                    <InputLabel>Engagement Type *</InputLabel>
                    <Select {...field} label="Engagement Type *">
                      <MenuItem value="Employee">Employee</MenuItem>
                      <MenuItem value="Contractor">Contractor</MenuItem>
                    </Select>
                    {errors.engagementType && <FormHelperText>{errors.engagementType.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Start Date *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="mm/dd/yyyy"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ placeholder: 'mm/dd/yyyy' }}
                  />
                )}
              />
              
              <Controller
                name="jobTitle"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Job Title / Role *"
                    error={!!errors.jobTitle}
                    helperText={errors.jobTitle?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Job Title / Role *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="weeklyHours"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Weekly Hours or Scope of Work *"
                    error={!!errors.weeklyHours}
                    helperText={errors.weeklyHours?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Weekly Hours or Scope of Work *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="workMode"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.workMode} sx={{ mb: 1.5 }}>
                    <InputLabel>Work Mode *</InputLabel>
                    <Select {...field} label="Work Mode *">
                      <MenuItem value="Remote">Remote</MenuItem>
                      <MenuItem value="On-site">On-site</MenuItem>
                      <MenuItem value="Hybrid">Hybrid</MenuItem>
                    </Select>
                    {errors.workMode && <FormHelperText>{errors.workMode.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              
              <Controller
                name="reportingManager"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Reporting Manager / Lead *"
                    error={!!errors.reportingManager}
                    helperText={errors.reportingManager?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Reporting Manager / Lead *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography fontWeight={600} mb={1.5}>Payment Information</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Controller
                name="annualSalary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={`For Employees - Annual Salary / CTC ${engagementType === 'Employee' ? '*' : ''}`}
                    disabled={engagementType === 'Contractor'}
                    error={!!errors.annualSalary}
                    helperText={errors.annualSalary?.message}
                    sx={{ mb: 1.5 }}
                    placeholder={`For Employees - Annual Salary / CTC ${engagementType === 'Employee' ? '*' : ''}`}
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ inputMode: 'decimal', pattern: '^[0-9]+(\\.[0-9]{1,2})?$', maxLength: 12 }}
                    onChange={e => field.onChange(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                )}
              />
              
              <Controller
                name="dayOrHourlyRate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={`For Contractors - Day or Hourly Rate ${engagementType === 'Contractor' ? '*' : ''}`}
                    disabled={engagementType === 'Employee'}
                    error={!!errors.dayOrHourlyRate}
                    helperText={errors.dayOrHourlyRate?.message}
                    sx={{ mb: 1.5 }}
                    placeholder={`For Contractors - Day or Hourly Rate ${engagementType === 'Contractor' ? '*' : ''}`}
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ inputMode: 'decimal', pattern: '^[0-9]+(\\.[0-9]{1,2})?$', maxLength: 12 }}
                    onChange={e => field.onChange(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                )}
              />
              
              <Controller
                name="bankName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank Name *"
                    error={!!errors.bankName}
                    helperText={errors.bankName?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Bank Name *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="accountNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Account Number *"
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Account Number *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 18 }}
                    onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))}
                  />
                )}
              />
              
              <Controller
                name="sortCodeOrIfsc"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Sort Code (UK) / IFSC Code (India) *"
                    error={!!errors.sortCodeOrIfsc}
                    helperText={errors.sortCodeOrIfsc?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Sort Code (UK) / IFSC Code (India) *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="contractorCompanyName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Contractor - Company Name (if any)"
                    disabled={engagementType === 'Employee'}
                    sx={{ mb: 1.5 }}
                    placeholder="Contractor - Company Name (if any)"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="gstVatNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="GST / VAT Number (if applicable)"
                    sx={{ mb: 1.5 }}
                    placeholder="GST / VAT Number (if applicable)"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography fontWeight={600} mb={1.5}>Required Documents</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Controller
                name="proofOfIdentity"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.proofOfIdentity} sx={{ mb: 1.5 }}>
                    <InputLabel>Proof of Identity Submitted *</InputLabel>
                    <Select {...field} label="Proof of Identity Submitted *">
                      <MenuItem value="Y">Yes</MenuItem>
                      <MenuItem value="N">No</MenuItem>
                    </Select>
                    {errors.proofOfIdentity && <FormHelperText>{errors.proofOfIdentity.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              
              <Controller
                name="proofOfAddress"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.proofOfAddress} sx={{ mb: 1.5 }}>
                    <InputLabel>Proof of Address Submitted *</InputLabel>
                    <Select {...field} label="Proof of Address Submitted *">
                      <MenuItem value="Y">Yes</MenuItem>
                      <MenuItem value="N">No</MenuItem>
                    </Select>
                    {errors.proofOfAddress && <FormHelperText>{errors.proofOfAddress.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              
              <Controller
                name="signedOfferContract"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.signedOfferContract} sx={{ mb: 1.5 }}>
                    <InputLabel>Signed Offer / Contract Submitted *</InputLabel>
                    <Select {...field} label="Signed Offer / Contract Submitted *">
                      <MenuItem value="Y">Yes</MenuItem>
                      <MenuItem value="N">No</MenuItem>
                    </Select>
                    {errors.signedOfferContract && <FormHelperText>{errors.signedOfferContract.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              
              <Controller
                name="companyRegistration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company Registration or Declaration Letter (Contractors only)"
                    disabled={engagementType === 'Employee'}
                    sx={{ mb: 1.5 }}
                    placeholder="Company Registration or Declaration Letter (Contractors only)"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        );

      case 5:
        return (
          <Box sx={{ minHeight: 400 }}>
            <Typography fontWeight={600} mb={1.5}>Declaration & Consent</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Controller
                name="informationAccurate"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="I confirm that the information provided is accurate and true. *"
                    sx={{ mb: 1.5, display: 'block' }}
                  />
                )}
              />
              {errors.informationAccurate && (
                <FormHelperText error sx={{ mb: 1.5 }}>
                  {errors.informationAccurate.message}
                </FormHelperText>
              )}
              
              <Controller
                name="consentDataProcessing"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="I consent to data processing under UK & Indian laws. *"
                    sx={{ mb: 1.5, display: 'block' }}
                  />
                )}
              />
              {errors.consentDataProcessing && (
                <FormHelperText error sx={{ mb: 1.5 }}>
                  {errors.consentDataProcessing.message}
                </FormHelperText>
              )}
              
              <Controller
                name="signature"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Signature *
                    </Typography>
                    <ReactSignatureCanvas
                      penColor="black"
                      canvasProps={{ width: 350, height: 100, className: 'sigCanvas', style: { border: '1px solid #ccc', borderRadius: 8 } }}
                      ref={ref => {
                        if (ref && field.value && ref.isEmpty()) {
                          ref.fromDataURL(field.value);
                        }
                      }}
                      onEnd={function () {
                        const canvas = this;
                        field.onChange(canvas.toDataURL());
                      }}
                      clearOnResize={false}
                    />
                    <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => {
                      const canvas = document.querySelector('.sigCanvas');
                      if (canvas) {
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        field.onChange('');
                      }
                    }}>
                      Clear
                    </Button>
                    {errors.signature && (
                      <FormHelperText error>{errors.signature.message}</FormHelperText>
                    )}
                  </Box>
                )}
              />
              
              <Controller
                name="signatureName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Name *"
                    error={!!errors.signatureName}
                    helperText={errors.signatureName?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="Name *"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="signatureDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Date *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.signatureDate}
                    helperText={errors.signatureDate?.message}
                    sx={{ mb: 1.5 }}
                    placeholder="mm/dd/yyyy"
                    slotProps={{
                      input: {
                        style: {
                          color: theme.palette.text.primary,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: theme.typography.fontSize,
                          fontWeight: theme.typography.fontWeightRegular,
                        }
                      }
                    }}
                    inputProps={{ placeholder: 'mm/dd/yyyy' }}
                  />
                )}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (submitSuccess) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Outer Card */}
        <Box
          sx={{
            position: 'relative',
            maxWidth: 1000,
            mx: 'auto',
            borderRadius: 6,
            p: 0.25,
            background: 'linear-gradient(120deg, #e0e7ff 0%, #e1bee7 50%, #ffe0f7 100%)', // lighter pastel gradient
            boxShadow: '0 4px 16px 0 rgba(118,75,162,0.08)',
            overflow: 'visible',
            mt: 2,
            border: '2.5px solid transparent',
            backgroundClip: 'padding-box, border-box',
          }}
        >
          <Paper
            elevation={4}
            sx={{
              borderRadius: 5,
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(16px)',
              p: { xs: 2, sm: 4 },
              m: 0,
              boxShadow: '0 2px 12px 0 rgba(118,75,162,0.08)',
              animation: `${fadeInUp} 0.7s cubic-bezier(0.23, 1, 0.32, 1)`,
            }}
          >
            {/* Inner Card */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: { xs: 3, sm: 4 },
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.18)',
                boxShadow: '0 2px 8px 0 rgba(118,75,162,0.06)',
              }}
            >
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  gutterBottom
                  sx={{
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: theme.typography.fontWeightBold,
                    fontSize: { xs: 24, sm: 26, md: 30 },
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 12px rgba(118,75,162,0.15)',
                    letterSpacing: 1.5,
                    mb: 1.5,
                  }}
                >
                  Employee & Contractor Engagement Form
                </Typography>
              </Box>
              {/* Responsive Stepper for all devices, including iPad Air/Mini portrait */}
              <Box sx={{ mb: 4 }}>
                {isVerticalStepper ? (
                  <Stepper activeStep={activeStep} orientation="vertical" sx={{
                    '& .MuiStepLabel-label': {
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: theme.typography.fontWeightMedium,
                      fontSize: isXs ? 11 : isSm ? 13 : 14,
                      transition: 'color 0.3s',
                    },
                    '& .MuiStepLabel-root.Mui-completed .MuiStepLabel-label': {
                      color: '#a3f7bf',
                      textDecoration: 'underline',
                      opacity: 0.85,
                    },
                    '& .MuiStepLabel-root.Mui-active .MuiStepLabel-label': {
                      color: '#764ba2',
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    },
                    '& .MuiStepIcon-root': {
                      fontSize: isXs ? 18 : isSm ? 22 : 24,
                      background: 'linear-gradient(120deg, #e0e7ff 0%, #e1bee7 50%, #ffe0f7 100%)',
                      borderRadius: '50%',
                      color: '#fff',
                      boxShadow: '0 1px 4px 0 rgba(118,75,162,0.10)',
                      transition: 'box-shadow 0.3s',
                    },
                    '& .MuiStepIcon-root.Mui-completed': {
                      color: '#43e97b',
                      animation: `${glow} 1.2s ease-in-out infinite`,
                    },
                    mb: 2
                  }}>
                    {steps.map((label, index) => (
                      <Step key={label} completed={index < activeStep}>
                        <StepLabel
                          icon={index < activeStep ? <CheckCircle style={{ color: '#43e97b', filter: 'drop-shadow(0 0 8px #a3f7bf)' }} /> : stepIcons[index]}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                ) : (
                  <Stepper activeStep={activeStep} alternativeLabel sx={{
                    '& .MuiStepLabel-label': {
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: theme.typography.fontWeightMedium,
                      fontSize: isMd ? 14 : isLg ? 16 : 15,
                      transition: 'color 0.3s',
                    },
                    '& .MuiStepLabel-root.Mui-completed .MuiStepLabel-label': {
                      color: '#a3f7bf',
                      textDecoration: 'underline',
                      opacity: 0.85,
                    },
                    '& .MuiStepLabel-root.Mui-active .MuiStepLabel-label': {
                      color: '#764ba2',
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    },
                    '& .MuiStepIcon-root': {
                      fontSize: isMd ? 22 : isLg ? 28 : 24,
                      background: 'linear-gradient(120deg, #e0e7ff 0%, #e1bee7 50%, #ffe0f7 100%)',
                      borderRadius: '50%',
                      color: '#fff',
                      boxShadow: '0 1px 4px 0 rgba(118,75,162,0.10)',
                      transition: 'box-shadow 0.3s',
                    },
                    '& .MuiStepIcon-root.Mui-completed': {
                      color: '#43e97b',
                      animation: `${glow} 1.2s ease-in-out infinite`,
                    },
                    mb: 2
                  }}>
                    {steps.map((label, index) => (
                      <Step key={label} completed={index < activeStep}>
                        <StepLabel
                          icon={index < activeStep ? <CheckCircle style={{ color: '#43e97b', filter: 'drop-shadow(0 0 8px #a3f7bf)' }} /> : stepIcons[index]}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                )}
              </Box>
              <Card elevation={0} sx={{ bgcolor: 'grey.50', mb: 4, borderRadius: 3, boxShadow: '0 2px 12px 0 rgba(118,75,162,0.08)' }}>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {renderStepContent()}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        variant="outlined"
                        size="large"
                        sx={{ minWidth: 120, boxShadow: '0 2px 8px 0 rgba(118,75,162,0.10)' }}
                      >
                        Back
                      </Button>
                      {activeStep === steps.length - 1 ? (
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={isSubmitting}
                          sx={{ minWidth: 120, boxShadow: '0 2px 8px 0 rgba(118,75,162,0.10)' }}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Form'}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          variant="contained"
                          size="large"
                          sx={{ minWidth: 120, boxShadow: '0 2px 8px 0 rgba(118,75,162,0.10)' }}
                        >
                          Continue
                        </Button>
                      )}
                    </Box>
                  </form>
                </CardContent>
              </Card>
            </Paper>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Outer Card */}
    
          {/* Inner Card */}
          <Paper
            elevation={4}
            sx={{
              borderRadius: 4,
              p: { xs: 3, sm: 4 },
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              boxShadow: '0 2px 8px 0 rgba(118,75,162,0.06)',
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: theme.typography.fontWeightBold,
                  fontSize: { xs: 18, sm: 22, md: 26 },
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 12px rgba(118,75,162,0.15)',
                  letterSpacing: 1.5,
                  mb: 1.5,
                }}
              >
                Employee & Contractor Engagement Form
              </Typography>
            </Box>
            {/* Responsive Stepper for all devices, including iPad Air/Mini portrait */}
            <Box sx={{ mb: 4 }}>
              {isVerticalStepper ? (
                <Stepper activeStep={activeStep} orientation="vertical" sx={{
                  '& .MuiStepLabel-label': {
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: theme.typography.fontWeightMedium,
                    fontSize: isXs ? 11 : isSm ? 13 : 14,
                    transition: 'color 0.3s',
                  },
                  '& .MuiStepLabel-root.Mui-completed .MuiStepLabel-label': {
                    color: '#a3f7bf',
                    textDecoration: 'underline',
                    opacity: 0.85,
                  },
                  '& .MuiStepLabel-root.Mui-active .MuiStepLabel-label': {
                    color: '#764ba2',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  },
                  '& .MuiStepIcon-root': {
                    fontSize: isXs ? 18 : isSm ? 22 : 24,
                    background: 'linear-gradient(120deg, #e0e7ff 0%, #e1bee7 50%, #ffe0f7 100%)',
                    borderRadius: '50%',
                    color: '#fff',
                    boxShadow: '0 1px 4px 0 rgba(118,75,162,0.10)',
                    transition: 'box-shadow 0.3s',
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: '#43e97b',
                    animation: `${glow} 1.2s ease-in-out infinite`,
                  },
                  mb: 2
                }}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel icon={index < activeStep ? <CheckCircle style={{ color: '#43e97b', filter: 'drop-shadow(0 0 8px #a3f7bf)' }} /> : stepIcons[index]}>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              ) : (
                <Stepper activeStep={activeStep} alternativeLabel sx={{
                  '& .MuiStepLabel-label': {
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: theme.typography.fontWeightMedium,
                    fontSize: isMd ? 14 : isLg ? 16 : 15,
                    transition: 'color 0.3s',
                  },
                  '& .MuiStepLabel-root.Mui-completed .MuiStepLabel-label': {
                    color: '#a3f7bf',
                    textDecoration: 'underline',
                    opacity: 0.85,
                  },
                  '& .MuiStepLabel-root.Mui-active .MuiStepLabel-label': {
                    color: '#764ba2',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  },
                  '& .MuiStepIcon-root': {
                    fontSize: isMd ? 22 : isLg ? 28 : 24,
                    background: 'linear-gradient(120deg, #e0e7ff 0%, #e1bee7 50%, #ffe0f7 100%)',
                    borderRadius: '50%',
                    color: '#fff',
                    boxShadow: '0 1px 4px 0 rgba(118,75,162,0.10)',
                    transition: 'box-shadow 0.3s',
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: '#43e97b',
                    animation: `${glow} 1.2s ease-in-out infinite`,
                  },
                  mb: 2
                }}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel icon={index < activeStep ? <CheckCircle style={{ color: '#43e97b', filter: 'drop-shadow(0 0 8px #a3f7bf)' }} /> : stepIcons[index]}>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}
            </Box>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', mb: 4, borderRadius: 3, boxShadow: '0 2px 12px 0 rgba(118,75,162,0.08)' }}>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {renderStepContent()}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      variant="outlined"
                      size="large"
                      sx={{ minWidth: 120, boxShadow: '0 2px 8px 0 rgba(118,75,162,0.10)' }}
                    >
                      Back
                    </Button>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        sx={{ minWidth: 120, boxShadow: '0 2px 8px 0 rgba(118,75,162,0.10)' }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Form'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        variant="contained"
                        size="large"
                        sx={{ minWidth: 120, boxShadow: '0 2px 8px 0 rgba(118,75,162,0.10)' }}
                      >
                        Continue
                      </Button>
                    )}
                  </Box>
                </form>
              </CardContent>
            </Card>
        </Paper>
    </Container>
  );
}