import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios"; // Changed from axiosService
axios.defaults.baseURL = 'https://api.antalyze.uk/v1'; // Set base URL for axios
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import PasswordStrengthBar from "react-password-strength-bar";
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
  Switch,
  FormControlLabel,
  IconButton,
  Grid,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Alert,
  Collapse,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Visibility,
  VisibilityOff,
  InfoOutlined as InfoOutlinedIcon,
  CancelOutlined as CancelOutlinedIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo2.png";
import companyLogo from "../assets/12springslogo.png";
import FlagsSelect from "react-flags-select";
import { SIGNUP_TYPE_OAUTH } from "../const";

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';

// Added imports for Dialog, DialogContent, DialogTitle, and VisibilityIcon
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import VisibilityIcon from '@mui/icons-material/Visibility';
// Removed: import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useMask } from '@react-input/mask'; // Import useMask from @react-input/mask

// Added for Accordion
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

function getValidationSchema({ signupType }) {
  return yup.object({
    invitationCode: yup
      .string()
      .required("Invitation code is required")
      .min(6, "Invitation code must be at least 6 characters"),

    firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
    middleName: yup.string(), // Made optional based on image
    lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
    dateOfBirth: yup.date().required("Date of birth is required").nullable(),
    privateMobile: yup.string().matches(/^[0-9]+$/, "Mobile number must be digits only").length(10, "Mobile number must be exactly 10 digits").required("Private Mobile is required"),
    photoUrl: yup.string().nullable(), // Changed to nullable string for file input
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address"),
    password: signupType !== SIGNUP_TYPE_OAUTH && yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: signupType !== SIGNUP_TYPE_OAUTH && yup.string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
    timezone: yup.string().required("Please select a timezone"),
    // Removed duplicate addressLine1 field here
    // Removed duplicate addressLine2 field here
    // Removed duplicate addressLine3 field here
    // Removed duplicate state field here
    // Removed duplicate city field here
    // Removed duplicate postcode field here
    // Removed duplicate country field here
    // Removed duplicate latitude field here
    // Removed duplicate longitude field here
    // Removed duplicate createdAt field here
    // Removed duplicate updatedAt field here
    emergencyContacts: yup.array().of( // Keeping for now, will remove from form display later
      yup.object().shape({
        name: yup.string().required("Contact name is required"),
        phone: yup.string().required("Phone number is required").matches(/^[0-9]+$/, "Phone number must be digits only"),
      })
    ).min(1, "At least one emergency contact is required"),
    identificationDocuments: yup.array().of(
      yup.object().shape({
        documentType: yup.string().required("Document type is required"),
        documentNumber: yup.string().required("Document number is required"),
        documentFile: yup.string().nullable().optional(), // Added for file upload
      })
    ).min(2, "At least two identification documents are required"),
    customFields: yup.array().of(
      yup.object().shape({
        fieldName: yup.string().required("Field name is required"),
        fieldValue: yup.string().required("Field value is required"),
      })
    ),
    jobTitle: yup.string().required("Job Title is required"),
    contractType: yup.string().required("Contract Type is required"),
    workStartTime: yup.date().required("Work Start Time is required").nullable(),
    workEndTime: yup.date().required("Work End Time is required").nullable()
      .test(
        'is-after-start',
        "End time must be after Start time",
        function (value) {
          const { workStartTime } = this.parent;
          return !workStartTime || !value || value > workStartTime;
        }
      ),
    dateOfJoining: yup.date().required("Date of Joining is required").nullable(),
    dateOfExit: yup.date().nullable()
      .test(
        'is-after-joining',
        "Exit Date must be on or after Joining Date",
        function (value) {
          const { dateOfJoining } = this.parent;
          return !dateOfJoining || !value || value >= dateOfJoining;
        }
      ),
    workLocation: yup.string().oneOf(workLocationOptions, "Invalid work location").required("Work Location is required"),
    accountStatus: yup.string().oneOf(["Active"], "Account Status can only be 'Active'").required("Account Status is required"),
    salaryCurrency: yup.string().required("Salary Currency is required"),
    salaryAmount: yup.number().required("Salary Amount is required").typeError("Salary Amount must be a number"), // Changed to number
    paymentFrequency: yup.string().required("Payment Frequency is required"),
    bankName: yup.string().required("Bank Name is required"),
    bankAccountNumber: yup.string().matches(/^[0-9]{9,17}$/, "Bank Account Number must be 9-17 digits").optional(),
    bankRoutingNumber: yup.string()
      .nullable()
      .notRequired()
      .test(
        'is-9-digits',
        "Bank Routing Number must be 9 digits",
        (value) => !value || /^[0-9]{9}$/.test(value) // Only validate if value exists
      ),
    // Address fields validation
    addressLine1: yup.string().required("Address line 1 is required"),
    addressLine2: yup.string().optional(),
    addressLine3: yup.string().optional(),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    postcode: yup.string().required("Postcode is required"),
    country: yup.string().required("Country is required"),
    latitude: yup.number().required("Latitude is required").nullable(),
    longitude: yup.number().required("Longitude is required").nullable(),
    createdAt: yup.date().nullable().optional(), // Auto-filled by backend, read-only
    updatedAt: yup.date().nullable().optional(), // Auto-updated by backend, read-only
  });
}

