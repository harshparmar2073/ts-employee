import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  Dashboard,
  Workspaces,
  DataUsage,
  Chat,
  Settings,
  Logout,
  RocketLaunch,
  People,
  Business,
  PersonAdd,
  SmartToy,
  Help,
  AutoAwesome,
  Message,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LogoutDialog from '../components/LogoutDialog';

const SidebarItems = [
  { text: 'Dashboard', icon: <Dashboard />, expandable: false },
  { text: 'Workspace', icon: <Workspaces />, expandable: false },
  {
    text: 'Datahub',
    icon: <DataUsage />,
    expandable: true,
    subItems: [
      { text: 'CRM', icon: <People /> },
      { text: 'Vendors', icon: <Business /> },
      { text: 'Customers', icon: <PersonAdd /> },
      { text: 'Token Sessions', icon: <LockIcon /> },
    ],
  },
  {
    text: 'Chatbot/Assistance',
    icon: <Chat />,
    expandable: true,
    subItems: [
      { text: 'AI Assistant', icon: <SmartToy /> },
      { text: 'Help Center', icon: <Help /> },
      { text: 'Smart Suggestions', icon: <AutoAwesome /> },
      { text: 'Chat History', icon: <Message /> },
    ],
  },
  {
    text: 'Settings',
    icon: <Settings />,
    expandable: true,
    subItems: [{ text: 'Security', icon: <LockIcon /> }],
  },
  { text: 'Logout', icon: <Logout />, expandable: false },
  { text: 'Sprint', icon: <RocketLaunch />, expandable: false },
];

export default function Sidebar({
  drawerWidth = 260,
  collapsed,
  handleCollapseToggle,
  selectedSection,
  setSelectedSection,
  expandedSections,
  setExpandedSections,
  isMobile,
  mobileOpen,
  handleDrawerToggle,
}) {
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleExpandClick = (section) => {
    if (collapsed) return;
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleItemClick = (item) => {
    if (item.expandable) {
      handleExpandClick(item.text);
    } else if (item.text === 'Logout') {
      setLogoutDialogOpen(true);
    } else {
      setSelectedSection(item.text);
      if (item.text === 'Dashboard') navigate('/dashboard/dashboard-content');
      else if (item.text === 'Security') navigate('/dashboard/security');
      else if (item.text === 'Token Sessions') navigate('/dashboard/member-table');
    }
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        width: drawerWidth,
        background: 'linear-gradient(to bottom right, #2E2A5A, #A0EACF)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"DM Sans", "Roboto", sans-serif',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={2}>
        {!collapsed && (
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(to right, #d1c4e9, #00cba9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            Antalyze
          </Typography>
        )}
        <IconButton size="small" onClick={handleCollapseToggle} sx={{ color: '#eee' }}>
          <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <List sx={{ flexGrow: 1 }}>
        {SidebarItems.map((item) => (
          <Box key={item.text}>
            <Tooltip
              title={collapsed ? item.text : ''}
              placement="right"
              arrow
              enterDelay={300}
            >
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleItemClick(item)}
                  selected={selectedSection === item.text}
                  sx={{
                    '&:hover': {
                      background: 'rgba(255,255,255,0.08)',
                      transform: 'scale(1.01)',
                    },
                    '&.Mui-selected': {
                      background: 'rgba(255,255,255,0.12)',
                      fontWeight: 600,
                    },
                    mx: 1,
                    my: 0.5,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
                  {!collapsed && <ListItemText primary={item.text} />}
                  {!collapsed && item.expandable && (
                    expandedSections[item.text] ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
            {item.expandable && !collapsed && (
              <Collapse in={expandedSections[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem key={subItem.text} disablePadding>
                      <ListItemButton
                        onClick={() => handleItemClick(subItem)}
                        selected={selectedSection === subItem.text}
                        sx={{
                          pl: 5,
                          '&:hover': {
                            background: 'rgba(255,255,255,0.08)',
                          },
                          '&.Mui-selected': {
                            background: 'rgba(255,255,255,0.12)',
                            fontWeight: 600,
                          },
                          mx: 1,
                          my: 0.25,
                          borderRadius: 2,
                        }}
                      >
                        <ListItemIcon sx={{ color: '#fff' }}>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              transition: 'all 0.3s ease-in-out',
              border: 'none',
              boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={() => {
          setLogoutDialogOpen(false);
          navigate('/logout');
        }}
      />
    </>
  );
}