import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { startOfMonth, endOfMonth } from "date-fns";
import axiosService from "../services/axiosService";

import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventForm from "./EventForm";
import CustomRecurrenceDialog from "./CustomRecurrenceDialog";

const CalendarView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [recurrenceInitialData, setRecurrenceInitialData] = useState(null);

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
      timezone: eventData.timezone,
      reference: eventData.reference || "",
      recurrenceRule: eventData.recurrenceRule || null,
    };

    try {
      const response = await axiosService.post("/auth/calendar-events/create", payload);
      console.log("✅ Event created via API:", response.data);
      fetchEvents(); // refresh calendar
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
        };

        if (event.recurrenceRule) {
          calendarEvent.rrule = event.recurrenceRule;
        }

        return calendarEvent;
      });

      setEvents(fetchedEvents);
      console.log("✅ Loaded events via /load:", fetchedEvents);
    } catch (error) {
      console.error("❌ Failed to fetch events via /load:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <Box
        sx={{
          position: "relative",
          minHeight: "calc(100vh - 64px)",
          background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
          p: 3,
        }}
      >
        <Card
          elevation={8}
          sx={{
            borderRadius: 5,
            p: 3,
            background: "linear-gradient(135deg, #ffffff, #f1f8e9)",
          }}
        >
          <CardContent>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              📅 Calendar
            </Typography>
            <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden" }}>
              <FullCalendar
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin,
                  rrulePlugin,
                ]}
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
                dateClick={({ dateStr }) => handleCreate(new Date(dateStr))}
                eventClick={() => {}}
                eventBackgroundColor="#64b5f6"
                eventBorderColor="#42a5f5"
                eventTextColor="#fff"
                height="auto"
              />
            </Box>
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
            onNextRecurring={() => setDialogOpen(false)}
            onOpenRecurrenceDialog={setRecurrenceDialogOpen}
            minHeight={{ xs: 350, sm: 420, md: 500 }}
          />
        </DialogContent>
      </Dialog>

      <CustomRecurrenceDialog
        open={recurrenceDialogOpen}
        onClose={() => setRecurrenceDialogOpen(false)}
        initialData={recurrenceInitialData}
      />
    </>
  );
};

export default CalendarView;