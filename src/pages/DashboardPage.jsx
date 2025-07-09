import React from 'react';
import { Typography, Paper } from '@mui/material';
import Layout from '../theme/Layout';

const userData = {
  name: 'John Doe',
  initials: 'JD',
  email: 'john.doe@example.com'
};

export default function DashboardPage() {
  // The Layout component manages selectedSection and passes it to children via render prop or context.
  // For now, we'll use a render prop pattern for simplicity.
  return (
    <Layout userData={userData}>
      {/* The Layout handles selectedSection and passes it as a prop to children if needed. */}
      {/* We'll assume selectedSection is 'Dashboard' for this static example. */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 5, color: '#333' }}>
        Dashboard Section
      </Typography>
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          bgcolor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(14px) saturate(180%)',
          borderRadius: 3, 
          boxShadow: '0 4px 16px rgba(31, 38, 135, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          color: '#000',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(180,180,255,0.2) 100%)'
        }}
      >
        Welcome to <strong>Dashboard</strong> section. This is where the content for this section will be displayed.
      </Paper>
    </Layout>
  );
}