// AccountInfo.jsx
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
// import axiosService from "../services/axiosService";
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
  FormControlLabel,
  Switch,
  IconButton,
  Collapse,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack, ArrowForward, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png";
import companyLogo from "../assets/12springslogo.png";
import theme from "../theme/theme";
import PasswordStrengthBar from "react-password-strength-bar";
import { useGoogleLogin } from "@react-oauth/google";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosService from "../services/axiosService";

// Validation schema
const validationSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  timezone: yup.string().required("Please select a timezone"),
  showAddress: yup.boolean(),
  addressLine1: yup.string().when("showAddress", {
    is: true,
    then: (schema) => schema.required("Address line 1 is required"),
  }),
  city: yup.string().when("showAddress", {
    is: true,
    then: (schema) => schema.required("City is required"),
  }),
  postcode: yup.string().when("showAddress", {
    is: true,
    then: (schema) => schema.required("Postcode is required"),
  }),
  country: yup.string().when("showAddress", {
    is: true,
    then: (schema) => schema.required("Country is required"),
  }),
});

// generate oauth state
function generateOAuthState(length = 32) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  const state = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return state;
}

const oauthState = generateOAuthState();

// compare given oauth state with stored value
function checkOAuthState(state) {
  return state === oauthState;
}

const ProfileInfo = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timezones, setTimezones] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
  } = useForm({
    // resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      timezone: "",
      showAddress: false,
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      county: "",
      city: "",
      postcode: "",
      country: "",
    },
  });

  const showAddress = watch("showAddress");
  const currentPassword = watch("password");

  const queryClient = useQueryClient();
  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ["/user/me"],
    queryFn: async () => {
      const r = await axiosService.get("/user/me");
      return r.data.data;
    }
  });

  const {
    mutate: updateProfile,
    isPending: updateProfilePending
  } = useMutation({
    mutationFn: async (data) => {
      await axiosService.put("/user/update/me", data);
      showToast("Profile updated", "success");
      queryClient.invalidateQueries("/user/me");
    }
  });

  // Load timezones
  useEffect(() => {
    const tzList = Intl.supportedValuesOf("timeZone");
    setTimezones(tzList);
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setValue("timezone", browserTz);
  }, [setValue]);

  const handleBack = () => navigate(-1);

  const onSubmit = (data) => {
    updateProfile(data);
  };

  async function finishLinkGoogleAccount(code) {
    try {
      await axiosService.post("/oauth2/link", { code });
      queryClient.invalidateQueries(["/user/me"]);
    } catch (error) {
      console.log(error);
      showToast("Error linking account. Please try again later.", "error");
    }
  }

  async function unlinkGoogleAccount() {
    try {
      await axiosService.post("/oauth2/unlink");
      queryClient.invalidateQueries(["/user/me"]);
    } catch (error) {
      console.log(error);
      const message = error.response?.data?.message
        || "Error unlinking account. Please try again later.";
      showToast(message, "error");
    }
  }

  const linkGoogleAccount = useGoogleLogin({
    flow: 'auth-code',
    scope: "email profile",
    state: oauthState,
    onSuccess: async codeResponse => {
      if (!checkOAuthState(codeResponse.state)) {
        console.log("OAuth state check failed");
        showToast("Error linking account. Please try again later.", "error");
        return;
      }

      finishLinkGoogleAccount(codeResponse.code);
    },
  });

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        minHeight: '100vh',
        px: { xs: 0, sm: 1, md: 2, lg: 4 },
        py: { xs: 0, sm: 1, md: 2, lg: 4 },
      }}
    >
      {/* Back arrow */}
      {/* Remove the IconButton with ArrowBack from the component. */}

      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
        <Card
          elevation={2}
          sx={{
            mx: 'auto',
            borderRadius: { xs: 1, sm: 2, md: 3 },
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            p: { xs: 1, sm: 2, md: 3 },
            maxWidth: { xs: '100%', sm: 600, md: 800, lg: 900 },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: { xs: 1, sm: 2, md: 3 },
                  width: "100%",
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="logo"
                  sx={{
                    height: { xs: 40, sm: 60, md: 80 },
                    maxWidth: { xs: '70%', sm: '60%', md: '50%' },
                    objectFit: "contain",
                    mx: "auto",
                    display: "block",
                    boxShadow: "0 4px 24px rgba(102,126,234,0.10)",
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.7)",
                    p: { xs: 0.5, sm: 1 },
                  }}
                />
              </Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  mt: { xs: 0.5, sm: 1 },
                  fontWeight: theme.typography.fontWeightBold,
                  fontFamily: theme.typography.fontFamily,
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: 18, sm: 22, md: 26 },
                  color: theme.palette.text.primary,
                }}
              >
                Profile Information
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                  fontSize: { xs: 12, sm: 14 },
                }}
              >
                Update your profile details
              </Typography>
            </Box>

            {profileLoading ?
              <Box sx={{ display: "flex" }}>
                <CircularProgress sx={{ m: "auto" }} />
              </Box> :
              profileError ?
                <Typography sx={{ textAlign: "center" }}>Error loading data</Typography> : (

                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Personal Information */}
                    <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 1.5, fontSize: { xs: 14, sm: 16 } }}>
                      Personal Information
                    </Typography>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="First Name"
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                          sx={{ mb: 1.5 }}
                        />
                      )}
                    />
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="Last Name"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                          sx={{ mb: 1.5 }}
                        />
                      )}
                    />

                    {/* Login */}
                    <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 1.5, fontSize: { xs: 14, sm: 16 } }}>
                      Login
                    </Typography>
                    <Controller
                      name="email"
                      control={control}
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
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ mb: 1.5 }}>
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
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            ),
                          }}
                          sx={{ mb: 1.5 }}
                        />
                      )}
                    />

                    {/* Timezone */}
                    <Controller
                      name="timezone"
                      control={control}
                      render={({ field }) => (
                        <Box>
                          <Autocomplete
                            options={timezones}
                            value={field.value}
                            onChange={(e, newValue) => field.onChange(newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Timezone"
                                error={!!errors.timezone}
                                helperText={errors.timezone?.message}
                              />
                            )}
                            disableClearable
                          />
                        </Box>
                      )}
                    />

                    {/* Google Account */}
                    <Box
                      sx={{ mt: 2, mb: 5 }}
                    >
                      <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 1.5, fontSize: { xs: 14, sm: 16 } }}>
                        Google Account
                      </Typography>

                      {profile.isGoogleAccountLinked ? (
                        <Button
                          variant="outlined"
                          onClick={unlinkGoogleAccount}
                          loading={profileLoading}
                        >
                          Unlink Google Account
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          onClick={linkGoogleAccount}
                          loading={profileLoading}
                        >
                          Link Google Account
                        </Button>
                      )}
                    </Box>

                    {/* Address Toggle */}
                    <Controller
                      name="showAddress"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={field.onChange}
                              color="secondary"
                              sx={{
                                transform: "scale(1.4)",
                                mx: 1,
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "& .MuiSwitch-switchBase": {
                                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                },
                                "& .MuiSwitch-thumb": {
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                },
                                "& .MuiSwitch-track": {
                                  borderRadius: "20px",
                                  transition: "background-color 0.3s",
                                },
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: "#fff",
                                  transform: "translateX(18px)",
                                  "& + .MuiSwitch-track": {
                                    background:
                                      "linear-gradient(45deg, #667eea, #764ba2)",
                                    opacity: 1,
                                  },
                                },
                              }}
                            />
                          }
                          label="Provide Address (Optional)"
                          sx={{ mb: showAddress ? 1.5 : 0 }}
                        />
                      )}
                    />

                    {/* Address Fields */}
                    <Collapse in={showAddress}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          sx={{ fontWeight: theme.typography.fontWeightBold, fontFamily: theme.typography.fontFamily, color: theme.palette.text.primary, mb: 1.5, fontSize: { xs: 14, sm: 16 } }}
                        >
                          Address Information
                        </Typography>
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
                          <Box sx={{ flex: "1 1 48%" }}>
                            <Controller
                              name="county"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  placeholder="County (Optional)"
                                />
                              )}
                            />
                          </Box>
                          <Box sx={{ flex: "1 1 48%" }}>
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
                          <Box sx={{ flex: "1 1 48%" }}>
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
                          <Box sx={{ flex: "1 1 48%" }}>
                            <Controller
                              name="country"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  placeholder="Country"
                                  error={!!errors.country}
                                  helperText={errors.country?.message}
                                />
                              )}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Collapse>

                    {/* Buttons */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: { xs: 1, sm: 2 },
                        mt: { xs: 2, sm: 4 },
                        flexDirection: { xs: 'column', sm: 'row' },
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{
                          flex: 1,
                          mb: { xs: 1, sm: 0 },
                          fontSize: { xs: 14, sm: 16 },
                          py: { xs: 1, sm: 1.5 },
                          fontWeight: theme.typography.fontWeightBold,
                          fontFamily: theme.typography.fontFamily,
                          color: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          '&:hover': {
                            borderColor: theme.palette.secondary.main,
                            color: theme.palette.secondary.main,
                          },
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        endIcon={updateProfilePending ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                        sx={{
                          flex: 1,
                          fontSize: { xs: 14, sm: 16 },
                          py: { xs: 1, sm: 1.5 },
                          fontWeight: theme.typography.fontWeightBold,
                          fontFamily: theme.typography.fontFamily,
                          background: theme.palette.primary.main,
                          color: theme.palette.getContrastText(theme.palette.primary.main),
                          '&:hover': {
                            background: theme.palette.secondary.main,
                            color: theme.palette.getContrastText(theme.palette.secondary.main),
                          },
                        }}
                      >
                        {updateProfilePending ? 'Saving...' : 'Save'}
                      </Button>
                    </Box>

                    {/* Footer */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: { xs: 1, sm: 2 },
                        mt: { xs: 2, sm: 4 },
                        flexDirection: isMobile ? "column" : "row",
                      }}
                    >
                      <Typography
                        sx={{
                          m: 0,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: 12, sm: 14, md: 16 },
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
                        sx={{ height: { xs: 18, sm: 24, md: 30, lg: 35 } }}
                      />
                    </Box>
                  </form>
                )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ProfileInfo;
