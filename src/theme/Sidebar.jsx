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
  Message,
  Lock as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  { 
    text: 'Settings', 
    icon: <Settings />, 
    expandable: true,
    subItems: [
      { text: 'Security', icon: <LockIcon /> }
    ]
  },
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
  const navigate = useNavigate();
  const handleExpandClick = (section) => {
    if (collapsed) return;
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleItemClick = (item) => {
    if (item.expandable) {
      handleExpandClick(item.text);
    } else {
      setSelectedSection(item.text);
      // Navigation logic for Dashboard and Security
      if (item.text === 'Dashboard') {
        navigate('/dashboard/dashboard-content');
      } else if (item.text === 'Security') {
        navigate('/dashboard/security');
      }
    }
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
        overflow: 'hidden',
        fontFamily: '"Inter", "Poppins", sans-serif',
        position: 'relative'
      }}>
      
      {/* Google Fonts Link */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          `
        }}
      />
      
      {/* Header: Antalyze. and collapse */}
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={2}>
        {!collapsed && (
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Inter", sans-serif',
              background: 'linear-gradient(45deg, #b2195b,rgb(139, 36, 155),rgb(116, 83, 167))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))',
              transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}>
            Antalyze
          </Typography>
        )}
        <IconButton 
          size="small" 
          onClick={handleCollapseToggle} 
          sx={{ 
            color: 'white',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }
          }}
        >
          <ChevronLeftIcon sx={{ 
            transform: collapsed ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' 
          }} />
        </IconButton>
      </Box>
      
      <Divider sx={{ 
        borderColor: 'rgba(255,255,255,0.3)',
        transition: 'border-color 0.3s ease'
      }} />
      
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
        {SidebarItems.map((item, index) => (
          <Box key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                sx={{
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2,
                  my: 0.5,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  fontFamily: '"Inter", sans-serif',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  transform: 'translateX(0)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    zIndex: 0
                  },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffd6e0',
                    transform: 'translateX(8px) scale(1.02)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 4px 8px rgba(255,255,255,0.1) inset',
                    '&::before': {
                      transform: 'translateX(0)'
                    }
                  },
                  '&:active': {
                    transform: 'translateX(4px) scale(0.98)',
                    transition: 'all 0.1s cubic-bezier(0.25, 0.8, 0.25, 1)'
                  },
                  ...(selectedSection === item.text && {
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffd6e0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2), 0 2px 4px rgba(255,255,255,0.1) inset'
                  })
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'white',
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center',
                    zIndex: 1,
                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    ...(selectedSection === item.text && { 
                      color: '#ffd6e0',
                      transform: 'scale(1.1)'
                    })
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        ml: -1, 
                        fontFamily: '"Inter", sans-serif',
                        zIndex: 1,
                        '& .MuiListItemText-primary': {
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                        }
                      }} 
                    />
                    {item.expandable && (
                      <Box sx={{ zIndex: 1 }}>
                        {expandedSections[item.text] ? (
                          <ExpandLess sx={{ 
                            color: 'white', 
                            fontSize: 24, 
                            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            transform: 'rotate(0deg)'
                          }} />
                        ) : (
                          <ExpandMore sx={{ 
                            color: 'white', 
                            fontSize: 24, 
                            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            transform: 'rotate(0deg)'
                          }} />
                        )}
                      </Box>
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            
            {/* Sub-items */}
            {item.expandable && !collapsed && (
              <Collapse 
                in={expandedSections[item.text]} 
                timeout={500}
                sx={{
                  '& .MuiCollapse-wrapper': {
                    transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
                  }
                }}
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItem key={subItem.text} disablePadding>
                      <ListItemButton
                        onClick={() => handleItemClick(subItem)}
                        sx={{
                          pl: 4,
                          my: 0.3,
                          ml: 1,
                          borderRadius: 2,
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: '"Inter", sans-serif',
                          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          animationDelay: `${subIndex * 0.1}s`,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '3px',
                            height: '100%',
                            background: 'linear-gradient(to bottom, #ffd6e0, #b2195b)',
                            transform: 'scaleY(0)',
                            transformOrigin: 'top',
                            transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            zIndex: 0
                          },
                          '&:hover': {
                            background: 'rgba(255,255,255,0.12)',
                            color: '#ffd6e0',
                            transform: 'translateX(12px) scale(1.02)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(255,255,255,0.08) inset',
                            '&::before': {
                              transform: 'scaleY(1)'
                            }
                          },
                          '&:active': {
                            transform: 'translateX(6px) scale(0.98)',
                            transition: 'all 0.1s cubic-bezier(0.25, 0.8, 0.25, 1)'
                          },
                          ...(selectedSection === subItem.text && {
                            background: 'rgba(255,255,255,0.18)',
                            color: '#ffd6e0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15), 0 2px 4px rgba(255,255,255,0.1) inset',
                            '&::before': {
                              transform: 'scaleY(1)'
                            }
                          })
                        }}
                      >
                        <ListItemIcon
                          sx={{ 
                            color: 'white', 
                            minWidth: 0, 
                            mr: 2,
                            zIndex: 1,
                            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            ...(selectedSection === subItem.text && { 
                              color: '#ffd6e0',
                              transform: 'scale(1.1) rotate(5deg)'
                            })
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={subItem.text} 
                          sx={{ 
                            fontFamily: '"Inter", sans-serif',
                            zIndex: 1,
                            '& .MuiListItemText-primary': {
                              fontFamily: '"Inter", sans-serif',
                              fontWeight: 400,
                              fontSize: '0.9rem',
                              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                            }
                          }} 
                        />
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
          mb: 2,
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: 'linear-gradient(to top, #7e5b72 80%, transparent)',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: '"Inter", sans-serif'
        }}
      >
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#6c5ce7',
            color: 'white',
            textTransform: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            minHeight: 40,
            lineHeight: 1.2,
            borderRadius: 2,
            fontFamily: '"Inter", sans-serif',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              transform: 'translateX(-100%)',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
              zIndex: 0
            },
            '&:hover': {
              bgcolor: '#5a4eea',
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.25), 0 4px 8px rgba(255,255,255,0.1) inset',
              '&::before': {
                transform: 'translateX(0)'
              }
            },
            '&:active': {
              transform: 'translateY(0px) scale(0.98)',
              transition: 'all 0.1s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>Support</span>
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
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}