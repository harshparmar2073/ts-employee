import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import axiosService from '../services/axiosService';
import { useToast } from '../context/ToastContext';
import { Box } from '@mui/material';

const CLIENT_ID = '953030921199-1mp8r5q7d4jgk9cru6ifuc3sjh29l9ou.apps.googleusercontent.com';

function LinkGoogleCalendarButton({ onSuccess, calendarId, calendarData, connectedCount = 0 }) {
  const codeClientRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  

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
      prompt: 'consent select_account',      // force consent and account chooser for multi-account
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

  
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      {connectedCount > 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.5, borderRadius: 2,
          backgroundColor: '#e8f5e9',
          border: '1px solid #2e7d32',
          color: '#2e7d32', fontSize: '0.8rem', fontWeight: 600
        }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2e7d32' }} />
          {connectedCount === 1 ? '1 Google account connected' : `${connectedCount} Google accounts connected`}
        </Box>
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={linkGoogleCalendar}
        disabled={isLoading || !calendarData}
        sx={{ 
          minWidth: '200px',
          '&:hover': { backgroundColor: '#e3f2fd' }
        }}
      >
        {isLoading
          ? 'Connecting...'
          : (!calendarData
              ? 'Select Calendar First'
              : (connectedCount > 0 ? 'Connect another Google account' : 'Connect Google account'))}
      </Button>

          </Box>
  );
}

export default LinkGoogleCalendarButton;
