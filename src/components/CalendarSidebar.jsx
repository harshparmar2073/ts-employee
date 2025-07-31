import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem as SelectMenuItem,
  Switch,
  Avatar,
  FormControlLabel,
  Tooltip,
  Popover,
} from "@mui/material";
import {
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  Share as ShareIcon,
  IntegrationInstructions as IntegrationIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAcceptIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  AllInclusive as AllDayIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { HexColorPicker } from "react-colorful";

// ============================================================================
// CALENDAR CONSTANTS & UTILITIES
// ============================================================================

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

// Calendar color palette with better organization
const CALENDAR_COLORS = [
  // Primary Colors
  "#4285f4", // Google Blue
  "#ea4335", // Google Red
  "#fbbc04", // Google Yellow
  "#34a853", // Google Green

  // Extended Palette
  "#ff6b6b", // Coral
  "#4ecdc4", // Teal
  "#45b7d1", // Light Blue
  "#96ceb4", // Mint
  "#feca57", // Orange
  "#ff9ff3", // Pink
  "#54a0ff", // Sky Blue
  "#5f27cd", // Purple
  "#00d2d3", // Cyan
  "#ff9f43", // Orange
  "#10ac84", // Emerald
  "#ff4757", // Red Orange
  "#2ed573", // Lime
  "#1e90ff", // Dodger Blue
  "#ff6348", // Tomato
  "#ffa502", // Orange
];

const CALENDAR_TYPES = [
  { value: "private", label: "Private" },
  { value: "shared", label: "Shared" },
  { value: "public", label: "Public" },
];

// Get timezones utility

// ============================================================================
// CALENDAR DETAILS DIALOG SECTIONS
// ============================================================================

const CalendarSettingsSection = ({ calendar }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
      Calendar Settings
    </Typography>

    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
      >
        Calendar Name
      </Typography>
      <TextField
        fullWidth
        value={calendar?.name || ""}
        size="small"
        sx={{ mb: 2 }}
      />
    </Box>

    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
      >
        Description
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={calendar?.description || ""}
        size="small"
        sx={{ mb: 2 }}
      />
    </Box>

    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
      >
        Timezone
      </Typography>
      <TextField
        fullWidth
        value={calendar?.timezone || "Asia/Calcutta"}
        size="small"
        disabled
        sx={{ mb: 2 }}
      />
    </Box>
  </Box>
);

const AutoAcceptSection = ({ calendar }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
      Auto-accept invitations
    </Typography>

    <Box>
      <FormControl fullWidth size="small">
        <Select defaultValue="auto">
          <SelectMenuItem value="auto">
            Automatically add all invitations to this calendar
          </SelectMenuItem>
          <SelectMenuItem value="manual">
            Manually accept invitations
          </SelectMenuItem>
          <SelectMenuItem value="none">Don't accept invitations</SelectMenuItem>
        </Select>
      </FormControl>
      <Typography
        variant="caption"
        sx={{ color: "#666", mt: 1, display: "block" }}
      >
        Calendars for resources can auto-accept invitations.{" "}
        <Typography
          component="span"
          sx={{ color: "#1976d2", cursor: "pointer" }}
        >
          Learn more about auto-accept invitations
        </Typography>
      </Typography>
    </Box>
  </Box>
);

const PermissionsSection = ({ calendar }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
      Access permissions for events
    </Typography>

    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <FormControlLabel control={<Switch />} label="Make available to public" />
    </Box>

    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth size="small" disabled>
        <Select defaultValue="details">
          <SelectMenuItem value="details">See all event details</SelectMenuItem>
          <SelectMenuItem value="busy">See only free/busy</SelectMenuItem>
        </Select>
      </FormControl>
    </Box>

    <Button
      variant="outlined"
      sx={{ alignSelf: "flex-start", borderRadius: 2 }}
    >
      Get shareable link
    </Button>

    <Typography variant="caption" sx={{ color: "#666" }}>
      <Typography component="span" sx={{ color: "#1976d2", cursor: "pointer" }}>
        Learn more about sharing your calendar
      </Typography>
    </Typography>
  </Box>
);

const SharedWithSection = ({ calendar }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
        Shared with
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#6f42c1" }}>HP</Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Harsh_Parmar
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              harshparmar2073@gmail.com
            </Typography>
          </Box>
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select defaultValue="manage">
            <SelectMenuItem value="manage">
              Make changes and manage sharing
            </SelectMenuItem>
            <SelectMenuItem value="edit">Make changes to events</SelectMenuItem>
            <SelectMenuItem value="view">See all event details</SelectMenuItem>
          </Select>
        </FormControl>
      </Box>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setShowAddForm(!showAddForm)}
        sx={{ alignSelf: "flex-start", borderRadius: 2 }}
      >
        Add people and groups
      </Button>

      {/* Add People Form - Only show when button is clicked */}
      {showAddForm && (
        <Box
          sx={{
            p: 3,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            background: "#fafbfc",
            mt: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#333", mb: 2 }}
          >
            Share with specific people
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Add email or name"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />

            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, color: "#666" }}
              >
                Permissions
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                >
                  <SelectMenuItem value="busy">
                    See only free/busy (hide details)
                  </SelectMenuItem>
                  <SelectMenuItem value="view">
                    See all event details
                  </SelectMenuItem>
                  <SelectMenuItem value="edit">
                    Make changes to events
                  </SelectMenuItem>
                  <SelectMenuItem value="manage">
                    Make changes and manage sharing
                  </SelectMenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAddForm(false)}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!email.trim()}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
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

  const timeOptions = [
    "12:00am",
    "12:30am",
    "1:00am",
    "1:30am",
    "2:00am",
    "2:30am",
    "3:00am",
    "3:30am",
    "4:00am",
    "4:30am",
    "5:00am",
    "5:30am",
    "6:00am",
    "6:30am",
    "7:00am",
    "7:30am",
    "8:00am",
    "8:30am",
    "9:00am",
    "9:30am",
    "10:00am",
    "10:30am",
    "11:00am",
    "11:30am",
    "12:00pm",
    "12:30pm",
    "1:00pm",
    "1:30pm",
    "2:00pm",
    "2:30pm",
    "3:00pm",
    "3:30pm",
    "4:00pm",
    "4:30pm",
    "5:00pm",
    "5:30pm",
    "6:00pm",
    "6:30pm",
    "7:00pm",
    "7:30pm",
    "8:00pm",
    "8:30pm",
    "9:00pm",
    "9:30pm",
    "10:00pm",
    "10:30pm",
    "11:00pm",
    "11:30pm",
  ];

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

  const timeOptions = [
    "12:00am",
    "12:30am",
    "1:00am",
    "1:30am",
    "2:00am",
    "2:30am",
    "3:00am",
    "3:30am",
    "4:00am",
    "4:30am",
    "5:00am",
    "5:30am",
    "6:00am",
    "6:30am",
    "7:00am",
    "7:30am",
    "8:00am",
    "8:30am",
    "9:00am",
    "9:30am",
    "10:00am",
    "10:30am",
    "11:00am",
    "11:30am",
    "12:00pm",
    "12:30pm",
    "1:00pm",
    "1:30pm",
    "2:00pm",
    "2:30pm",
    "3:00pm",
    "3:30pm",
    "4:00pm",
    "4:30pm",
    "5:00pm",
    "5:30pm",
    "6:00pm",
    "6:30pm",
    "7:00pm",
    "7:30pm",
    "8:00pm",
    "8:30pm",
    "9:00pm",
    "9:30pm",
    "10:00pm",
    "10:30pm",
    "11:00pm",
    "11:30pm",
  ];

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

const IntegrateSection = ({ calendar }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
      Integrate calendar
    </Typography>

    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
      >
        Calendar ID
      </Typography>
      <TextField
        fullWidth
        value="da375dace53f478dad2da99675c2ff1990ee4f4f9885825a7fe0db7677dff369@group.calendar.google.com"
        size="small"
        sx={{ mb: 3 }}
      />
    </Box>

    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
      >
        Public URL to this calendar
      </Typography>
      <TextField
        fullWidth
        value="https://calendar.google.com/calendar/embed?src=da375dace53f478dad2da99675c2ff1990"
        size="small"
        sx={{ mb: 1 }}
      />
      <Typography variant="caption" sx={{ color: "#666" }}>
        Use this URL to access this calendar from a web browser.
      </Typography>
    </Box>

    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
      >
        Embed code
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        value='<iframe src="https://calendar.google.com/calendar/embed?src=da375dace53f478dad2da99675c2ff1990"></iframe>'
        size="small"
        sx={{ mb: 1 }}
      />
      <Typography
        variant="caption"
        sx={{ color: "#666", mb: 2, display: "block" }}
      >
        Use this code to embed this calendar in a web page.
      </Typography>
      <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
        Customize
      </Button>
    </Box>

    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
      >
        Public address in iCal format
      </Typography>
      <TextField
        fullWidth
        value="https://calendar.google.com/calendar/ical/da375dace53f478dad2da99675c2ff1990ee4f4f98"
        size="small"
        sx={{ mb: 1 }}
      />
      <Typography variant="caption" sx={{ color: "#666" }}>
        Use this address to access this calendar from other applications.
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "#dc3545", display: "block", mt: 1 }}
      >
        Warning: The address won't work unless this calendar is public.
      </Typography>
    </Box>

    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: "#666" }}
      >
        Secret address in iCal format
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField fullWidth value="••••••••••" size="small" />
        <IconButton size="small">
          <VisibilityIcon />
        </IconButton>
        <IconButton size="small">
          <ContentCopyIcon />
        </IconButton>
      </Box>
      <Typography
        variant="caption"
        sx={{ color: "#666", mt: 1, display: "block" }}
      >
        Use this address to access this calendar from other applications without
        making it public.
      </Typography>
    </Box>
  </Box>
);

