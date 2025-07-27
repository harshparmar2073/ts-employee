import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { fromZonedTime } from "date-fns-tz";
import { RRule } from "rrule";
import { HexColorPicker } from "react-colorful";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import { RgbaColorPicker } from "react-colorful";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Avatar from '@mui/material/Avatar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Get timezones
const getIanaTimezones = () => {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }
  return [];
};

// Schema
const eventSchema = yup.object({
  title: yup.string().required("Title is required").min(3),
  startDate: yup.date().required("Start date is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date cannot be before start date"),
  startTime: yup.string().required("Start time is required"),
  endTime: yup.string().required("End time is required"),
  timezone: yup.string().required("Timezone is required"),
  description: yup.string().max(500),
  allDay: yup.boolean(),
  recurrence: yup.string().nullable(),
  recurrenceEnd: yup.date().nullable(), // End date is now always optional
  weekdays: yup.array().nullable(),
  dayOfMonth: yup.mixed().transform((value) => {
    if (Array.isArray(value)) return null;
    if (value === '' || value === undefined || value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }).nullable(),
  monthOfYear: yup.mixed().transform((value) => {
    if (Array.isArray(value)) return null;
    if (value === '' || value === undefined || value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }).nullable(),
  // New interval field for recurrence frequency
  interval: yup.number().min(1, "Interval must be at least 1").nullable(),
  eventColour: yup.string().required("Event color is required"),
  skipWeekends: yup.boolean().nullable(),
});

// Helper to parse RRULE string to recurrence type
function getRecurrenceTypeFromRRule(rruleStr) {
  if (!rruleStr) return "";
  try {
    const rule = RRule.fromString(rruleStr);
    switch (rule.options.freq) {
      case RRule.DAILY:
        return "daily";
      case RRule.WEEKLY:
        return "weekly";
      case RRule.MONTHLY:
        return "monthly";
      case RRule.YEARLY:
        return "yearly";
      default:
        return "custom";
    }
  } catch {
    return "custom";
  }
}

// Time parser
function parseInTimeZone(
  dateStr,
  timeStr,
  timezone,
  allDay = false,
  isEnd = false
) {
  if (!dateStr || (!timeStr && !allDay) || !timezone) return null;
  const pad = (n) => n.toString().padStart(2, "0");

  if (dateStr instanceof Date) {
    dateStr = `${dateStr.getFullYear()}-${pad(dateStr.getMonth() + 1)}-${pad(
      dateStr.getDate()
    )}`;
  }

  let time = allDay
    ? isEnd
      ? "23:59:59.999"
      : "00:00:00.000"
    : `${timeStr}:00`;
  const dateTimeStr = `${dateStr}T${time}`;
  const utcDate = fromZonedTime(dateTimeStr, timezone);
  return new Date(utcDate);
}

// Component
const EventForm = ({ initialDate, initialEvent, onSave, onCancel }) => {
  const [timezones, setTimezones] = useState([]);
  const weekdays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();

  const pad = (n) => n.toString().padStart(2, "0");
  const minutes = now.getMinutes();
  const roundedMinutes = minutes <= 30 ? 30 : 0;
  const roundedHours =
    minutes <= 30 ? now.getHours() : (now.getHours() + 1) % 24;

  const startTimeDate = new Date(now);
  startTimeDate.setHours(roundedHours, roundedMinutes, 0, 0);
  const endTimeDate = new Date(startTimeDate.getTime() + 30 * 60000);

  const defaultTime = `${pad(startTimeDate.getHours())}:${pad(
    startTimeDate.getMinutes()
  )}`;
  const defaultEndTime = `${pad(endTimeDate.getHours())}:${pad(
    endTimeDate.getMinutes()
  )}`;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: initialEvent
      ? (() => {
          const rruleStr = initialEvent.extendedProps?.recurrenceRule;
          let recurrence = "";
          let interval = 1;
          let recurrenceEnd = null;
          let weekdays = [];
          let dayOfMonth = null;
          let monthOfYear = null;
          let skipWeekends = false;
          if (rruleStr) {
            try {
              const rule = RRule.fromString(rruleStr);
              const weekdayMap = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
              switch (rule.options.freq) {
                case RRule.DAILY:
                  recurrence = "daily";
                  break;
                case RRule.WEEKLY:
                  recurrence = "weekly";
                  break;
                case RRule.MONTHLY:
                  recurrence = "monthly";
                  break;
                case RRule.YEARLY:
                  recurrence = "yearly";
                  break;
                default:
                  recurrence = "custom";
              }
              interval = rule.options.interval || 1;
              if (rule.options.until) recurrenceEnd = rule.options.until;
              if (rule.options.byweekday) {
                weekdays = Array.isArray(rule.options.byweekday)
                  ? rule.options.byweekday.map((d) => {
                      if (typeof d === 'string') return d.slice(0,2).toUpperCase();
                      if (typeof d === 'number') return weekdayMap[d];
                      if (typeof d === 'object' && d.weekday !== undefined) return weekdayMap[d.weekday];
                      return '';
                    })
                  : [];
                weekdays = weekdays.filter(Boolean); // Remove empty
                // If all weekdays are MO-FR, set skipWeekends
                if (
                  recurrence === "daily" &&
                  weekdays.length === 5 &&
                  ["MO","TU","WE","TH","FR"].every((d) => weekdays.includes(d))
                ) {
                  skipWeekends = true;
                }
              }
              if (rule.options.bymonthday) dayOfMonth = rule.options.bymonthday;
              if (rule.options.bymonth) monthOfYear = rule.options.bymonth;
            } catch {}
          }
          return {
            title: initialEvent.title || "",
            description: initialEvent.extendedProps?.description || "",
            startDate: initialEvent.start ? new Date(initialEvent.start) : (initialDate || new Date()),
            endDate: initialEvent.end ? new Date(initialEvent.end) : (initialDate || new Date()),
            startTime: initialEvent.start ? `${new Date(initialEvent.start).getHours().toString().padStart(2, '0')}:${new Date(initialEvent.start).getMinutes().toString().padStart(2, '0')}` : defaultTime,
            endTime: initialEvent.end ? `${new Date(initialEvent.end).getHours().toString().padStart(2, '0')}:${new Date(initialEvent.end).getMinutes().toString().padStart(2, '0')}` : defaultEndTime,
            timezone: initialEvent.extendedProps?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            allDay: initialEvent.allDay || false,
            recurrence,
            recurrenceEnd,
            weekdays,
            dayOfMonth,
            monthOfYear,
            interval,
            eventColour: initialEvent.backgroundColor || "#4285f4",
            skipWeekends,
            attendees: initialEvent.extendedProps?.attendees || [],
          };
        })()
      : {
        title: "",
        startDate: initialDate || new Date(),
        endDate: initialDate || new Date(),
        startTime: defaultTime,
        endTime: defaultEndTime,
        description: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        allDay: false,
        recurrence: "",
        recurrenceEnd: null,
        weekdays: [],
        dayOfMonth: null,
        monthOfYear: null,
        interval: 1,
        eventColour: "#4285f4",
        skipWeekends: false,
        attendees: [],
      },
  });

  // When initialEvent changes, reset the form to ensure all fields (including weekdays) are in sync
  useEffect(() => {
    if (initialEvent) {
      const rruleStr = initialEvent.extendedProps?.recurrenceRule;
      let recurrence = "";
      let interval = 1;
      let recurrenceEnd = null;
      let weekdays = [];
      let dayOfMonth = null;
      let monthOfYear = null;
      let skipWeekends = false;
      if (rruleStr) {
        try {
          const rule = RRule.fromString(rruleStr);
          const weekdayMap = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
          switch (rule.options.freq) {
            case RRule.DAILY:
              recurrence = "daily";
              break;
            case RRule.WEEKLY:
              recurrence = "weekly";
              break;
            case RRule.MONTHLY:
              recurrence = "monthly";
              break;
            case RRule.YEARLY:
              recurrence = "yearly";
              break;
            default:
              recurrence = "custom";
          }
          interval = rule.options.interval || 1;
          if (rule.options.until) recurrenceEnd = rule.options.until;
          if (rule.options.byweekday) {
            weekdays = Array.isArray(rule.options.byweekday)
              ? rule.options.byweekday.map((d) => {
                  if (typeof d === 'string') return d.slice(0,2).toUpperCase();
                  if (typeof d === 'number') return weekdayMap[d];
                  if (typeof d === 'object' && d.weekday !== undefined) return weekdayMap[d.weekday];
                  return '';
                })
              : [];
            weekdays = weekdays.filter(Boolean);
            if (
              recurrence === "daily" &&
              weekdays.length === 5 &&
              ["MO","TU","WE","TH","FR"].every((d) => weekdays.includes(d))
            ) {
              skipWeekends = true;
            }
          }
          if (rule.options.bymonthday) dayOfMonth = rule.options.bymonthday;
          if (rule.options.bymonth) monthOfYear = rule.options.bymonth;
        } catch {}
      }
      reset({
        title: initialEvent.title || "",
        description: initialEvent.extendedProps?.description || "",
        startDate: initialEvent.start ? new Date(initialEvent.start) : (initialDate || new Date()),
        endDate: initialEvent.end ? new Date(initialEvent.end) : (initialDate || new Date()),
        startTime: initialEvent.start ? `${new Date(initialEvent.start).getHours().toString().padStart(2, '0')}:${new Date(initialEvent.start).getMinutes().toString().padStart(2, '0')}` : defaultTime,
        endTime: initialEvent.end ? `${new Date(initialEvent.end).getHours().toString().padStart(2, '0')}:${new Date(initialEvent.end).getMinutes().toString().padStart(2, '0')}` : defaultEndTime,
        timezone: initialEvent.extendedProps?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        allDay: initialEvent.allDay || false,
        recurrence,
        recurrenceEnd,
        weekdays,
        dayOfMonth,
        monthOfYear,
        interval,
        eventColour: initialEvent.backgroundColor || "#4285f4",
        skipWeekends,
        attendees: initialEvent.extendedProps?.attendees || [],
      });
    }
  }, [initialEvent]);

  const form = watch();
  const [color, setColor] = useState(form.eventColour || "#4285f4");
  // For attendee input
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [attendeeNameTouched, setAttendeeNameTouched] = useState(false);
  const [attendeeEmailTouched, setAttendeeEmailTouched] = useState(false);
  // Remove email validation button logic


  useEffect(() => {
    setTimezones(getIanaTimezones());
    setColor(form.eventColour || "#4285f4");
    // If editing, update recurrence fields from RRULE
    if (initialEvent?.extendedProps?.recurrenceRule) {
      try {
        const rule = RRule.fromString(initialEvent.extendedProps.recurrenceRule);
        const weekdayMap = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
        if (rule.options.byweekday) {
          const weekdays = Array.isArray(rule.options.byweekday)
            ? rule.options.byweekday.map((d) => {
                if (typeof d === 'string') return d.slice(0,2).toUpperCase();
                if (typeof d === 'number') return weekdayMap[d];
                if (typeof d === 'object' && d.weekday !== undefined) return weekdayMap[d.weekday];
                return '';
              })
            : [];
          setValue('weekdays', weekdays.filter(Boolean));
          // If all weekdays are MO-FR, set skipWeekends
          if (
            rule.options.freq === RRule.DAILY &&
            weekdays.length === 5 &&
            ["MO","TU","WE","TH","FR"].every((d) => weekdays.includes(d))
          ) {
            setValue('skipWeekends', true);
          }
        }
        if (rule.options.until) setValue('recurrenceEnd', rule.options.until);
        if (rule.options.interval) setValue('interval', rule.options.interval);
        if (rule.options.bymonthday) setValue('dayOfMonth', rule.options.bymonthday);
        if (rule.options.bymonth) setValue('monthOfYear', rule.options.bymonth);
      } catch {}
    }
  }, []);

  // Keep color picker and form in sync
  useEffect(() => {
    if (form.eventColour !== color) {
      setColor(form.eventColour);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.eventColour]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log("Watch triggered:", name, value);
      // When recurrence is changed, reset interval and specific recurrence options
      if (name === "recurrence") {
        console.log("Recurrence changed to:", value.recurrence);
        console.log("Current form values before reset:", value);
        setValue("interval", 1);
        // Only reset fields that are not applicable to the new recurrence type
        if (value.recurrence === "daily") {
          setValue("weekdays", []);
          setValue("dayOfMonth", null);
          setValue("monthOfYear", null);
        } else if (value.recurrence === "weekly") {
          setValue("dayOfMonth", null);
          setValue("monthOfYear", null);
          setValue("skipWeekends", false);
        } else if (value.recurrence === "monthly") {
          setValue("weekdays", []);
          setValue("dayOfMonth", null);
          setValue("monthOfYear", null);
          setValue("skipWeekends", false);
        } else if (value.recurrence === "yearly") {
          setValue("weekdays", []);
          setValue("dayOfMonth", null);
          setValue("skipWeekends", false);
        } else {
          // If recurrence is empty or "none", reset all recurrence-related fields
          setValue("weekdays", []);
          setValue("dayOfMonth", null);
          setValue("monthOfYear", null);
          setValue("recurrenceEnd", null);
          setValue("skipWeekends", false);
        }
        
        // Force a small delay to ensure the values are properly set
        setTimeout(() => {
          console.log("Form values after reset:", watch());
        }, 100);
      }
      if (name === "startDate" && value.startDate) {
        setValue("endDate", value.startDate);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const buildRRule = (data, dtstart) => {
    console.log("buildRRule called with data:", data);
    
    const options = {
      freq: RRule[data.recurrence?.toUpperCase()],
      interval: data.interval || 1, // Use interval from form data
    };
    if (data.recurrenceEnd) options.until = data.recurrenceEnd; // recurrenceEnd is already a Date object

    if (data.recurrence === "daily" && data.skipWeekends) {
      options.byweekday = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];
    }

    if (data.recurrence === "weekly" && data.weekdays && data.weekdays.length > 0) {
      console.log("Adding weekly weekdays:", data.weekdays);
      options.byweekday = data.weekdays.map((day) => RRule[day]);
    } else if (data.recurrence === "weekly") {
      // For weekly without weekdays, use the current day of week
      const currentDay = new Date().getDay();
      const weekdayMap = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];
      options.byweekday = [weekdayMap[currentDay]];
      console.log("Using current day of week for weekly recurrence:", weekdayMap[currentDay]);
    }
    
    if (data.recurrence === "monthly" && data.dayOfMonth && data.dayOfMonth > 0) {
      console.log("Adding monthly dayOfMonth:", data.dayOfMonth);
      options.bymonthday = data.dayOfMonth;
    } else if (data.recurrence === "monthly") {
      // For monthly without dayOfMonth, use the current day of month
      options.bymonthday = new Date().getDate();
      console.log("Using current day of month for monthly recurrence:", new Date().getDate());
    }
    
    if (data.recurrence === "yearly" && data.dayOfMonth && data.dayOfMonth > 0 && data.monthOfYear && data.monthOfYear > 0) {
      console.log("Adding yearly monthOfYear:", data.monthOfYear, "dayOfMonth:", data.dayOfMonth);
      options.bymonth = data.monthOfYear;
      options.bymonthday = data.dayOfMonth;
    } else if (data.recurrence === "yearly") {
      // For yearly without monthOfYear/dayOfMonth, use the current month and day
      const now = new Date();
      options.bymonth = now.getMonth() + 1;
      options.bymonthday = now.getDate();
      console.log("Using current month and day for yearly recurrence:", now.getMonth() + 1, now.getDate());
    }
    
    console.log("Final RRule options:", options);
    const rrule = new RRule(options).toString();
    console.log("Generated RRule string:", rrule);
    return rrule;

  };

  const handleSave = (data) => {
    console.log("handleSave called with data:", data);
    
    // Clean up the data to ensure proper types
    const cleanedData = {
      ...data,
      dayOfMonth: data.dayOfMonth && !Array.isArray(data.dayOfMonth) ? Number(data.dayOfMonth) : null,
      monthOfYear: data.monthOfYear && !Array.isArray(data.monthOfYear) ? Number(data.monthOfYear) : null,
      interval: data.interval ? Number(data.interval) : 1,
      weekdays: Array.isArray(data.weekdays) ? data.weekdays : [],
    };
    
    console.log("Cleaned data:", cleanedData);
    
    const startDate = parseInTimeZone(
      cleanedData.startDate,
      cleanedData.startTime,
      cleanedData.timezone,
      cleanedData.allDay,
      false
    );
    const endDate = parseInTimeZone(
      cleanedData.endDate,
      cleanedData.endTime,
      cleanedData.timezone,
      cleanedData.allDay,
      true
    );

    let rrule = null;
    if (cleanedData.recurrence && cleanedData.recurrence !== "") {
      // Only build RRule if recurrence is selected
      console.log("Building RRule for recurrence:", cleanedData.recurrence);
      rrule = buildRRule(cleanedData, startDate);
      console.log("Generated RRule:", rrule);
    }

    const fullData = {
      ...cleanedData,
      id: initialEvent?.id || null, // ✅ Add this line
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      recurrenceRule: rrule,
      // Ensure recurrenceEnd is ISO string if it exists
      recurrenceEnd: cleanedData.recurrenceEnd
        ? cleanedData.recurrenceEnd.toISOString()
        : null,
      eventColour: cleanedData.eventColour,
      skipWeekends: !!cleanedData.skipWeekends,
      attendees: cleanedData.attendees,
    };
    console.log("EventForm outgoing payload:", fullData);
    onSave(fullData);
  };

  return (
    <Box p={3}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {initialEvent ? "Edit Event" : "New Event"}
          </Typography>
          <form onSubmit={handleSubmit(handleSave, (errors) => {
            console.log("Form validation errors:", errors);
          })}>
            <Stack spacing={2}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />

              {/* Date Pickers */}
              <Stack direction="row" spacing={2}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Start Date"
                      value={field.value ? new Date(field.value) : null}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: errors.startDate?.message,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="End Date"
                      value={field.value ? new Date(field.value) : null}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: errors.endDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Stack>

              {/* Time */}
              {!form.allDay && (
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Start Time"
                        type="time"
                        fullWidth
                        error={!!errors.startTime}
                        helperText={errors.startTime?.message}
                      />
                    )}
                  />
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="End Time"
                        type="time"
                        fullWidth
                        error={!!errors.endTime}
                        helperText={errors.endTime?.message}
                      />
                    )}
                  />
                </Stack>
              )}

              <Stack direction="row" spacing={6} alignItems="center">
                <Controller
                  name="allDay"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="All Day"
                    />
                  )}
                />
                {/* Event Color Picker - popover style, improved alignment and appearance */}
                <Controller
                  name="eventColour"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        ml: 12,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "linear-gradient(90deg, #4285f4, #9c27b0)",
                          minWidth: 90,
                          fontFamily: "Poppins, Roboto, Arial, sans-serif",
                          letterSpacing: 0.5,
                        }}
                      >
                        Event Color:
                      </Typography>
                      <Tooltip title="Pick event color" arrow>
                        <Box
                          sx={{
                            width: 60,
                            height: 36,
                            borderRadius: "8px",
                            background: field.value,
                            border: "2.5px solid #e3eafc",
                            boxShadow: "0 4px 18px rgba(76, 110, 245, 0.18)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "box-shadow 0.2s, transform 0.2s",
                            position: "relative",
                            "&:hover": {
                              boxShadow: "0 8px 28px rgba(156, 39, 176, 0.22)",
                              transform: "scale(1.08)",
                            },
                          }}
                          onClick={(e) => setAnchorEl(e.currentTarget)}
                        />
                      </Tooltip>
                      <Popover
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        PaperProps={{
                          sx: {
                            borderRadius: 3,
                            boxShadow: "0 6px 32px rgba(25, 118, 210, 0.18)",
                            border: "1.5px solid #e3eafc",
                            p: 2,
                            bgcolor: "#f8fafd",
                          },
                        }}
                      >
                        <Box sx={{ p: 0.5, minWidth: 220 }}>
                          <HexColorPicker
                            color={color}
                            onChange={(col) => {
                              setColor(col);
                              field.onChange(col);
                            }}
                            style={{
                              width: "100%",
                              borderRadius: "12px",
                              boxShadow: "0 2px 12px #4285f455",
                              transition: "box-shadow 0.3s cubic-bezier(.4,2,.6,1)",
                              animation: "colorful-pop 0.5s cubic-bezier(.4,2,.6,1)",
                            }}
                          />
                          <TextField
                            value={color}
                            onChange={e => {
                              setColor(e.target.value);
                              field.onChange(e.target.value);
                            }}
                            label="Hex Color"
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2 }}
                          />
                        </Box>
                      </Popover>
                    </Box>
                  )}
                />
              </Stack>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />

              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={timezones}
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Timezone"
                        fullWidth
                        error={!!errors.timezone}
                        helperText={errors.timezone?.message}
                      />
                    )}
                    disableClearable
                  />
                )}
              />

              {/* Recurrence */}
              <Controller
                name="recurrence"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.recurrence}>
                    <InputLabel>Repeat</InputLabel>
                    <Select {...field} label="Repeat">
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                    {errors.recurrence && (
                      <Typography color="error" variant="caption">
                        {errors.recurrence?.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              {/* Enhanced Recurrence Details Section */}
              {(form.recurrence === "daily" ||
                form.recurrence === "weekly" ||
                form.recurrence === "monthly" ||
                form.recurrence === "yearly") && (
                <Card
                  elevation={1}
                  sx={{
                    borderRadius: "20px",
                    mt: 3,
                    border: "2px solid #f0f4ff",
                    background:
                      "linear-gradient(145deg, #fafbff 0%, #f8faff 100%)",
                    position: "relative",
                    overflow: "visible",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      background:
                        "linear-gradient(145deg, #4285f4, #9c27b0, #ff6b6b)",
                      borderRadius: "22px",
                      zIndex: -1,
                      opacity: 0.1,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "16px",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                          boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "20px",
                          }}
                        >
                          🔄
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#2c3e50",
                            fontWeight: 700,
                            textTransform: "capitalize",
                            mb: 0.5,
                          }}
                        >
                          {form.recurrence} Recurrence
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Configure how often this event repeats
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={3}>
                      {/* Daily: Skip Weekends Option */}
                      {form.recurrence === "daily" && (
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: "16px",
                            bgcolor: "white",
                            border: "1px solid #e3f2fd",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Controller
                            name="skipWeekends"
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...field}
                                    checked={!!field.value}
                                  />
                                }
                                label="Skip Weekends (Saturday & Sunday)"
                              />
                            )}
                          />
                        </Box>
                      )}
                      {/* Interval Section */}
                      {(form.recurrence === "weekly" ||
                        form.recurrence === "monthly" ||
                        form.recurrence === "yearly") && (
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: "16px",
                            bgcolor: "white",
                            border: "1px solid #e3f2fd",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              color: "#1565c0",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            ⏱️ Frequency
                          </Typography>
                          <Controller
                            name="interval"
                            control={control}
                            render={({ field }) => (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{
                                    minWidth: "fit-content",
                                    color: "#424242",
                                  }}
                                >
                                  Every
                                </Typography>
                                <TextField
                                  {...field}
                                  type="number"
                                  inputProps={{ min: 1, max: 99 }}
                                  error={!!errors.interval}
                                  helperText={errors.interval?.message}
                                  sx={{
                                    width: "80px",
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "12px",
                                      bgcolor: "#f8f9fa",
                                    },
                                  }}
                                  size="small"
                                />
                                <Typography
                                  variant="body1"
                                  sx={{ color: "#424242" }}
                                >
                                  {form.recurrence === "weekly"
                                    ? field.value === 1
                                      ? "week"
                                      : "weeks"
                                    : form.recurrence === "monthly"
                                    ? field.value === 1
                                      ? "month"
                                      : "months"
                                    : field.value === 1
                                    ? "year"
                                    : "years"}
                                </Typography>
                              </Box>
                            )}
                          />
                        </Box>
                      )}

                      {/* Weekly Days Selection */}
                      {form.recurrence === "weekly" && (
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: "16px",
                            bgcolor: "white",
                            border: "1px solid #e8f5e8",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 2.5,
                              fontWeight: 600,
                              color: "#2e7d32",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            📅 Repeat On
                          </Typography>
                          {/* Debug print for weekdays */}
                          {console.log('form.weekdays:', form.weekdays)}
                          <Controller
                            name="weekdays"
                            control={control}
                            render={({ field }) => (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                                {weekdays.map((day, index) => (
                                  <Chip
                                    key={day}
                                    label={weekdayLabels[index]}
                                    clickable
                                    onClick={() => {
                                      // Always use the code from the weekdays constant, never a number
                                      const valueArr = Array.isArray(field.value) ? field.value : [];
                                      const newDays = valueArr.includes(day)
                                        ? valueArr.filter((d) => d !== day)
                                        : [...valueArr, day];
                                      field.onChange(newDays);
                                    }}
                                    variant={Array.isArray(field.value) && field.value.includes(day) ? "filled" : "outlined"}
                                    sx={{
                                      minWidth: "56px",
                                      height: "40px",
                                      fontWeight: 600,
                                      fontSize: "0.875rem",
                                      borderRadius: "12px",
                                      transition:
                                        "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                      "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow:
                                          "0 4px 12px rgba(0,0,0,0.15)",
                                        bgcolor: Array.isArray(field.value) && field.value.includes(day)
                                          ? "#1565c0"
                                          : "#f5f5f5",
                                        color: Array.isArray(field.value) && field.value.includes(day)
                                          ? "white"
                                          : "#1976d2",
                                        border: "1px solid #1976d2",
                                      },
                                      ...(Array.isArray(field.value) && field.value.includes(day)
                                        ? {
                                            bgcolor: "#1976d2",
                                            color: "white",
                                          }
                                        : {
                                            color: "#1976d2",
                                            border: "1px solid #e0e0e0",
                                          }),
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          />
                        </Box>
                      )}

                      {/* Monthly Day Selection */}
                      {form.recurrence === "monthly" && (
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: "16px",
                            bgcolor: "white",
                            border: "1px solid #fff3e0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              color: "#ef6c00",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            📆 Day of Month
                          </Typography>
                          <Controller
                            name="dayOfMonth"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Day"
                                type="number"
                                inputProps={{ min: 1, max: 31 }}
                                error={!!errors.dayOfMonth}
                                helperText={errors.dayOfMonth?.message}
                                sx={{
                                  maxWidth: "120px",
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                    bgcolor: "#fafafa",
                                  },
                                }}
                              />
                            )}
                          />
                        </Box>
                      )}

                      {/* Yearly Selection */}
                      {form.recurrence === "yearly" && (
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: "16px",
                            bgcolor: "white",
                            border: "1px solid #fce4ec",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              color: "#c2185b",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            🗓️ Annual Date
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <Controller
                              name="monthOfYear"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  select
                                  label="Month"
                                  error={!!errors.monthOfYear}
                                  helperText={errors.monthOfYear?.message}
                                  sx={{
                                    minWidth: "140px",
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "12px",
                                      bgcolor: "#fafafa",
                                    },
                                  }}
                                >
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                      {new Date(0, i).toLocaleString("en", {
                                        month: "long",
                                      })}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                            <Controller
                              name="dayOfMonth"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Day"
                                  type="number"
                                  inputProps={{ min: 1, max: 31 }}
                                  error={!!errors.dayOfMonth}
                                  helperText={errors.dayOfMonth?.message}
                                  sx={{
                                    maxWidth: "100px",
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "12px",
                                      bgcolor: "#fafafa",
                                    },
                                  }}
                                />
                              )}
                            />
                          </Stack>
                        </Box>
                      )}

                      {/* End Date */}
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: "16px",
                          bgcolor: "white",
                          border: "1px solid #f3e5f5",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: "#7b1fa2",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          🏁 End Date (Optional)
                        </Typography>
                        <Controller
                          name="recurrenceEnd"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              label="Repeat until"
                              value={field.value ? new Date(field.value) : null}
                              onChange={field.onChange}
                              slotProps={{
                                textField: {
                                  error: !!errors.recurrenceEnd,
                                  helperText: errors.recurrenceEnd?.message,
                                  sx: {
                                    maxWidth: "200px",
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "12px",
                                      bgcolor: "#fafafa",
                                    },
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              
              {/* Attendees Field */}
              <Controller
                name="attendees"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <Accordion sx={{ mb: 2, borderRadius: 2.5, background: '#fafbff', boxShadow: 'none', border: '1.5px solid #e0e0e0' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderRadius: 2.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'Poppins, Roboto, Arial, sans-serif',
                          color: 'text.primary',
                          fontSize: { xs: 14, sm: 16 },
                        }}
                      >
                        Attendees
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" mb={1} mt={2}>
                        <TextField
                          label="Name"
                          value={attendeeName}
                          onChange={e => setAttendeeName(e.target.value)}
                          size="small"
                          fullWidth
                          error={Boolean(attendeeNameTouched && attendeeName.length < 2)}
                          helperText={attendeeNameTouched && attendeeName.length < 2 ? "Name too short" : ""}
                          onBlur={() => setAttendeeNameTouched(true)}
                          sx={{ mb: { xs: 1, sm: 0 } }}
                        />
                        <TextField
                          label="Email"
                          value={attendeeEmail}
                          onChange={e => setAttendeeEmail(e.target.value)}
                          size="small"
                          fullWidth
                          type="email"
                          error={Boolean(attendeeEmailTouched && !/^[^@]+@[^@]+\.[^@]+$/.test(attendeeEmail))}
                          helperText={attendeeEmailTouched && !/^[^@]+@[^@]+\.[^@]+$/.test(attendeeEmail) ? "Invalid email" : ""}
                          onBlur={() => setAttendeeEmailTouched(true)}
                        />
                        <Button
                          variant="contained"
                          size="medium"
                          color="primary"
                          sx={{ minWidth: 44, minHeight: 44, borderRadius: "50%" }}
                          onClick={() => {
                            setAttendeeNameTouched(true);
                            setAttendeeEmailTouched(true);
                            if (
                              attendeeName.length >= 2 &&
                              /^[^@]+@[^@]+\.[^@]+$/.test(attendeeEmail)
                            ) {
                              field.onChange([
                                ...field.value,
                                { name: attendeeName, email: attendeeEmail },
                              ]);
                              setAttendeeName("");
                              setAttendeeEmail("");
                              setAttendeeNameTouched(false);
                              setAttendeeEmailTouched(false);
                            }
                          }}
                          disabled={
                            !attendeeName ||
                            attendeeName.length < 2 ||
                            !attendeeEmail ||
                            !/^[^@]+@[^@]+\.[^@]+$/.test(attendeeEmail)
                          }
                        >
                          <PersonAddAlt1Icon />
                        </Button>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {field.value.map((att, idx) => (
                          <Chip
                            key={idx}
                            avatar={
                              <Avatar sx={{ bgcolor: "#1976d2", color: "#fff" }}>
                                {att.name
                                  ? att.name
                                      .split(' ')
                                      .map(n => n[0])
                                      .join('')
                                      .toUpperCase()
                                  : "?"}
                              </Avatar>
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {att.name}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {att.email}
                                </Typography>
                              </Box>
                            }
                            onDelete={() => {
                              const newList = field.value.filter((_, i) => i !== idx);
                              field.onChange(newList);
                            }}
                            sx={{ mb: 1, px: 1.5, py: 0.5, background: "#e3f2fd", borderRadius: 2, boxShadow: "0 1px 4px #4285f422", transition: "all 0.2s cubic-bezier(.4,2,.6,1)", "& .MuiAvatar-root": { width: 28, height: 28, fontSize: 16 } }}
                          />
                        ))}
                      </Stack>
                      {errors.attendees && (
                        <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                          {errors.attendees.message}
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )}
              />

              {/* Preview Card based on selected event color */}
              <Card
                elevation={5}
                sx={{
                  borderRadius: 4,
                  mt: 4,
                  p: 2,
                  background: form.eventColour,
                  color: "#fff",
                  boxShadow: `0 8px 20px ${form.eventColour}99`,
                  transition: "all 0.3s ease-in-out",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  🎨 Event Color Preview
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  This is how your event will look using the selected color.
                </Typography>
              </Card>


              {/* Action buttons */}
              <Box display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
                <Box display="flex" gap={2}>
                  <Button variant="contained" type="submit">
                    Save
                  </Button>
                </Box>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventForm;
