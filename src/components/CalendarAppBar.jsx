import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Badge,
  InputBase,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const CalendarAppBar = ({ 
  sidebarCollapsed, 
  onAddEvent, 
  darkMode, 
  onToggleDarkMode 
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${sidebarCollapsed ? 80 : 280}px)`,
        ml: `${sidebarCollapsed ? 80 : 280}px`,
        backgroundColor: '#fff',
        color: '#495057',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #e9ecef',
        zIndex: 1200,
        height: 64,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: '100%' }}>
        {/* Left side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <SearchIcon sx={{ color: '#6c757d', fontSize: 20 }} />
            <InputBase
              placeholder="Search events, calendars..."
              sx={{
                fontSize: '0.875rem',
                color: '#495057',
                '& .MuiInputBase-input': {
                  width: 200,
                },
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#6f42c1',
                fontSize: '0.875rem',
              }}
            >
              C
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Calendar
            </Typography>
          </Box>
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddEvent}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              textTransform: 'capitalize',
              '&:hover': {
                backgroundColor: '#5e35b1',
                color: '#fff',
              },
            }}
          >
            Add Event
          </Button>
          
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton>
            <SettingsIcon />
          </IconButton>
          
          <IconButton onClick={onToggleDarkMode}>
            <DarkModeIcon />
          </IconButton>
          
          <Avatar sx={{ width: 32, height: 32, backgroundColor: '#6f42c1' }}>
            <PersonIcon />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CalendarAppBar; 