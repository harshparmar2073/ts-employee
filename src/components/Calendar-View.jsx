// CalendarView.jsx

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { startOfMonth, endOfMonth } from "date-fns";
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

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

import { rrulestr } from "rrule";

const parseRRuleString = (ruleStr) => {
  return rrulestr(ruleStr, { forceset: false }).options;
};

const CalendarView = () => {
  const theme = useTheme();
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
    setDialogOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
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
            ...parseRRuleString(event.recurrenceRule),
            dtstart: event.startDateTime,
          };
        } else {
          calendarEvent.start = event.startDateTime;
          calendarEvent.end = event.endDateTime;
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

  const renderEventContent = (eventInfo) => {
    return (
      <Box
        sx={{
          p: 1.2,
          backgroundColor: eventInfo.event.backgroundColor,
          color: "#fff",
          borderRadius: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          fontFamily: "'Poppins', 'Roboto', sans-serif",
          fontSize: "0.85rem",
          fontWeight: 500,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <Typography noWrap>{eventInfo.event.title}</Typography>
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
        maxWidth="sm"
      >
        <DialogTitle>📌 Event Details</DialogTitle>
        <DialogContent>
          <Typography variant="h6">{eventToView?.title}</Typography>
          <Typography>
            Description: {eventToView?.extendedProps?.description || "—"}
          </Typography>
          <Typography>
            Location: {eventToView?.extendedProps?.location || "—"}
          </Typography>
          <Typography>
            Time: {new Date(eventToView?.start).toLocaleString()} -{" "}
            {new Date(eventToView?.end).toLocaleString()}
          </Typography>
          <Typography>
            Recurrence: {eventToView?.extendedProps?.recurrenceRule || "None"}
          </Typography>
          {eventToView?.extendedProps?.attendees && Array.isArray(eventToView.extendedProps.attendees) && eventToView.extendedProps.attendees.length > 0 && (
            <Box mt={2}>
              <Typography fontWeight={600} mb={0.5}>Attendees:</Typography>
              {eventToView.extendedProps.attendees.map((att, idx) => (
                <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                  {att.name} ({att.email})
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              handleDeleteClick(eventToView);
            }}
            color="error"
          >
            Delete
          </Button>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setDialogOpen(true);
              setSelectedDate(new Date(eventToView.start));
            }}
            variant="contained"
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
