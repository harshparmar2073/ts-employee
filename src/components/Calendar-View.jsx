// -----------------------------------------------------------------------------
// React
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from "react";

// -----------------------------------------------------------------------------
// Date utilities
// -----------------------------------------------------------------------------
import {
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  differenceInMinutes,
  isValid,
} from "date-fns";

import { formatInTimeZone } from "date-fns-tz";

// -----------------------------------------------------------------------------
// Services & app context
// -----------------------------------------------------------------------------
import axiosService from "../services/axiosService";
import { useToast } from "../context/ToastContext";

// -----------------------------------------------------------------------------
// App components
// -----------------------------------------------------------------------------
import EventForm from "../components/EventForm";
import CalendarSidebar from "./CalendarSidebar";
import CalendarMain from "./CalendarMain";
// Optional helper button (even if currently commented in JSX, safe to keep import)
import LinkGoogleCalendarButton from "./LinkGoogleCalendarButton";

// -----------------------------------------------------------------------------
// MUI: Core components & hooks
// -----------------------------------------------------------------------------
import Slide from "@mui/material/Slide";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  FormControlLabel,
  Divider,
  Tooltip,
  RadioGroup,
  Radio,
  Chip as MuiChip,
  Fab,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import SvgIcon from "@mui/material/SvgIcon";

// -----------------------------------------------------------------------------
// MUI: Icons
// -----------------------------------------------------------------------------
import {
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  LocalOffer as LocalOfferIcon,
  Description as DescriptionIcon,
  Place as PlaceIcon,
  AccessTime as AccessTimeIcon,
  Repeat as RepeatIcon,
  Link as LinkIcon,
  People as PeopleIcon,
  DeleteOutline as DeleteOutlineIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { Tooltip as MuiTooltip } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DOMPurify from "dompurify";

// -----------------------------------------------------------------------------
// Other libraries
// -----------------------------------------------------------------------------
import { rrulestr } from "rrule";
import { alpha } from "@mui/material/styles";

// -----------------------------------------------------------------------------
// Local component helpers (placed near imports in your file)
// -----------------------------------------------------------------------------
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
// RRule parsing utility
const parseRRuleString = (ruleStr, dtstart) => {
  return rrulestr(ruleStr, { forceset: false, dtstart: new Date(dtstart) })
    .options;
};

const MicrosoftIcon = (props) => (
  <SvgIcon viewBox="0 0 24 24" {...props}>
    {/* four tiles */}
    <path d="M3 3h9v9H3z" /> {/* orange-ish (we'll color via sx) */}
    <path d="M12 3h9v9h-9z" /> {/* green */}
    <path d="M3 12h9v9H3z" /> {/* blue */}
    <path d="M12 12h9v9h-9z" /> {/* yellow */}
  </SvgIcon>
);

// Duration formatting utility
const formatDuration = (startISO, endISO) => {
  const start = parseISO(startISO);
  const end = parseISO(endISO);

  let totalMinutes = differenceInMinutes(end, start);
  if (totalMinutes < 0) totalMinutes = 0; // Handle negative durations

  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const CalendarView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  // Timezone state
  const [timezones, setTimezones] = useState([]);

  // Event management state
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    eventId: null,
    title: "",
    recurrence: null,
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    eventId: null,
    title: "",
    recurrence: null,
  });
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmEditTitle, setConfirmEditTitle] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteOption, setDeleteOption] = useState("this");
  const [editOption, setEditOption] = useState("this");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [eventToView, setEventToView] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState(
    "My Personal Calendar"
  );
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [calendarType, setCalendarType] = useState("Private");

  // AI Voice Input state
  const [aiVoiceInputVisible, setAiVoiceInputVisible] = useState(false);
  const [aiVoiceInputValue, setAiVoiceInputValue] = useState("");

  // Calendar management state
  const [createdCalendars, setCreatedCalendars] = useState([]);

  // Loading state
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Toast notifications
  const { showToast } = useToast();

