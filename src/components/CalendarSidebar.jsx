import React, { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Card,
  CardContent,
  InputBase,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem as SelectMenuItem,
  Tooltip,
  Popover,
  Menu,
  MenuItem,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  PushPin as PushPinIcon,
} from "@mui/icons-material";
import { HexColorPicker } from "react-colorful";
import CalendarNotifications from "./CalendarNotifications";
import LinkGoogleCalendarButton from "./LinkGoogleCalendarButton";
import LinkMicrosoftCalendarButton from "./LinkMicrosoftCalendarButton";

// Calendar form validation schema
const calendarSchema = yup.object({
  name: yup
    .string()
    .required("Calendar name is required")
    .min(3, "Name must be at least 3 characters"),
  description: yup
    .string()
    .max(500, "Description must be less than 500 characters"),
  type: yup.string().required("Calendar type is required"),
  color: yup.string().required("Calendar color is required"),
});

const CALENDAR_TYPES = [
  { value: "private", label: "Private" },
  { value: "company", label: "Company" },
];

const CalendarSidebar = ({
  sidebarCollapsed,
  onToggleSidebar,
  selectedCalendar,
  calendarType,
  onCalendarTypeChange,
  createdCalendars,
  onCalendarSelect,
  onCalendarCreate,
  onCalendarUpdate,
  onCalendarDelete,
  onGoogleCalendarConnected,
  onGoogleCalendarDisconnected,
  onMicrosoftCalendarConnected,
  onMicrosoftCalendarDisconnected,
}) => {
  // Calendar management state
  const [calendarFormOpen, setCalendarFormOpen] = useState(false);
  const [selectedCalendarForDetails, setSelectedCalendarForDetails] =
    useState(null);
  const [activeSection, setActiveSection] = useState("basic");

  // Menu state for calendar options
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedCalendarForMenu, setSelectedCalendarForMenu] = useState(null);

  // Color picker state
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState(null);

  const [showConnectionPrompt, setShowConnectionPrompt] = useState(true);

// shape: { google: [], microsoft: [] }
const [connectedAccounts, setConnectedAccounts] = useState({ google: [], microsoft: [] });
const [accountActionAnchorEl, setAccountActionAnchorEl] = useState(null); // anchor for per-account menu
const [accountActionTarget, setAccountActionTarget] = useState(null); // the account object for the menu actions
const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false);
const [accountToDisconnect, setAccountToDisconnect] = useState(null);

  // React Hook Form setup for calendar form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(calendarSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "company",
      color: "#4285f4",
    },
  });

  // Reset form when selectedCalendarForDetails changes
  useEffect(() => {
    if (selectedCalendarForDetails) {
      // Map the calendar type correctly
      let calendarType = "private";
      if (selectedCalendarForDetails.securityVisibility) {
        // Map API values to form values - preserve original values
        const securityVisibility =
          selectedCalendarForDetails.securityVisibility;

        // Map to form values while preserving the original type
        if (securityVisibility.toLowerCase() === "private") {
          calendarType = "private";
        } else if (
          securityVisibility.toLowerCase() === "team" ||
          securityVisibility.toLowerCase() === "company"
        ) {
          calendarType = "company"; // Map both team and company to company
        } else {
          calendarType = "private"; // default
        }
      } else if (selectedCalendarForDetails.type) {
        calendarType = selectedCalendarForDetails.type;
      }

      console.log("Setting calendar form data:", {
        name: selectedCalendarForDetails.name,
        description: selectedCalendarForDetails.description,
        type: calendarType,
        color:
          selectedCalendarForDetails.colour ||
          selectedCalendarForDetails.color ||
          "#4285f4",
        originalData: selectedCalendarForDetails,
        securityVisibility: selectedCalendarForDetails.securityVisibility,
        originalType: selectedCalendarForDetails.type,
      });

      reset({
        name: selectedCalendarForDetails.name,
        description: selectedCalendarForDetails.description,
        type: calendarType,
        color:
          selectedCalendarForDetails.colour ||
          selectedCalendarForDetails.color ||
          "#4285f4",
      });
    } else {
      reset({
        name: "",
        description: "",
        type: "company",
        color: "#4285f4",
      });
    }
  }, [selectedCalendarForDetails, reset]);

  useEffect(() => {
  const source =
    selectedCalendarForDetails ||
    selectedCalendar ||
    (createdCalendars?.length ? createdCalendars[0] : null);

  const google = [];
  const microsoft = [];

  if (source) {
    // Try a few shapes your API might use:
    if (Array.isArray(source.externalAccounts)) {
      source.externalAccounts.forEach(acc => {
        const provider = (acc.provider || "").toLowerCase();
        if (provider === "google") google.push(acc);
        else if (provider === "microsoft" || provider === "outlook") microsoft.push(acc);
      });
    } else {
      if (Array.isArray(source.googleAccounts)) google.push(...source.googleAccounts);
      if (Array.isArray(source.microsoftAccounts)) microsoft.push(...source.microsoftAccounts);

      if (Array.isArray(source.connectedAccounts)) {
        source.connectedAccounts.forEach(acc => {
          const provider = (acc.provider || "").toLowerCase();
          if (provider === "google") google.push(acc);
          else if (provider === "microsoft" || provider === "outlook") microsoft.push(acc);
        });
      }
    }
  }

  // Merge from source only when it actually has accounts; otherwise preserve the local state
  setConnectedAccounts(prev => {
    const mergeUnique = (oldList = [], newList = []) => {
      if (!newList || newList.length === 0) return oldList;
      const out = [...oldList];
      newList.forEach(n => {
        const keyN = n?.id || n?.accountId || n?.email;
        const idx = out.findIndex(o => (o?.id || o?.accountId || o?.email) === keyN);
        if (idx >= 0) out[idx] = { ...out[idx], ...n };
        else out.push(n);
      });
      return out;
    };

    const nextGoogle = mergeUnique(prev.google, google);
    const nextMicrosoft = mergeUnique(prev.microsoft, microsoft);
    return { google: nextGoogle, microsoft: nextMicrosoft };
  });

  if ((google && google.length) || (microsoft && microsoft.length)) {
    setShowConnectionPrompt(false);
  }
}, [selectedCalendarForDetails, selectedCalendar, createdCalendars]);


  const providerLabel = (p) => (p === "google" ? "Google" : p === "microsoft" ? "Microsoft" : p);

 // --- Replace existing handleExternalConnectSuccess with this more robust version ---
