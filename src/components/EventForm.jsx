import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EventIcon from '@mui/icons-material/Event';
import CustomRecurrenceDialog from './CustomRecurrenceDialog';
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toZonedTime, formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const getIanaTimezones = () => {
  if (typeof Intl.supportedValuesOf === 'function') {
    return Intl.supportedValuesOf('timeZone');
  }
 

};

const eventSchema = yup.object({
  title: yup.string().required("Title is required").min(3, "Title must be at least 3 characters"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date cannot be before start date"),
  startTime: yup.string().required("Start time is required"),
  endTime: yup
    .string()
    .required("End time is required")
    .test("is-after", "End time must be after start time", function (value) {
      const { startTime } = this.parent;
      return value > startTime;
    }),
  timezone: yup.string().required("Timezone is required"),
  description: yup.string().max(500, "Description too long"),
  allDay: yup.boolean(),
});

function parseInTimeZone(dateStr, timeStr, timezone) {
  if (!dateStr || !timeStr || !timezone) return null;

  // If dateStr is a Date object, convert it to 'YYYY-MM-DD' string based on its local components
  if (dateStr instanceof Date) {
    const pad = (n) => n.toString().padStart(2, '0');
    dateStr = `${dateStr.getFullYear()}-${pad(dateStr.getMonth() + 1)}-${pad(dateStr.getDate())}`;
  }

  // Combine date and time into ISO format string
  const dateTimeStr = `${dateStr}T${timeStr}:00`;

  // Convert to UTC based on the specified timezone
  const utcDate = fromZonedTime(dateTimeStr, timezone);

  return new Date(utcDate);
}

const EventForm = ({ initialDate, onSave, onCancel, onNextRecurring, minHeight }) => {
  const [timezones, setTimezones] = useState([]);
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState(null);

  useEffect(() => {
    setTimezones(getIanaTimezones());
  }, []);

  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const {
    control,
     setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(eventSchema),
      defaultValues: {
      title: "",
      // use the same pad(...) helper to format local YYYY-MM-DD
      startDate: initialDate
        ? `${initialDate.getFullYear()}-${pad(initialDate.getMonth()+1)}-${pad(initialDate.getDate())}`
        : defaultDate,
      endDate:   initialDate
        ? `${initialDate.getFullYear()}-${pad(initialDate.getMonth()+1)}-${pad(initialDate.getDate())}`
        : defaultDate,
        startTime: defaultTime,
     endTime:   defaultTime,
      description: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      allDay: false,
    },
  });

   const startTime = watch("startTime");
  useEffect(() => {
    if (!startTime) return;
    const [h, m] = startTime.split(":").map(Number);
    const startMs = h * 3600000 + m * 60000;
    const endMs = startMs + 30 * 60000;
    const pad = (n) => n.toString().padStart(2, "0");
    const newEnd = `${pad(Math.floor(endMs / 3600000) % 24)}:${pad(Math.floor((endMs % 3600000) / 60000))}`;
    const currEnd = watch("endTime");
    if (currEnd === startTime || !currEnd) {
      setValue("endTime", newEnd, { shouldValidate: true });
    }
  }, [startTime, setValue, watch]);

  const form = watch();

  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date; // already ISO
    // If it's a Date object, format as YYYY-MM-DD
    return date.toISOString().slice(0, 10);
  };

  const handleSave = (data) => {
 const startDate = parseInTimeZone(data.startDate, data.startTime, data.timezone);
const endDate = parseInTimeZone(data.endDate, data.endTime, data.timezone);


    // 2) formatter in that zone
    const fmt = (d) =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: data.timezone,
        year: "numeric", month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(d);

    const formattedStartDate = formatInTimeZone(startDate, data.timezone, 'EEE MMM dd yyyy HH:mm:ss xxx (OOOO)');
    const formattedEndDate = formatInTimeZone(endDate, data.timezone, 'EEE MMM dd yyyy HH:mm:ss xxx (OOOO)');
    const fullData = {
      ...data,
      formattedStartDate,
      formattedEndDate,
      startDate: startDate,
      endDate:   endDate,
      
      ...(recurrenceRule ? { recurrenceRule } : {}),
    };

    console.log("Event Form Data:", { 
      ...fullData, 
      formattedStartDate, 
      formattedEndDate,
      startDateISO: startDate.toISOString(),
      endDateISO: endDate.toISOString()
    });
    onSave(fullData);
  };

  const handleNextRecurring = () => {
    setRecurrenceDialogOpen(true);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'auto',
        backgroundColor: 'white',
        borderRadius:4,
        px: { xs: 1, sm: 2, md: 4 }, // Responsive horizontal padding
        py: { xs: 2, sm: 4 },        // Responsive vertical padding (add this line)
      }}
    >
      <Card
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 800, lg: 1000 },
          minHeight: minHeight || { xs: 520, sm: 600, md: 700, lg: 700 }, // Taller on sm/md screens
          borderRadius: 5,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          m: 0,
          display: 'flex',           // Make Card a flex container
          flexDirection: 'column',   // Stack children vertically
          justifyContent: 'center',  // Center content vertically
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 3, pb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mr: 2 }}>
            <EventIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight={700} color="primary.main" letterSpacing={1}>
            New Event
          </Typography>
        </Box>
        <Divider sx={{ mb: 3, mx: 4 }} />
        <CardContent sx={{ p: { xs: 4, sm: 4, md: 8 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <form onSubmit={handleSubmit(handleSave)} noValidate>
            <Stack spacing={3}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    required
                    variant="outlined"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                      variant="outlined"
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                      variant="outlined"
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                    />
                  )}
                />
              </Stack>
              <Controller
                name="allDay"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                      />
                    }
                    label="All day"
                  />
                )}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Time"
                      type="time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                      variant="outlined"
                      error={!!errors.startTime}
                      helperText={errors.startTime?.message}
                      disabled={watch("allDay")}
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
                      InputLabelProps={{ shrink: true }}
                      required
                      variant="outlined"
                      error={!!errors.endTime}
                      helperText={errors.endTime?.message}
                      disabled={watch("allDay")}
                    />
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
                    variant="outlined"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Timezone
                </Typography>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={timezones}
                      value={field.value}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Timezone" variant="outlined" fullWidth required error={!!errors.timezone} helperText={errors.timezone?.message} />
                      )}
                      fullWidth
                      isOptionEqualToValue={(option, value) => option === value}
                      disableClearable
                    />
                  )}
                />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
                <Button onClick={onCancel}  variant="outlined" sx={{ minWidth: 120, py: { xs: 1, sm: 1.25, md: 1.5 } }}>
                  Cancel
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" type="submit" sx={{ py: { xs: 1, sm: 1.25, md: 1.5 } }}>
                    Save 
                  </Button>
                  <Button variant="contained"  onClick={handleNextRecurring} sx={{ py: { xs: 1, sm: 1.25, md: 1.5 } }}>
                    Next / Recurring
                  </Button>
                </Box>
              </Box>
            </Stack>
          </form>
        </CardContent>
        <CustomRecurrenceDialog
          open={recurrenceDialogOpen}
          onClose={() => setRecurrenceDialogOpen(false)}
          onDone={({ rruleString, customOptions }) => {
            setRecurrenceRule(rruleString);
            setRecurrenceDialogOpen(false);
          }}
          start={
            form.startDate && form.startTime
              ? new Date(`${form.startDate}T${form.startTime}`)
              : new Date()
          }
        />
      </Card>
    </Box>
  );
};

export default EventForm;
