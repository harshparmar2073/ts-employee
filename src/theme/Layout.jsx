import React, { useState } from 'react';
import { Box, CssBaseline, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Appbar from './Appbar'; // Assuming you have this component
import Sidebar from './Sidebar'; // Assuming you have this component
import { Outlet } from "react-router-dom";

const drawerWidthOpen = 250;
const drawerWidthClosed = 80;

export default function Layout({ userData }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [selectedSection, setSelectedSection] = useState('Dashboard'); // State for selected section
    const [anchorEl, setAnchorEl] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleCollapseToggle = () => setCollapsed(!collapsed);
    const handleProfileMenuOpen = e => setAnchorEl(e.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);

    const drawerWidth = collapsed ? drawerWidthClosed : drawerWidthOpen;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Appbar
                drawerWidth={drawerWidth}
                isMobile={isMobile}
                handleDrawerToggle={handleDrawerToggle}
                userData={userData}
                selectedSection={selectedSection}
                anchorEl={anchorEl}
                handleProfileMenuOpen={handleProfileMenuOpen}
                handleProfileMenuClose={handleProfileMenuClose}
            />
            <Sidebar
                drawerWidth={drawerWidth}
                collapsed={collapsed}
                handleCollapseToggle={handleCollapseToggle}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection} // Pass setSelectedSection to Sidebar
                expandedSections={expandedSections}
                setExpandedSections={setExpandedSections}
                isMobile={isMobile}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    background: 'rgba(240,240,240,0.8)',
                    backdropFilter: 'blur(8px)',
                    minHeight: '100vh'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}