const handleExternalConnectSuccess = (provider, accountData) => {
  const root = accountData?.data || accountData?.result || accountData?.payload || accountData;
  const upsert = (raw) => {
    if (!raw) return;
    const normalized = {
      ...raw,
      provider,
      id: raw.id || raw.accountId || raw.googleAccountId || raw.microsoftAccountId || raw.userId || raw.sub,
      accountId: raw.accountId || raw.id || raw.googleAccountId || raw.microsoftAccountId || raw.userId || raw.sub,
      email: raw.email || raw.accountEmail || raw.user?.email || raw.profile?.email || raw.mail,
      name: raw.name || raw.user?.name || raw.profile?.name || raw.displayName,
    };

    setConnectedAccounts((prev) => {
      const list = prev[provider] ? [...prev[provider]] : [];
      const idx = list.findIndex(
        (a) =>
          (a.id && normalized.id && a.id === normalized.id) ||
          (a.accountId && normalized.accountId && a.accountId === normalized.accountId) ||
          (a.email && normalized.email && a.email === normalized.email)
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...normalized };
      } else {
        const isPrimary = list.length === 0 || normalized.isPrimary;
        list.push({ ...normalized, isPrimary: !!isPrimary });
        if (isPrimary) {
          list.forEach((a, i) => {
            if (i !== list.length - 1) a.isPrimary = false;
          });
        }
      }
      return { ...prev, [provider]: list };
    });
  };

  if (Array.isArray(root)) {
    root.forEach(upsert);
  } else if (Array.isArray(root?.externalAccounts)) {
    root.externalAccounts
      .filter((a) => (a.provider || "").toLowerCase() === provider)
      .forEach(upsert);
  } else if (Array.isArray(root?.accounts)) {
    root.accounts.forEach(upsert);
  } else if (root?.account) {
    upsert(root.account);
  } else if (root?.user) {
    upsert(root.user);
  } else if (root) {
    upsert(root);
  }

  setShowConnectionPrompt(false);

  if (provider === "google" && onGoogleCalendarConnected) onGoogleCalendarConnected(accountData);
  if (provider === "microsoft" && onMicrosoftCalendarConnected) onMicrosoftCalendarConnected(accountData);
};

// --- New helper: open actions menu for a given account ---
const handleAccountActionOpen = (event, account) => {
  event.stopPropagation();
  setAccountActionAnchorEl(event.currentTarget);
  setAccountActionTarget(account);
};

// --- Close per-account menu ---
const handleAccountActionClose = () => {
  setAccountActionAnchorEl(null);
  setAccountActionTarget(null);
};