const CalendarSidebar = ({
  sidebarCollapsed,
  onToggleSidebar,
  selectedCalendar,
  calendarType,
  onCalendarTypeChange,
  createdCalendars,
  onCalendarSelect,
  onCalendarSettings,
  onCalendarDelete,
  onCalendarCreate,
  onCalendarUpdate,
}) => {
  // CSS animations for color picker
  const colorPickerAnimations = {
    "@keyframes shimmer": {
      "0%": {
        transform: "translateX(-100%)",
      },
      "100%": {
        transform: "translateX(100%)",
      },
    },
    "@keyframes colorful-pop": {
      "0%": {
        transform: "scale(0.95)",
        opacity: 0.8,
      },
      "100%": {
        transform: "scale(1)",
        opacity: 1,
      },
    },
  };
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCalendarForMenu, setSelectedCalendarForMenu] = useState(null);

  // Calendar management state
  const [calendarFormOpen, setCalendarFormOpen] = useState(false);
  const [selectedCalendarForDetails, setSelectedCalendarForDetails] =
    useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Color picker state
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#4285f4");

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerOpen && !event.target.closest(".color-picker-container")) {
        setColorPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorPickerOpen]);

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

  // Menu handlers - optimized for performance and clarity
  const handleMenuOpen = (event, calendar) => {
    event.stopPropagation(); // Prevent event bubbling
    setAnchorEl(event.currentTarget);
    setSelectedCalendarForMenu(calendar);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCalendarForMenu(null);
  };

  const handleCalendarSettings = useCallback((calendar, action) => {
    console.log("Calendar settings action:", action, "for calendar:", calendar);

    // Open the same calendar form dialog but with existing data
    setSelectedCalendarForDetails(calendar);

    // Always default to 'basic' section when editing calendar
    setActiveSection("basic");

    setCalendarFormOpen(true);
  }, []);

  const handleMenuAction = useCallback(
    (action) => {
      if (selectedCalendarForMenu) {
        // Call the internal handleCalendarSettings function
        handleCalendarSettings(selectedCalendarForMenu, action);
      }
      handleMenuClose();
    },
    [selectedCalendarForMenu, handleCalendarSettings]
  );

  const handleDeleteCalendar = useCallback(() => {
    if (selectedCalendarForMenu && onCalendarDelete) {
      onCalendarDelete(selectedCalendarForMenu);
    }
    handleMenuClose();
  }, [selectedCalendarForMenu, onCalendarDelete]);

  // Calendar management handlers
  const handleAddCalendar = () => {
    setSelectedCalendarForDetails(null); // Clear any selected calendar
    setActiveSection("basic"); // Reset to basic section
    setCalendarFormOpen(true);
  };

  const handleSaveCalendar = (formData) => {
    console.log("Saving calendar:", formData);

    if (selectedCalendarForDetails) {
      // Update existing calendar
      const updatedCalendar = {
        ...selectedCalendarForDetails,
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

  // Menu configuration - centralized and reusable
  const menuItems = useMemo(
    () => [
      {
        id: "settings",
        label: "Calendar settings",
        icon: SettingsIcon,
        action: () => handleMenuAction("settings"),
      },
      {
        id: "autoAccept",
        label: "Auto-accept invitations",
        icon: AutoAcceptIcon,
        action: () => handleMenuAction("autoAccept"),
      },
      {
        id: "permissions",
        label: "Access permissions for events",
        icon: SecurityIcon,
        action: () => handleMenuAction("permissions"),
      },
      {
        id: "shared",
        label: "Shared with",
        icon: PeopleIcon,
        action: () => handleMenuAction("shared"),
      },
      {
        id: "notifications",
        label: "Event notifications",
        icon: NotificationsIcon,
        action: () => handleMenuAction("notifications"),
      },
      {
        id: "allDayNotifications",
        label: "All-day event notifications",
        icon: AllDayIcon,
        action: () => handleMenuAction("allDayNotifications"),
      },
      {
        id: "otherNotifications",
        label: "Other notifications",
        icon: ScheduleIcon,
        action: () => handleMenuAction("otherNotifications"),
      },
      {
        id: "integrate",
        label: "Integrate calendar",
        icon: IntegrationIcon,
        action: () => handleMenuAction("integrate"),
      },
    ],
    [handleMenuAction]
  );

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
          {["Private", "Shared", "Public"].map((type) => (
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

        {/* Calendar List */}
        <List sx={{ p: 0 }}>
          {/* Created Calendars Section */}
          {createdCalendars.filter((calendar) => {
            // Map calendar type to filter type - handle both API and form field names
            const typeMapping = {
              private: "Private",
              shared: "Shared",
              public: "Public",
            };
            // Use securityVisibility from API or type from form
            const calendarTypeValue = (
              calendar.securityVisibility ||
              calendar.type ||
              ""
            ).toLowerCase();
            const normalizedType = (calendarType || "").toLowerCase();

            return (
              typeMapping[calendarTypeValue]?.toLowerCase() === normalizedType
            );
          }).length > 0 && (
            <Box sx={{ mb: 3 }}>
              {/* Section Header */}
              {!sidebarCollapsed && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6c757d",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      "&::before": {
                        content: '""',
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6f42c1, #4285f4)",
                        display: "inline-block",
                      },
                    }}
                  >
                    Your {calendarType} Calendars
                  </Typography>
                </Box>
              )}

              {/* Enhanced Calendar Container */}
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                  borderRadius: 2.5,
                  p: 1.5,
                  position: "relative",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                      "linear-gradient(90deg, #6f42c1, #4285f4, #6f42c1)",
                    borderRadius: "2.5px 2.5px 0 0",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "radial-gradient(circle at 20% 80%, rgba(111, 66, 193, 0.03) 0%, transparent 50%)",
                    borderRadius: 2.5,
                    pointerEvents: "none",
                  },
                }}
              >
                {createdCalendars
                  .filter((calendar) => {
                    const typeMapping = {
                      private: "Private",
                      shared: "Shared",
                      public: "Public",
                    };
                    const calendarTypeValue = (calendar.securityVisibility || calendar.type || '').toLowerCase();
                    const normalizedType = (calendarType || '').toLowerCase();
                  
                    return typeMapping[calendarTypeValue]?.toLowerCase() === normalizedType;
                  })
                  .map((calendar, index) => (
                    <ListItem
                      key={calendar.id}
                      sx={{
                        p: 0,
                        mb: 1,
                        "&:last-child": { mb: 0 },
                        animation: "fadeInUp 0.3s ease forwards",
                        animationDelay: `${index * 0.1}s`,
                        opacity: 0,
                        "@keyframes fadeInUp": {
                          "0%": {
                            opacity: 0,
                            transform: "translateY(10px)",
                          },
                          "100%": {
                            opacity: 1,
                            transform: "translateY(0)",
                          },
                        },
                      }}
                    >
                      <Card
                        sx={{
                          width: "100%",
                          background:
                            selectedCalendar === calendar.name
                              ? "linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%)"
                              : "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
                          border:
                            selectedCalendar === calendar.name
                              ? "2px solid #6f42c1"
                              : "1px solid #e9ecef",
                          borderRadius: 2,
                          boxShadow:
                            selectedCalendar === calendar.name
                              ? "0 4px 12px rgba(111, 66, 193, 0.15)"
                              : "0 2px 8px rgba(0,0,0,0.08)",
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: `linear-gradient(90deg, ${
                              calendar.colour || calendar.color || "#4285f4"
                            }, ${
                              calendar.colour || calendar.color || "#4285f4"
                            }80)`,
                            opacity:
                              selectedCalendar === calendar.name ? 1 : 0.7,
                            transition: "opacity 0.3s ease",
                          },
                          "&:hover": {
                            boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                            transform: "translateY(-2px)",
                            borderColor: "#6f42c1",
                            "&::before": {
                              opacity: 1,
                            },
                          },
                        }}
                        onClick={() =>
                          onCalendarSelect && onCalendarSelect(calendar.name)
                        }
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${
                                    calendar.colour ||
                                    calendar.color ||
                                    "#4285f4"
                                  }, ${
                                    calendar.colour ||
                                    calendar.color ||
                                    "#4285f4"
                                  }cc)`,
                                  mr: 1,
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                  position: "relative",
                                  "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.8)",
                                  },
                                }}
                              />
                              {!sidebarCollapsed && (
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color:
                                        selectedCalendar === calendar.name
                                          ? "#6f42c1"
                                          : "#495057",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      fontSize: "0.8rem",
                                      transition: "color 0.3s ease",
                                    }}
                                  >
                                    {calendar.name}
                                  </Typography>
                                  {calendar.description && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#6c757d",
                                        fontSize: "0.7rem",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        display: "block",
                                        mt: 0.25,
                                        fontWeight: 400,
                                      }}
                                    >
                                      {calendar.description}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                            {!sidebarCollapsed && (
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, calendar)}
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
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
              </Box>
            </Box>
          )}

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

      {/* Calendar Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            border: "1px solid #e0e0e0",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        {selectedCalendarForMenu && (
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor:
                    selectedCalendarForMenu.colour ||
                    selectedCalendarForMenu.color ||
                    "#4285f4",
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#333" }}
              >
                {selectedCalendarForMenu.name}
              </Typography>
              <VisibilityIcon
                sx={{ fontSize: 16, color: "#6c757d", ml: "auto" }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#6c757d" }}>
              {selectedCalendarForMenu.type === "default"
                ? "Default Calendar"
                : "Created Calendar"}
            </Typography>
          </Box>
        )}

        {/* Menu Items - Rendered from configuration */}
        {menuItems.map((item, index) =>
          [
            <MenuItem key={item.id} onClick={item.action}>
              <ListItemIcon>
                <item.icon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>,
            // Add dividers after specific items
            (index === 3 || index === 6) && (
              <Divider key={`divider-${item.id}`} />
            ),
          ].filter(Boolean)
        )}

        {/* Delete option - only for created calendars */}
        {selectedCalendarForMenu?.type !== "default" && (
          <MenuItem onClick={handleDeleteCalendar} sx={{ color: "#dc3545" }}>
            <ListItemIcon>
              <DeleteIcon sx={{ fontSize: 18, color: "#dc3545" }} />
            </ListItemIcon>
            <ListItemText primary="Remove calendar" />
          </MenuItem>
        )}
      </Menu>

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
                  { id: "permissions", label: "Permissions" },
                  { id: "shared", label: "Sharing" },
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
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                  "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                                animation: "shimmer 2s infinite",
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
                              setSelectedColor(col);
                            }}
                            sx={{
                              width: "100%",
                              borderRadius: "12px",
                              boxShadow: "0 2px 12px #4285f455",
                              transition:
                                "box-shadow 0.3s cubic-bezier(.4,2,.6,1)",
                              animation:
                                "colorful-pop 0.5s cubic-bezier(.4,2,.6,1)",
                              ...colorPickerAnimations,
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
                {activeSection === "permissions" && (
                  <PermissionsSection calendar={selectedCalendarForDetails} />
                )}
                {activeSection === "shared" && (
                  <SharedWithSection calendar={selectedCalendarForDetails} />
                )}
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
    </Drawer>
  );
};

export default CalendarSidebar;
