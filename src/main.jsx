import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme/theme.js";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="953030921199-1mp8r5q7d4jgk9cru6ifuc3sjh29l9ou.apps.googleusercontent.com">
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
          <ToastProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ToastProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>;
  </StrictMode>
);