// --- Set selected account as primary for provider ---
const handleSetPrimaryAccount = (provider, accountIdOrEmail) => {
  setConnectedAccounts(prev => {
    const list = (prev[provider] || []).map(acc => {
      const match = acc.id === accountIdOrEmail || acc.accountId === accountIdOrEmail || acc.email === accountIdOrEmail;
      return { ...acc, isPrimary: match };
    });
    return { ...prev, [provider]: list };
  });
  handleAccountActionClose();
};

// --- Remove account locally (no API) ---
const handleRemoveAccount = (provider, account) => {
  const key = account?.id || account?.accountId || account?.email;
  if (!key) return;
  if (!window.confirm(`Remove ${account?.email || account?.name || account?.id} from this calendar?`)) return;
  setConnectedAccounts(prev => ({
    ...prev,
    [provider]: (prev[provider] || []).filter(a => (a.id || a.accountId || a.email) !== key),
  }));
};

// --- Disconnect a specific external account ---
const handleExternalDisconnect = (provider, accountOrId) => {
  const key = typeof accountOrId === "object" ? accountOrId.id || accountOrId.accountId || accountOrId.email : accountOrId;
  if (!key) return;

  setConnectedAccounts(prev => ({
    ...prev,
    [provider]: (prev[provider] || []).filter(a => (a.id || a.accountId || a.email) !== key)
  }));

  if (provider === "google" && onGoogleCalendarDisconnected) onGoogleCalendarDisconnected(accountOrId);
  if (provider === "microsoft" && onMicrosoftCalendarDisconnected) onMicrosoftCalendarDisconnected(accountOrId);
};

// --- Show disconnect confirmation dialog (do not immediately remove) ---
const handleRequestDisconnect = (provider, account) => {
  setAccountToDisconnect({ provider, account });
  setConfirmDisconnectOpen(true);
  handleAccountActionClose();
};

