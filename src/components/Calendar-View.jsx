// CalendarView.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  differenceInMinutes,
} from "date-fns";

import axiosService from "../services/axiosService";
import Slide from "@mui/material/Slide";
import EventForm from "../components/EventForm";
import { useToast } from "../context/ToastContext";

// Import new components
import CalendarSidebar from "./CalendarSidebar";
import CalendarMain from "./CalendarMain";

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
  Avatar,
  Fab,
  CircularProgress,
  Backdrop,
} from "@mui/material";

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

import { rrulestr } from "rrule";

import LinkGoogleCalendarButton from "./LinkGoogleCalendarButton";

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CalendarView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

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

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Event management handlers
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
            timezone: event.timezone,
            meetingUrl: event.meetingUrl,
            recurrenceRule: event.recurrenceRule,
            attendees: event.attendees,
          },
        };

        if (event.recurrenceRule) {
          calendarEvent.rrule = {
            ...parseRRuleString(event.recurrenceRule, event.startDateTime),
            dtstart: event.startDateTime, // ✅ Must be JS Date
          };
          calendarEvent.duration = formatDuration(
            event.startDateTime,
            event.endDateTime
          );
          calendarEvent.exdate = event.exceptionDates;
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
        showToast("Calendar access denied. Please reconnect your Google Calendar.", "error");
        
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
      setCreatedCalendars(response.data); // Or `response.data.data` if using `ApiResponse`

      // Set default calendar if available
      if (response.data && response.data.length > 0) {
        const defaultCalendar =
          response.data.find((cal) => cal.isDefault) || response.data[0];
        if (defaultCalendar) {
          console.log(
            "🎯 Setting default calendar:",
            defaultCalendar.name,
            "ID:",
            defaultCalendar.id
          );
          setSelectedCalendar(defaultCalendar.name);
          setSelectedCalendarId(defaultCalendar.id);
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

  const renderEventContent = (eventInfo) => {
    const { title, start, end, extendedProps } = eventInfo.event;

    const formattedStart = new Date(start).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const formattedEnd = new Date(end).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Box
        sx={{
          p: 1,
          backgroundColor: eventInfo.event.backgroundColor || "#1976d2",
          color: "#fff",
          borderRadius: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          fontFamily: theme.typography.fontFamily,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          noWrap
          sx={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#fff",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.3 }}>
          <ScheduleIcon sx={{ fontSize: 16, opacity: 0.9 }} />
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 500,
              opacity: 0.9,
              color: "#fff",
            }}
          >
            {formattedStart} – {formattedEnd}
          </Typography>
        </Box>

        {extendedProps.durationText && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.2 }}
          >
            <AccessTimeIcon sx={{ fontSize: 16, opacity: 0.8 }} />
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 500,
                opacity: 0.85,
                color: "#fff",
              }}
            >
              {extendedProps.durationText}
            </Typography>
          </Box>
        )}

        {extendedProps.timezone && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.2 }}
          >
            <PublicIcon sx={{ fontSize: 16, opacity: 0.85 }} />
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 500,
                opacity: 0.85,
                color: "#fff",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {extendedProps.timezone}
            </Typography>
          </Box>
        )}
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

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
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
  };

  // Handle Google Calendar reconnection when tokens are invalid
  const handleGoogleCalendarReconnect = async (calendarId) => {
    try {
      showToast("Reconnecting to Google Calendar...", "info");
      
      // First, disconnect to clear any invalid tokens
      await axiosService.post('/calendar/google-disconnect', {
        calendarId: calendarId
      });
      
      // Then trigger a reconnection
      showToast("Please reconnect your Google Calendar to continue.", "warning");
      
      // You could automatically trigger the Google OAuth flow here
      // For now, we'll just show a message asking the user to reconnect
      
    } catch (error) {
      console.error("❌ Error during Google Calendar reconnection:", error);
      showToast("Failed to reconnect Google Calendar. Please try manually.", "error");
    }
  };

  // Handle successful Google Calendar connection
  const handleGoogleCalendarConnected = (calendarData) => {
    console.log("✅ Google Calendar connected successfully:", calendarData);
    showToast("Google Calendar connected successfully! Events will be loaded shortly.", "success");
    
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

  // Utility function to check if a calendar is connected to Google
  const isGoogleCalendarConnected = (calendar) => {
    return calendar?.externalCalendarType === 'GOOGLE';
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

  const [googleEvents, setGoogleEvents] = useState([]);

  const handleGoogleEvents = (apiEvents) => {
    const formatted = apiEvents.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled",
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime,
    }));

    setGoogleEvents(formatted);
  };

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
        selectedCalendar={createdCalendars.find(cal => cal.id === selectedCalendarId) || null}
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
              Edit Event
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
                  Time
                </Typography>
                <Typography
                  fontWeight={500}
                  color="text.primary"
                  sx={{ mt: 0.2 }}
                >
                  {eventToView?.start
                    ? new Date(eventToView?.start).toLocaleString()
                    : ""}{" "}
                  -{" "}
                  {eventToView?.end
                    ? new Date(eventToView?.end).toLocaleString()
                    : ""}
                </Typography>
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
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <LinkIcon color="primary" />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Meeting
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    href={eventToView.extendedProps.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<LinkIcon />}
                    sx={{ mt: 0.5 }}
                  >
                    Join Meeting
                  </Button>
                </Box>
              </Box>
            )}
            {eventToView?.extendedProps?.meetingUrl && (
              <Divider sx={{ my: 1.5 }} />
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
                            <MuiAvatar
                              sx={{
                                bgcolor: "primary.main",
                                color: "#fff",
                                width: 28,
                                height: 28,
                                fontSize: "1rem",
                              }}
                            >
                              {att.name?.[0] || "?"}
                            </MuiAvatar>
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