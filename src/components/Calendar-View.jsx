// CalendarView.jsx

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
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


import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Fab,
  TextField,
  Snackbar,
  Tooltip,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";

import {
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  Description as DescriptionIcon,
  Place as PlaceIcon,
  AccessTime as AccessTimeIcon,
  Repeat as RepeatIcon,
  People as PeopleIcon,
  Link as LinkIcon,
  DeleteOutline as DeleteOutlineIcon,
  TextFormat as TextFormatIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  LocalOffer as LocalOfferIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

import { Avatar, Chip, Divider } from '@mui/material';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

import { rrulestr } from "rrule";

// TODO: timezone handling
const parseRRuleString = (ruleStr, dtstart) => {
  return rrulestr(ruleStr, { forceset: false, dtstart: new Date(dtstart) })
    .options;
};

function formatDuration(startISO, endISO) {
  const start = parseISO(startISO);
  const end = parseISO(endISO);

  let totalMinutes = differenceInMinutes(end, start);
  if (totalMinutes < 0) totalMinutes = 0; // Handle negative durations

  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
}

const CalendarView = () => {
  const theme = useTheme(); // <-- Only call useTheme here
  const isMobile = useMediaQuery("(max-width:600px)");

  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    eventId: null,
    title: "",
    recurrence: null,
  });
  const [confirmTitle, setConfirmTitle] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteOption, setDeleteOption] = useState("this");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [eventToView, setEventToView] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  const headerToolbar = isMobile
    ? {
        left: "prev,next today",
        center: "title",
        right: "createButton",
      }
    : {
        left: "prev,next today createButton",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listYear",
      };

  const handleCreate = (date) => {
    const localMidnight = new Date(date);
    localMidnight.setHours(0, 0, 0, 0);
    setSelectedDate(localMidnight);
    setEventToEdit(null); // Clear edit state
    setDialogOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    if (eventToEdit) {
      // Editing an existing event
      await handleUpdateEvent({ ...eventData, id: eventToEdit.id });
    } else {
      // Creating a new event
      const payload = {
        originalEventId: null,
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
        await axiosService.post("/auth/calendar-events/create", payload);
        fetchEvents();
      } catch (error) {
        console.error("❌ Error creating event via API:", error);
      }

      setDialogOpen(false);
    }
  };

  const fetchEvents = async () => {
    const from = startOfMonth(new Date()).toISOString();
    const to = endOfMonth(new Date()).toISOString();

    try {
      const response = await axiosService.get("/auth/calendar-events/load", {
        params: { from, to },
      });

      console.log(" API /load response:", response.data);

      const fetchedEvents = response.data.map((event) => {

        const minutes = differenceInMinutes(
          parseISO(event.endDateTime),
          parseISO(event.startDateTime)
        );
        console.log(
          `Event ${event.id} duration: ${minutes} minutes`
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
            dtstart: event.startDateTime,
          };
          calendarEvent.duration = formatDuration(
            event.startDateTime,
            event.endDateTime
          );
          calendarEvent.exdate = event.exceptionDates;
          calendarEvent.extendedProps.durationText = `${minutes} min`; // <-- Add this
        } else {
          calendarEvent.start = event.startDateTime;
          calendarEvent.end = event.endDateTime;

          calendarEvent.extendedProps.durationText = `${minutes} min`; // <-- Add this
        }

        if (event.eventColour) {
          calendarEvent.backgroundColor = event.eventColour;
          calendarEvent.borderColor = event.eventColour;
        }

        return calendarEvent;
      });

      setEvents(fetchedEvents);
    } catch (error) {
      console.error("❌ Failed to fetch events via /load:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleConfirmDelete = async () => {
    const { eventId, recurrence } = deleteDialog;
    try {
      let response;
      if (!recurrence) {
        response = await axiosService.delete(
          `/auth/calendar-events/delete/${eventId}`
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
          "/auth/calendar-events/delete-recurring",
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

  const handleUpdateEvent = async (eventData) => {
    const payload = {
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
      await axiosService.put(
        `/auth/calendar-events/update/${eventData.id}`,
        payload
      );
      fetchEvents(); // Refresh the calendar
    } catch (error) {
      console.error("❌ Error updating event via API:", error);
    }

    setDialogOpen(false);
  };


  
 
  
  const renderEventContent = (eventInfo) => {
    const { title, start, end, extendedProps } = eventInfo.event;
  
    const formattedStart = new Date(start).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  
    const formattedEnd = new Date(end).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
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
        {/* Title */}
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
  
        {/* Time Range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
          <ScheduleIcon sx={{ fontSize: 16, opacity: 0.9 }} />
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 500,
              opacity: 0.9,
              color: '#fff',
            }}
          >
            {formattedStart} – {formattedEnd}
          </Typography>
        </Box>
  
        {/* Duration */}
        {extendedProps.durationText && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
            <AccessTimeIcon sx={{ fontSize: 16, opacity: 0.8 }} />
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 500,
                opacity: 0.85,
                color: '#fff',
              }}
            >
              {extendedProps.durationText}
            </Typography>
          </Box>
        )}
  
        {/* Timezone */}
        {extendedProps.timezone && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
            <PublicIcon sx={{ fontSize: 16, opacity: 0.85 }} />
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 500,
                opacity: 0.85,
                color: '#fff',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {extendedProps.timezone}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{ p: 3, minHeight: "calc(100vh - 64px)", background: "#f7f7f9" }}
      >
        <Card elevation={8} sx={{ borderRadius: 4, p: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              📅 Calendar
            </Typography>
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                interactionPlugin,
                rrulePlugin,
              ]}
              initialView="dayGridMonth"
              slotDuration="00:15:00" // ⬅️ Set 15-minute slot duration
              slotLabelInterval="01:00" // ⬅️ Label every hour (optional)
              allDaySlot={false} // ⬅️ Optional: hide the all-day slot row
              headerToolbar={headerToolbar}
              customButtons={{
                createButton: {
                  text: "Create",
                  click: () => handleCreate(new Date()),
                },
              }}
              events={events}
              selectable
              editable
              eventClick={handleEventClick}
              dateClick={({ dateStr }) => handleCreate(new Date(dateStr))}
              eventContent={renderEventContent}
              height="auto"
            />
          </CardContent>
        </Card>

        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleCreate(new Date())}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(135deg, #00bcd4, #2196f3)",
            color: "#fff",
          }}
        >
          <AddIcon />
        </Fab>
      </Box>

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
            <LocalOfferIcon sx={{ fontSize: 28 }} /> {/* Yellow accent */}
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
                {eventToView?.extendedProps?.recurrenceRule || "No recurrence"}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          {/* Meeting Link */}
          {eventToView?.extendedProps?.meetingUrl && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
                      <Chip
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
                backgroundColor: "#ffebee", // light red background
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
              setEventToEdit(eventToView); // Set event to edit
              setDialogOpen(true);
              setSelectedDate(new Date(eventToView.start));
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
            // onNextRecurring={() => setDialogOpen(false)}
            // onOpenRecurrenceDialog={() => {}}
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
    </>
  );
};

export default CalendarView;