// --- Confirm disconnect action ---
const handleConfirmDisconnect = () => {
  if (!accountToDisconnect) {
    setConfirmDisconnectOpen(false);
    return;
  }

  const { provider, account } = accountToDisconnect;
  handleExternalDisconnect(provider, account);

  setConfirmDisconnectOpen(false);
  setAccountToDisconnect(null);
};


  const handleCalendarSettings = useCallback((calendar) => {
    // Open the same calendar form dialog but with existing data
    setSelectedCalendarForDetails(calendar);

    // Always default to 'basic' section when editing calendar
    setActiveSection("basic");

    setCalendarFormOpen(true);
  }, []);

  // Menu handlers
  const handleMenuOpen = useCallback((event, calendar) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCalendarForMenu(calendar);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
    setSelectedCalendarForMenu(null);
  }, []);

  const handleMenuAction = useCallback(
    (action) => {
      if (!selectedCalendarForMenu) return;

      switch (action) {
        case "settings":
          handleCalendarSettings(selectedCalendarForMenu);
          break;
        case "edit":
          setSelectedCalendarForDetails(selectedCalendarForMenu);
          setActiveSection("basic");
          setCalendarFormOpen(true);
          break;
        case "notification":
          setSelectedCalendarForDetails(selectedCalendarForMenu);
          setActiveSection("notifications");
          setCalendarFormOpen(true);
          break;
        case "remove":
          // Handle calendar removal with confirmation
          if (
            window.confirm(
              `Are you sure you want to remove "${selectedCalendarForMenu.name}"? This action cannot be undone.`
            )
          ) {
            if (onCalendarDelete) {
              // Call the parent's calendar delete function
              onCalendarDelete(selectedCalendarForMenu);
              console.log("Calendar removed:", selectedCalendarForMenu.name);
            } else {
              console.log(
                "onCalendarDelete prop not provided - cannot remove calendar"
              );
            }
          }
          break;
        default:
          break;
      }

      handleMenuClose();
    },
    [selectedCalendarForMenu, handleCalendarSettings, onCalendarUpdate]
  );

  // Calendar management handlers
  const handleAddCalendar = () => {
    setSelectedCalendarForDetails(null); // Clear any selected calendar
    setActiveSection("basic"); // Reset to basic section
    setCalendarFormOpen(true);
  };

  const handleSaveCalendar = (formData) => {
    // Map form type to API expected values
    const typeMapping = {
      private: "Private",
      company: "Company", // Handle company type
    };

    const apiType = typeMapping[formData.type] || "Private";

    console.log("Type mapping:", {
      formType: formData.type,
      apiType: apiType,
      typeMapping: typeMapping,
      availableTypes: CALENDAR_TYPES,
    });

    if (selectedCalendarForDetails) {
      // Update existing calendar
      const updatedCalendar = {
        ...selectedCalendarForDetails,
        calendarId: selectedCalendarForDetails.id, // Include calendar ID for updates
        name: formData.name,
        description: formData.description,
        securityVisibility: apiType, // Map to API field with proper casing
        colour: formData.color, // Map to API field
        type: formData.type, // Also keep the form type for consistency
      };

      console.log("Updating calendar with:", updatedCalendar);
      if (onCalendarUpdate) {
        onCalendarUpdate(updatedCalendar);
      }
    } else {
      // Create new calendar
      const newCalendar = {
        calendarId: null, // Will be assigned by the backend for new calendars
        name: formData.name,
        description: formData.description,
        securityVisibility: apiType, // Map to API field with proper casing
        colour: formData.color, // Map to API field
        type: formData.type, // Also keep the form type for consistency
        createdAt: new Date().toISOString(),
      };

      console.log("Creating new calendar with:", newCalendar);
      if (onCalendarCreate) {
        onCalendarCreate(newCalendar);
      }
    }

    setCalendarFormOpen(false);
    setSelectedCalendarForDetails(null);
    reset();
  };

  const handleCloseCalendarForm = () => {
    setCalendarFormOpen(false);
    setSelectedCalendarForDetails(null);
    setActiveSection("basic"); // Reset to basic section
    reset();
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarCollapsed ? 0 : { xs: 240, sm: 280 },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sidebarCollapsed ? 0 : { xs: 240, sm: 280 },
          boxSizing: "border-box",
          backgroundColor: "#fff",
          borderRight: "1px solid #e9ecef",
          transition: "width 0.3s ease",
          height: "100vh",
          overflow: "hidden",
          opacity: sidebarCollapsed ? 0 : 1,
          visibility: sidebarCollapsed ? "hidden" : "visible",
        },
      }}
    >
      <Box
        sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh", position: "relative" }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: "#495057",
            display: sidebarCollapsed ? "none" : "block",
            mt: 4,
          }}
        >
          Calendars
        </Typography>

        {/* Search */}
        <Box
          sx={{
            position: "relative",
            mb: 3,
            display: sidebarCollapsed ? "none" : "block",
          }}
        >
          <SearchIcon
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6c757d",
              fontSize: 20,
            }}
          />
          <InputBase
            placeholder="Search calendars..."
            sx={{
              pl: 4,
              pr: 2,
              py: 1,
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 2,
              border: "1px solid #dee2e6",
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>

        {/* Calendar Type Tabs */}
        <Box
          sx={{
            gap: 1,
            mb: 3,
            display: sidebarCollapsed ? "none" : "flex",
          }}
        >
          {["Private", "Company"].map((type) => (
            <Button
              key={type}
              variant={calendarType === type ? "contained" : "outlined"}
              size="small"
              onClick={() => onCalendarTypeChange(type)}
              sx={{
                flex: 1,
                fontSize: "0.75rem",
                py: 0.5,
                backgroundColor:
                  calendarType === type ? "#6f42c1" : "transparent",
                color: calendarType === type ? "#fff" : "#6c757d",
                borderColor: calendarType === type ? "#6f42c1" : "#dee2e6",
                "&:hover": {
                  backgroundColor:
                    calendarType === type ? "#5a32a3" : "#f8f9fa",
                },
              }}
            >
              {type}
            </Button>
          ))}
        </Box>

        {/* Simple Category Section */}
        {!sidebarCollapsed && createdCalendars.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#495057",
                mb: 2,
                fontSize: "0.875rem",
              }}
            >
              My {calendarType} calendars
            </Typography>

            {/* Debug info */}
            {console.log("Calendar filtering debug:", {
              totalCalendars: createdCalendars.length,
              calendarType: calendarType,
              calendars: createdCalendars.map((cal) => ({
                name: cal.name,
                securityVisibility: cal.securityVisibility,
                type: cal.type,
                id: cal.id,
              })),
            })}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {createdCalendars
                .filter((calendar) => {
                  // Get the calendar type value from API response
                  const calendarTypeValue = (
                    calendar.securityVisibility ||
                    calendar.type ||
                    ""
                  ).toLowerCase();

                  // Normalize the current filter type
                  const normalizedType = (calendarType || "").toLowerCase();

                  // Map the calendar type to the expected filter type
                  let mappedCalendarType = null;
                  if (calendarTypeValue === "private") {
                    mappedCalendarType = "Private";
                  } else if (
                    calendarTypeValue === "team" ||
                    calendarTypeValue === "company"
                  ) {
                    // Both team and company show in Company section
                    mappedCalendarType = "Company";
                  }

                  console.log("Calendar filtering:", {
                    calendarName: calendar.name,
                    calendarTypeValue,
                    mappedCalendarType,
                    normalizedType,
                    matches:
                      mappedCalendarType?.toLowerCase() === normalizedType,
                  });

                  return mappedCalendarType?.toLowerCase() === normalizedType;
                })
                 .map((calendar) => (
                  <Box
                    key={calendar.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 0.5,
                      px: 1,
                      cursor: "pointer",
                      borderRadius: 2,
                      background:
                        selectedCalendar && selectedCalendar.id === calendar.id
                          ? "linear-gradient(90deg, #ede7f6 60%, #d1c4e9 100%)"
                          : "inherit",
                      boxShadow:
                        selectedCalendar && selectedCalendar.id === calendar.id
                          ? "0 2px 8px rgba(111, 66, 193, 0.10)"
                          : "none",
                      borderLeft:
                        selectedCalendar && selectedCalendar.id === calendar.id
                          ? "3px solid #6f42c1"
                          : "3px solid transparent",
                      transform:
                        selectedCalendar && selectedCalendar.id === calendar.id
                          ? "scale(1.03)"
                          : "scale(1)",
                      transition: "all 0.2s cubic-bezier(.4,2,.6,1)",
                      "&:hover": {
                        backgroundColor: selectedCalendar && selectedCalendar.id === calendar.id ? "#ede7f6" : "#f8f9fa",
                        boxShadow: selectedCalendar && selectedCalendar.id === calendar.id ? "0 4px 16px rgba(111, 66, 193, 0.13)" : "0 2px 8px rgba(111, 66, 193, 0.06)",
                        borderLeft: selectedCalendar && selectedCalendar.id === calendar.id ? "4px solid #6f42c1" : "4px solid #b39ddb",
                        transform: "scale(1.04)",
                      },
                    }}
                    onClick={() => onCalendarSelect && onCalendarSelect(calendar.name, calendar.id)}
                  >
                   <Box
                     sx={{
                       display: "flex",
                       alignItems: "center",
                       gap: 1.5,
                     }}
                   >
                     <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: calendar.colour || calendar.color || "#4285f4",
                        }}
                      />
                     <Box
                       sx={{
                         display: "flex",
                         alignItems: "center",
                         gap: 0.5,
                       }}
                     >
                       <Typography
                         variant="body2"
                         sx={{
                           color: selectedCalendar && selectedCalendar.id === calendar.id ? "#6f42c1" : "#495057",
                           fontSize: "0.95rem",
                           fontWeight: selectedCalendar && selectedCalendar.id === calendar.id ? 700 : 400,
                           letterSpacing: selectedCalendar && selectedCalendar.id === calendar.id ? "0.02em" : "normal",
                           textShadow: selectedCalendar && selectedCalendar.id === calendar.id ? "0 1px 4px #ede7f6" : "none",
                         }}
                       >
                         {calendar.name}
                       </Typography>
                        {calendar.isDefault && (
                          <PushPinIcon
                            sx={{
                              fontSize: 16,
                              color: "#6f42c1",
                              marginLeft: 1,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, calendar)}
                      sx={{
                        opacity: 0.6,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          opacity: 1,
                          backgroundColor: "rgba(111, 66, 193, 0.1)",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: 16, color: "#6c757d" }} />
                    </IconButton>
                  </Box>
                ))}
            </Box>
          </Box>
        )}

        {/* Calendar List */}
        <List sx={{ p: 0 }}>
          {/* Add Calendar Button */}
          <ListItem sx={{ p: 0, mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={handleAddCalendar}
              sx={{
                justifyContent: "flex-start",
                borderColor: "#6f42c1",
                color: "#6f42c1",
                borderRadius: 2,
                py: 0.75,
                px: 1.5,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                width: "150px",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                  borderColor: "#5a32a3",
                  color: "#5a32a3",
                },
                display: sidebarCollapsed ? "none" : "flex",
              }}
            >
              Add Calendar
            </Button>
          </ListItem>
        </List>
      </Box>
      {/* Calendar Form Dialog */}
      <Dialog
        open={calendarFormOpen}
        onClose={() => setCalendarFormOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            background: "#fff",
            minHeight: "600px",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #e0e0e0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 18, color: "white" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
              {selectedCalendarForDetails
                ? "Edit Calendar"
                : "Create New Calendar"}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 0, py: 0 }}>
          {/* Clean Navigation - Only show when editing existing calendar */}
          {selectedCalendarForDetails && (
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "#e9ecef",
                px: 3,
                py: 2.5,
                background: "#fafbfc",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {[
                  { id: "basic", label: "Basic" },
                  { id: "external", label: "Connect External" },
                  { id: "notifications", label: "Notifications" },
                ].map((item) => (
                  <Box
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    sx={{
                      cursor: "pointer",
                      px: 2.5,
                      py: 1,
                      borderRadius: 1.5,
                      border:
                        activeSection === item.id
                          ? "1px solid #6f42c1"
                          : "1px solid #e0e0e0",
                      background:
                        activeSection === item.id ? "#6f42c1" : "#fff",
                      color: activeSection === item.id ? "#fff" : "#666",
                      fontWeight: activeSection === item.id ? 600 : 500,
                      fontSize: "0.75rem",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      boxShadow:
                        activeSection === item.id
                          ? "0 2px 4px rgba(111, 66, 193, 0.2)"
                          : "0 1px 3px rgba(0,0,0,0.1)",
                      "&:hover": {
                        background:
                          activeSection === item.id ? "#5a32a3" : "#f8f9fa",
                        color: activeSection === item.id ? "#fff" : "#333",
                        boxShadow:
                          activeSection === item.id
                            ? "0 2px 4px rgba(111, 66, 193, 0.2)"
                            : "0 2px 6px rgba(0,0,0,0.15)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Content */}
          <Box sx={{ px: 3, py: 3 }}>
            {/* Basic Calendar Details */}
            {activeSection === "basic" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Name Field */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
                      >
                        Name *
                      </Typography>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Enter calendar name"
                        size="small"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    </Box>
                  )}
                />
                {/* Description Field */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
                      >
                        Description
                      </Typography>
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Enter calendar description (optional)"
                        size="small"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    </Box>
                  )}
                />
                {/* Calendar Type Field */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
                      >
                        Calendar Type *
                      </Typography>
                      <FormControl fullWidth size="small" error={!!errors.type}>
                        <Select
                          {...field}
                          displayEmpty
                          value={field.value || ""}
                          onChange={field.onChange}
                        >
                          {CALENDAR_TYPES.map((type) => (
                            <SelectMenuItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectMenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {errors.type && (
                        <Typography
                          variant="caption"
                          sx={{ color: "error.main", mt: 0.5 }}
                        >
                          {errors.type.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
                {/* Calendar Color Field */}
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
                      >
                        Calendar Color *
                      </Typography>
                      {/* Custom Color Picker */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Tooltip title="Pick custom color" arrow>
                          <Box
                            sx={{
                              width: 60,
                              height: 40,
                              borderRadius: "12px",
                              background: `linear-gradient(135deg, ${field.value} 0%, ${field.value}88 100%)`,
                              border: "2px solid #e3eafc",
                              boxShadow: "0 4px 18px rgba(76, 110, 245, 0.18)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease",
                              position: "relative",
                              overflow: "hidden",
                              "&:hover": {
                                boxShadow:
                                  "0 8px 28px rgba(156, 39, 176, 0.22)",
                                transform: "scale(1.05)",
                                borderColor: "#6f42c1",
                              },
                            }}
                            onClick={(e) =>
                              setColorPickerAnchorEl(e.currentTarget)
                            }
                          >
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: field.value,
                                border: "2px solid #fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                zIndex: 1,
                                position: "relative",
                              }}
                            />
                          </Box>
                        </Tooltip>

                        <TextField
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="#4285f4"
                          size="small"
                          error={!!errors.color}
                          helperText={errors.color?.message}
                          sx={{
                            flex: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "&:hover": {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#6f42c1",
                                },
                              },
                            },
                          }}
                        />
                      </Box>

                      {/* Color Preview */}
                      <Box
                        sx={{
                          mt: 1,
                          p: 2,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${field.value}15 0%, ${field.value}08 100%)`,
                          border: `1px solid ${field.value}30`,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: field.value,
                            border: "2px solid #fff",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "#666", fontWeight: 500 }}
                        >
                          Preview: This is how your calendar will appear
                        </Typography>
                      </Box>

                      <Popover
                        open={Boolean(colorPickerAnchorEl)}
                        anchorEl={colorPickerAnchorEl}
                        onClose={() => setColorPickerAnchorEl(null)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        PaperProps={{
                          sx: {
                            borderRadius: 3,
                            boxShadow: "0 6px 32px rgba(25, 118, 210, 0.18)",
                            border: "1.5px solid #e3eafc",
                            p: 2,
                            bgcolor: "#f8fafd",
                          },
                        }}
                      >
                        <Box sx={{ p: 0.5, minWidth: 220 }}>
                          <HexColorPicker
                            color={field.value}
                            onChange={(col) => {
                              field.onChange(col);
                            }}
                            sx={{
                              width: "100%",
                              borderRadius: "12px",
                              boxShadow: "0 2px 12px #4285f455",
                              transition:
                                "box-shadow 0.3s cubic-bezier(.4,2,.6,1)",
                            }}
                          />
                        </Box>
                      </Popover>
                    </Box>
                  )}
                />
              </Box>
            )}
{activeSection === "external" && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
      External Calendar Connections
    </Typography>

    {showConnectionPrompt ? (
      <Box
        sx={{
          p: 4,
          border: "2px dashed #e0e0e0",
          borderRadius: 3,
          backgroundColor: "#fafafa",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#6f42c1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
            <line x1="16" y1="2" x2="16" y2="8"></line>
            <line x1="8" y1="2" x2="8" y2="8"></line>
            <path d="M3 10h18"></path>
            <path d="M15 16l3 3 3-3"></path>
            <path d="M18 13v9"></path>
          </svg>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Connect External Calendars
          </Typography>
          <Typography variant="body2" sx={{ color: "#5f6368", maxWidth: "480px", lineHeight: 1.6 }}>
            Sync events from your Google Calendar or Microsoft Outlook to automatically keep all your schedules in one place.
            Connect multiple accounts and manage them individually (set primary, disconnect).
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setCalendarFormOpen(false)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Maybe Later
          </Button>

          <Button
            variant="contained"
            onClick={() => setShowConnectionPrompt(false)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Connect Calendar
          </Button>
        </Box>
      </Box>
    ) : (
      <>
        <Typography variant="body2" sx={{ color: "#5f6368", mb: 2 }}>
          Connect multiple external calendars to sync events across all your accounts. Changes made in any connected calendar will be reflected here.
        </Typography>

        {/* Google block */}
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: "visible" }}>
          <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: "linear-gradient(135deg,#4285f4 0%,#34a853 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                }}>G</Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Google Calendar</Typography>
                  <Typography variant="caption" sx={{ color: "#6c757d" }}>Sync multiple Google accounts</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <LinkGoogleCalendarButton
                  calendarId={selectedCalendarForDetails?.id || selectedCalendar?.id || (createdCalendars?.length > 0 ? createdCalendars[0]?.id : null)}
                  calendarData={selectedCalendarForDetails || selectedCalendar || (createdCalendars?.length > 0 ? createdCalendars[0] : null)}
                  hasAnyAccounts={(connectedAccounts.google || []).length > 0}
                  connectedCount={(connectedAccounts.google || []).length}
                  onSuccess={(accountData) => handleExternalConnectSuccess("google", accountData)}
                  onDisconnect={() => {
                    // Bulk disconnect from Google for this calendar: clear local list
                    setConnectedAccounts(prev => ({ ...prev, google: [] }));
                    if (onGoogleCalendarDisconnected) onGoogleCalendarDisconnected({ all: true });
                  }}
                />
              </Box>
            </Box>

            {/* List of connected google accounts */}
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
              {(connectedAccounts.google || []).length === 0 ? (
                <Typography variant="body2" sx={{ color: "#6c757d" }}>No Google accounts connected yet.</Typography>
              ) : (
                (connectedAccounts.google || []).map((acc) => (
                  <Box
                    key={acc.id || acc.email || acc.accountId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.25,
                      borderRadius: 2,
                      background: "#fff",
                      border: "1px solid #eef2ff",
                      boxShadow: "0 2px 8px rgba(66,133,244,0.04)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#eaf2ff", color: "#1967d2", width: 40, height: 40 }}>
                        {acc.email ? acc.email.charAt(0).toUpperCase() : "G"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {acc.email || acc.name || acc.id}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.25 }}>
                          <Typography variant="caption" sx={{ color: "#6c757d" }}>
                            {acc.isPrimary ? "Primary" : "Connected"}
                          </Typography>
                          {acc.isPrimary && <Chip label="Primary" size="small" sx={{ ml: 0.5, bgcolor: "#f3e8ff", color: "#6f42c1", fontWeight: 700 }} />}
                        </Box>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* Make primary */}
                      {!acc.isPrimary && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSetPrimaryAccount("google", acc.id || acc.email || acc.accountId)}
                          sx={{ textTransform: "none" }}
                        >
                          Make primary
                        </Button>
                      )}

                      {/* Remove locally */}
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleRemoveAccount("google", acc)}
                        sx={{ textTransform: "none" }}
                      >
                        Remove
                      </Button>

                      {/* Disconnect individual */}
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleRequestDisconnect("google", acc)}
                        sx={{ textTransform: "none" }}
                      >
                        Disconnect
                      </Button>
                    </Stack>
                  </Box>
                ))
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Microsoft block */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: "linear-gradient(135deg,#0078d4 0%,#00a1f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                }}>M</Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Microsoft Outlook</Typography>
                  <Typography variant="caption" sx={{ color: "#6c757d" }}>Sync multiple Outlook / Microsoft accounts</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <LinkMicrosoftCalendarButton
                  calendarId={selectedCalendarForDetails?.id || selectedCalendar?.id || (createdCalendars?.length > 0 ? createdCalendars[0]?.id : null)}
                  calendarData={selectedCalendarForDetails || selectedCalendar || (createdCalendars?.length > 0 ? createdCalendars[0] : null)}
                  onSuccess={(accountData) => handleExternalConnectSuccess("microsoft", accountData)}
                  onDisconnect={(payload) => {
                    const id = typeof payload === "object" ? payload.id || payload.accountId || payload.email : payload;
                    handleExternalDisconnect("microsoft", id || payload);
                  }}
                />
              </Box>
            </Box>

            {/* List of connected microsoft accounts */}
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
              {(connectedAccounts.microsoft || []).length === 0 ? (
                <Typography variant="body2" sx={{ color: "#6c757d" }}>No Microsoft accounts connected yet.</Typography>
              ) : (
                (connectedAccounts.microsoft || []).map((acc) => (
                  <Box
                    key={acc.id || acc.email || acc.accountId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.25,
                      borderRadius: 2,
                      background: "#fff",
                      border: "1px solid #eef7ff",
                      boxShadow: "0 2px 8px rgba(0,120,212,0.03)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#eef8ff", color: "#0078d4", width: 40, height: 40 }}>
                        {acc.email ? acc.email.charAt(0).toUpperCase() : "M"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {acc.email || acc.name || acc.id}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.25 }}>
                          <Typography variant="caption" sx={{ color: "#6c757d" }}>
                            {acc.isPrimary ? "Primary" : "Connected"}
                          </Typography>
                          {acc.isPrimary && <Chip label="Primary" size="small" sx={{ ml: 0.5, bgcolor: "#f3e8ff", color: "#6f42c1", fontWeight: 700 }} />}
                        </Box>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {!acc.isPrimary && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSetPrimaryAccount("microsoft", acc.id || acc.email || acc.accountId)}
                          sx={{ textTransform: "none" }}
                        >
                          Make primary
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleRemoveAccount("microsoft", acc)}
                        sx={{ textTransform: "none" }}
                      >
                        Remove
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleRequestDisconnect("microsoft", acc)}
                        sx={{ textTransform: "none" }}
                      >
                        Disconnect
                      </Button>
                    </Stack>
                  </Box>
                ))
              )}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button variant="text" onClick={() => setShowConnectionPrompt(true)} sx={{ textTransform: "none", fontWeight: 500 }}>
            Back to connection options
          </Button>
        </Box>
      </>
    )}

    {/* Confirm disconnect dialog */}
    <Dialog open={confirmDisconnectOpen} onClose={() => setConfirmDisconnectOpen(false)}>
      <DialogTitle>Disconnect account</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to disconnect{" "}
          <strong>{accountToDisconnect?.account?.email || accountToDisconnect?.account?.name || accountToDisconnect?.account?.id}</strong>{" "}
          from <strong>{providerLabel(accountToDisconnect?.provider)}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmDisconnectOpen(false)} variant="outlined">Cancel</Button>
        <Button onClick={handleConfirmDisconnect} variant="contained" color="error">Disconnect</Button>
      </DialogActions>
    </Dialog>
  </Box>
)}

            {/* Settings Sections - Only show when editing existing calendar */}
            {selectedCalendarForDetails &&
              activeSection !== "basic" &&
              activeSection !== "external" && (
                <CalendarNotifications
                  calendar={selectedCalendarForDetails}
                  activeSection={activeSection}
                />
              )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 3, borderTop: "1px solid #e0e0e0" }}>
          <Button
            onClick={handleCloseCalendarForm}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleSaveCalendar)}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 2,
            }}
          >
            {selectedCalendarForDetails ? "Update Calendar" : "Create Calendar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            minWidth: 180,
            mt: 1,
          },
        }}
      >
        <MenuItem onClick={() => handleMenuAction("edit")}>
          Edit calendar
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction("notification")}>
          Notification
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction("remove")}
          sx={{
            color: "#dc3545 !important",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#dc3545 !important",
              color: "#fff !important",
            },
            borderTop: "1px solid #e0e0e0",
            marginTop: "4px",
            paddingTop: "12px",
            "& .MuiTypography-root": {
              color: "inherit",
            },
          }}
        >
          Remove calendar
        </MenuItem>
      </Menu>
    </Drawer>
  );
};

export default CalendarSidebar;
