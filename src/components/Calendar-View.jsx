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
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

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

    // Don't fetch if no calendar is selected
    if (!selectedCalendarId) {
      console.log("No calendar selected, skipping event fetch");
      setEvents([]);
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
            eventType: event.eventType, // e.g. "GOOGLE_IMPORT"
            externalCalendarType: event.externalCalendarType, // e.g. "GOOGLE"
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

          if (Array.isArray(event.exceptionDates) && event.exceptionDates.length) {
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

      setEvents(fetchedEvents);
      console.log("📅 Events fetched successfully:", fetchedEvents);
    } catch (error) {
      console.error("❌ Failed to fetch events:", error);

      // Handle specific error cases
      if (error.response?.status === 403) {
        console.error("🔒 Forbidden error - likely OAuth token issue");
        showToast(
          "Calendar access denied. Please reconnect your Google Calendar.",
          "error"
        );

        // If this is a retry, don't retry again to avoid infinite loops
        if (retryCount === 0) {
          console.log("🔄 Attempting to refresh calendar connection...");
          // You could trigger a reconnection flow here
          // For now, just show the error
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

  const renderEventContent = (eventInfo) => {
    const { title, start, end, extendedProps, backgroundColor } = eventInfo.event;
  
    // 🔎 Detect weekly/day time-grid and short events
    const isTimeGrid =
      eventInfo.view?.type === "timeGridWeek" || eventInfo.view?.type === "timeGridDay";
    const durationMs = start && end ? end.getTime() - start.getTime() : 0;
    const isShort = durationMs > 0 && durationMs <= 45 * 60 * 1000; // 45 min threshold
    const compact = isTimeGrid && isShort; // <— compact only in week/day for short events
  
    const fmt = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const timeLabel =
      start && end
        ? `${fmt.format(start)} – ${fmt.format(end)}`
        : start
        ? fmt.format(start)
        : "";
  
    // Uses your formatDurationHuman helper (multi‑day friendly)
    const durationText =
      start && end
        ? formatDurationHuman(start.toISOString(), end.toISOString())
        : "";
  
    // Safe bg + adaptive contrast
    const safeBg = normalizeColor(backgroundColor, "#1976d2");
    const darkBg = isDarkColor(safeBg);
    const isGoogle =
      (extendedProps?.eventType || "").toUpperCase() === "GOOGLE_IMPORT" ||
      (extendedProps?.externalCalendarType || "").toUpperCase() === "GOOGLE";
  
    // 🔧 compact chip style tweaks
    const chipCompactSx = {
      padding: compact ? "1px 6px" : "2px 8px",
      borderRadius: 10,
      backgroundColor: darkBg ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.06)",
    };
  
    return (
      <Box
        sx={(theme) => ({
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: compact ? 0.25 : 0.5,
          px: compact ? 0.75 : 1,
          py: compact ? 0.5 : 0.75,
          borderRadius: 1,
          backgroundColor: safeBg,
          color: theme.palette.getContrastText(safeBg),
          fontFamily: theme.typography.fontFamily,
          overflow: "hidden",
        })}
      >
        {/* Title (hidden in compact to save vertical space) */}
        {!compact && (
          <Typography
            title={title}
            sx={{
              fontWeight: 700,
              fontSize: "0.92rem",
              lineHeight: 1.2,
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
        )}
  
        {/* Badges row (flat) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {timeLabel && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, ...chipCompactSx }} title={timeLabel}>
              <ScheduleIcon sx={{ fontSize: compact ? 12 : 14, opacity: 0.9 }} />
              <Typography component="span" sx={{ fontSize: compact ? "0.68rem" : "0.72rem", fontWeight: 700 }}>
                {timeLabel}
              </Typography>
            </Box>
          )}
  
          {durationText && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, ...chipCompactSx }} title={durationText}>
              <AccessTimeIcon sx={{ fontSize: compact ? 11 : 13, opacity: 0.9 }} />
              <Typography component="span" sx={{ fontSize: compact ? "0.68rem" : "0.72rem", fontWeight: 700 }}>
                {durationText}
              </Typography>
            </Box>
          )}
  
          {/* Hide extras in compact to prevent clipping */}
          {!compact && extendedProps?.location && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, padding: "2px 8px", borderRadius: 10,
              backgroundColor: darkBg ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.06)" }} title={extendedProps.location}>
              <PlaceIcon sx={{ fontSize: 14, opacity: 0.9 }} />
              <Typography
                component="span"
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  maxWidth: "10rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {extendedProps.location}
              </Typography>
            </Box>
          )}
  
          {!compact && extendedProps?.recurrenceRule && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, padding: "2px 8px", borderRadius: 10,
              backgroundColor: darkBg ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.06)" }} title="Repeats">
              <RepeatIcon sx={{ fontSize: 14, opacity: 0.9 }} />
              <Typography component="span" sx={{ fontSize: "0.72rem", fontWeight: 700 }}>
                Repeats
              </Typography>
            </Box>
          )}
  
          {!compact && isGoogle && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                padding: "2px 8px",
                borderRadius: 10,
                backgroundColor: darkBg ? "#DB4437" : "#FDECEA",
                color: darkBg ? "#fff" : "#B71C1C",
                borderColor: darkBg ? "#B71C1C" : "#F8BBD0",
              }}
              title="Imported from Google Calendar"
            >
              <GoogleIcon
                sx={{
                  fontSize: 14,
                  opacity: 0.9,
                  color: darkBg ? "#fff" : "#DB4437",
                }}
              />
              <Typography component="span" sx={{ fontSize: "0.72rem", fontWeight: 700, ml: 0.5 }}>
                Google
              </Typography>
            </Box>
          )}
        </Box>
  
        {/* Tiny title row added in compact so you still see the subject */}
        {compact && (
          <Typography
            title={title}
            sx={{
              mt: 0.25,
              fontSize: "0.72rem",
              fontWeight: 700,
              lineHeight: 1.1,
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              opacity: 0.9,
            }}
          >
            {title}
          </Typography>
        )}
  
        {/* Attendees block — keep your full logic, but hide in compact to avoid clipping */}
        {!compact &&
          extendedProps?.attendees?.length > 0 &&
          (() => {
            const avatarFillBg = darkBg ? "#ffffff" : "#111827";
            const avatarFillText = darkBg ? "#111827" : "#ffffff";
            const avatarRing = darkBg ? "rgba(255,255,255,0.85)" : "rgba(17,24,39,0.25)";
  
            return (
              <AvatarGroup
                max={3}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 22,
                    height: 22,
                    fontSize: "0.7rem",
                    bgcolor: avatarFillBg,
                    color: avatarFillText,
                    border: `1px solid ${avatarRing}`,
                  },
                  "& .MuiAvatarGroup-avatar": {
                    bgcolor: avatarFillBg,
                    color: avatarFillText,
                    border: `1px solid ${avatarRing}`,
                  },
                }}
              >
                {extendedProps.attendees.map((a, idx) => {
                  const status = (a.responseStatus || a.status || "").toLowerCase();
                  const hasImg = Boolean(a.photoUrl);
                  return (
                    <Tooltip
                      key={idx}
                      placement="top"
                      arrow
                      title={
                        <Box sx={{ p: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                            {a.name || "Unknown Name"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.85rem", opacity: 0.8 }}>
                            {a.email || "No Email"}
                          </Typography>
                          {status && (
                            <Typography sx={{ fontSize: "0.8rem", mt: 0.5 }}>
                              Status: {status}
                            </Typography>
                          )}
                        </Box>
                      }
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "#333",
                            color: "#fff",
                            fontSize: "0.9rem",
                            maxWidth: 240,
                            borderRadius: 1,
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
                          },
                        },
                        arrow: { sx: { color: "#333" } },
                      }}
                    >
                      <Avatar
                        src={hasImg ? a.photoUrl : undefined}
                        alt={a.name || a.email || "Attendee"}
                        sx={{
                          bgcolor: hasImg ? avatarFillBg : avatarFillBg,
                          color: avatarFillText,
                          border: `1px solid ${avatarRing}`,
                          position: "relative",
                        }}
                      >
                        {!hasImg &&
                          (a.name?.[0]?.toUpperCase() || a.email?.[0]?.toUpperCase() || "?")}
  
                        {status && (
                          <Box
                            sx={{
                              position: "absolute",
                              right: -2,
                              bottom: -2,
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: darkBg
                                ? "0 0 0 1px rgba(255,255,255,0.4)"
                                : "0 0 0 1px rgba(0,0,0,0.12)",
                            }}
                          >
                            {/^(accepted|yes)$/.test(status) ? (
                              <CheckCircleIcon sx={{ fontSize: 12, color: "#2e7d32" }} />
                            ) : /^(declined|no)$/.test(status) ? (
                              <CancelIcon sx={{ fontSize: 12, color: "#c62828" }} />
                            ) : (
                              <HourglassEmptyIcon sx={{ fontSize: 12, color: "#6b7280" }} />
                            )}
                          </Box>
                        )}
                      </Avatar>
                    </Tooltip>
                  );
                })}
              </AvatarGroup>
            );
          })()}
      </Box>
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

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
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
          overflow: "hidden",
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
                <Typography
                  fontWeight={500}
                  color="text.primary"
                  sx={{ mt: 0.2 }}
                >
                  {eventToView?.extendedProps?.description || (
                    <span style={{ color: "#aaa" }}>No description</span>
                  )}
                </Typography>
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
                      ({Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time"})
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
                    
                  {formatInTimeZone(new Date(eventToView.start), eventToView?.extendedProps?.timezone, "EEE, MMM d")} ·{" "}
                  {formatInTimeZone(new Date(eventToView.start), eventToView?.extendedProps?.timezone, "h:mm a")} –{" "}
                  {formatInTimeZone(new Date(eventToView.end), eventToView?.extendedProps?.timezone, "h:mm a")}{" "}
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
