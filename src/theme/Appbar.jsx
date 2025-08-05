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
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsNone as NotificationsIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import axiosService from '../services/axiosService';

export default function Appbar({ drawerWidth, isMobile, handleDrawerToggle, userData, selectedSection, anchorEl, handleProfileMenuOpen, handleProfileMenuClose, onSelectSection,
}
  
) {
  const navigate = useNavigate();

  // Fetch real user data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/user/me"],
    queryFn: async () => {
      const r = await axiosService.get("/user/me");
      return r.data.data;
    },
    // Use fallback data if API fails
    placeholderData: userData
  });

  // Helper function to generate initials
  function generateInitials(firstName, lastName) {
    const first = (firstName || 'U').charAt(0).toUpperCase();
    const last = (lastName || '').charAt(0).toUpperCase();
    
    // If no last name, just use first name initial
    if (!lastName) {
      return first;
    }
    
    return first + last;
  }

  // Create user display data from profile or fallback to passed userData
  const displayUserData = {
    name: profile?.authName || profile?.firstName || userData?.name ,
    initials: generateInitials(
      profile?.authName || profile?.firstName, 
      profile?.authLastName || profile?.lastName
    ) || userData?.initials,
    email: profile?.authUserName || profile?.email 
  };

  const goTo = (path) => {
    navigate(path);
    handleProfileMenuClose();
  };
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
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', position: 'relative' }}>
              {profileLoading ? (
                <CircularProgress size={16} sx={{ color: 'white' }} />
              ) : (
                displayUserData.initials
              )}
            </Avatar>
            <Typography sx={{ ml: 1, mr: 0.5 }}>
              {profileLoading ? 'Loading...' : displayUserData.name}
            </Typography>
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
<MenuItem onClick={() => goTo('/dashboard/account-info')}>
      Account Info
    </MenuItem>
<MenuItem onClick={() =>goTo('/dashboard/security')}>Settings</MenuItem>         
<MenuItem onClick={() => goTo('/dashboard/profile-info')}>
      Profile Info
    </MenuItem>        <Divider />
    <MenuItem onClick={() => goTo('/logout')}>
      Logout
    </MenuItem> 
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}