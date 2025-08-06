import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import axiosService from '../services/axiosService';
import { useToast } from '../context/ToastContext';

const CLIENT_ID = '953030921199-1mp8r5q7d4jgk9cru6ifuc3sjh29l9ou.apps.googleusercontent.com';

function LinkGoogleCalendarButton({ onSuccess, calendarId, calendarData }) {
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
  
  // Debug logging
  console.log('LinkGoogleCalendarButton props:', { calendarId, calendarData, onSuccess });
  console.log('Calendar data structure:', {
    id: calendarData?.id,
    name: calendarData?.name,
    externalCalendarType: calendarData?.externalCalendarType,
    isDefault: calendarData?.isDefault
  });

  useEffect(() => {
    if (window.google && window.google.accounts?.oauth2?.initCodeClient) {
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: CLIENT_ID,
        scope: 'openid profile email https://www.googleapis.com/auth/calendar.readonly',
        ux_mode: 'popup',
                callback: async (response) => {
          if (!response.code) {
            showToast('Google authorization failed.', 'error');
            return;
          }
          try {
            setIsLoading(true);
            if (!calendarId) {
              showToast('Calendar ID is required to link Google Calendar.', 'error');
              return;
            }
            
            // Log the calendar ID being sent
            console.log('Sending calendar ID to backend:', calendarId);
            console.log('Calendar data being used:', calendarData);
            
            const res = await axiosService.post('/calendar/google-connect', {
              code: response.code,
              calendarId: calendarId
            });
            console.log(':white_check_mark: Google Calendar linked successfully');
            console.log('Response:', res.data);
            setIsConnected(true);
            showToast('✅ Google Calendar connected successfully!', 'success');
            if (onSuccess) {
              console.log(':link: Invoking onSuccess callback after linking');
              onSuccess(res.data); // Send calendar metadata or status to parent
            }
          } catch (err) {
            console.error(':x: Error linking calendar:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
            showToast('Error linking calendar: ' + errorMessage, 'error');
          } finally {
            setIsLoading(false);
          }
        },
      });
    }
  }, []);

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

  return (
    <Button
      variant={isConnected ? "contained" : "outlined"}
      color={isConnected ? "success" : "primary"}
      onClick={linkGoogleCalendar}
      disabled={isLoading || !calendarData}
      sx={{ 
        ml: 2, 
        mb: 2,
        minWidth: '140px',
        '&:hover': {
          backgroundColor: isConnected ? '#2e7d32' : undefined,
        }
      }}
    >
      {isLoading ? 'Connecting...' : isConnected ? '✅ Connected' : !calendarData ? 'Select Calendar First' : 'Connect with Google'}
    </Button>
  );
}

export default LinkGoogleCalendarButton;
