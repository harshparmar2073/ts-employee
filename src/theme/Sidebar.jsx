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
  ChevronLeft,
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
  Lock,
  CalendarMonth,
} from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import LogoutDialog from '../components/LogoutDialog';

const SidebarItems = [
  { text: 'Dashboard', icon: <Dashboard />, expandable: false },
  { text: 'Calendar', icon: <CalendarMonth/>, expandable: false },
  { text: 'Workspace', icon: <Workspaces />, expandable: false },
  {
    text: 'Datahub',
    icon: <DataUsage />,
    expandable: true,
    subItems: [
      {text:'Employee',icon:<PersonIcon/>},
      { text: 'CRM', icon: <People /> },
      { text: 'Vendors', icon: <Business /> },
      { text: 'Customers', icon: <PersonAdd /> },
      { text: 'Token Sessions', icon: <Lock /> },
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
    subItems: [{ text: 'Security', icon: <Lock /> }],
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
      } else if (item.text === 'Calendar') {
        navigate('/dashboard/calendar-view');
      } else if (item.text === 'Security') {
        navigate('/dashboard/security');
      } else if (item.text === 'Token Sessions') {
        navigate('/dashboard/member-table');
      } else if (item.text === 'Employee') {
        navigate('/dashboard/employee-contract-form');
      }
    }
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        width: drawerWidth,
        background: 'linear-gradient(to bottom, #f9f9fb, #e0e4ec)', // gentle pastel
        color: '#212121',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Segoe UI", "Inter", "Roboto", sans-serif',
        borderRight: '1px solid #ddd',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={2}>
        {!collapsed && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.8rem',
              letterSpacing: '0.5px',
              color: '#5e35b1',
            }}
          >
            Antalyze
          </Typography>
        )}
        <IconButton onClick={handleCollapseToggle}>
          <ChevronLeft />
        </IconButton>
      </Box>
      <Divider />
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
                      background: 'linear-gradient(90deg, #ede7f6, #e0f2f1)',
                      fontWeight: 600,
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#d1c4e9',
                      fontWeight: 600,
                    },
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    px: 2,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ color: '#5e35b1' }}>{item.icon}</ListItemIcon>
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
                            background: 'linear-gradient(90deg, #ede7f6, #e0f2f1)',
                            fontWeight: 500,
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#d1c4e9',
                            fontWeight: 600,
                          },
                          borderRadius: 2,
                          mx: 1,
                          my: 0.3,
                          px: 2,
                        }}
                      >
                        <ListItemIcon sx={{ color: '#5e35b1' }}>{subItem.icon}</ListItemIcon>
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
              borderRight: 'none',
              background: 'transparent',
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