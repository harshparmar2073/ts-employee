// src/pages/CalendarView.jsx
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EventForm from "./EventForm"; // <-- Step 2 will create this
import EventIcon from '@mui/icons-material/Event';
import rrulePlugin from '@fullcalendar/rrule';
import CustomRecurrenceDialog from "./CustomRecurrenceDialog"; // Import your dialog

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
    // clone and zero time so it's always local-midnight of the clicked day
    const localMidnight = new Date(date);
    localMidnight.setHours(0, 0, 0, 0);
    setSelectedDate(localMidnight);
    setDialogOpen(true);
  };

  const handleSaveEvent = (eventData) => {
    let eventForCalendar;
 if (eventData.recurrenceRule) {
      // For recurring, keep the rule but still convert your start into a Date for logging
      const { ...rest } = eventData;
      eventForCalendar = {
        ...rest,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        formattedStartDate: eventData.formattedStartDate,
        formattedEndDate: eventData.formattedEndDate,
        rrule: eventData.recurrenceRule,
      };
    } else {
      // Non-recurring: convert both start/end into real Date objects
      eventForCalendar = {
        ...eventData,
        
      };
    }
    console.log('Event passed to FullCalendar:', eventForCalendar);
    // setEvents([...events, eventForCalendar]); // Commented out to not display events
    setDialogOpen(false);
  };

  const handleNextRecurring = (eventData) => {
    // ...handle recurring logic or open another dialog/step...
    setDialogOpen(false);
  };

  // Handler to open recurrence dialog
  const handleOpenRecurrenceDialog = (initialData) => {
    setRecurrenceInitialData(initialData);
    setRecurrenceDialogOpen(true);
  };

  // Handler to close recurrence dialog
  const handleCloseRecurrenceDialog = () => {
    setRecurrenceDialogOpen(false);
    setRecurrenceInitialData(null);
  };

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
        <Card elevation={6} sx={{ borderRadius: 5, p: 3, background: "#f5f5f5" }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Calendar
            </Typography>
            <Box sx={{ position: "relative" }}>
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
                    click: () => handleCreate(new Date()), // today still works
                 },
                }}
                events={events}
                selectable
                editable
dateClick={({ dateStr }) => handleCreate(new Date(dateStr))}
                eventClick={() => {}}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* EventForm Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        scroll="body"
      slotProps={{
          paper: {
            sx: {
              bgcolor: 'white',                    // pure white background
              borderRadius: isMobile ? 0 : 2,      // same rounding
              m: { xs: 0, sm: '4px 0', md: '6px 0' },
              mx: 'auto',                          // center horizontally
              width: { xs: '100%', sm: 600, md: 800 },
              overflow: 'visible',
            }
          }
        }}
      >
<DialogContent
          sx={{
            p: 0,
            overflow: 'visible',
            bgcolor: 'white',
            borderRadius: isMobile ? 0 : 2,     // <— also round the content so inner Box doesn’t overflow
            m: 1                                // <— give a tiny margin so you can see the rounding
          }}
        >         
 <EventForm
            initialDate={selectedDate}
            onSave={handleSaveEvent}
            onCancel={() => setDialogOpen(false)}
            onNextRecurring={handleNextRecurring}
            onOpenRecurrenceDialog={handleOpenRecurrenceDialog}
            minHeight={{ xs: 350, sm: 420, md: 500 }} // Pass minHeight as prop for responsive height
          />
        </DialogContent>
      </Dialog>

      {/* Render CustomRecurrenceDialog at the same level */}
      <CustomRecurrenceDialog
        open={recurrenceDialogOpen}
        onClose={handleCloseRecurrenceDialog}
        initialData={recurrenceInitialData}
        // ...other props as needed
      />
    </>
  );
};

export default CalendarView;