import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper } from '@mui/material';

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      navigate('/'); // Redirect to login if token is missing
    }
  }, [token, navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#4f8cff' }}>
          Welcome to the Dashboard
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.05rem', color: '#555' }}>
          You have successfully logged in!
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard;
