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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Collapse,
} from '@mui/material';
import { Add as AddIcon, Headphones as HeadphonesIcon, Mic as MicIcon, SmartToy } from '@mui/icons-material';

const CalendarMain = ({ 
  events, 
  onEventClick, 
  onDateClick, 
  renderEventContent,
  sidebarCollapsed,
  onAddEvent,
  onAddAIEvent,
  aiVoiceInputVisible,
  aiVoiceInputValue,
  onAiVoiceInputChange,
  onCreateFromAI
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
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
              <Tooltip title="AI-powered Event Creation (Voice Input)">
                <Button
                  variant="contained"
                  startIcon={<SmartToy/>}
                  onClick={onAddAIEvent}
                  sx={{
                    color: '#fff',
                    // backgroundColor: '#6c5ce7',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    transition: 'all 0.3s ease',
                    minWidth: { xs: 'auto', sm: '140px' },
                    // '&:hover': {
                    //   backgroundColor: '#5f4dd0',
                    //   transform: 'translateY(-1px)',
                    //   boxShadow: '0 4px 8px rgba(108, 92, 231, 0.3)',
                    // },
                  }}
                >
                  AI Event
                </Button>
              </Tooltip>
            </Box>
          </Box>
          
          {/* AI Voice Input Field */}
          <Collapse in={aiVoiceInputVisible}>
            <Box sx={{ 
              p: { xs: 2, sm: 3 }, 
              pt: 0,
              pb: 2,
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa'
            }}>
              <TextField
                fullWidth
                placeholder="Speak or type your event details here..."
                value={aiVoiceInputValue}
                onChange={(e) => onAiVoiceInputChange(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        sx={{ 
                          color: '#6c5ce7',
                          '&:hover': {
                            backgroundColor: 'rgba(108, 92, 231, 0.1)',
                          }
                        }}
                      >
                        <MicIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={onCreateFromAI}
                        disabled={!aiVoiceInputValue.trim()}
                        sx={{
                          // backgroundColor: '#6c5ce7',
                          color: '#fff',
                          borderRadius: 1.5,
                          px: 2,
                          py: 0.5,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          // '&:hover': {
                          //   backgroundColor: '#5f4dd0',
                          // },
                          '&:disabled': {
                            backgroundColor: '#ccc',
                            color: '#666',
                          }
                        }}
                      >
                        Create Event
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6c5ce7',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6c5ce7',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '1rem',
                    fontWeight: 500,
                  },
                }}
              />
            </Box>
          </Collapse>
          
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