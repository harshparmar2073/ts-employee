// EventForm.jsx
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { fromZonedTime } from "date-fns-tz";
import { RRule } from "rrule";

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
  recurrenceEnd: yup.string().nullable(),
  weekdays: yup.array().nullable(),
  dayOfMonth: yup.number().nullable(),
  monthOfYear: yup.number().nullable(),
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
      recurrenceEnd: "",
      weekdays: [],
      dayOfMonth: null,
      monthOfYear: null,
    },
  });

  const form = watch();
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === "startDate" && value.startDate) {
        setValue("endDate", value.startDate);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  useEffect(() => {
    setTimezones(getIanaTimezones());
  }, []);

  const buildRRule = (data, dtstart) => {
    const options = {
      freq: RRule[data.recurrence?.toUpperCase()],
      dtstart,
      interval: 1,
    };
    if (data.recurrenceEnd) options.until = new Date(data.recurrenceEnd);
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
    if (data.recurrence) {
      rrule = buildRRule(data, startDate);
    }

    const fullData = {
      ...data,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      recurrenceRule: rrule,
    };
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
                      disabled={form.allDay}
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
                      disabled={form.allDay}
                    />
                  )}
                />
              </Stack>

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
                      <TextField {...params} label="Timezone" fullWidth />
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
                  <FormControl fullWidth>
                    <InputLabel>Repeat</InputLabel>
                    <Select {...field} label="Repeat">
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              {/* Dynamic Recurrence Options */}
              {form.recurrence === "daily" && (
                <Controller
                  name="recurrenceEnd"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Repeat Until (optional)"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  )}
                />
              )}

              {form.recurrence === "weekly" && (
                <Stack direction="row">
                  {weekdays.map((day) => (
                    <Controller
                      key={day}
                      name="weekdays"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value.includes(day)}
                              onChange={(e) => {
                                const newDays = e.target.checked
                                  ? [...field.value, day]
                                  : field.value.filter((d) => d !== day);
                                field.onChange(newDays);
                              }}
                            />
                          }
                          label={day}
                        />
                      )}
                    />
                  ))}
                </Stack>
              )}

              {form.recurrence === "monthly" && (
                <Controller
                  name="dayOfMonth"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Day of Month"
                      type="number"
                      fullWidth
                    />
                  )}
                />
              )}

              {form.recurrence === "yearly" && (
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="monthOfYear"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Month" fullWidth>
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
                        fullWidth
                      />
                    )}
                  />
                </Stack>
              )}

              {/* Action buttons */}
              <Box display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => console.log("Next Recurring Event")}
                  >
                    Next Recurring Event
                  </Button>
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
