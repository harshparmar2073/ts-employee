import { useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import axiosService from '../services/axiosService';

const CLIENT_ID = '953030921199-1mp8r5q7d4jgk9cru6ifuc3sjh29l9ou.apps.googleusercontent.com';

function LinkGoogleCalendarButton({ onSuccess }) {
  const codeClientRef = useRef(null);

  useEffect(() => {
    if (window.google && window.google.accounts?.oauth2?.initCodeClient) {
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: CLIENT_ID,
        scope: 'openid profile email https://www.googleapis.com/auth/calendar.readonly',
        ux_mode: 'popup',
        callback: async (response) => {
          if (!response.code) {
            alert('Google authorization failed.');
            return;
          }

          try {
            const res = await axiosService.post('/calendar-events/google-calendar-link', {
              code: response.code,
            });

            console.log('Google Calendar linked successfully.');
            console.log('Response:', res.data);

            if (onSuccess) {
                console.log('Sending events to parent component');
              onSuccess(res.data); // send events to parent
            }
          } catch (err) {
            console.error('Error linking calendar:', err);
            alert('Error linking calendar. ' + (err.response?.data?.message || ''));
          }
        },
      });
    }
  }, []);

  const linkGoogleCalendar = () => {
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    } else {
      alert('Google API not loaded.');
    }
  };

  return (
    <Button 
      variant="outlined" 
      onClick={linkGoogleCalendar} 
      sx={{ ml: 2, mb: 2 }}
    >
      Link Google Calendar
    </Button>
  );
}

export default LinkGoogleCalendarButton;