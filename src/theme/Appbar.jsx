// components/theme/AppBar.js
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsNone as NotificationsIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

export default function Appbar({ drawerWidth, isMobile, handleDrawerToggle, userData, selectedSection, anchorEl, handleProfileMenuOpen, handleProfileMenuClose }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: '#fafafa',
        color: 'black',
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0'
      }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center">
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{selectedSection}</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2, md: 3 }}>
          <IconButton><NotificationsIcon /></IconButton>
          <Box display="flex" alignItems="center" onClick={handleProfileMenuOpen} sx={{ cursor: 'pointer' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
              {userData.initials}
            </Avatar>
            <Typography sx={{ ml: 1, mr: 0.5 }}>{userData.name}</Typography>
            <ArrowDropDownIcon />
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            sx={{
              '& .MuiPaper-root': {
                minWidth: 200
              }
            }}
          >
            <MenuItem onClick={handleProfileMenuClose}>My Profile</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Profile Info</MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}