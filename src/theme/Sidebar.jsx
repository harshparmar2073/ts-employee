// components/theme/Sidebar.js
import React from 'react';
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
  Button,
  Collapse
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
  Message
} from '@mui/icons-material';

const drawerWidthOpen = 250;
const drawerWidthClosed = 80;

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
      { text: 'Customers', icon: <PersonAdd /> }
    ]
  },
  { 
    text: 'Chatbot/Assistance', 
    icon: <Chat />, 
    expandable: true,
    subItems: [
      { text: 'AI Assistant', icon: <SmartToy /> },
      { text: 'Help Center', icon: <Help /> },
      { text: 'Smart Suggestions', icon: <AutoAwesome /> },
      { text: 'Chat History', icon: <Message /> }
    ]
  },
  { text: 'Settings', icon: <Settings />, expandable: false },
  { text: 'Logout', icon: <Logout />, expandable: false },
  { text: 'Sprint', icon: <RocketLaunch />, expandable: false }
];

export default function Sidebar({
  drawerWidth,
  collapsed,
  handleCollapseToggle,
  selectedSection,
  setSelectedSection,
  expandedSections,
  setExpandedSections,
  isMobile,
  mobileOpen,
  handleDrawerToggle
}) {
  const handleExpandClick = (section) => {
    if (collapsed) return;
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        width: drawerWidth,
        background: 'linear-gradient(to top, #7e5b72, #2d3e65)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
      {/* Header: Antalyze. and collapse */}
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={2}>
        {!collapsed && (
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(45deg, #b2195b,rgb(139, 36, 155),rgb(116, 83, 167))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))'
            }}>
            Antalyze
          </Typography>
        )}
        <IconButton size="small" onClick={handleCollapseToggle} sx={{ color: 'white' }}>
          <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />
      <Divider sx={{ border: 'rgba(255,255,255,0.3)' }} />
      {/* Navigation Items */}
      <List
        sx={{
          flexGrow: 1,
          px: collapsed ? 0 : 1,
          overflowY: 'auto',
          maxHeight: '100%',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        {SidebarItems.map(item => (
          <Box key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.expandable) {
                    handleExpandClick(item.text);
                  } else {
                    setSelectedSection(item.text);
                  }
                }}
                sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2 }}
                selected={selectedSection === item.text}
              >
                <ListItemIcon
                  sx={{
                    color: 'white',
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText primary={item.text} sx={{ ml: -1 }} />
                    {item.expandable &&
                      (expandedSections[item.text] ? (
                        <ExpandLess sx={{ color: 'white', fontSize: 24 }} />
                      ) : (
                        <ExpandMore sx={{ color: 'white', fontSize: 24 }} />
                      ))}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            {/* Sub-items */}
            {item.expandable && !collapsed && (
              <Collapse in={expandedSections[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map(subItem => (
                    <ListItem key={subItem.text} disablePadding>
                      <ListItemButton
                        onClick={() => setSelectedSection(subItem.text)}
                        sx={{ pl: 4 }}
                        selected={selectedSection === subItem.text}
                      >
                        <ListItemIcon
                          sx={{ color: 'white', minWidth: 0, mr: 2 }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
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
      {/* Support Button */}
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          mt: -1.5,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#6c5ce7',
            color: 'white',
            textTransform: 'none',
            fontSize: '0.75rem',
            minHeight: 32,
            lineHeight: 1.1,
            borderRadius: 1,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: '#5a4eea',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'
            }
          }}
        >
          Support
        </Button>
      </Box>
    </Box>
  );

  return (
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
            overflow: 'hidden'
          }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}