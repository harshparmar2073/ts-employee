import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function DashboardPage() {
  return (
    <>
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
    </>
  );
}