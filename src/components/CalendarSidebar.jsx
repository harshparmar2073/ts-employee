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
} from "@mui/material";
import {
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  PushPin as PushPinIcon,
} from "@mui/icons-material";
import { HexColorPicker } from "react-colorful";

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

// Dynamic time options generator
const generateTimeOptions = (interval = 30) => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      const timeString = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      times.push(timeString);
    }
  }
  return times;
};

const EventNotificationsSection = ({ calendar }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "notification",
      quantity: 30,
      timeUnit: "minutes",
      time: "5:00pm",
    },
    { id: 2, type: "email", quantity: 10, timeUnit: "minutes", time: "5:00pm" },
  ]);

  const timeOptions = generateTimeOptions(30); // 30-minute intervals

  const addNotification = () => {
    const newNotification = {
      id: Date.now(),
      type: "notification",
      quantity: 30,
      timeUnit: "minutes",
      time: "5:00pm",
    };
    setNotifications([...notifications, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const updateNotification = (id, field, value) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
        Event notifications
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
        Receive notifications for events on this calendar.
      </Typography>

      {/* All notification rules */}
      {notifications.map((notification) => (
        <Box
          key={notification.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            background: "#fafbfc",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={notification.type}
              onChange={(e) =>
                updateNotification(notification.id, "type", e.target.value)
              }
            >
              <SelectMenuItem value="notification">Notification</SelectMenuItem>
              <SelectMenuItem value="email">Email</SelectMenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            value={notification.quantity}
            onChange={(e) =>
              updateNotification(
                notification.id,
                "quantity",
                parseInt(e.target.value) || 1
              )
            }
            sx={{
              width: 60,
              "& .MuiInputBase-input": {
                textAlign: "center",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#333",
              },
            }}
            inputProps={{ min: 1, max: 30 }}
          />

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={notification.timeUnit}
              onChange={(e) =>
                updateNotification(notification.id, "timeUnit", e.target.value)
              }
            >
              <SelectMenuItem value="minutes">minutes</SelectMenuItem>
              <SelectMenuItem value="hours">hours</SelectMenuItem>
              <SelectMenuItem value="days">days</SelectMenuItem>
              <SelectMenuItem value="weeks">weeks</SelectMenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ color: "#666" }}>
            before at
          </Typography>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={notification.time}
              onChange={(e) =>
                updateNotification(notification.id, "time", e.target.value)
              }
            >
              {timeOptions.map((time) => (
                <SelectMenuItem key={time} value={time}>
                  {time}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            size="small"
            onClick={() => removeNotification(notification.id)}
            sx={{ color: "#dc3545" }}
          >
            ✕
          </IconButton>
        </Box>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addNotification}
        sx={{ alignSelf: "flex-start", borderRadius: 2 }}
      >
        Add notification
      </Button>
    </Box>
  );
};

const AllDayNotificationsSection = ({ calendar }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "email", quantity: 1, timeUnit: "days", time: "5:00pm" },
  ]);

  const timeOptions = generateTimeOptions(30); // 30-minute intervals

  const addNotification = () => {
    const newNotification = {
      id: Date.now(),
      type: "email",
      quantity: 1,
      timeUnit: "days",
      time: "5:00pm",
    };
    setNotifications([...notifications, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const updateNotification = (id, field, value) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
        All-day event notifications
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
        Receive notifications for all day events on this calendar.
      </Typography>

      {/* All notification rules */}
      {notifications.map((notification) => (
        <Box
          key={notification.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            background: "#fafbfc",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={notification.type}
              onChange={(e) =>
                updateNotification(notification.id, "type", e.target.value)
              }
            >
              <SelectMenuItem value="notification">Notification</SelectMenuItem>
              <SelectMenuItem value="email">Email</SelectMenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            value={notification.quantity}
            onChange={(e) =>
              updateNotification(
                notification.id,
                "quantity",
                parseInt(e.target.value) || 1
              )
            }
            sx={{
              width: 60,
              "& .MuiInputBase-input": {
                textAlign: "center",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#333",
              },
            }}
            inputProps={{ min: 1, max: 30 }}
          />

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={notification.timeUnit}
              onChange={(e) =>
                updateNotification(notification.id, "timeUnit", e.target.value)
              }
            >
              <SelectMenuItem value="minutes">minutes</SelectMenuItem>
              <SelectMenuItem value="hours">hours</SelectMenuItem>
              <SelectMenuItem value="days">days</SelectMenuItem>
              <SelectMenuItem value="weeks">weeks</SelectMenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ color: "#666" }}>
            before at
          </Typography>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={notification.time}
              onChange={(e) =>
                updateNotification(notification.id, "time", e.target.value)
              }
            >
              {timeOptions.map((time) => (
                <SelectMenuItem key={time} value={time}>
                  {time}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            size="small"
            onClick={() => removeNotification(notification.id)}
            sx={{ color: "#dc3545" }}
          >
            ✕
          </IconButton>
        </Box>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addNotification}
        sx={{ alignSelf: "flex-start", borderRadius: 2 }}
      >
        Add notification
      </Button>
    </Box>
  );
};

const OtherNotificationsSection = ({ calendar }) => {
  const [notifications, setNotifications] = useState([
    {
      id: "new",
      label: "New events",
      desc: "An event is added to this calendar",
      type: "none",
    },
    {
      id: "changed",
      label: "Changed events",
      desc: "An event on this calendar is changed",
      type: "none",
    },
    {
      id: "canceled",
      label: "Canceled events",
      desc: "An event on this calendar is cancelled",
      type: "none",
    },
    {
      id: "responses",
      label: "Event responses",
      desc: "Guests respond to an event on this calendar",
      type: "none",
    },
    {
      id: "agenda",
      label: "Daily agenda",
      desc: "Receive a daily email with the agenda for this calendar",
      type: "none",
    },
  ]);

  const updateNotification = (id, value) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, type: value } : n))
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
        Other notifications
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
        Receive email notifications when changes are made to this calendar.
      </Typography>

      {notifications.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            background: "#fafbfc",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: "#333" }}>
              {item.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#666", display: "block", mt: 0.5 }}
            >
              {item.desc}
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={item.type}
              onChange={(e) => updateNotification(item.id, e.target.value)}
            >
              <SelectMenuItem value="none">None</SelectMenuItem>
              <SelectMenuItem value="email">Email</SelectMenuItem>
              <SelectMenuItem value="notification">Notification</SelectMenuItem>
            </Select>
          </FormControl>
        </Box>
      ))}
    </Box>
  );
};



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
      type: "private",
      color: "#4285f4",
    },
  });

  // Reset form when selectedCalendarForDetails changes
  useEffect(() => {
    if (selectedCalendarForDetails) {
      reset({
        name: selectedCalendarForDetails.name,
        description: selectedCalendarForDetails.description,
        type:
          selectedCalendarForDetails.securityVisibility ||
          selectedCalendarForDetails.type ||
          "private",
        color:
          selectedCalendarForDetails.colour ||
          selectedCalendarForDetails.color ||
          "#4285f4",
      });
    } else {
      reset({
        name: "",
        description: "",
        type: "private",
        color: "#4285f4",
      });
    }
  }, [selectedCalendarForDetails, reset]);


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

  const handleMenuAction = useCallback((action) => {
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
        if (window.confirm(`Are you sure you want to remove "${selectedCalendarForMenu.name}"? This action cannot be undone.`)) {
          if (onCalendarDelete) {
            // Call the parent's calendar delete function
            onCalendarDelete(selectedCalendarForMenu);
            console.log("Calendar removed:", selectedCalendarForMenu.name);
          } else {
            console.log("onCalendarDelete prop not provided - cannot remove calendar");
          }
        }
        break;
      default:
        break;
    }
    
    handleMenuClose();
  }, [selectedCalendarForMenu, handleCalendarSettings, onCalendarUpdate]);



  // Calendar management handlers
  const handleAddCalendar = () => {
    setSelectedCalendarForDetails(null); // Clear any selected calendar
    setActiveSection("basic"); // Reset to basic section
    setCalendarFormOpen(true);
  };

  const handleSaveCalendar = (formData) => {
    if (selectedCalendarForDetails) {
      // Update existing calendar
      const updatedCalendar = {
        ...selectedCalendarForDetails,
        calendarId: selectedCalendarForDetails.id, // Include calendar ID for updates
        name: formData.name,
        description: formData.description,
        securityVisibility: formData.type, // Map to API field
        colour: formData.color, // Map to API field
      };

      if (onCalendarUpdate) {
        onCalendarUpdate(updatedCalendar);
      }
    } else {
      // Create new calendar
      const newCalendar = {
        calendarId: null, // Will be assigned by the backend for new calendars
        name: formData.name,
        description: formData.description,
        securityVisibility: formData.type, // Map to API field
        colour: formData.color, // Map to API field
        createdAt: new Date().toISOString(),
      };

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
            display: "flex",
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
                         <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
               {createdCalendars
                 .filter((calendar) => {
                   // Map calendar type to filter type - handle both API and form field names
                   const typeMapping = {
                     private: "Private",
                     company: "Company",
                   };
                   // Use securityVisibility from API or type from form
                   const calendarTypeValue = (
                     calendar.securityVisibility || calendar.type || ""
                   ).toLowerCase();
                   const normalizedType = (calendarType || "").toLowerCase();
                   return (
                     typeMapping[calendarTypeValue]?.toLowerCase() === normalizedType
                   );
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
                     borderRadius: 1,
                     "&:hover": {
                       backgroundColor: "#f8f9fa",
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
                         //  border: selectedCalendar === calendar.name ? "1px solid #6f42c1" : "none",
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
                           color: selectedCalendar === calendar.name ? "#6f42c1" : "#495057",
                           fontSize: "0.875rem",
                           fontWeight: selectedCalendar === calendar.name ? 600 : 400,
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
                     <MoreVertIcon
                       sx={{ fontSize: 16, color: "#6c757d" }}
                     />
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
                        <Select {...field} displayEmpty>
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
            {/* Settings Sections - Only show when editing existing calendar */}
            {selectedCalendarForDetails && activeSection !== "basic" && (
              <Box sx={{ maxHeight: "50vh", overflow: "auto" }}>
                {activeSection === "notifications" && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {/* Event Notifications Section */}
                    <Box
                      sx={{
                        p: 3,
                        border: "1px solid #e0e0e0",
                        borderRadius: 3,
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <EventNotificationsSection
                        calendar={selectedCalendarForDetails}
                      />
                    </Box>

                    {/* All-day Event Notifications Section */}
                    <Box
                      sx={{
                        p: 3,
                        border: "1px solid #e0e0e0",
                        borderRadius: 3,
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <AllDayNotificationsSection
                        calendar={selectedCalendarForDetails}
                      />
                    </Box>

                    {/* Other Notifications Section */}
                    <Box
                      sx={{
                        p: 3,
                        border: "1px solid #e0e0e0",
                        borderRadius: 3,
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <OtherNotificationsSection
                        calendar={selectedCalendarForDetails}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
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
