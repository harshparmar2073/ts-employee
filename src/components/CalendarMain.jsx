import React from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import {
  Box,
  Card,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const CalendarMain = ({ 
  events, 
  onEventClick, 
  onDateClick, 
  renderEventContent,
  sidebarCollapsed,
  onAddEvent
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  const headerToolbar = isMobile
    ? {
        left: "prev,next today",
        center: "title",
        right: "",
      }
    : {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listYear",
      };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Main calendar content */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          background: '#f8f9fa',
          height: '100vh',
          overflow: 'hidden',
          maxWidth: '100%',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            height: '100%', 
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            pb: 1, 
            borderBottom: '1px solid #e9ecef', 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Typography 
              variant="h4" 
              fontWeight={600} 
              sx={{ 
                color: '#495057',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}
            >
              📅 Calendar
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddEvent}
              sx={{
                color: '#fff',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: 2, sm: 3 },
                py: { xs: 0.75, sm: 1 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                minWidth: { xs: 'auto', sm: '120px' },
              }}
            >
              Add Event
            </Button>
          </Box>
          
          {/* Calendar Container */}
          <Box sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 2 }, 
            pt: 1, 
            overflow: 'auto', 
            overflowX: 'hidden',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}>
            <Box 
              sx={{ 
                height: '100%', 
                width: '100%',
                overflow: 'auto',
                overflowX: 'hidden',
                maxWidth: '100%',
                boxSizing: 'border-box',
                '& .fc': {
                  height: '100%',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                },
                
                '& .fc-view-harness': {
                  height: '100% !important',
                  width: '100% !important',
                  maxWidth: '100% !important',
                },
                '& .fc-daygrid-body': {
                  width: '100% !important',
                  maxWidth: '100% !important',
                },
                '& .fc-daygrid-day': {
                  minHeight: { xs: '60px', sm: '80px' },
                  maxWidth: '100%',
                  minWidth: { xs: '60px', sm: '80px' },
                },
                '& .fc-daygrid-day-frame': {
                  minHeight: { xs: '60px', sm: '80px' },
                  maxWidth: '100%',
                  minWidth: { xs: '60px', sm: '80px' },
                },
                '& .fc-daygrid-day-events': {
                  minHeight: { xs: '40px', sm: '60px' },
                  maxWidth: '100%',
                },
                '& .fc-daygrid-day-number': {
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  fontWeight: 500,
                },
                '& .fc-col-header-cell': {
                  padding: { xs: '4px 2px', sm: '8px 4px' },
                  maxWidth: '100%',
                  minWidth: { xs: '60px', sm: '80px' },
                  textAlign: 'center',
                  borderRight: '1px solid #e0e0e0',
                  '&:last-child': {
                    borderRight: 'none',
                  },
                },
                '& .fc-col-header-cell-cushion': {
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                  fontWeight: 600,
                  color: '#495057',
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: { xs: '2px 1px', sm: '4px 2px' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                '& .fc-toolbar': {
                  padding: { xs: '4px 0', sm: '8px 0' },
                  maxWidth: '100%',
                  flexWrap: 'wrap',
                  gap: { xs: 1, sm: 2 },
                },
                '& .fc-toolbar-chunk': {
                  maxWidth: '100%',
                },
                '& .fc-button-group': {
                  maxWidth: '100%',
                  flexWrap: 'wrap',
                },
                '& .fc-button': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  padding: { xs: '2px 6px', sm: '4px 10px' },
                },
                '& .fc-event': {
                  cursor: 'pointer',
                  borderRadius: '4px',
                  margin: '1px 0',
                  maxWidth: '100%',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                },
                '& .fc-event-main': {
                  padding: { xs: '1px 2px', sm: '2px 4px' },
                  maxWidth: '100%',
                },
                '& .fc-scroller': {
                  overflow: 'auto !important',
                  overflowX: 'hidden !important',
                },
                '& .fc-scroller-liquid': {
                  overflow: 'auto !important',
                  overflowX: 'hidden !important',
                },
                '& .fc-scroller-liquid-absolute': {
                  overflow: 'auto !important',
                  overflowX: 'hidden !important',
                },
              }}
            >
              <FullCalendar
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin,
                  rrulePlugin,
                ]}
                initialView="dayGridMonth"
                slotDuration="00:15:00"
                slotLabelInterval="01:00"
                allDaySlot={false}
                headerToolbar={headerToolbar}
                events={events}
                selectable
                editable
                eventClick={onEventClick}
                dateClick={onDateClick}
                eventContent={renderEventContent}
                height="auto"
                aspectRatio={isMobile ? 1.0 : 1.35}
                dayMaxEvents={isMobile ? 2 : true}
                moreLinkClick="popover"
                eventDisplay="block"
                displayEventTime={!isMobile}
                displayEventEnd={!isMobile}
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
                dayHeaderFormat={{
                  weekday: isMobile ? 'narrow' : 'short'
                }}
                titleFormat={{
                  month: 'long',
                  year: 'numeric'
                }}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day',
                  list: 'List'
                }}
                handleWindowResize={true}
                windowResizeDelay={100}
                contentHeight="auto"
                expandRows={true}
                dayCellContent={isMobile ? (arg) => arg.dayNumberText : undefined}
              />
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default CalendarMain; 