const getDummyEvents = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return [
    {
      id: "dummy-1",
      title: "Team Meeting (Google)",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
      backgroundColor: "#2196f3",
      borderColor: "#2196f3",
      extendedProps: {
        description: "Weekly team sync meeting to discuss project progress",
        location: "Conference Room A",
        meetingUrl: "https://meet.google.com/dummy-link",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        recurrenceRule: null,
        attendees: [
          { name: "John Doe", email: "john@example.com", responseStatus: "accepted" },
          { name: "Jane Smith", email: "jane@example.com", responseStatus: "tentative" }
        ],
        eventType: "GOOGLE_IMPORT",        // helps detection in renderEventContent
        externalCalendarType: "GOOGLE",    // alternate detection path
        durationText: "60 min"
      }
    },
    {
      id: "dummy-2",
      title: "Client Presentation (Microsoft)",
      start: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 14, 30).toISOString(),
      end: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 16, 0).toISOString(),
      backgroundColor: "#ff9800",
      borderColor: "#ff9800",
      extendedProps: {
        description: "Quarterly business review presentation for key client",
        location: "Client Office - Downtown",
        meetingUrl: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        recurrenceRule: null,
        attendees: [
          { name: "Alice Johnson", email: "alice@client.com", responseStatus: "accepted" },
          { name: "Bob Wilson", email: "bob@example.com", responseStatus: "accepted" },
          { name: "Carol Brown", email: "carol@example.com", responseStatus: "declined" }
        ],
        eventType: "MICROSOFT_IMPORT",    // helps detection in renderEventContent
        externalCalendarType: "MICROSOFT",// alternate detection path
        durationText: "90 min"
      }
    }
  ];
};


  const handleCreate = (date, options = {}) => {
    const localMidnight = new Date(date);
    localMidnight.setHours(0, 0, 0, 0);
    setSelectedDate(localMidnight);
    setEventToEdit(null);

    if (options.isAI) {
      // Handle AI event creation
      // TODO: Open AI-specific dialog with voice input capabilities
      // For now, just open the regular dialog but mark it as AI mode
      setDialogOpen(true);
      // You could set a state to indicate AI mode and show different UI
    } else {
      // Regular event creation
      setDialogOpen(true);
    }
  };

  const handleSaveEvent = async (eventData) => {
    if (eventToEdit) {
      await handleUpdateEvent({ ...eventData, id: eventToEdit.id });
    } else {
      const payload = {
        originalEventId: null,
        calendarId: selectedCalendarId,
        title: eventData.title,
        startDateTime: eventData.startDate,
        endDateTime: eventData.endDate,
        location: eventData.location || "",
        meetingUrl: eventData.meetingUrl || "",
        description: eventData.description || "",
        eventStatus: "Active",
        eventColour: eventData.eventColour,
        timezone: eventData.timezone,
        reference: eventData.reference || "",
        recurrenceRule: eventData.recurrenceRule || null,
        attendees: eventData.attendees || [],
      };

      try {
        await axiosService.post("/calendar-events/create", payload);
        fetchEvents();
      } catch (error) {
        console.error("❌ Error creating event via API:", error);
      }

      setDialogOpen(false);
    }
  };

 const fetchEvents = async (retryCount = 0) => {
  const from = startOfMonth(new Date()).toISOString();
  const to = endOfMonth(new Date()).toISOString();

  if (!selectedCalendarId) {
    console.log("No calendar selected, showing dummy events");
    setEvents(getDummyEvents());
    setIsLoadingEvents(false);
    return;
  }

  setIsLoadingEvents(true);
  try {
    const response = await axiosService.get("/calendar-events/load", {
      params: {
        from,
        to,
        calendarId: selectedCalendarId,
      },
    });

    const fetchedEvents = response.data.map((event) => {
      const minutes = differenceInMinutes(
        parseISO(event.endDateTime),
        parseISO(event.startDateTime)
      );
      const calendarEvent = {
        id: event.id,
        title: event.title,
        extendedProps: {
          description: event.description,
          location: event.location,
          meetingUrl: event.meetingUrl,
          timezone: event.timezone,
          recurrenceRule: event.recurrenceRule,
          attendees: event.attendees,
          eventType: event.eventType,
          externalCalendarType: event.externalCalendarType,
        },
      };

      if (event.recurrenceRule) {
        calendarEvent.rrule = {
          ...parseRRuleString(event.recurrenceRule, event.startDateTime),
          dtstart: event.startDateTime,
        };
        calendarEvent.duration = formatDuration(
          event.startDateTime,
          event.endDateTime
        );
        if (
          Array.isArray(event.exceptionDates) &&
          event.exceptionDates.length
        ) {
          calendarEvent.exdate = event.exceptionDates;
        }
        calendarEvent.extendedProps.durationText = `${minutes} min`;
      } else {
        calendarEvent.start = event.startDateTime;
        calendarEvent.end = event.endDateTime;
        calendarEvent.extendedProps.durationText = `${minutes} min`;
      }

      if (event.eventColour) {
        calendarEvent.backgroundColor = event.eventColour;
        calendarEvent.borderColor = event.eventColour;
      }

      return calendarEvent;
    });

    // If no real events are found, add dummy events for demonstration
    const allEvents = fetchedEvents.length > 0 ? fetchedEvents : [...fetchedEvents, ...getDummyEvents()];
    
    setEvents(allEvents);
    console.log("📅 Events fetched successfully:", allEvents);
  } catch (error) {
    console.error("❌ Failed to fetch events:", error);
    
    // On error, show dummy events so the calendar still has content
    setEvents(getDummyEvents());
    
    if (error.response?.status === 403) {
      console.error("🔒 Forbidden error - likely OAuth token issue");
      showToast(
        "Calendar access denied. Please reconnect your Google Calendar.",
        "error"
      );
      if (retryCount === 0) {
        console.log("🔄 Attempting to refresh calendar connection...");
      }
    } else if (error.response?.status === 401) {
      console.error("🔑 Unauthorized - authentication issue");
      showToast("Authentication failed. Please log in again.", "error");
    } else if (error.response?.status >= 500) {
      console.error("🌐 Server error");
      showToast("Server error. Please try again later.", "error");
    } else {
      showToast("Failed to load events. Please try again.", "error");
    }
  } finally {
    setIsLoadingEvents(false);
  }
};

  const fetchCalendars = async () => {
    try {
      const response = await axiosService.get("/calendar/getList/");
      console.log("📅 Calendars loaded:", response.data);
      setCreatedCalendars(response.data);

      if (response.data && response.data.length > 0) {
        const storedId = localStorage.getItem("lastSelectedCalendarId");

        // Try to find the stored one first
        let targetCalendar =
          (storedId &&
            response.data.find((cal) => String(cal.id) === String(storedId))) ||
          response.data.find((cal) => cal.isDefault) ||
          response.data[0];

        if (targetCalendar) {
          console.log(
            "🎯 Setting calendar:",
            targetCalendar.name,
            "ID:",
            targetCalendar.id
          );
          setSelectedCalendar(targetCalendar.name);
          setSelectedCalendarId(targetCalendar.id);
          localStorage.setItem("lastSelectedCalendarId", targetCalendar.id);
        }
      }
    } catch (error) {
      console.error("❌ Failed to load calendars:", error);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    if (selectedCalendarId) {
      fetchEvents();
    }
  }, [selectedCalendarId]);

  const handleEventClick = (clickInfo) => {
    setEventToView(clickInfo.event);
    setSelectedDate(new Date(clickInfo.event.start));
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (event) => {
    const eventId = event.id;
    const title = event.title;
    const recurrence = event.extendedProps?.recurrenceRule || null;
    const instanceStart = event.start;

    setDeleteDialog({ open: true, eventId, title, recurrence });
    setSelectedDate(new Date(instanceStart));
    setConfirmTitle("");
    setDeleteOption("this");
  };

  const handleEditClick = (event) => {
    const eventId = event.id;
    const title = event.title;
    const recurrence = event.extendedProps?.recurrenceRule || null;
    const instanceStart = event.start;

    setEditDialog({ open: true, eventId, title, recurrence });
    setSelectedDate(new Date(instanceStart));
    setConfirmEditTitle("");
    setEditOption("this");
  };

  const handleConfirmDelete = async () => {
    const { eventId, recurrence } = deleteDialog;
    try {
      let response;
      if (!recurrence) {
        response = await axiosService.delete(
          `/calendar-events/delete/${eventId}`
        );
      } else {
        if (!selectedDate) {
          alert("Error: Could not determine the occurrence date.");
          return;
        }
        const payload = {
          eventId,
          deleteOption,
          occurrenceDate: selectedDate.toISOString(),
        };
        response = await axiosService.post(
          "/calendar-events/delete-recurring",
          payload
        );
      }
      setSnackbarOpen(true);
      fetchEvents();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to delete event.";
      alert(errorMsg);
    }
    setDeleteDialog({
      open: false,
      eventId: null,
      title: "",
      recurrence: null,
    });
    setConfirmTitle("");
  };

  const handleConfirmEdit = () => {
    const { eventId, title, recurrence } = editDialog;

    // Check if the confirmation title matches
    if (confirmEditTitle !== title) {
      alert("Please enter the correct event title to confirm.");
      return;
    }

    // Close the view dialog and edit dialog
    setViewDialogOpen(false);
    setEditDialog({
      open: false,
      eventId: null,
      title: "",
      recurrence: null,
    });
    setConfirmEditTitle("");

    // Set the event to edit and open the edit form
    setEventToEdit(eventToView);
    setDialogOpen(true);
    setSelectedDate(new Date(eventToView.start));
  };

  const handleUpdateEvent = async (eventData) => {
    const payload = {
      calendarId: selectedCalendarId,
      title: eventData.title,
      startDateTime: eventData.startDate,
      endDateTime: eventData.endDate,
      location: eventData.location || "",
      meetingUrl: eventData.meetingUrl || "",
      description: eventData.description || "",
      eventStatus: "Active",
      eventColour: eventData.eventColour,
      timezone: eventData.timezone,
      reference: eventData.reference || "",
      recurrenceRule: eventData.recurrenceRule || null,
      attendees: eventData.attendees || [],
      editOption: editOption,
      occurrenceDate: selectedDate.toISOString(),
    };

    try {
      await axiosService.put(
        `/calendar-events/update/${eventData.id}`,
        payload
      );
      fetchEvents();
    } catch (error) {
      console.error("❌ Error updating event via API:", error);
    }

    setDialogOpen(false);

    // Reset edit dialog state
    setEditDialog({
      open: false,
      eventId: null,
      title: "",
      recurrence: null,
    });
    setConfirmEditTitle("");
    setEditOption("this");
  };

  const formatDurationHuman = (startISO, endISO) => {
    const start = parseISO(startISO);
    const end = parseISO(endISO);
    if (!isValid(start) || !isValid(end)) return "";

    let total = Math.max(0, differenceInMinutes(end, start));

    const days = Math.floor(total / (60 * 24));
    total %= 60 * 24;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
    if (minutes > 0) parts.push(`${minutes} min`);
    return parts.join(" ") || "0 min";
  };

  // Helpers (keep near your other utils)
  const isValidCssColor = (color) => {
    if (!color || typeof color !== "string") return false;
    const el = document.createElement("div");
    el.style.color = "";
    el.style.color = color.trim();
    return el.style.color !== "";
  };
  const normalizeColor = (v, fb = "#1976d2") =>
    isValidCssColor(v) ? v.trim() : fb;

  // Perceived brightness: true if dark color
  const isDarkColor = (color) => {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = color || "#000";
    const computed = ctx.fillStyle;
    if (!computed) return false;

    const [r, g, b] = computed
      .replace(/^rgba?\(|\s+|\)$/g, "")
      .split(",")
      .map(Number);
    if ([r, g, b].some((v) => Number.isNaN(v))) return false;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  // Flat chip style (auto adapts to dark/light bg)
  const chipSx = (dark) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    padding: "2px 8px",
    borderRadius: 10,
    backgroundColor: dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.06)",
    color: "inherit",
    lineHeight: 1,
    fontWeight: 700,
    fontSize: "0.72rem",
  });
 
  const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
