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
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Snackbar,
  Tooltip,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CalendarView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [popoverData, setPopoverData] = useState(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, eventId: null, title: "", recurrence: null });
  const [confirmTitle, setConfirmTitle] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteOption, setDeleteOption] = useState("this");

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

      const fetchedEvents = response.data.map((event) => {
        const calendarEvent = {
          id: event.id,
          title: event.title,
          start: event.startDateTime,
          end: event.endDateTime,
          extendedProps: {
            description: event.description,
            location: event.location,
            timezone: event.timezone,
            meetingUrl: event.meetingUrl,
            recurrenceRule: event.recurrenceRule,
          },
        };

        if (event.recurrenceRule) {
          calendarEvent.rrule = event.recurrenceRule;
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
    setPopoverData({
      anchorEl: clickInfo.jsEvent.currentTarget,
      event: clickInfo.event,
    });
  };

  const handlePopoverClose = () => setPopoverData(null);

  const handleMenuOpen = (event, eventId) => {
    event.stopPropagation();
    setMenuAnchorEls((prev) => ({ ...prev, [eventId]: event.currentTarget }));
  };

  const handleMenuClose = (eventId) => {
    setMenuAnchorEls((prev) => ({ ...prev, [eventId]: null }));
  };

  const handleDeleteClick = (eventId, title, recurrence) => {
    setDeleteDialog({ open: true, eventId, title, recurrence });
    setConfirmTitle("");
    setDeleteOption("this");
  };

  const handleConfirmDelete = () => {
    console.log("Deleting", deleteOption, "for event ID:", deleteDialog.eventId);
    setDeleteDialog({ open: false, eventId: null, title: "", recurrence: null });
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
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'Poppins', 'Roboto', sans-serif",
          fontSize: "0.85rem",
          fontWeight: 500,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <Typography noWrap sx={{ flexGrow: 1 }}>{eventInfo.event.title}</Typography>
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, eventInfo.event.id)}
          sx={{ color: "#fff", ml: 1 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEls[eventInfo.event.id]}
          open={Boolean(menuAnchorEls[eventInfo.event.id])}
          onClose={() => handleMenuClose(eventInfo.event.id)}
        >
          <MenuItem onClick={() => alert("Edit Event ID: " + eventInfo.event.id)}>Edit</MenuItem>
          <MenuItem
            onClick={() => handleDeleteClick(
              eventInfo.event.id,
              eventInfo.event.title,
              eventInfo.event.extendedProps.recurrenceRule
            )}
          >
            Delete
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <>
      {/* Calendar & FAB */}
      <Box sx={{ p: 3, minHeight: "calc(100vh - 64px)", background: "#f7f7f9" }}>
        <Card elevation={8} sx={{ borderRadius: 4, p: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              📅 Calendar
            </Typography>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
              initialView="dayGridMonth"
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setDeleteDialog({ open: false, eventId: null, title: "", recurrence: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, background: "#fff", boxShadow: 10 } }}
      >
        <DialogTitle sx={{ backgroundColor: "#fff3e0", color: "#bf360c", fontWeight: 600, px: 3, py: 2 }}>
          ⚠️ Confirm Delete
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete the event <strong>{deleteDialog.title}</strong>?
          </Typography>

          {deleteDialog.recurrence && (
            <RadioGroup
              value={deleteOption}
              onChange={(e) => setDeleteOption(e.target.value)}
              sx={{ mb: 2 }}
            >
              <FormControlLabel value="this" control={<Radio />} label="Only this event" />
              <FormControlLabel value="future" control={<Radio />} label="This and future events" />
              <FormControlLabel value="all" control={<Radio />} label="Entire series" />
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
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(deleteDialog.title);
                  setSnackbarOpen(true);
                }}
                edge="end"
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, eventId: null, title: "", recurrence: null })}>
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Copied to clipboard"
      />
    </>
  );
};

export default CalendarView;