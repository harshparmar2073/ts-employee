import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useToast } from "../context/ToastContext";
import {
  Autocomplete,
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  InfoOutlined as InfoOutlinedIcon,
  CancelOutlined as CancelOutlinedIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import FlagsSelect from "react-flags-select";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "react-phone-number-input/style.css";
import ControlledPhoneInput from "../components/forms/ControlledPhoneInput";
import { useQuery } from '@tanstack/react-query';
import axiosService from "../services/axiosService";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman & Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const indianDocumentTypes = [
  "Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID"
];

function getValidationSchema() {
  return yup.object({
    firstName: yup.string().optional(),
    middleName: yup.string().nullable().optional(),
    lastName: yup.string().optional(),
    dateOfBirth: yup.date().nullable().optional(),
    privateMobile: yup.string().optional(),
    photoUrl: yup.string().nullable().optional(),
    email: yup.string().email().optional(),
    timezone: yup.string().optional(),
    emergencyContacts: yup.array().optional(),
    identificationDocuments: yup.array().optional(),
    customFields: yup.array().optional(),
    jobTitle: yup.string().optional(),
    contractType: yup.string().optional(),
    workStartTime: yup.date().nullable().optional(),
    workEndTime: yup.date().nullable().optional(),
    dateOfJoining: yup.date().nullable().optional(),
    dateOfExit: yup.date().nullable().optional(),
    workLocation: yup.string().optional(),
    accountStatus: yup.string().optional(),
    salaryCurrency: yup.string().optional(),
    salaryAmount: yup.number().nullable().optional(),
    paymentFrequency: yup.string().optional(),
    bankName: yup.string().optional(),
    bankAccountNumber: yup.string().nullable().optional(),
    bankRoutingNumber: yup.string().nullable().optional(),
    addressLine1: yup.string().optional(),
    addressLine2: yup.string().nullable().optional(),
    addressLine3: yup.string().nullable().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    postcode: yup.string().optional(),
    country: yup.string().optional(),
    latitude: yup.number().nullable().optional(),
    longitude: yup.number().nullable().optional(),
  });
}

const contractTypeOptions = ["Employed", "Contractor", "Intern"];
const salaryCurrencyOptions = ["USD", "GBP", "EUR", "INR"];
const paymentFrequencyOptions = ["Monthly", "Bi-Weekly", "Weekly"];
const workLocationOptions = ["London Office", "India Office", "Remote - work from home"];

// Helpers to parse flat API fields into structured form
const parseAddress = (addressStr) => {
  if (!addressStr || typeof addressStr !== 'string') return {};
  try {
    const parts = addressStr.split(',').map(p => p.trim());
    const latPart = parts.find(p => /^Latitude\s*:/i.test(p));
    const lngPart = parts.find(p => /^Longitude\s*:/i.test(p));
    const latitude = latPart ? parseFloat(latPart.split(':')[1]) : null;
    const longitude = lngPart ? parseFloat(lngPart.split(':')[1]) : null;

    const core = parts.filter(p => !/^Latitude\s*:/i.test(p) && !/^Longitude\s*:/i.test(p));
    const country = core.length >= 1 ? core[core.length - 1] || '' : '';
    const postcode = core.length >= 2 ? core[core.length - 2] || '' : '';
    const state = core.length >= 3 ? core[core.length - 3] || '' : '';
    const city = core.length >= 4 ? core[core.length - 4] || '' : '';
    const rem = core.slice(0, core.length - 4);
    const addressLine1 = rem[0] || '';
    const addressLine2 = rem[1] || '';
    const addressLine3 = rem[2] || '';
    return { addressLine1, addressLine2, addressLine3, city, state, postcode, country, latitude, longitude };
  } catch {
    return {};
  }
};

const parseEmergencyContacts = (ecStr) => {
  if (!ecStr) return [];
  return ecStr.split(';').map(s => s.trim()).filter(Boolean).map(s => {
    const [namePart, phonePart] = s.split(':');
    return { name: (namePart || '').trim(), phone: (phonePart || '').trim() };
  }).filter(c => c.name || c.phone);
};

const parseIdentityDocuments = (idStr) => {
  if (!idStr) return [];
  return idStr.split(';').map(s => s.trim()).filter(Boolean).map(s => {
    const [typePart, numPart] = s.split(':');
    return {
      documentType: (typePart || '').trim() || 'Aadhaar Card',
      documentNumber: (numPart || '').trim(),
      documentFile: null,
    };
  }).filter(d => d.documentType || d.documentNumber);
};

const getCallingCode = (iso) => {
  if (!iso) return '';
  const map = { IN: '91', US: '1', GB: '44' };
  return map[iso.toUpperCase()] || '';
};

const toNational = (iso, number) => {
  if (!number) return '';
  const digits = String(number).replace(/\D/g, '');
  const code = getCallingCode(iso);
  if (code && digits.startsWith(code)) {
    return digits.slice(code.length);
  }
  return digits;
};

const ensureE164 = (iso, number) => {
  if (!number) return '';
  if (String(number).startsWith('+')) return number;
  const code = getCallingCode(iso);
  return code ? `+${code}${String(number).replace(/\D/g, '')}` : number;
};

const EmployeeDetailsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast } = useToast();
  const [openPhotoPreview, setOpenPhotoPreview] = useState(false);
  const [openDocumentPreview, setOpenDocumentPreview] = useState(false);
  const [currentDocumentPreview, setCurrentDocumentPreview] = useState(null);
  const [timezones, setTimezones] = useState([]);

  const {
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getValidationSchema()),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      timezone: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      state: "",
      city: "",
      postcode: "",
      country: "IN",
      emergencyContacts: [{ name: "", phone: "" }],
      identificationDocuments: [
        { documentType: "Aadhaar Card", documentNumber: "", documentFile: null },
        { documentType: "PAN Card", documentNumber: "", documentFile: null },
      ],
      customFields: [],
      dateOfBirth: null,
      privateMobile: "",
      photoUrl: "",
      jobTitle: "",
      contractType: "",
      workStartTime: null,
      workEndTime: null,
      dateOfJoining: null,
      dateOfExit: null,
      workLocation: "",
      accountStatus: "Active",
      salaryCurrency: "INR",
      salaryAmount: "",
      paymentFrequency: "Monthly",
      bankName: "",
      bankAccountNumber: "",
      bankRoutingNumber: "",
      latitude: null,
      longitude: null,
    },
  });

  const formData = watch();

  const { fields: emergencyContactsFields } = useFieldArray({
    control,
    name: "emergencyContacts",
  });
  
  const { fields: identificationDocumentsFields } = useFieldArray({
    control,
    name: "identificationDocuments",
  });

  const currentSalaryCurrency = watch("salaryCurrency");

  // Fetch current employee details
  const { data: employeeData, isLoading: isEmployeeLoading, isError: isEmployeeError } = useQuery({
    queryKey: ['employee-me'],
    queryFn: async () => {
      const res = await axiosService.get('/employees/me');
      return res.data;
    },
  });

  useEffect(() => {
    const tzList = Intl.supportedValuesOf("timeZone");
    setTimezones(tzList);
  }, []);

  useEffect(() => {
    if (!employeeData) return;
    
    try {
      const src = employeeData;
      // Address parsing fallback
      const addrParsed = (!src.addressLine1 && typeof src.address === 'string') ? parseAddress(src.address) : {};
      // Emergency contacts parsing fallback
      const ecParsed = Array.isArray(src.emergencyContacts) && src.emergencyContacts.length
        ? src.emergencyContacts
        : parseEmergencyContacts(src.emergencyContact);
      // Identity documents parsing fallback
      const idParsed = Array.isArray(src.identificationDocuments) && src.identificationDocuments.length
        ? src.identificationDocuments.map(d => ({
            documentType: d.documentType ?? 'Aadhaar Card',
            documentNumber: d.documentNumber ?? '',
            documentFile: d.documentFile ?? null,
          }))
        : parseIdentityDocuments(src.identityDocuments);

      const mapped = {
        firstName: src.firstName ?? "",
        middleName: src.middleName ?? "",
        lastName: src.lastName ?? "",
        email: src.email ?? src.authUser ?? "",
        timezone: src.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        addressLine1: src.addressLine1 ?? src.address?.line1 ?? addrParsed.addressLine1 ?? "",
        addressLine2: src.addressLine2 ?? src.address?.line2 ?? addrParsed.addressLine2 ?? "",
        addressLine3: src.addressLine3 ?? src.address?.line3 ?? addrParsed.addressLine3 ?? "",
        state: src.state ?? src.address?.state ?? addrParsed.state ?? "",
        city: src.city ?? src.address?.city ?? addrParsed.city ?? "",
        postcode: src.postcode ?? src.address?.postcode ?? addrParsed.postcode ?? "",
        country: src.country ?? src.address?.country ?? addrParsed.country ?? "IN",
        dateOfBirth: src.dateOfBirth ? new Date(src.dateOfBirth) : null,
        privateMobile: ensureE164((src.country ?? src.address?.country ?? addrParsed.country ?? "IN"), src.privateMobile ?? src.mobileNumber ?? ""),
        photoUrl: src.photoUrl ?? "",
        jobTitle: src.jobTitle ?? "",
        contractType: src.contractType ?? "",
        workStartTime: src.workStartTime ? new Date(`2000-01-01T${src.workStartTime}`) : null,
        workEndTime: src.workEndTime ? new Date(`2000-01-01T${src.workEndTime}`) : null,
        dateOfJoining: src.dateOfJoining ? new Date(src.dateOfJoining) : null,
        dateOfExit: src.dateOfExit ? new Date(src.dateOfExit) : null,
        workLocation: src.workLocation ?? "",
        accountStatus: src.accountStatus ?? "Active",
        salaryCurrency: src.salaryCurrency ?? "INR",
        salaryAmount: src.salaryAmount ?? "",
        paymentFrequency: src.paymentFrequency ?? "Monthly",
        bankName: src.bankName ?? "",
        bankAccountNumber: src.bankAccountNumber ?? "",
        bankRoutingNumber: src.bankRoutingNumber ?? "",
        latitude: src.latitude ?? addrParsed.latitude ?? null,
        longitude: src.longitude ?? addrParsed.longitude ?? null,
        emergencyContacts: ecParsed.length ? ecParsed : [{ name: "", phone: "" }],
        identificationDocuments: idParsed.length ? idParsed : [
          { documentType: "Aadhaar Card", documentNumber: "", documentFile: null },
          { documentType: "PAN Card", documentNumber: "", documentFile: null }
        ],
      };
      reset(mapped, { keepDefaultValues: true });
    } catch (e) {
      console.error("Error mapping employee data:", e);
      showToast("Error loading employee data", "error");
    }
  }, [employeeData, reset, showToast]);

  if (isEmployeeLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading employee details…</Typography>
      </Box>
    );
  }

  if (isEmployeeError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h6" color="error">Failed to load employee details</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
        padding: { xs: 1, sm: 2 },
        overflow: "auto",
      }}
    >
      <style>{`
        .read-only-mode .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline,
        .read-only-mode .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #e0e0e0 !important;
          box-shadow: none !important;
        }
        .read-only-mode .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
          border-color: #e0e0e0 !important;
        }
        .read-only-mode input::placeholder,
        .read-only-mode textarea::placeholder,
        .read-only-mode .MuiAutocomplete-input::placeholder,
        .read-only-mode .PhoneInputInput::placeholder,
        .read-only-mode .MuiInputBase-input::placeholder,
        .read-only-mode .MuiOutlinedInput-input::placeholder {
          color: #bdbdbd !important;
          opacity: 1 !important;
        }
        .read-only-mode .MuiSelect-select.Mui-disabled {
          color: rgba(0, 0, 0, 0.87) !important;
          -webkit-text-fill-color: rgba(0, 0, 0, 0.87) !important;
          opacity: 1 !important;
          background-color: inherit !important;
        }
        .read-only-mode .MuiSelect-icon {
          color: rgba(0, 0, 0, 0.54) !important;
          display: none !important;
        }
        .read-only-mode .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline {
          border-color: #e0e0e0 !important;
        }
        .read-only-mode .MuiOutlinedInput-root input[readOnly] {
         background-color: inherit !important;
        }
        .read-only-mode .MuiMenuItem-root:hover,
        .read-only-mode .MuiMenuItem-root.Mui-selected,
        .read-only-mode .MuiMenuItem-root.Mui-focusVisible,
        .read-only-mode .MuiMenuItem-root.Mui-selected.Mui-focusVisible,
        .read-only-mode .MuiMenuItem-root.Mui-selected:hover,
        .read-only-mode .MuiAutocomplete-option:hover,
        .read-only-mode .MuiAutocomplete-option.Mui-focused,
        .read-only-mode .MuiAutocomplete-option[aria-selected="true"],
        .read-only-mode .MuiAutocomplete-option[aria-selected="true"].Mui-focused,
        .read-only-mode .MuiAutocomplete-option[aria-selected="true"]:hover {
          background-color: transparent !important;
          color: inherit !important;
        }
        .read-only-mode .MuiPopover-root,
        .read-only-mode .MuiMenuItem-root,
        .read-only-mode .MuiAutocomplete-popper,
        .read-only-mode .MuiAutocomplete-option,
        .read-only-mode .MuiSelect-select,
        .read-only-mode .FlagsSelect__option,
        .read-only-mode .MuiInputLabel-root,
        .read-only-mode .MuiAutocomplete-root .MuiInputBase-root,
        .read-only-mode .ReactFlagsSelect-module_selectBtn__19wW7,
        .read-only-mode .PhoneInputInput {
          pointer-events: none !important;
          cursor: default !important;
        }
        .read-only-mode .PhoneInputCountrySelect {
          pointer-events: none !important; /* Ensure the actual select is not interactive */
          cursor: default !important;
          background-color: transparent !important; /* Prevent any background overlay */
          border: none !important; /* Remove any borders */
        }
        .read-only-mode .PhoneInputCountrySelectArrow {
          display: none !important; /* Hide the dropdown arrow */
        }
        .read-only-mode .PhoneInputCountryIcon {
          display: inline-block !important; /* Ensure flag is always visible */
          visibility: visible !important;
          opacity: 1 !important;
        }
        .read-only-mode .PhoneInputCountryIcon img {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .read-only-mode .PhoneInputCountry--disabled {
          opacity: 1 !important; /* Maintain full opacity for the country section */
        }
        // .read-only-mode .MuiSelect-select:hover {
        //   background-color: transparent !important;
        //   cursor: default !important;
        // }
        .read-only-mode .MuiInputBase-root.Mui-disabled,
        .read-only-mode .MuiInputBase-root.Mui-readOnly,
        .read-only-mode .MuiOutlinedInput-root.Mui-disabled,
        .read-only-mode .MuiOutlinedInput-root.Mui-readOnly {
          background-color: inherit !important;
        }
        .read-only-mode .MuiInputLabel-root {
          color: rgba(0, 0, 0, 0.6) !important;
          -webkit-text-fill-color: rgba(0, 0, 0, 0.6) !important;
        }
        .read-only-mode label[for^="photo-upload"],
        .read-only-mode label[for^="document-upload-"] {
          pointer-events: none !important;
          cursor: default !important;
          background-color: inherit !important;
        }
        .read-only-mode label[for^="photo-upload"] .MuiButton-root,
        .read-only-mode label[for^="document-upload-"] .MuiButton-root {
          color: rgba(0, 0, 0, 0.54) !important;
        }
        .read-only-mode label[for^="photo-upload"] .MuiSvgIcon-root,
        .read-only-mode label[for^="document-upload-"] .MuiSvgIcon-root {
          color: rgba(0, 0, 0, 0.54) !important;
        }
        .read-only-mode .MuiInputBase-root input:hover,
        .read-only-mode .MuiInputBase-root textarea:hover,
        .read-only-mode .MuiOutlinedInput-root:hover {
          cursor: default !important;
          background-color: transparent !important;
        }
        .read-only-mode .MuiOutlinedInput-notchedOutline {
          border-color: rgba(0, 0, 0, 0.23) !important;
        }
        .read-only-mode .PhoneInputCountry {
          display: flex !important;
          opacity: 1 !important;
          pointer-events: none !important; /* Country selector itself should not be interactive */
          cursor: default !important;
        }
        .read-only-mode .PhoneInputCountryIcon {
          display: inline-block !important; /* Ensure the icon container is visible */
        }
        .read-only-mode .PhoneInputCountryIcon img,
        .read-only-mode .PhoneInputCountryIcon svg {
          display: block !important; /* Ensure the flag image/svg is visible */
          visibility: visible !important;
        }
        .read-only-mode .PhoneInputCountrySelectArrow {
          display: none !important; /* Hide the dropdown arrow if not desired */
        }
        .read-only-mode .PhoneInputInternationalIconPhone {
          display: inline-block !important;
        }
      `}</style>
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
        <Card
          elevation={0}
          sx={{
            mx: "auto",
            borderRadius: { xs: 1, sm: 2 },
            position: "relative",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }} className="read-only-mode">
            {/* Title */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 2
                }}
              >
                Employee Details
              </Typography>
            </Box>

            {/* Personal Information */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="personal-information-content"
                id="personal-information-header"
                sx={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(180deg)' },
                  '& .MuiAccordionSummary-content': { marginLeft: theme.spacing(1) },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    fontSize: { xs: 16, sm: 18 }
                  }}
                >
                  Personal Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 32%" }, minWidth: 0 }}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="First Name"
                          placeholder="First Name"
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 32%" }, minWidth: 0 }}>
                    <Controller
                      name="middleName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Middle Name"
                          placeholder="Middle Name"
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 32%" }, minWidth: 0 }}>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Last Name"
                          placeholder="Last Name"
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                          <DatePicker
                            {...field}
                            value={field.value || null}
                            label="Date of Birth"
                            format="dd/MM/yyyy"
                            readOnly
                            slotProps={{
                              textField: {
                                sx: { '& .MuiOutlinedInput-root': { height: 56 } },
                                fullWidth: true,
                                InputProps: { readOnly: true },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="privateMobile"
                      control={control}
                      render={({ field: { value, ...field } }) => (
                        <ControlledPhoneInput
                          key={`emp-phone-${formData.country || 'IN'}-ro`}
                          {...field}
                          name="privateMobile"
                          label="Mobile Number"
                          control={control}
                          defaultCountry={formData.country || 'IN'}
                          value={value}
                          errors={errors}
                          disabled={true} // This will disable the input in read-only mode
                          international={true} // Ensure country code is shown
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="photoUrl"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth sx={{ mb: 1.5, height: 56 }}>
                          <label style={{ height: '100%', display: 'flex', alignItems: 'center', border: '1px solid #c4c4c4', borderRadius: 4, padding: '0 14px', cursor: 'default', backgroundColor: '#fff', opacity: 0.7 }}>
                            <Button variant="text" component="span" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', color: '#555' }} disabled>
                              {field.value ? "Photo Uploaded" : "No Photo"}
                            </Button>
                            {field.value && (
                              <Box sx={{ ml: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => { e.preventDefault(); setOpenPhotoPreview(true); }}
                                  sx={{ color: theme.palette.primary.main }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Box>
                            )}
                          </label>
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Login / Email and Timezone */}
            <Accordion sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="login-content"
                id="login-header"
                sx={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(180deg)' },
                  '& .MuiAccordionSummary-content': { marginLeft: theme.spacing(1) },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    fontSize: { xs: 16, sm: 18 }
                  }}
                >
                  Login
				  </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <Box sx={{ mb: 2 }}>
                  <Alert severity="info" variant="outlined" sx={{ borderRadius: 2, borderColor: theme.palette.secondary.main, color: theme.palette.text.primary }}>
                    <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Two-factor authentication is enabled by default. A security code will be emailed to your username (<strong>email</strong>) when logging in.
                    </Typography>
                  </Alert>
                </Box>
                <Dialog open={openPhotoPreview} onClose={() => setOpenPhotoPreview(false)} maxWidth="md" fullWidth>
                  <DialogTitle>Photo Preview</DialogTitle>
                  <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                      <Box component="img" src={watch("photoUrl")} alt="Uploaded Photo" sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
                    </Box>
                  </DialogContent>
                </Dialog>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Email"
                      type="email"
                      InputProps={{ readOnly: true }}
                      sx={{ mb: 1.5 }}
                    />
                  )}
                />
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ mt: 1.5, mb: 1.5, '& .MuiOutlinedInput-root': { height: 56 } }}>
                      <InputLabel>Timezone</InputLabel>
                      <Select {...field} label="Timezone" disabled MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                        {timezones.map((tz) => (
                          <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </AccordionDetails>
            </Accordion>

            {/* Employment Details */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="employment-details-content"
                id="employment-details-header"
                sx={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(180deg)' },
                  '& .MuiAccordionSummary-content': { marginLeft: theme.spacing(1) },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    fontSize: { xs: 16, sm: 18 }
                  }}
                >
                  Employment Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="jobTitle"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Job Title"
                          placeholder="e.g., Sr. Software Engineer"
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="contractType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                          <InputLabel>Contract Type</InputLabel>
                          <Select {...field} label="Contract Type" disabled MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                            {contractTypeOptions.map((option) => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="workStartTime"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Work Start Time"
                          type="time"
                          InputLabelProps={{ shrink: true }}
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                          value={field.value ? new Date(field.value).toTimeString().slice(0, 5) : ''}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="workEndTime"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Work End Time"
                          type="time"
                          InputLabelProps={{ shrink: true }}
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                          value={field.value ? new Date(field.value).toTimeString().slice(0, 5) : ''}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="dateOfJoining"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                          <DatePicker
                            {...field}
                            value={field.value || null}
                            label="Date of Joining"
                            format="dd/MM/yyyy"
                            readOnly
                            slotProps={{
                              textField: {
                                sx: { '& .MuiOutlinedInput-root': { height: 56 } },
                                fullWidth: true,
                                InputProps: { readOnly: true },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="dateOfExit"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                          <DatePicker
                            {...field}
                            value={field.value || null}
                            label="Date of Exit"
                            format="dd/MM/yyyy"
                            readOnly
                            slotProps={{
                              textField: {
                                sx: { '& .MuiOutlinedInput-root': { height: 56 } },
                                fullWidth: true,
                                InputProps: { readOnly: true },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="workLocation"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                          <InputLabel>Work Location</InputLabel>
                          <Select {...field} label="Work Location" disabled MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                            {workLocationOptions.map((option) => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="accountStatus"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                          <InputLabel>Account Status</InputLabel>
                          <Select {...field} label="Account Status" disabled MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                            <MenuItem value="Active">Active</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Salary & Bank Details */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="salary-bank-details-content"
                id="salary-bank-details-header"
                sx={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(180deg)' },
                  '& .MuiAccordionSummary-content': { marginLeft: theme.spacing(1) },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    fontSize: { xs: 16, sm: 18 }
                  }}
                >
                  Salary & Bank Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    mt: 2,
                    mb: 1,
                    fontSize: { xs: 12, sm: 14 },
                  }}
                >
                  Compensation
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="salaryCurrency"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                          <InputLabel>Salary Currency</InputLabel>
                          <Select {...field} label="Salary Currency" disabled MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                            {salaryCurrencyOptions.map((option) => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="salaryAmount"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Salary Amount"
                          placeholder="e.g., 100000"
                          type="number"
                          InputProps={{
                            startAdornment: currentSalaryCurrency ? (
                              <Typography variant="body1" sx={{ mr: 1 }}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentSalaryCurrency }).formatToParts(1).find(part => part.type === 'currency').value}
                              </Typography>
                            ) : null,
                            readOnly: true,
                          }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="paymentFrequency"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                          <InputLabel>Payment Frequency</InputLabel>
                          <Select {...field} label="Payment Frequency" disabled MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                            {paymentFrequencyOptions.map((option) => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    mt: 2,
                    mb: 1,
                    fontSize: { xs: 12, sm: 14 },
                  }}
                >
                  Bank Information
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="bankName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Bank Name"
                          placeholder="e.g., Bank of America"
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="bankAccountNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Bank Account Number"
                          placeholder="e.g., 123456789"
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                    <Controller
                      name="bankRoutingNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Bank Routing Number (Optional)"
                          placeholder="e.g., 123456789"
                          type="number"
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiInputBase-root': { height: 56 } }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Address Information */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="address-information-content"
                id="address-information-header"
                sx={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(180deg)' },
                  '& .MuiAccordionSummary-content': { marginLeft: theme.spacing(1) },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    fontSize: { xs: 16, sm: 18 },
                  }}
                >
                  Current Address
                  <Tooltip title="Please ensure all address fields are accurately completed." arrow>
                    <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: 18 }} />
                  </Tooltip>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <Box sx={{ mb: 2 }}>
                  <Controller
                    name="addressLine1"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Address Line 1"
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />
                  <Controller
                    name="addressLine2"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Address Line 2 (Optional)"
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />
                  <Controller
                    name="addressLine3"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Address Line 3 (Optional)"
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}>
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            options={indianStates}
                            disabled
                            disableClearable
                            PopperProps={{ placement: "bottom-start" }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                placeholder="State"
                                InputProps={{ ...params.InputProps, readOnly: true }}
                              />
                            )}
                            sx={{ mb: 1.5 }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="City"
                            InputProps={{ readOnly: true }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}>
                      <Controller
                        name="postcode"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="Postcode"
                            InputProps={{ readOnly: true }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Box sx={{ mb: 1.5 }}>
                            <FlagsSelect
                              selected={field.value}
                              placeholder="Select Country"
                              searchable={false}
                              alignOptionsToRight={false}
                              showSelectedLabel={true}
                              showOptionLabel={true}
                              fullWidth
                              selectedSize={theme.typography.fontSize}
                              optionsSize={theme.typography.fontSize}
                              className="mui-flags-select"
                              disabled
                              style={{
                                width: '100%',
                                height: 56,
                                borderRadius: 8,
                                fontFamily: theme.typography.fontFamily,
                                fontSize: theme.typography.fontSize,
                                fontWeight: theme.typography.fontWeightRegular,
                                background: '#fff',
                                border: '1.5px solid #c4c4c4',
                                paddingLeft: 14,
                                paddingRight: 14,
                                display: 'flex',
                                alignItems: 'center',
                                boxSizing: 'border-box',
                                opacity: 0.7,
                                pointerEvents: 'none',
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
                                opacity: 0.7 !important;
                                pointer-events: none !important;
                              }
                            `}</style>
                          </Box>
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}>
                      <Controller
                        name="latitude"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Latitude"
                            placeholder="e.g., 34.0522"
                            type="number"
                            InputProps={{ readOnly: true }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}>
                      <Controller
                        name="longitude"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Longitude"
                            placeholder="e.g., -118.2437"
                            type="number"
                            InputProps={{ readOnly: true }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Custom Section */}
            <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="custom-section-content"
                id="custom-section-header"
                sx={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(180deg)' },
                  '& .MuiAccordionSummary-content': { marginLeft: theme.spacing(1) },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    fontSize: { xs: 16, sm: 18 }
                  }}
                >
                  Custom Section
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <Box sx={{ mb: 2 }}>
                  {/* Identification Documents */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: theme.typography.fontWeightBold,
                        fontFamily: theme.typography.fontFamily,
                        color: theme.palette.text.primary,
                        mb: 1.5,
                        fontSize: { xs: 12, sm: 14 },
                      }}
                    >
                      Identification Documents
                    </Typography>
                    {identificationDocumentsFields.map((item, index) => (
                      <Box key={item.id} sx={{ mb: index < identificationDocumentsFields.length - 1 ? 2 : 0 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" } }}>
                            <Controller
                              name={`identificationDocuments.${index}.documentType`}
                              control={control}
                              render={({ field }) => (
                                <Autocomplete
                                  {...field}
                                  options={indianDocumentTypes}
                                  disabled
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      placeholder="Document Type"
                                      InputProps={{ ...params.InputProps, readOnly: true }}
                                      sx={{ '& .MuiInputBase-root': { height: 56 } }}
                                    />
                                  )}
                                  disableClearable
                                  sx={{ mb: 1.5 }}
                                />
                              )}
                            />
                          </Box>
                          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" } }}>
                            <Controller
                              name={`identificationDocuments.${index}.documentNumber`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  placeholder="Document Number"
                                  InputProps={{ readOnly: true }}
                                  sx={{ '& .MuiInputBase-root': { height: 56 } }}
                                />
                              )}
                            />
                          </Box>
                          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" } }}>
                            <Controller
                              name={`identificationDocuments.${index}.documentFile`}
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth sx={{ height: 56 }}>
                                  <label style={{ height: '100%', display: 'flex', alignItems: 'center', border: '1px solid #c4c4c4', borderRadius: 4, padding: '0 14px', cursor: 'default', backgroundColor: '#fff', opacity: 0.7 }}>
                                    <Button variant="text" component="span" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', color: '#555' }} disabled>
                                      {field.value ? "File Uploaded" : "No File"}
                                    </Button>
                                    {field.value && (
                                      <Box sx={{ ml: 1 }}>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => { e.preventDefault(); setCurrentDocumentPreview(field.value); setOpenDocumentPreview(true); }}
                                          sx={{ color: theme.palette.primary.main }}
                                        >
                                          <VisibilityIcon />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </label>
                                </FormControl>
                              )}
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Emergency Contact Information */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: theme.typography.fontWeightBold,
                        fontFamily: theme.typography.fontFamily,
                        color: theme.palette.text.primary,
                        mb: 1.5,
                        fontSize: { xs: 12, sm: 14 },
                      }}
                    >
                      Emergency Contact
                    </Typography>
                    {emergencyContactsFields.map((item, index) => (
                      <Box key={item.id} sx={{ mb: index < emergencyContactsFields.length - 1 ? 2 : 0 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                            <Controller
                              name={`emergencyContacts.${index}.name`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  placeholder="Contact Name"
                                  InputProps={{ readOnly: true }}
                                  sx={{ '& .MuiInputBase-root': { height: 56 } }}
                                />
                              )}
                            />
                          </Box>
                          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                            <Controller
                              name={`emergencyContacts.${index}.phone`}
							  control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  placeholder="Phone Number"
                                  inputProps={{ maxLength: 10 }}
                                  InputProps={{ readOnly: true }}
                                  sx={{ '& .MuiInputBase-root': { height: 56 } }}
                                />
                              )}
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Dialog open={openDocumentPreview} onClose={() => setOpenDocumentPreview(false)} maxWidth="md" fullWidth>
              <DialogTitle>Document Preview</DialogTitle>
              <DialogContent>
                {currentDocumentPreview && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    {currentDocumentPreview.startsWith('data:image') ? (
                      <Box component="img" src={currentDocumentPreview} alt="Uploaded Document" sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
                    ) : currentDocumentPreview.startsWith('data:application/pdf') ? (
                      <embed src={currentDocumentPreview} type="application/pdf" width="100%" height="500px" style={{ border: 'none' }} />
                    ) : (
                      <Typography variant="body1" color="textSecondary">No preview available for this file type.</Typography>
                    )}
                  </Box>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default EmployeeDetailsPage;