`;
  
const renderEventContent = (eventInfo) => {
  const { title, start, end, extendedProps, backgroundColor } = eventInfo.event;
  // remove trailing provider markers like " (Google)" or " (Microsoft)" from display title
  const displayTitle = String(title || "").replace(/\s*\((Google|Microsoft)\)\s*$/i, "").trim();

  const safeBg = normalizeColor(backgroundColor, "#1976d2");
  const darkBg = isDarkColor(safeBg);
  const fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
  const timeLabel = start && end ? `${fmt.format(start)} – ${fmt.format(end)}` : start ? fmt.format(start) : "";
  const durationText = start && end ? formatDurationHuman(start.toISOString(), end.toISOString()) : "";
  const isGoogle = (extendedProps?.eventType || "").toUpperCase() === "GOOGLE_IMPORT" || (extendedProps?.externalCalendarType || "").toUpperCase() === "GOOGLE";
  const isMicrosoft = (extendedProps?.eventType || "").toUpperCase() === "MICROSOFT_IMPORT" || (extendedProps?.externalCalendarType || "").toUpperCase() === "MICROSOFT";
  const timeChipLabel = durationText ? `${timeLabel} • ${durationText}` : timeLabel;

  const tooltipContent = (
    <Box sx={{ p: 0, maxWidth: 340 }}>
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${safeBg} 0%, ${alpha(safeBg, 0.8)} 100%)`,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#fff",
            fontSize: "1.1rem",
            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            mb: 1,
          }}
        >
          {displayTitle}
        </Typography>

       {/* Time chip inside tooltip */}
{timeChipLabel && (
  <MuiChip
    icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
    label={timeChipLabel}
    sx={{
      height: 30,
      fontWeight: 500,
      borderRadius: "20px",
      fontSize: "0.82rem",
      px: 1.5,
      bgcolor: "#ffffffcb", // solid white background
      color: 'black',    // event accent color for text
      border: `1px solid ${alpha(safeBg, 0.4)}`, // subtle border
      "& .MuiChip-icon": {
        color: 'black',
        ml: 0.5,
      },
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    }}
  />
)}

      </Box>

      <Box sx={{ p: 2.5, pt: 2, bgcolor: "#fff" }}>
        {extendedProps?.location && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 0.75, borderRadius: "50%", bgcolor: alpha(safeBg, 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlaceIcon sx={{ fontSize: 16, color: safeBg }} />
            </Box>
            <Typography sx={{ fontSize: "0.9rem", color: "#374151", fontWeight: 500 }}>{extendedProps.location}</Typography>
          </Box>
        )}

        {extendedProps?.description && (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 0.75, borderRadius: "50%", bgcolor: alpha(safeBg, 0.1), display: "flex", alignItems: "center", justifyContent: "center", mt: 0.2 }}>
              <DescriptionIcon sx={{ fontSize: 16, color: safeBg }} />
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.5, maxHeight: "60px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
              {extendedProps.description.replace(/<[^>]*>/g, "")}
            </Typography>
          </Box>
        )}

        {extendedProps?.meetingUrl && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 0.75, borderRadius: "50%", bgcolor: alpha("#10b981", 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LinkIcon sx={{ fontSize: 16, color: "#10b981" }} />
            </Box>
            <Typography sx={{ fontSize: "0.9rem", color: "#10b981", fontWeight: 500 }}>Video meeting available</Typography>
          </Box>
        )}

        {extendedProps?.attendees?.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 0.75, borderRadius: "50%", bgcolor: alpha("#8b5cf6", 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PeopleIcon sx={{ fontSize: 16, color: "#8b5cf6" }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "0.9rem", color: "#374151", fontWeight: 500 }}>{extendedProps.attendees.length} attendee{extendedProps.attendees.length > 1 ? "s" : ""}</Typography>
              <Box sx={{ display: "flex", ml: 1 }}>
                {extendedProps.attendees.slice(0, 3).map((attendee, idx) => (
                  <Avatar key={idx} sx={{ width: 20, height: 20, fontSize: "0.7rem", bgcolor: safeBg, color: "#fff", ml: idx > 0 ? -0.5 : 0, border: "2px solid #fff", zIndex: 3 - idx }}>
                    {attendee.name?.[0]?.toUpperCase() || attendee.email?.[0]?.toUpperCase() || "?"}
                  </Avatar>
                ))}
                {extendedProps.attendees.length > 3 && <Typography sx={{ fontSize: "0.8rem", color: "#6b7280", ml: 1 }}>+{extendedProps.attendees.length - 3}</Typography>}
              </Box>
            </Box>
          </Box>
        )}

        {extendedProps?.recurrenceRule && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 0.75, borderRadius: "50%", bgcolor: alpha("#f59e0b", 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RepeatIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
            </Box>
            <Typography sx={{ fontSize: "0.9rem", color: "#374151", fontWeight: 500 }}>Recurring event</Typography>
          </Box>
        )}

        {/* Provider badge placed at the END after all details */}
        {(isGoogle || isMicrosoft) && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 6,
                bgcolor: isGoogle ? alpha("#DB4437", 0.08) : alpha("#0078D4", 0.08),
                border: `1px solid ${isGoogle ? alpha("#DB4437", 0.18) : alpha("#0078D4", 0.18)}`,
              }}
            >
              {isGoogle && <GoogleIcon sx={{ fontSize: 16, color: "#DB4437" }} />}
              {isMicrosoft && <MicrosoftIcon sx={{ fontSize: 16, color: "#0078D4" }} />}
              <Typography sx={{ fontSize: "0.82rem", color: isGoogle ? "#DB4437" : "#0078D4", fontWeight: 600 }}>
                {isGoogle ? "Google Calendar" : "Microsoft Outlook"}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <MuiTooltip
      title={tooltipContent}
      placement="top"
      arrow
      enterDelay={200}
      leaveDelay={100}
      PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, 12] } }] }}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "transparent",
            color: "#fff",
            fontSize: "0.875rem",
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)",
            maxWidth: "none",
            border: "none",
            p: 0,
          },
        },
        arrow: { sx: { color: "#fff", "&::before": { boxShadow: "0 8px 16px rgba(0,0,0,0.1)" } } },
      }}
    >
      <Box
        sx={(theme) => ({
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: `linear-gradient(135deg, ${safeBg} 0%, ${alpha(safeBg, 0.85)} 100%)`,
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)", opacity: 0, transition: "opacity 0.3s ease" },
          "&:hover": { transform: "translateY(-2px) scale(1.02)", boxShadow: "0 8px 25px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.4)", "&::before": { opacity: 1 } },
        })}
      >
        <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)`, borderTopLeftRadius: 2, borderBottomLeftRadius: 2 }} />

        <Box sx={{ flex: 1, px: 2, py: 1, display: "flex", alignItems: "center", gap: 1.5, position: "relative", zIndex: 1 }}>
          
          {/* Compact preview: title only (no time chip here) */}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.8rem",
              lineHeight: 1.3,
              color: (theme) => theme.palette.getContrastText(safeBg),
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
          >
            {displayTitle}
          </Typography>
        </Box>

        <Box sx={{ position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)", transform: "skewX(-15deg)", transition: "left 0.6s ease", ".MuiBox-root:hover &": { left: "100%" } }} />
      </Box>
    </MuiTooltip>
  );
};


  // Event handlers
  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleCalendarTypeChange = (type) => {
    setCalendarType(type);
  };

  const handleAddEvent = () => {
    handleCreate(new Date());
  };

  const handleAddAIEvent = () => {
    // Toggle AI voice input field visibility
    setAiVoiceInputVisible(!aiVoiceInputVisible);
    if (!aiVoiceInputVisible) {
      setAiVoiceInputValue(""); // Clear previous input when opening
    }
  };

  const handleCreateFromAI = () => {
    if (aiVoiceInputValue.trim()) {
      // TODO: Parse AI input and create event
      console.log("Creating event from AI input:", aiVoiceInputValue);
      // For now, just open the regular event dialog with the AI input as title
      setSelectedDate(new Date());
      setEventToEdit(null);
      setDialogOpen(true);
      // You could set a state to indicate AI mode and pre-fill the form
      setAiVoiceInputVisible(false);
      setAiVoiceInputValue("");
    }
  };

  // Calendar management handlers
  const handleCalendarSelect = (calendarName, calendarId) => {
    console.log("🎯 Calendar selected:", calendarName, "ID:", calendarId);
    setSelectedCalendar(calendarName);
    setSelectedCalendarId(calendarId);
    localStorage.setItem("lastSelectedCalendarId", calendarId);
  };

  // Handle Google Calendar reconnection when tokens are invalid
  const handleGoogleCalendarReconnect = async (calendarId) => {
    try {
      showToast("Reconnecting to Google Calendar...", "info");

      // First, disconnect to clear any invalid tokens
      await axiosService.post("/calendar/google-disconnect", {
        calendarId: calendarId,
      });

      // Then trigger a reconnection
      showToast(
        "Please reconnect your Google Calendar to continue.",
        "warning"
      );

      // You could automatically trigger the Google OAuth flow here
      // For now, we'll just show a message asking the user to reconnect
    } catch (error) {
      console.error("❌ Error during Google Calendar reconnection:", error);
      showToast(
        "Failed to reconnect Google Calendar. Please try manually.",
        "error"
      );
    }
  };

  // Handle successful Google Calendar connection
  const handleGoogleCalendarConnected = (calendarData) => {
    console.log("✅ Google Calendar connected successfully:", calendarData);
    showToast(
      "Google Calendar connected successfully! Events will be loaded shortly.",
      "success"
    );

    // Refresh the calendar list to get updated connection status
    fetchCalendars();

    // Retry fetching events after a short delay
    setTimeout(() => {
      if (selectedCalendarId) {
        fetchEvents();
      }
    }, 1000);
  };

  // Handle Google Calendar disconnection
  const handleGoogleCalendarDisconnected = (calendarData) => {
    console.log("🔌 Google Calendar disconnected:", calendarData);
    showToast("Google Calendar disconnected successfully.", "info");

    // Refresh the calendar list to get updated connection status
    fetchCalendars();

    // Clear events if the disconnected calendar was selected
    if (selectedCalendarId === calendarData?.calendarId) {
      setEvents([]);
    }
  };

  const handleMicrosoftCalendarConnected = (calendarData) => {
    console.log("✅ Microsoft Calendar connected successfully:", calendarData);
    showToast(
      "Microsoft Calendar connected successfully! Events will be loaded shortly.",
      "success"
    );

    // Refresh the calendar list to get updated connection status
    fetchCalendars();

    // Retry fetching events after a short delay
    setTimeout(() => {
      if (selectedCalendarId) {
        fetchEvents();
      }
    }, 1000);
  };

  // Handle Microsoft Calendar disconnection
  const handleMicrosoftCalendarDisconnected = (calendarData) => {
    console.log("🔌 Microsoft Calendar disconnected:", calendarData);
    showToast("Microsoft Calendar disconnected successfully.", "info");

    // Refresh the calendar list to get updated connection status
    fetchCalendars();

    // Clear events if the disconnected calendar was selected
    if (selectedCalendarId === calendarData?.calendarId) {
      setEvents([]);
    }
  };

  const handleCalendarSettings = useCallback((calendar, action) => {
    console.log("Calendar settings action:", action, "for calendar:", calendar);
    // This will be handled by CalendarSidebar now
  }, []);

  const handleCalendarDelete = useCallback(
    async (calendar) => {
      console.log("Deleting calendar:", calendar);

      try {
        // Call API to delete calendar from server
        setCreatedCalendars((prev) =>
          prev.filter((cal) => cal.id !== calendar.id)
        );

        if (selectedCalendar === calendar.name) {
          setSelectedCalendar("My Personal Calendar");
        }

        // Show success notification
        showToast(
          `Calendar "${calendar.name}" has been deleted successfully`,
          "success"
        );
      } catch (error) {
        console.error("❌ Failed to delete calendar:", error);
        // Show error notification
        showToast(
          `Failed to delete calendar "${calendar.name}". Please try again.`,
          "error"
        );
      }
    },
    [selectedCalendar, showToast]
  );

  const handleCalendarCreate = useCallback(
    async (newCalendar) => {
      try {
        const response = await axiosService.post("/calendar", newCalendar);
        console.log("✅ Calendar created:", response.data);

        // Add the returned calendar to the state
        setCreatedCalendars((prev) => [...prev, response.data.data]);

        // Show success notification
        showToast(
          `Calendar "${newCalendar.name}" has been created successfully`,
          "success"
        );
      } catch (error) {
        console.error("❌ Failed to create calendar:", error);
        // Show error notification
        showToast(
          `Failed to create calendar "${newCalendar.name}". Please try again.`,
          "error"
        );
      }
    },
    [showToast]
  );

  const handleCalendarUpdate = useCallback(
    async (updatedCalendar) => {
      try {
        const response = await axiosService.put(
          `/calendar/${updatedCalendar.id}`,
          updatedCalendar
        );
        console.log("✅ Calendar updated:", response.data);

        // Update state with latest server data
        setCreatedCalendars((prev) =>
          prev.map((cal) =>
            cal.id === updatedCalendar.id ? response.data.data : cal
          )
        );

        // Show success notification
        showToast(
          `Calendar "${updatedCalendar.name}" has been updated successfully`,
          "success"
        );
      } catch (error) {
        console.error("❌ Failed to update calendar:", error);
        // Show error notification
        showToast(
          `Failed to update calendar "${updatedCalendar.name}". Please try again.`,
          "error"
        );
      }
    },
    [showToast]
  );
  const desc = eventToView?.extendedProps?.description || "";
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        // overflow: "hidden",
        width: "100%",
        maxWidth: "100%",
        position: "relative",
      }}
    >
      {/* Sidebar */}
      <CalendarSidebar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        selectedCalendar={
          createdCalendars.find((cal) => cal.id === selectedCalendarId) || null
        }
        calendarType={calendarType}
        onCalendarTypeChange={handleCalendarTypeChange}
        createdCalendars={createdCalendars}
        onCalendarSelect={handleCalendarSelect}
        onCalendarSettings={handleCalendarSettings}
        onCalendarDelete={handleCalendarDelete}
        onCalendarCreate={handleCalendarCreate}
        onCalendarUpdate={handleCalendarUpdate}
        onGoogleCalendarConnected={handleGoogleCalendarConnected}
        onGoogleCalendarDisconnected={handleGoogleCalendarDisconnected}
        onMicrosoftCalendarConnected={handleMicrosoftCalendarConnected}
        onMicrosoftCalendarDisconnected={handleMicrosoftCalendarDisconnected}
      />

      {/* Expand/Collapse Button - Always Visible */}
      <IconButton
        onClick={handleToggleSidebar}
        sx={{
          position: "fixed",
          top: { xs: 80, sm: 20 },
          left: sidebarCollapsed ? { xs: 10, sm: 20 } : { xs: 250, sm: 300 },
          zIndex: 1200,
          background: "#fff",
          border: "1px solid #e0e0e0",
          boxShadow: 2,
          "&:hover": {
            background: "#f5f5f5",
            boxShadow: 3,
          },
          transition: "all 0.3s ease",
        }}
        size="medium"
      >
        {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>

      {/* Main content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          // overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
          position: "relative",
        }}
      >
        {/* <LinkGoogleCalendarButton
          onSuccess={(calendar) => {
            console.log(":white_check_mark: Linked calendar:", calendar);
            // Optionally store the calendar or show a success message
            // You can later fetch events using a separate call
            // For now, don’t try to .map()
          }}
        /> */}
        {/* Main calendar content */}
        <CalendarMain
          events={events}
          onEventClick={handleEventClick}
          onDateClick={({ dateStr }) => handleCreate(new Date(dateStr))}
          renderEventContent={renderEventContent}
          sidebarCollapsed={sidebarCollapsed}
          onAddEvent={handleAddEvent}
          onAddAIEvent={handleAddAIEvent}
          aiVoiceInputVisible={aiVoiceInputVisible}
          aiVoiceInputValue={aiVoiceInputValue}
          onAiVoiceInputChange={setAiVoiceInputValue}
          onCreateFromAI={handleCreateFromAI}
        />

        {/* Loading overlay - Calendar area only */}
        {isLoadingEvents && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 2,
                padding: 3,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                minWidth: 200,
              }}
            >
              <CircularProgress
                size={40}
                thickness={3}
                sx={{
                  color: "#6f42c1",
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: "#333",
                  fontWeight: 500,
                  textAlign: "center",
                  fontSize: "0.9rem",
                }}
              >
                Loading events...
              </Typography>
            </Box>
          </Box>
        )}

        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleCreate(new Date())}
          sx={{
            position: "fixed",
            bottom: 30,
            right: 24,
            background: "linear-gradient(135deg, #00bcd4, #2196f3)",
            color: "#fff",
          }}
        >
          <AddIcon />
        </Fab>

        {/* Existing dialogs remain unchanged */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 5,
              boxShadow: 20,
              background: "#f8fafc",
              p: 0,
              width: 700,
              maxWidth: "90vw",
              overflow: "visible",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#e3f0ff",
              color: "#1976d2",
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              minHeight: 48,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <span role="img" aria-label="edit">
              📝
            </span>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                letterSpacing: 2,
                color: "#1976d2",
                opacity: 0.85,
              }}
            >
              View Event
            </Typography>
          </DialogTitle>
          <DialogContent
            sx={{
              px: 6,
              pt: 3,
              pb: 2,
              bgcolor: "background.paper",
              minHeight: 350,
              display: "flex",
              flexDirection: "column",
              gap: 0,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              boxShadow: "0 2px 16px 0 rgba(0,0,0,0.04)",
            }}
          >
            {/* Title as first field */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}
            >
              <LocalOfferIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 500, letterSpacing: 1 }}
                >
                  Title
                </Typography>
                <Typography
                  fontWeight={600}
                  color="primary.main"
                  sx={{ mt: 0.2, fontSize: "1.16rem" }}
                >
                  {eventToView?.title || "Event Title"}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            {/* Description */}

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <DescriptionIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Description
                </Typography>

                {desc ? (
                  <Typography
                    component="div"
                    fontWeight={500}
                    color="text.primary"
                    sx={{ mt: 0.2 }}
                    // NOTE: no children when using dangerouslySetInnerHTML
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(desc),
                    }}
                  />
                ) : (
                  <Typography
                    fontWeight={500}
                    color="text.primary"
                    sx={{ mt: 0.2 }}
                  >
                    <span style={{ color: "#aaa" }}>No description</span>
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />
            {/* Location */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <PlaceIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Location
                </Typography>
                <Typography
                  fontWeight={500}
                  color="text.primary"
                  sx={{ mt: 0.2 }}
                >
                  {eventToView?.extendedProps?.location || (
                    <span style={{ color: "#aaa" }}>No location</span>
                  )}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            {/* Time */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <AccessTimeIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Local Time
                </Typography>
                {eventToView?.start && eventToView?.end && (
                  <Typography
                    fontWeight={500}
                    color="text.primary"
                    sx={{ mt: 0.5 }}
                  >
                    {format(new Date(eventToView.start), "EEE, MMM d")} ·{" "}
                    {format(new Date(eventToView.start), "h:mm a")} –{" "}
                    {format(new Date(eventToView.end), "h:mm a")}{" "}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      (
                      {Intl.DateTimeFormat().resolvedOptions().timeZone ||
                        "Local time"}
                      )
                    </Typography>
                  </Typography>
                )}
              </Box>
            </Box>
            {/* Time */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <AccessTimeIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Time
                </Typography>
                {eventToView?.start && eventToView?.end && (
                  <Typography
                    fontWeight={500}
                    color="text.primary"
                    sx={{ mt: 0.5 }}
                  >
                    {formatInTimeZone(
                      new Date(eventToView.start),
                      eventToView?.extendedProps?.timezone,
                      "EEE, MMM d"
                    )}{" "}
                    ·{" "}
                    {formatInTimeZone(
                      new Date(eventToView.start),
                      eventToView?.extendedProps?.timezone,
                      "h:mm a"
                    )}{" "}
                    –{" "}
                    {formatInTimeZone(
                      new Date(eventToView.end),
                      eventToView?.extendedProps?.timezone,
                      "h:mm a"
                    )}{" "}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({eventToView?.extendedProps?.timezone || "Local time"})
                    </Typography>
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            {/* Recurrence */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <RepeatIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Recurrence
                </Typography>
                <Typography
                  fontWeight={500}
                  color={
                    eventToView?.extendedProps?.recurrenceRule
                      ? "primary.main"
                      : "#aaa"
                  }
                  sx={{ mt: 0.2 }}
                >
                  {eventToView?.extendedProps?.recurrenceRule ||
                    "No recurrence"}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            {/* Meeting Link */}
            {eventToView?.extendedProps?.meetingUrl && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <LinkIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Meeting
                    </Typography>

                    {/* Show raw meeting link */}
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        wordBreak: "break-all", // ensures long URLs wrap
                        mb: 1,
                      }}
                    >
                      {eventToView.extendedProps.meetingUrl}
                    </Typography>

                    {/* Join button */}
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      href={eventToView.extendedProps.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LinkIcon />}
                    >
                      Join Meeting
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
              </>
            )}
            {/* Attendees */}
            {eventToView?.extendedProps?.attendees &&
              Array.isArray(eventToView.extendedProps.attendees) &&
              eventToView.extendedProps.attendees.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <PeopleIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box sx={{ width: "100%" }}>
                    <Typography variant="overline" color="text.secondary">
                      Attendees
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mt: 0.5,
                      }}
                    >
                      {eventToView.extendedProps.attendees.map((att, idx) => (
                        <MuiChip
                          key={idx}
                          avatar={
                            <Avatar
                              sx={{
                                bgcolor: "primary.main",
                                color: "#fff",
                                width: 28,
                                height: 28,
                                fontSize: "1rem",
                              }}
                            >
                              {att.name?.[0] || "?"}
                            </Avatar>
                          }
                          label={att.name}
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            fontSize: "1rem",
                            px: 1.5,
                            borderRadius: 2,
                            bgcolor: "#e3f0ff",
                          }}
                          title={att.email}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
          </DialogContent>
          <DialogActions
            sx={{
              px: 6,
              pb: 4,
              pt: 3,
              display: "flex",
              justifyContent: "space-between",
              background: "background.default",
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
          >
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                handleDeleteClick(eventToView);
              }}
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1,
                fontSize: "1rem",
                "&:hover": {
                  backgroundColor: "#ffebee",
                  color: "error.main",
                  borderColor: "error.main",
                  "& .MuiSvgIcon-root": {
                    color: "error.main",
                  },
                },
              }}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                handleEditClick(eventToView);
              }}
              variant="contained"
              color="primary"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1,
                fontSize: "1rem",
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialog.open}
          TransitionComponent={Transition}
          keepMounted
          onClose={() =>
            setDeleteDialog({
              open: false,
              eventId: null,
              title: "",
              recurrence: null,
            })
          }
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, background: "#fff", boxShadow: 10 },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#fff3e0",
              color: "#bf360c",
              fontWeight: 600,
              px: 3,
              py: 2,
            }}
          >
            ⚠️ Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete the event{" "}
              <strong>{deleteDialog.title}</strong>?
            </Typography>
            {deleteDialog.recurrence && (
              <RadioGroup
                value={deleteOption}
                onChange={(e) => setDeleteOption(e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="this"
                  control={<Radio />}
                  label="Only this event"
                />
                <FormControlLabel
                  value="future"
                  control={<Radio />}
                  label="This and future events"
                />
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label="Entire series"
                />
              </RadioGroup>
            )}
            <Typography variant="body2" color="text.secondary" mb={2}>
              Please type the event title to confirm:
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                label="Confirm title"
                value={confirmTitle}
                onChange={(e) => setConfirmTitle(e.target.value)}
                fullWidth
                size="small"
              />
              <Tooltip title="Copy title">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(deleteDialog.title);
                    setSnackbarOpen(true);
                  }}
                >
                  <ContentCopyIcon />
                </Button>
              </Tooltip>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() =>
                setDeleteDialog({
                  open: false,
                  eventId: null,
                  title: "",
                  recurrence: null,
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={confirmTitle !== deleteDialog.title}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editDialog.open}
          TransitionComponent={Transition}
          keepMounted
          onClose={() =>
            setEditDialog({
              open: false,
              eventId: null,
              title: "",
              recurrence: null,
            })
          }
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, background: "#fff", boxShadow: 10 },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              fontWeight: 600,
              px: 3,
              py: 2,
            }}
          >
            ✏️ Confirm Edit
          </DialogTitle>
          <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to edit the event{" "}
              <strong>{editDialog.title}</strong>?
            </Typography>
            {editDialog.recurrence && (
              <RadioGroup
                value={editOption}
                onChange={(e) => setEditOption(e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="this"
                  control={<Radio />}
                  label="Only this event"
                />
                <FormControlLabel
                  value="future"
                  control={<Radio />}
                  label="This and future events"
                />
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label="Entire series"
                />
              </RadioGroup>
            )}
            <Typography variant="body2" color="text.secondary" mb={2}>
              Please type the event title to confirm:
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                label="Confirm title"
                value={confirmEditTitle}
                onChange={(e) => setConfirmEditTitle(e.target.value)}
                fullWidth
                size="small"
              />
              <Tooltip title="Copy title">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(editDialog.title);
                    setSnackbarOpen(true);
                  }}
                >
                  <ContentCopyIcon />
                </Button>
              </Tooltip>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() =>
                setEditDialog({
                  open: false,
                  eventId: null,
                  title: "",
                  recurrence: null,
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmEdit}
              disabled={confirmEditTitle !== editDialog.title}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="md"
          scroll="body"
          slotProps={{
            paper: {
              sx: {
                bgcolor: "white",
                borderRadius: isMobile ? 0 : 2,
                m: { xs: 0, sm: "4px 0", md: "6px 0" },
                mx: "auto",
                width: { xs: "100%", sm: 600, md: 800 },
                overflow: "visible",
              },
            },
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              overflow: "visible",
              bgcolor: "white",
              borderRadius: isMobile ? 0 : 2,
              m: 1,
            }}
          >
            <EventForm
              initialDate={selectedDate}
              initialEvent={eventToEdit}
              onSave={handleSaveEvent}
              onCancel={() => setDialogOpen(false)}
              minHeight={{ xs: 350, sm: 420, md: 500 }}
            />
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message="Copied to clipboard"
        />
      </Box>
    </Box>
  );
};

export default CalendarView;
