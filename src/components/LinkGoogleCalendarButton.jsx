import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import axiosService from '../services/axiosService';
import { useToast } from '../context/ToastContext';
import { Box } from '@mui/material';

const CLIENT_ID = '953030921199-1mp8r5q7d4jgk9cru6ifuc3sjh29l9ou.apps.googleusercontent.com';

function LinkGoogleCalendarButton({ onSuccess, calendarId, calendarData, onDisconnect }) {
  const codeClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  
  // Check if calendar is already connected to Google
  useEffect(() => {
    if (calendarData?.externalCalendarType === 'GOOGLE') {
      setIsConnected(true);
    }
  }, [calendarData]);
  
  // // Debug logging
  // console.log('LinkGoogleCalendarButton props:', { calendarId, calendarData, onSuccess });
  // console.log('Calendar data structure:', {
  //   id: calendarData?.id,
  //   name: calendarData?.name,
  //   externalCalendarType: calendarData?.externalCalendarType,
  //   isDefault: calendarData?.isDefault
  // });

  useEffect(() => {
    // Bail if the Google Identity Services script hasn’t loaded yet
    if (!window.google?.accounts?.oauth2?.initCodeClient) {
      console.warn('Google Identity Services not ready yet.');
      return;
    }
  
    // IMPORTANT: keep scopes exactly in sync with your backend
    const SCOPE =
      'https://www.googleapis.com/auth/calendar.readonly openid email profile';
  
    codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      ux_mode: 'popup',
      access_type: 'offline', // request refresh token
      prompt: 'consent',      // force consent to guarantee refresh token
      callback: async (response) => {
        if (!response?.code) {
          showToast('Google authorization failed.', 'error');
          return;
        }
  
        try {
          setIsLoading(true);
  
          if (!calendarId) {
            showToast('Calendar ID is required to link Google Calendar.', 'error');
            return;
          }
  
          const res = await axiosService.post('/calendar/google-connect', {
            code: response.code,
            calendarId,
          });
  
          setIsConnected(true);
          showToast('✅ Google Calendar connected successfully!', 'success');
          onSuccess?.(res.data);
        } catch (err) {
          console.error('❌ Error linking calendar:', err);
          const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error occurred';
          showToast('Error linking calendar: ' + errorMessage, 'error');
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, [showToast, calendarId, onSuccess]);

  const linkGoogleCalendar = () => {
    if (!calendarData) {
      showToast('Please select a calendar first.', 'warning');
      return;
    }
    
    if (!calendarId) {
      showToast('Invalid calendar ID. Please select a valid calendar.', 'error');
      return;
    }
    
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    } else {
      showToast('Google API not loaded.', 'error');
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (!calendarId) {
      showToast('Invalid calendar ID. Please select a valid calendar.', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await axiosService.post('/calendar/google-disconnect', {
        calendarId: calendarId
      });
      console.log('✅ Google Calendar disconnected successfully');
      console.log('Response:', res.data);
      setIsConnected(false);
      showToast('✅ Google Calendar disconnected successfully!', 'success');
      if (onDisconnect) {
        console.log('🔗 Invoking onDisconnect callback after disconnecting');
        onDisconnect(res.data);
      }
    } catch (err) {
      console.error('❌ Error disconnecting calendar:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      showToast('Error disconnecting calendar: ' + errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {isConnected ? (
        // Connected state - show status and disconnect button
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: '#e8f5e8',
            border: '1px solid #4caf50',
            color: '#2e7d32',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: '#4caf50' 
            }} />
            Connected to Google
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={disconnectGoogleCalendar}
            disabled={isLoading}
            sx={{ 
              minWidth: '100px',
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                backgroundColor: '#ffebee',
                borderColor: '#d32f2f',
                color: '#d32f2f',
              }
            }}
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </>
      ) : (
        // Not connected state - show connect button
        <Button
          variant="outlined"
          color="primary"
          onClick={linkGoogleCalendar}
          disabled={isLoading || !calendarData}
          sx={{ 
            minWidth: '140px',
            '&:hover': {
              backgroundColor: '#e3f2fd',
            }
          }}
        >
          {isLoading ? 'Connecting...' : !calendarData ? 'Select Calendar First' : 'Connect with Google'}
        </Button>
      )}
    </Box>
  );
}

export default LinkGoogleCalendarButton;
