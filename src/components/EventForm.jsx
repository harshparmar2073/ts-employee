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
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
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
  dayOfMonth: yup.number().nullable(),
  monthOfYear: yup.number().nullable(),
  // New interval field for recurrence frequency
  interval: yup.number().min(1, "Interval must be at least 1").nullable(),
  eventColour: yup.string().required("Event color is required"),
  skipWeekends: yup.boolean().nullable(),
});

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
const EventForm = ({ initialDate, onSave, onCancel }) => {
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
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: "",
      startDate: initialDate || new Date(),
      endDate: initialDate || new Date(),
      startTime: defaultTime,
      endTime: defaultEndTime,
      description: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      allDay: false,
      recurrence: "",
      recurrenceEnd: null, // Changed to null for DatePicker
      weekdays: [],
      dayOfMonth: null,
      monthOfYear: null,
      interval: 1, // Default interval
      eventColour: "#4285f4", // Default color
      skipWeekends: false, // For daily recurrence
    },
  });

  const form = watch();
  // For react-color-palette, we need a [color, setColor] state
  const [color, setColor] = useColor("hex", form.eventColour || "#4285f4");
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setTimezones(getIanaTimezones());
    // Sync color picker with form value
    setColor({
      hex: form.eventColour || "#4285f4",
      rgb: { r: 66, g: 133, b: 244 },
      hsv: { h: 221, s: 0.73, v: 0.96 },
      oldHue: 221,
      source: "hex",
    });
  }, []);

  // Keep color picker and form in sync
  useEffect(() => {
    if (form.eventColour !== color.hex) {
      setColor({ ...color, hex: form.eventColour });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.eventColour]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // When recurrence is changed, reset interval and specific recurrence options
      if (name === "recurrence") {
        setValue("interval", 1);
        setValue("weekdays", []);
        setValue("dayOfMonth", null);
        setValue("monthOfYear", null);
        setValue("recurrenceEnd", null); // Clear recurrenceEnd when recurrence type changes
      }
      if (name === "startDate" && value.startDate) {
        setValue("endDate", value.startDate);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const buildRRule = (data, dtstart) => {
    const options = {
      freq: RRule[data.recurrence?.toUpperCase()],
      dtstart,
      interval: data.interval || 1, // Use interval from form data
    };
    if (data.recurrenceEnd) options.until = data.recurrenceEnd; // recurrenceEnd is already a Date object

    if (data.recurrence === "daily" && data.skipWeekends) {
      options.byweekday = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];
    }

    if (data.recurrence === "weekly" && data.weekdays.length) {
      options.byweekday = data.weekdays.map((day) => RRule[day]);
    }
    if (data.recurrence === "monthly" && data.dayOfMonth) {
      options.bymonthday = data.dayOfMonth;
    }
    if (data.recurrence === "yearly" && data.dayOfMonth && data.monthOfYear) {
      options.bymonth = data.monthOfYear;
      options.bymonthday = data.dayOfMonth;
    }
    return new RRule(options).toString();
  };

  const handleSave = (data) => {
    const startDate = parseInTimeZone(
      data.startDate,
      data.startTime,
      data.timezone,
      data.allDay,
      false
    );
    const endDate = parseInTimeZone(
      data.endDate,
      data.endTime,
      data.timezone,
      data.allDay,
      true
    );

    let rrule = null;
    if (data.recurrence && data.recurrence !== "") {
      // Only build RRule if recurrence is selected
      rrule = buildRRule(data, startDate);
    }

    const fullData = {
      ...data,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      recurrenceRule: rrule,
      // Ensure recurrenceEnd is ISO string if it exists
      recurrenceEnd: data.recurrenceEnd
        ? data.recurrenceEnd.toISOString()
        : null,
      eventColour: data.eventColour,
      skipWeekends: !!data.skipWeekends,
    };
    console.log("EventForm outgoing payload:", fullData);
    onSave(fullData);
  };

  return (
    <Box p={3}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            New Event
          </Typography>
          <form onSubmit={handleSubmit(handleSave)}>
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
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, #4285f4 0%, #9c27b0 100%) padding-box, ${field.value} border-box`,
                            border: "3px solid transparent",
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
                            "::after": {
                              content: '""',
                              position: "absolute",
                              top: 4,
                              left: 4,
                              right: 4,
                              bottom: 4,
                              borderRadius: "50%",
                              background: field.value,
                              boxShadow: "0 1px 6px rgba(0,0,0,0.10)",
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
                        <Box sx={{ p: 0.5 }}>
                          <ColorPicker
                            width={220}
                            height={150}
                            color={color}
                            onChange={(col) => {
                              setColor(col);
                              field.onChange(col.hex);
                            }}
                            hideHSV
                            hideRGB
                            dark
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
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}
                          >
                            {weekdays.map((day, index) => (
                              <Controller
                                key={day}
                                name="weekdays"
                                control={control}
                                render={({ field }) => (
                                  <Chip
                                    label={weekdayLabels[index]}
                                    clickable
                                    onClick={() => {
                                      const newDays = field.value.includes(day)
                                        ? field.value.filter((d) => d !== day)
                                        : [...field.value, day];
                                      field.onChange(newDays);
                                    }}
                                    variant={
                                      field.value.includes(day)
                                        ? "filled"
                                        : "outlined"
                                    }
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
                                        bgcolor: field.value.includes(day)
                                          ? "#1565c0"
                                          : "#f5f5f5",
                                        color: field.value.includes(day)
                                          ? "white"
                                          : "#1976d2",
                                        border: "1px solid #1976d2",
                                      },
                                      ...(field.value.includes(day)
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
                                )}
                              />
                            ))}
                          </Box>
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
