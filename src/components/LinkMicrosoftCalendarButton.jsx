import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import axiosService from '../services/axiosService';

const CLIENT_ID = '953030921199-1mp8r5q7d4jgk9cru6ifuc3sjh29l9ou.apps.googleusercontent.com';

function LinkMicrosoftCalendarButton({ onSuccess, onDisconnect }) {
  const codeClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Check if Microsoft Calendar is connected
      const response = await axiosService.get('/calendar/microsoft-status');
      setIsConnected(response.data?.connected || false);
    } catch (error) {
      console.error('Error checking connection status:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (window.google && window.google.accounts?.oauth2?.initCodeClient) {
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: CLIENT_ID,
        scope: 'openid profile email https://www.googleapis.com/auth/calendar.readonly',
        ux_mode: 'popup',
        callback: async (response) => {
          if (!response.code) {
            alert('Microsoft authorization failed.');
            return;
          }
          try {
            setIsLoading(true);
            const res = await axiosService.post('/calendar/microsoft-connect', {
              code: response.code,
              calendarId: '070dab4e-b897-4de9-b3bc-3fca9b6636b1'
            });
            console.log(':white_check_mark: Microsoft Calendar linked successfully');
            console.log('Response:', res.data);
            setIsConnected(true);
            if (onSuccess) {
              console.log(':link: Invoking onSuccess callback after linking');
              onSuccess(res.data); // Send calendar metadata or status to parent
            }
          } catch (err) {
            console.error(':x: Error linking calendar:', err);
            alert('Error linking calendar. ' + (err.response?.data?.message || ''));
          } finally {
            setIsLoading(false);
          }
        },
      });
    }
  }, []);
  const linkMicrosoftCalendar = () => {
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    } else {
      alert('Microsoft API not loaded.');
    }
  };

  const disconnectMicrosoftCalendar = async () => {
    try {
      setIsLoading(true);
      const res = await axiosService.post('/calendar/microsoft-disconnect');
      console.log(':white_check_mark: Microsoft Calendar disconnected successfully');
      console.log('Response:', res.data);
      setIsConnected(false);
      if (onDisconnect) {
        onDisconnect(res.data);
      }
    } catch (err) {
      console.error(':x: Error disconnecting calendar:', err);
      alert('Error disconnecting calendar. ' + (err.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      variant={isConnected ? "contained" : "outlined"}
      color={isConnected ? "error" : "primary"}
      onClick={isConnected ? disconnectMicrosoftCalendar : linkMicrosoftCalendar}
      disabled={isLoading}
      sx={{ 
        ml: 2, 
        mb: 2,
        minWidth: '140px',
        '&:hover': {
          backgroundColor: isConnected ? '#d32f2f' : undefined,
        }
      }}
    >
      {isLoading ? 'Loading...' : isConnected ? 'Disconnect Microsoft' : 'Connect with Microsoft'}
    </Button>
  );
}
export default LinkMicrosoftCalendarButton;