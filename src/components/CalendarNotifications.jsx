import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem as SelectMenuItem,
  IconButton,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

// Dynamic time options generator
const generateTimeOptions = (interval = 30) => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      const timeString = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      times.push(timeString);
    }
  }
  return times;
};

const EventNotificationsSection = ({ calendar }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "notification",
      quantity: 30,
      timeUnit: "minutes",
      time: "5:00pm",
    },
    { id: 2, type: "email", quantity: 10, timeUnit: "minutes", time: "5:00pm" },
  ]);

  const timeOptions = generateTimeOptions(30);

  const addNotification = () => {
    const newNotification = {
      id: Date.now(),
      type: "notification",
      quantity: 30,
      timeUnit: "minutes",
      time: "5:00pm",
    };
    setNotifications([...notifications, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const updateNotification = (id, field, value) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
        Event notifications
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
        Receive notifications for events on this calendar.
      </Typography>

      {notifications.map((notification) => (
        <Box
          key={notification.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            background: "#fafbfc",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={notification.type}
              onChange={(e) =>
                updateNotification(notification.id, "type", e.target.value)
              }
            >
              <SelectMenuItem value="notification">Notification</SelectMenuItem>
              <SelectMenuItem value="email">Email</SelectMenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            value={notification.quantity}
            onChange={(e) =>
              updateNotification(
                notification.id,
                "quantity",
                parseInt(e.target.value) || 1
              )
            }
            sx={{
              width: 60,
              "& .MuiInputBase-input": {
                textAlign: "center",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#333",
              },
            }}
            inputProps={{ min: 1, max: 30 }}
          />

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={notification.timeUnit}
              onChange={(e) =>
                updateNotification(notification.id, "timeUnit", e.target.value)
              }
            >
              <SelectMenuItem value="minutes">minutes</SelectMenuItem>
              <SelectMenuItem value="hours">hours</SelectMenuItem>
              <SelectMenuItem value="days">days</SelectMenuItem>
              <SelectMenuItem value="weeks">weeks</SelectMenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ color: "#666" }}>
            before at
          </Typography>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={notification.time}
              onChange={(e) =>
                updateNotification(notification.id, "time", e.target.value)
              }
            >
              {timeOptions.map((time) => (
                <SelectMenuItem key={time} value={time}>
                  {time}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            size="small"
            onClick={() => removeNotification(notification.id)}
            sx={{ color: "#dc3545" }}
          >
            ✕
          </IconButton>
        </Box>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addNotification}
        sx={{ alignSelf: "flex-start", borderRadius: 2 }}
      >
        Add notification
      </Button>
    </Box>
  );
};

const AllDayNotificationsSection = ({ calendar }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "email", quantity: 1, timeUnit: "days", time: "5:00pm" },
  ]);

  const timeOptions = generateTimeOptions(30);

  const addNotification = () => {
    const newNotification = {
      id: Date.now(),
      type: "email",
      quantity: 1,
      timeUnit: "days",
      time: "5:00pm",
    };
    setNotifications([...notifications, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const updateNotification = (id, field, value) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
        All-day event notifications
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
        Receive notifications for all day events on this calendar.
      </Typography>

      {notifications.map((notification) => (
        <Box
          key={notification.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            background: "#fafbfc",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={notification.type}
              onChange={(e) =>
                updateNotification(notification.id, "type", e.target.value)
              }
            >
              <SelectMenuItem value="notification">Notification</SelectMenuItem>
              <SelectMenuItem value="email">Email</SelectMenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            value={notification.quantity}
            onChange={(e) =>
              updateNotification(
                notification.id,
                "quantity",
                parseInt(e.target.value) || 1
              )
            }
            sx={{
              width: 60,
              "& .MuiInputBase-input": {
                textAlign: "center",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#333",
              },
            }}
            inputProps={{ min: 1, max: 30 }}
          />

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={notification.timeUnit}
              onChange={(e) =>
                updateNotification(notification.id, "timeUnit", e.target.value)
              }
            >
              <SelectMenuItem value="minutes">minutes</SelectMenuItem>
              <SelectMenuItem value="hours">hours</SelectMenuItem>
              <SelectMenuItem value="days">days</SelectMenuItem>
              <SelectMenuItem value="weeks">weeks</SelectMenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ color: "#666" }}>
            before at
          </Typography>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={notification.time}
              onChange={(e) =>
                updateNotification(notification.id, "time", e.target.value)
              }
            >
              {timeOptions.map((time) => (
                <SelectMenuItem key={time} value={time}>
                  {time}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            size="small"
            onClick={() => removeNotification(notification.id)}
            sx={{ color: "#dc3545" }}
          >
            ✕
          </IconButton>
        </Box>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addNotification}
        sx={{ alignSelf: "flex-start", borderRadius: 2 }}
      >
        Add notification
      </Button>
    </Box>
  );
};

const OtherNotificationsSection = ({ calendar }) => {
  const [notifications, setNotifications] = useState([
    {
      id: "new",
      label: "New events",
      desc: "An event is added to this calendar",
      type: "none",
    },
    {
      id: "changed",
      label: "Changed events",
      desc: "An event on this calendar is changed",
      type: "none",
    },
    {
      id: "canceled",
      label: "Canceled events",
      desc: "An event on this calendar is cancelled",
      type: "none",
    },
    {
      id: "responses",
      label: "Event responses",
      desc: "Guests respond to an event on this calendar",
      type: "none",
    },
    {
      id: "agenda",
      label: "Daily agenda",
      desc: "Receive a daily email with the agenda for this calendar",
      type: "none",
    },
  ]);

  const updateNotification = (id, value) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, type: value } : n))
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
        Other notifications
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
        Receive email notifications when changes are made to this calendar.
      </Typography>

      {notifications.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            background: "#fafbfc",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: "#333" }}>
              {item.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#666", display: "block", mt: 0.5 }}
            >
              {item.desc}
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={item.type}
              onChange={(e) => updateNotification(item.id, e.target.value)}
            >
              <SelectMenuItem value="none">None</SelectMenuItem>
              <SelectMenuItem value="email">Email</SelectMenuItem>
              <SelectMenuItem value="notification">Notification</SelectMenuItem>
            </Select>
          </FormControl>
        </Box>
      ))}
    </Box>
  );
};

const CalendarNotifications = ({ calendar, activeSection }) => {
  if (activeSection !== "notifications") return null;

  return (
    <Box sx={{ maxHeight: "50vh", overflow: "auto" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Event Notifications Section */}
        <Box
          sx={{
            p: 3,
            border: "1px solid #e0e0e0",
            borderRadius: 3,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <EventNotificationsSection calendar={calendar} />
        </Box>

        {/* All-day Event Notifications Section */}
        <Box
          sx={{
            p: 3,
            border: "1px solid #e0e0e0",
            borderRadius: 3,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <AllDayNotificationsSection calendar={calendar} />
        </Box>

        {/* Other Notifications Section */}
        <Box
          sx={{
            p: 3,
            border: "1px solid #e0e0e0",
            borderRadius: 3,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <OtherNotificationsSection calendar={calendar} />
        </Box>
      </Box>
    </Box>
  );
};

export default CalendarNotifications; 