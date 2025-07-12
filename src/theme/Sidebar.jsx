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
  drawerWidth = 250,
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
      if (item.text === 'Dashboard') {
        navigate('/dashboard/dashboard-content');
      } else if (item.text === 'Security') {
        navigate('/dashboard/security');
      } else if (item.text === 'Token Sessions') {
        navigate('/dashboard/member-table');
      }
    }
  };

  const drawer = (
    <Box
  sx={{
    height: '100%',
    width: drawerWidth,
    background: 'linear-gradient(to top, #9370DB, #b2f5ea)', // purple to light green
    color: 'black',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
  }}

    >
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={2}>
        {!collapsed && (
          <Typography
            variant="h4"
            sx={{
              background: 'linear-gradient(45deg, #9c27b0, #00cba9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2.125rem' },
            }}
          >
            Antalyze
          </Typography>
        )}
        <IconButton size="small" onClick={handleCollapseToggle} sx={{ color: 'white' }}>
          <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />
      <List sx={{ flexGrow: 1 }}>
        {SidebarItems.map((item) => (
          <Box key={item.text}>
            <Tooltip
              title={collapsed ? item.text : ''}
              placement="right"
              arrow
              enterDelay={300}
              sx={{ fontSize: '1rem' }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleItemClick(item)}
                  selected={selectedSection === item.text}
                  sx={{
                    '&:hover': {
                      background: 'linear-gradient(90deg, #d1c4e9, #b2f5ea)',
                      fontWeight: 'bold',
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, #a084ca, #b2f5ea)',
                      fontWeight: 'bold',
                    },
                    transition: 'all 0.3s ease-in-out',
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                  }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
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
                          pl: 4,
                          '&:hover': {
                            background: 'linear-gradient(90deg, #d1c4e9, #b2f5ea)',
                            fontWeight: 'bold',
                          },
                          '&.Mui-selected': {
                            background: 'linear-gradient(90deg, #a084ca, #b2f5ea)',
                            fontWeight: 'bold',
                          },
                          borderRadius: 2,
                          mx: 1,
                          my: 0.5,
                        }}
                      >
                        <ListItemIcon sx={{ color: 'white' }}>{subItem.icon}</ListItemIcon>
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