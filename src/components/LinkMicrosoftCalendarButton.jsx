import { useEffect, useRef, useState, useCallback } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import axiosService from "../services/axiosService";
import { useToast } from "../context/ToastContext";

// -------------------- CONFIG (fill these) --------------------
const MS_CLIENT_ID = "fa6cbbd3-6a9d-44fd-bb20-a6c06f52989e";
const TENANT = "organizations"; // all org
const REDIRECT_URI = `${window.location.origin}/ms-auth-callback.html`;
const MS_SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "email",
  "User.Read",
  "Calendars.Read" // or "Calendars.ReadWrite"
].join(" ");
// ------------------------------------------------------------

function LinkMicrosoftCalendarButton({
  onSuccess,
  onDisconnect,
  calendarId,
  calendarData,
}) {
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef(null);

  // reflect connected state from parent data
  useEffect(() => {
    setIsConnected(calendarData?.externalCalendarType === "MICROSOFT");
  }, [calendarData]);

  // ---------- PKCE helpers ----------
  const base64Url = (buf) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const sha256 = async (input) => {
    const enc = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", enc);
    return base64Url(digest);
  };

  const generateVerifier = () => {
    const array = new Uint8Array(64);
    crypto.getRandomValues(array);
    return base64Url(array.buffer).slice(0, 96); // 43–128 chars
  };

  const openPopup = (_unused, title, width = 600, height = 700) => {
    const top = window.top;
    const y = top?.outerHeight ? Math.max(0, (top.outerHeight - height) / 2 + (top.screenY || 0)) : 0;
    const x = top?.outerWidth ? Math.max(0, (top.outerWidth - width) / 2 + (top.screenX || 0)) : 0;
    const features = `popup=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${y},left=${x}`;
  
    const win = window.open("", title, features); // open immediately (sync with click)
    if (win) {
      win.document.write(`<html><body style="font-family:system-ui;padding:16px">Opening Microsoft sign-in…</body></html>`);
      win.document.close();
      win.focus();
    }
    popupRef.current = win;
    return win;
  };
  // Listen for message from /ms-auth-callback.html
  useEffect(() => {
    const handler = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "ms-oauth-code") return;

      const { urlWithCode } = event.data;
      try {
        const u = new URL(urlWithCode);
        const code = u.searchParams.get("code");
        if (!code) {
          showToast("Microsoft authorization failed (no code).", "error");
          return;
        }

        const stored = sessionStorage.getItem("ms_pkce");
        if (!stored) {
          showToast("PKCE verifier missing. Try again.", "error");
          return;
        }
        const { verifier, calendarIdAtRequest } = JSON.parse(stored);

        if (!calendarIdAtRequest || String(calendarIdAtRequest) !== String(calendarId)) {
          showToast("Calendar changed during authorization. Please retry.", "warning");
          return;
        }

        setIsLoading(true);

        // Exchange code + verifier on your backend
        const res = await axiosService.post("/calendar/microsoft-connect", {
          code,
          codeVerifier: verifier,
          redirectUri: REDIRECT_URI,
          calendarId,
        });

        setIsConnected(true);
        showToast("✅ Microsoft Calendar connected successfully!", "success");
        onSuccess && onSuccess(res.data);
      } catch (err) {
        console.error("❌ Microsoft connect error:", err);
        const msg = err?.response?.data?.message || err?.message || "Connect failed";
        showToast(msg, "error");
      } finally {
        setIsLoading(false);
        sessionStorage.removeItem("ms_pkce");
        if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [calendarId, onSuccess, showToast]);

  const connect = useCallback(async () => {
    if (!calendarId) {
      showToast("Please select a valid calendar first.", "warning");
      return;
    }
  
    // Open placeholder popup synchronously on the click
    const w = openPopup("about:blank", "Microsoft Sign-In");
    const popupOpened = !!w;
  
    try {
      setIsLoading(true);
  
      // PKCE
      const verifier = generateVerifier();
      const challenge = await sha256(verifier);
  
      sessionStorage.setItem(
        "ms_pkce",
        JSON.stringify({ verifier, calendarIdAtRequest: calendarId })
      );
  
      const authUrl = new URL(
        `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`
      );
      authUrl.searchParams.set("client_id", MS_CLIENT_ID);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("response_mode", "query");
      authUrl.searchParams.set("scope", MS_SCOPES);
      authUrl.searchParams.set("code_challenge", challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      authUrl.searchParams.set("prompt", "consent");
  
      if (popupOpened) {
        // Navigate the popup
        w.location.href = authUrl.toString();
      } else {
        // Fallback: same-tab redirect (no popup)
        window.location.assign(authUrl.toString());
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to start Microsoft authorization.", "error");
      setIsLoading(false);
      sessionStorage.removeItem("ms_pkce");
      try { if (popupOpened) w.close(); } catch {}
    }
  }, [calendarId, showToast]);


  const disconnect = useCallback(async () => {
    if (!calendarId) {
      showToast("Invalid calendar ID.", "error");
      return;
    }
    try {
      setIsLoading(true);
      const res = await axiosService.post("/calendar/microsoft-disconnect", {
        calendarId,
      });
      setIsConnected(false);
      showToast("✅ Microsoft Calendar disconnected.", "success");
      onDisconnect && onDisconnect(res.data);
    } catch (err) {
      console.error("❌ Disconnect error:", err);
      const msg = err?.response?.data?.message || err?.message || "Disconnect failed";
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  }, [calendarId, onDisconnect, showToast]);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {isConnected ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: "#e8f0fe",
              border: "1px solid #4f6bed",
              color: "#2140e8",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#4f6bed",
              }}
            />
            Connected to Microsoft
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={disconnect}
            disabled={isLoading}
            sx={{
              minWidth: 110,
              borderColor: "#d32f2f",
              color: "#d32f2f",
              "&:hover": {
                backgroundColor: "#ffebee",
                borderColor: "#b71c1c",
                color: "#b71c1c",
              },
            }}
          >
            {isLoading ? "Disconnecting..." : "Disconnect"}
          </Button>
        </>
      ) : (
        <Button
          variant="outlined"
          color="primary"
          onClick={connect}
          disabled={isLoading || !calendarId}
          sx={{ minWidth: 200, "&:hover": { backgroundColor: "#e3f2fd" } }}
        >
          {isLoading ? "Connecting..." : "Connect with Microsoft"}
        </Button>
      )}
    </Box>
  );
}

export default LinkMicrosoftCalendarButton;