const contractTypeOptions = ["Employed", "Contractor", "Intern"];
const accountStatusOptions = ["Active", "Inactive", "Suspended"];
const salaryCurrencyOptions = ["USD", "GBP", "EUR", "INR"];
const paymentFrequencyOptions = ["Monthly", "Bi-Weekly", "Weekly"];

const workLocationOptions = ["London Office", "India Office", "Remote - work from home"];

const Signup = () => {
  const [params] = useSearchParams();
  const signupType = params.get("signupType");

  console.log(params);
  const [oauthSignupDetails, setOAuthSignupDetails] = useState(null);

  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md")); // isTablet is already defined, keep it.
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultTimezone, setDefaultTimezone] = useState("");

  const [openPhotoPreview, setOpenPhotoPreview] = useState(false); // State for photo preview dialog
  const [openDocumentPreview, setOpenDocumentPreview] = useState(false); // State for document preview dialog
  const [currentDocumentPreview, setCurrentDocumentPreview] = useState(null); // State to hold the document URL for preview

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(getValidationSchema({
      signupType: signupType
    })),
    mode: "onChange",
    defaultValues: {
      invitationCode: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
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
        { documentType: "Aadhaar Card", documentNumber: "", documentFile: null }, // Default to Aadhaar Card
        { documentType: "PAN Card", documentNumber: "", documentFile: null }, // Default to PAN Card
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
      workLocation: "", // Set default to empty string, or first option if desired
      accountStatus: "Active", // Default to 'Active'
      salaryCurrency: "INR", // Default value changed to INR
      salaryAmount: "",
      paymentFrequency: "Monthly", // Default value
      bankName: "",
      bankAccountNumber: "",
      bankRoutingNumber: "",
      latitude: null,
      longitude: null,
      // createdAt: null, // Added default value
      // updatedAt: null, // Added default value
    },
  });

  const { fields: emergencyContactsFields, append: appendEmergencyContact, remove: removeEmergencyContact } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const { fields: identificationDocumentsFields, append: appendIdentificationDocument, remove: removeIdentificationDocument } = useFieldArray({
    control,
    name: "identificationDocuments",
  });

  const { fields: customFieldsFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control,
    name: "customFields",
  });

  const currentPassword = watch("password");
  const currentSalaryCurrency = watch("salaryCurrency"); // Watch salary currency for dynamic symbol

  const [timezones, setTimezones] = useState([]);
  const [defaultTz, setDefaultTz] = useState("");

  // Load timezones and detect browser timezone
  useEffect(() => {
    const tzList = Intl.supportedValuesOf("timeZone");
    setTimezones(tzList);

    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDefaultTz(browserTz);

    // Set the default timezone in form after load
    setValue("timezone", browserTz);
  }, [setValue]);

  const handleBack = () => {
    sessionStorage.removeItem("oauthSignupDetails");
    navigate("/")
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Prepare the payload according to API requirements
      const timezoneValue =
        data.timezone === "auto" ? defaultTimezone : data.timezone;

      const payload = {
        employeeCode: 1, // Generate UUID for employeeCode
        firstName: data.firstName,
        middleName: data.middleName || "", // Optional field
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        contractType: data.contractType,
        workStartTime: data.workStartTime ? new Date(data.workStartTime).toTimeString().slice(0, 8) : null, // Format as HH:MM:SS
        workEndTime: data.workEndTime ? new Date(data.workEndTime).toTimeString().slice(0, 8) : null, // Format as HH:MM:SS
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        privateMobile: data.privateMobile,
        photoUrl: data.photoUrl,
        dateOfJoining: data.dateOfJoining ? data.dateOfJoining.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        dateOfExit: data.dateOfExit ? data.dateOfExit.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        workLocation: data.workLocation,
        salaryCurrency: data.salaryCurrency,
        salaryAmount: data.salaryAmount,
        paymentFrequency: data.paymentFrequency,
        bankAccountNumber: data.bankAccountNumber,
        bankName: data.bankName,
        bankRoutingNumber: data.bankRoutingNumber,
        accountStatus: data.accountStatus,
        address: `${data.addressLine1}, ${data.addressLine2 || ''}, ${data.addressLine3 || ''}, ${data.city}, ${data.state}, ${data.postcode}, ${data.country}, Latitude: ${data.latitude}, Longitude: ${data.longitude}`.trim(),
        emergencyContact: data.emergencyContacts.map(contact => `${contact.name}: ${contact.phone}`).join('; '),
        identityDocuments: data.identificationDocuments.map(doc => `${doc.documentType}: ${doc.documentNumber} ${doc.documentFile ? '(File Attached)' : ''}`).join('; '),
        // createdAt: data.createdAt ? data.createdAt.toISOString() : new Date().toISOString(), // Use current date if not provided
        // updatedAt: data.updatedAt ? data.updatedAt.toISOString() : new Date().toISOString(), // Use current date if not provided
      };

      // Make API call
      let response;
      response = await axios.post("/employees", payload); // Changed to axios.post

      if (response.status === 200 || response.status === 201) {
        showToast(
          "Account created successfully! Redirecting to login page...",
          "success"
        );

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response received
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // load oauth signup details from session storage
  useEffect(() => {
    if (signupType === SIGNUP_TYPE_OAUTH) {
      const signupDetailsJSON = sessionStorage.getItem("oauthSignupDetails");
      if (!signupDetailsJSON)
        return;
      try {
        const signupDetails = JSON.parse(signupDetailsJSON);
        setOAuthSignupDetails(signupDetails);
        reset({
          firstName: signupDetails.firstName,
          lastName: signupDetails.lastName,
          email: signupDetails.email
        }, { keepDefaultValues: true });
      } catch (error) {
        console.log("Error parsing oauth signup details json", error);
      }
    }
  }, [signupType]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.gradientBackground,
        padding: { xs: 1, sm: 2 }, // Responsive padding
        position: "relative",
        overflow: "auto",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      {/* Back arrow */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: { xs: 8, sm: 16 }, // Responsive top
          left: { xs: 8, sm: 16 }, // Responsive left
          color: theme.palette.primary.main,
          bgcolor: "rgba(255,255,255,0.9)",
          "&:hover": {
            bgcolor: theme.palette.background.paper,
            color: theme.palette.secondary.main,
          },
          zIndex: 1,
        }}
      >
        <ArrowBack />
      </IconButton>

      <Container
        maxWidth="md"
        sx={{
          px: { xs: 1, sm: 2, md: 4 }, // Responsive horizontal padding
        }}
      >
        <Card
          elevation={0}
          sx={{
            mx: "auto",
            borderRadius: { xs: 1, sm: 2 }, // Responsive border radius
            position: "relative",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}> {/* Responsive padding */}
            {/* Logo & Title */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                  width: "100%",
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="logo"
                  sx={{
                    height: { xs: 60, sm: 80 }, // Responsive height
                    maxWidth: "60%",
                    objectFit: "contain",
                    mx: "auto",
                    display: "block",
                    boxShadow: "0 4px 24px rgba(102,126,234,0.10)",
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.9)",
                    p: 1,
                  }}
                />
              </Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  mt: 1,
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  mb: 0.5
                }}
              >
                Employee Signup
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                Account Signup
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Invitation Code */}
              <Controller
                name="invitationCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Invitation Code"
                    error={!!errors.invitationCode}
                    helperText={errors.invitationCode?.message}
                    sx={{
                      mb: 2.5,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#ede7f6",
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />

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
                      fontSize: { xs: 16, sm: 18 } // Responsive font size
                }}
              >
                Personal Information
              </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 32%" }, minWidth: 0 }}> {/* First Name */}
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                            label="First Name"
                    placeholder="First Name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                            sx={{ '& .MuiInputBase-root': { height: 56 } }}
                            onChange={(e) => field.onChange(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  />
                )}
              />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 32%" }, minWidth: 0 }}> {/* Middle Name */}
              <Controller
                name="middleName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                            label="Middle Name"
                    placeholder="Middle Name"
                    error={!!errors.middleName}
                    helperText={errors.middleName?.message}
                            sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                )}
              />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 32%" }, minWidth: 0 }}> {/* Last Name */}
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                            label="Last Name"
                    placeholder="Last Name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                            sx={{ '& .MuiInputBase-root': { height: 56 } }}
                  />
                )}
              />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}> {/* Date of Birth */}
                      <Controller
                        name="dateOfBirth"
                        control={control}
                        render={({ field }) => (
                          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                            <DatePicker
                              {...field}
                              value={field.value || null} // Ensure value is always Date object or null
                              label="Date of Birth"
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: {
                                  error: !!errors.dateOfBirth,
                                  helperText: errors.dateOfBirth?.message,
                                  sx: { '& .MuiOutlinedInput-root': { height: 56 } },
                                  fullWidth: true,
                                },
                              }}
                            />
                          </LocalizationProvider>
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}> {/* Private Mobile */}
                      <Controller
                        name="privateMobile"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label=" Mobile Number"
                            placeholder=" Mobile Number"
                            error={!!errors.privateMobile}
                            helperText={errors.privateMobile?.message}
                            inputProps={{ maxLength: 10 }}
                            sx={{ '& .MuiInputBase-root': { height: 56 } }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}> {/* Photo URL */}
                      <Controller
                        name="photoUrl"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.photoUrl} sx={{ mb: 1.5, height: 56 }}>
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id="photo-upload"
                              type="file"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    field.onChange(event.target.result);
                                  };
                                  reader.readAsDataURL(e.target.files[0]);
                                } else {
                                  field.onChange(""); // Change null to empty string
                                }
                              }}
                            />
                            <label htmlFor="photo-upload" style={{ height: '100%', display: 'flex', alignItems: 'center', border: '1px solid #c4c4c4', borderRadius: 4, padding: '0 14px', cursor: 'pointer', backgroundColor: '#fff' }}>
                              <Button variant="text" component="span" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', color: '#555' }}>
                                {field.value ? "Change Photo" : "Upload Photo"}
                              </Button>
                              {field.value && (
                                <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => { e.preventDefault(); setOpenPhotoPreview(true); }}
                                    sx={{ color: theme.palette.primary.main }}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => { e.preventDefault(); field.onChange(""); }}
                                    sx={{ color: theme.palette.error.main }}
                                  >
                                    <CancelOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                            </label>
                            {errors.photoUrl && (
                              <FormHelperText>{errors.photoUrl?.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
              {/* Removed redundant Divider */}

              {/* Login */}
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
                      fontSize: { xs: 16, sm: 18 } // Responsive font size
                }}
              >
                Login
              </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>
              <Box sx={{ mb: 2 }}>
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    Two-factor authentication is enabled by default. A security
                    code will be emailed to your username (<strong>email</strong>)
                    when logging in.
                  </Typography>
                </Alert>
              </Box>
                  <Dialog open={openPhotoPreview} onClose={() => setOpenPhotoPreview(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Photo Preview</DialogTitle>
                    <DialogContent>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                        <Box
                          component="img"
                          src={watch("photoUrl")}
                          alt="Uploaded Photo"
                          sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                        />
                      </Box>
                    </DialogContent>
                  </Dialog>
              <Controller
                name="email"
                control={control}
                disabled={signupType === SIGNUP_TYPE_OAUTH}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 1.5 }}
                  />
                )}
              />
                  {/* Timezone Controller moved here to be always visible within Login AccordionDetails */}
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.timezone} sx={{ mt: 1.5, mb: 1.5, '& .MuiOutlinedInput-root': { height: 56 } }}>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          {...field}
                          label="Timezone"
                          MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                        >
                          {timezones.map((tz) => (
                            <MenuItem key={tz} value={tz}>
                              {tz}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.timezone && <FormHelperText>{errors.timezone?.message}</FormHelperText>}
                      </FormControl>
                )}
              />

              {signupType !== SIGNUP_TYPE_OAUTH && (
                <>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                          <Box sx={{ mt: 1.5, mb: 1.5 }}>
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Password"
                          type={showPassword ? "text" : "password"}
                          error={!!errors.password}
                          helperText={errors.password?.message}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{
                                  color: theme.palette.secondary.main,
                                  "&:hover": {
                                    color: theme.palette.primary.main,
                                  },
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            ),
                          }}
                        />
                        {/* Password Strength Bar */}
                        {currentPassword && (
                          <Box sx={{ mt: 1 }}>
                            <PasswordStrengthBar
                              password={currentPassword}
                              minLength={8}
                              scoreWords={[
                                "Very Weak",
                                "Weak",
                                "Fair",
                                "Good",
                                "Strong",
                              ]}
                              shortScoreWord="Too Short"
                            />
                          </Box>
                        )}
                      </Box>
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              sx={{
                                color: theme.palette.secondary.main,
                                "&:hover": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          ),
                        }}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />
                </>
              )}
                </AccordionDetails>
              </Accordion>
              {/* Removed redundant Divider */}

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
                      fontSize: { xs: 16, sm: 18 } // Responsive font size
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
                            error={!!errors.jobTitle}
                            helperText={errors.jobTitle?.message}
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
                          <FormControl fullWidth error={!!errors.contractType} sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                            <InputLabel>Contract Type</InputLabel>
                            <Select
                              {...field}
                              label="Contract Type"
                              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                              {contractTypeOptions.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                              ))}
                            </Select>
                            {errors.contractType && <FormHelperText>{errors.contractType?.message}</FormHelperText>}
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
                            InputLabelProps={{
                              shrink: true,
                            }}
                            error={!!errors.workStartTime}
                            helperText={errors.workStartTime?.message}
                            sx={{ '& .MuiInputBase-root': { height: 56 } }}
                            value={field.value ? new Date(field.value).toTimeString().slice(0, 5) : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(`2000-01-01T${e.target.value}`) : null)} // Convert time string to Date object or null
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
                            InputLabelProps={{
                              shrink: true,
                            }}
                            error={!!errors.workEndTime}
                            helperText={errors.workEndTime?.message}
                            sx={{ '& .MuiInputBase-root': { height: 56 } }}
                            value={field.value ? new Date(field.value).toTimeString().slice(0, 5) : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(`2000-01-01T${e.target.value}`) : null)} // Convert time string to Date object or null
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
                              value={field.value || null} // Ensure value is always Date object or null
                              label="Date of Joining"
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: {
                                  error: !!errors.dateOfJoining,
                                  helperText: errors.dateOfJoining?.message,
                                  sx: { '& .MuiOutlinedInput-root': { height: 56 } },
                                  fullWidth: true,
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
                              value={field.value || null} // Ensure value is always Date object or null
                              label="Date of Exit"
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: {
                                  error: !!errors.dateOfExit,
                                  helperText: errors.dateOfExit?.message,
                                  sx: { '& .MuiOutlinedInput-root': { height: 56 } },
                                  fullWidth: true,
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
                          <FormControl fullWidth error={!!errors.workLocation} sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                            <InputLabel>Work Location</InputLabel>
                            <Select
                              {...field}
                              label="Work Location"
                              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                              {workLocationOptions.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                              ))}
                            </Select>
                            {errors.workLocation && <FormHelperText>{errors.workLocation?.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                      <Controller
                        name="accountStatus"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.accountStatus} sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                            <InputLabel>Account Status</InputLabel>
                            <Select
                              {...field}
                              label="Account Status"
                              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                              {/* Only 'Active' option available as per new requirement */}
                              <MenuItem value="Active">Active</MenuItem>
                            </Select>
                            {errors.accountStatus && <FormHelperText>{errors.accountStatus?.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
              {/* Removed redundant Divider */}

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
                      fontSize: { xs: 16, sm: 18 } // Responsive font size
                    }}
                  >
                    Salary & Bank Details
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>

                  {/* Compensation Section */}
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
                          <FormControl fullWidth error={!!errors.salaryCurrency} sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                            <InputLabel>Salary Currency</InputLabel>
                            <Select
                              {...field}
                              label="Salary Currency"
                              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                              {salaryCurrencyOptions.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                              ))}
                            </Select>
                            {errors.salaryCurrency && <FormHelperText>{errors.salaryCurrency?.message}</FormHelperText>}
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
                            }}
                            error={!!errors.salaryAmount}
                            helperText={errors.salaryAmount?.message}
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
                          <FormControl fullWidth error={!!errors.paymentFrequency} sx={{ '& .MuiOutlinedInput-root': { height: 56 } }}>
                            <InputLabel>Payment Frequency</InputLabel>
                            <Select
                              {...field}
                              label="Payment Frequency"
                              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                              {paymentFrequencyOptions.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                              ))}
                            </Select>
                            {errors.paymentFrequency && <FormHelperText>{errors.paymentFrequency?.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Box>
                  </Box>

                  {/* Bank Info Section */}
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
                            error={!!errors.bankName}
                            helperText={errors.bankName?.message}
                            sx={{ '& .MuiInputBase-root': { height: 56 } }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                      <Controller
                        name="bankAccountNumber"
                        control={control}
                        render={({ field }) => {
                          const { ref } = useMask({
                            mask: '00000000000000000', // Max 17 digits, all numbers
                            replacement: { '0': /\d/ },
                          });
                          return (
                            <TextField
                              {...field}
                              inputRef={ref} // Pass the ref to the input element
                              fullWidth
                              label="Bank Account Number"
                              placeholder="e.g., 123456789"
                              error={!!errors.bankAccountNumber}
                              helperText={errors.bankAccountNumber?.message}
                              sx={{ '& .MuiInputBase-root': { height: 56 } }}
                            />
                          );
                        }}
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
                            required={false} // Explicitly set to false to avoid automatic asterisk
                            error={!!errors.bankRoutingNumber}
                            helperText={errors.bankRoutingNumber?.message}
                            sx={{ '& .MuiInputBase-root': { height: 56 } }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
              {/* Removed redundant Divider */}

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
                      fontSize: { xs: 16, sm: 18 }, // Responsive font size
                    }}
                  >
                    Current Address
                    <Tooltip title="Please ensure all address fields are accurately completed as they are mandatory for signup." arrow>
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
                        error={!!errors.addressLine1}
                        helperText={errors.addressLine1?.message}
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
                        error={!!errors.addressLine2}
                        helperText={errors.addressLine2?.message}
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
                        error={!!errors.addressLine3}
                        helperText={errors.addressLine3?.message}
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />

                  {/* 2x2 Grid for County, City, Postcode, Country */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Responsive flex basis */}
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            options={indianStates}
                            onChange={(e, newValue) => field.onChange(newValue)}
                            disableClearable
                            PopperProps={{ placement: "bottom-start" }} // Moved here
                            renderInput={(params) => (
                              <TextField
                                {...params}
                            fullWidth
                                placeholder="State"
                                error={!!errors.state}
                                helperText={errors.state?.message}
                              />
                            )}
                            sx={{ mb: 1.5 }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Responsive flex basis */}
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="City"
                            error={!!errors.city}
                            helperText={errors.city?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Responsive flex basis */}
                      <Controller
                        name="postcode"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="Postcode"
                            error={!!errors.postcode}
                            helperText={errors.postcode?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Responsive flex basis */}
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Box sx={{ mb: 1.5 }}>
                            <FlagsSelect
                              selected={field.value}
                              onSelect={field.onChange}
                              placeholder="Select Country"
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
                                border: errors.country ? '1.5px solid #d32f2f' : '1.5px solid #c4c4c4',
                                paddingLeft: 14,
                                paddingRight: 14,
                                display: 'flex',
                                alignItems: 'center',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
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
                                /* Remove border: none to allow outer border to show */
                                box-shadow: none !important;
                                outline: none !important;
                                padding-left: 0 !important;
                                transition: border-color 0.2s !important;
                              }
                              .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7:focus {
                                border: 1.5px solid #5E35B1 !important;
                                box-shadow: 0 0 0 2px rgba(94,53,177,0.15) !important;
                              }
                              .mui-flags-select .ReactFlagsSelect-module_selectBtn__19wW7::placeholder {
                                font-family: ${theme.typography.fontFamily} !important;
                                font-size: ${theme.typography.fontSize}px !important;
                                color: #888 !important;
                                opacity: 1 !important;
                              }
                            `}</style>
                            {errors.country && (
                              <FormHelperText error>{errors.country.message}</FormHelperText>
                            )}
                          </Box>
                        )}
                      />
                    </Box>
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Latitude */}
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
                              error={!!errors.latitude}
                              helperText={errors.latitude?.message}
                            />
                          )}
                        />
                  </Box>
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}> {/* Longitude */}
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
                              error={!!errors.longitude}
                              helperText={errors.longitude?.message}
                            />
                          )}
                        />
                </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
              {/* Removed redundant Divider */}

              {/* Custom Section - Main Heading */}
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
                      fontSize: { xs: 16, sm: 18 } // Main heading font size
                }}
              >
                Custom Section
              </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>
                  <Box sx={{ mb: 2 }}> {/* Wrapper Box for all subsections */}

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
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                      }}
                    >
                            <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" } }}>
                        <Controller
                                name={`identificationDocuments.${index}.documentType`}
                          control={control}
                          render={({ field }) => (
                                  <Autocomplete
                              {...field}
                                    options={indianDocumentTypes}
                                    onChange={(e, newValue) => field.onChange(newValue)}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                              fullWidth
                                        placeholder="Document Type"
                                        error={!!errors.identificationDocuments?.[index]?.documentType}
                                        helperText={errors.identificationDocuments?.[index]?.documentType?.message}
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
                                    error={!!errors.identificationDocuments?.[index]?.documentNumber}
                                    helperText={errors.identificationDocuments?.[index]?.documentNumber?.message}
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
                                  <FormControl fullWidth error={!!errors.identificationDocuments?.[index]?.documentFile} sx={{ height: 56 }}>
                                    <input
                                      accept="image/*,application/pdf"
                                      style={{ display: 'none' }}
                                      id={`document-upload-${index}`}
                                      type="file"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          const reader = new FileReader();
                                          reader.onload = (event) => {
                                            field.onChange(event.target.result);
                                          };
                                          reader.readAsDataURL(e.target.files[0]);
                                        } else {
                                          field.onChange(""); // Change null to empty string
                                        }
                                      }}
                                    />
                                    <label htmlFor={`document-upload-${index}`} style={{ height: '100%', display: 'flex', alignItems: 'center', border: '1px solid #c4c4c4', borderRadius: 4, padding: '0 14px', cursor: 'pointer', backgroundColor: '#fff' }}>
                                      <Button variant="text" component="span" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', color: '#555' }}>
                                        {field.value ? "Change File" : "Upload File"}
                                      </Button>
                                      {field.value && (
                                        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => { e.preventDefault(); setCurrentDocumentPreview(field.value); setOpenDocumentPreview(true); }}
                                            sx={{ color: theme.palette.primary.main }}
                                          >
                                            <VisibilityIcon />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => { e.preventDefault(); field.onChange(""); }}
                                            sx={{ color: theme.palette.error.main }}
                                          >
                                            <CancelOutlinedIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      )}
                                    </label>
                                    {errors.identificationDocuments?.[index]?.documentFile && (
                                      <FormHelperText>{errors.identificationDocuments?.[index]?.documentFile?.message}</FormHelperText>
                                    )}
                                  </FormControl>
                                )}
                              />
                            </Box>
                            {/* Adjusted the condition to allow removal if there are more than 1 document inputs, not 2 */}
                            {identificationDocumentsFields.length > 1 && (
                        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 auto" }, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <IconButton
                            color="error"
                                  onClick={() => removeIdentificationDocument(index)}
                                  aria-label="remove document"
                            size="small"
                          >
                            <CancelOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                        onClick={() => appendIdentificationDocument({ documentType: "", documentNumber: "", documentFile: null })}
                  sx={{ mt: 1 }}
                >
                        Add Identification Document
                </Button>
              </Box>

                    {/* Emergency Contact Information */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    mb: 1.5,
                          fontSize: { xs: 12, sm: 14 }, // Changed to subheading font size
                  }}
                >
                        Emergency Contact
                </Typography>

                      {emergencyContactsFields.map((item, index) => (
                        <Box key={item.id} sx={{ mb: index < emergencyContactsFields.length - 1 ? 2 : 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                        <Controller
                                name={`emergencyContacts.${index}.name`}
                          control={control}
                          render={({ field }) => (
                                <TextField
                                    {...field}
                                fullWidth
                                    placeholder="Contact Name"
                                    error={!!errors.emergencyContacts?.[index]?.name}
                                    helperText={errors.emergencyContacts?.[index]?.name?.message}
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
                                    error={!!errors.emergencyContacts?.[index]?.phone}
                                    helperText={errors.emergencyContacts?.[index]?.phone?.message}
                                    inputProps={{ maxLength: 10 }}
                              sx={{ '& .MuiInputBase-root': { height: 56 } }}
                            />
                          )}
                        />
                      </Box>
                            {emergencyContactsFields.length > 1 && (
                        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 auto" }, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <IconButton
                            color="error"
                                  onClick={() => removeEmergencyContact(index)}
                                  aria-label="remove contact"
                            size="small"
                          >
                            <CancelOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                        onClick={() => appendEmergencyContact({ name: "", phone: "" })}
                  sx={{ mt: 1 }}
                >
                        Add Emergency Contact
                </Button>
              </Box>

                    {/* Documents & Audit Info Section */}
                    {/* Hidden as per user request */}
                    {false && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          sx={{
                            fontWeight: theme.typography.fontWeightBold,
                            fontFamily: theme.typography.fontFamily,
                            color: theme.palette.text.primary,
                            mb: 1.5,
                            fontSize: { xs: 12, sm: 14 } // Changed to subheading font size
                          }}
                        >
                          Documents & Audit Info
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
                          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                            <Controller
                              name="createdAt"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Created At"
                                  InputProps={{ readOnly: true }}
                                  value={field.value ? new Date(field.value).toLocaleString() : ''}
                                  sx={{ '& .MuiInputBase-root': { height: 56 } }}
                                />
                              )}
                            />
                          </Box>
                          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" }, minWidth: 0 }}>
                            <Controller
                              name="updatedAt"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Updated At"
                                  InputProps={{ readOnly: true }}
                                  value={field.value ? new Date(field.value).toLocaleString() : ''}
                                  sx={{ '& .MuiInputBase-root': { height: 56 } }}
                                />
                              )}
                            />
                          </Box>
                        </Box>
                      </Box>
                    )}

              {/* Custom Fields */}
                    {/* Hidden as per user request */}
                    {false && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    mb: 1.5,
                          fontSize: { xs: 12, sm: 14 }, // Changed to subheading font size
                  }}
                >
                  Custom Fields
                </Typography>

                {customFieldsFields.map((item, index) => (
                  <Box key={item.id} sx={{ mb: index < customFieldsFields.length - 1 ? 2 : 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                        <Controller
                          name={`customFields.${index}.fieldName`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              placeholder="Field Name"
                              error={!!errors.customFields?.[index]?.fieldName}
                              helperText={errors.customFields?.[index]?.fieldName?.message}
                            />
                          )}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                        <Controller
                          name={`customFields.${index}.fieldValue`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              placeholder="Field Value"
                              error={!!errors.customFields?.[index]?.fieldValue}
                              helperText={errors.customFields?.[index]?.fieldValue?.message}
                            />
                          )}
                        />
                      </Box>
                      {customFieldsFields.length > 0 && (
                        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 auto" }, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <IconButton
                            color="error"
                            onClick={() => removeCustomField(index)}
                            aria-label="remove field"
                            size="small"
                          >
                            <CancelOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => appendCustomField({ fieldName: "", fieldValue: "" })}
                  sx={{ mt: 1 }}
                >
                  Add Custom Field
                </Button>
              </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
              {/* Removed redundant Divider */}

              <Dialog open={openDocumentPreview} onClose={() => setOpenDocumentPreview(false)} maxWidth="md" fullWidth>
                <DialogTitle>Document Preview</DialogTitle>
                <DialogContent>
                  {currentDocumentPreview && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                      {currentDocumentPreview.startsWith('data:image') ? (
                        <Box
                          component="img"
                          src={currentDocumentPreview}
                          alt="Uploaded Document"
                          sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                        />
                      ) : currentDocumentPreview.startsWith('data:application/pdf') ? (
                        <embed
                          src={currentDocumentPreview}
                          type="application/pdf"
                          width="100%"
                          height="500px"
                          style={{ border: 'none' }}
                        />
                      ) : (
                        <Typography variant="body1" color="textSecondary">No preview available for this file type.</Typography>
                      )}
                    </Box>
                  )}
                </DialogContent>
              </Dialog>

              {/* Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 4,
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" }, // Responsive flex direction
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={isSubmitting}
                  sx={{
                    width: { xs: "100%", sm: 140 }, // Responsive width
                    height: theme.components.MuiButton.styleOverrides.root.height,
                    fontSize: theme.components.MuiButton.styleOverrides.root.fontSize,
                    fontFamily: theme.components.MuiButton.styleOverrides.root.fontFamily,
                    fontWeight: theme.components.MuiButton.styleOverrides.root.fontWeight,
                    borderRadius: theme.components.MuiButton.styleOverrides.root.borderRadius,
                    textTransform: theme.components.MuiButton.styleOverrides.root.textTransform,
                    order: { xs: 2, sm: 1 }, // Order for mobile vs desktop
                  }}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  endIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <ArrowForward />
                    )
                  }
                  disabled={isSubmitting}
                  sx={{
                    width: { xs: "100%", sm: 140 }, // Responsive width
                    height: theme.components.MuiButton.styleOverrides.root.height,
                    fontSize: theme.components.MuiButton.styleOverrides.root.fontSize,
                    fontFamily: theme.components.MuiButton.styleOverrides.root.fontFamily,
                    fontWeight: theme.components.MuiButton.styleOverrides.root.fontWeight,
                    borderRadius: theme.components.MuiButton.styleOverrides.root.borderRadius,
                    textTransform: theme.components.MuiButton.styleOverrides.root.textTransform,
                    order: { xs: 1, sm: 2 }, // Order for mobile vs desktop
                  }}
                >
                  {isSubmitting ? "Creating..." : "Signup"}
                </Button>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mt: 4,
                  flexDirection: { xs: "column", sm: "row" }, // Responsive flex direction
                }}
              >
                <Typography
                  sx={{
                    m: 0,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: 14, sm: 16 }, // Responsive font size
                    fontWeight: theme.typography.fontWeightBold,
                    color: theme.palette.text.primary,
                  }}
                >
                  Powered by
                </Typography>
                <Box
                  component="img"
                  src={companyLogo}
                  alt="Twelve Springs"
                  sx={{ height: { xs: 30, sm: 35 } }} // Responsive height
                />
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Signup;
