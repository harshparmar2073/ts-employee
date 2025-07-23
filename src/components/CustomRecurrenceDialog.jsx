import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardContent,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { RRule } from "rrule";
import { format } from "date-fns";
import EventIcon from "@mui/icons-material/Event";

const frequencies = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const weekdays = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function CustomRecurrenceDialog({
  open,
  onClose,
  onDone,
  start,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      frequency: "weekly",
      interval: 1,
      repeatOn: [1],
      ends: "never",
      endDate: format(new Date(), "yyyy-MM-dd"),
      occurrences: 5,
    },
  });

  const frequency = watch("frequency");
  const ends = watch("ends");

  const onSubmit = (data) => {
    const weekdayMap = [
      RRule.SU,
      RRule.MO,
      RRule.TU,
      RRule.WE,
      RRule.TH,
      RRule.FR,
      RRule.SA,
    ];
    const freqMap = {
      daily: RRule.DAILY,
      weekly: RRule.WEEKLY,
      monthly: RRule.MONTHLY,
      yearly: RRule.YEARLY,
    };

    // Ensure start is local midnight for consistency
 

    const options = {
      freq: freqMap[data.frequency],
      interval: Number(data.interval),
      byweekday:
        data.frequency === "weekly"
          ? data.repeatOn.map((d) => weekdayMap[d])
          : undefined,
      count: data.ends === "after" ? Number(data.occurrences) : undefined,
      until: data.ends === "on" ? new Date(data.endDate) : undefined,
    };

    Object.keys(options).forEach((key) => {
      if (options[key] === undefined || options[key] === null) {
        delete options[key];
      }
    });

    const rule = new RRule(options);
    // Only show RRULE part, not DTSTART
    const rruleString = rule.toString();
    onDone?.({
      rruleString,
      customOptions: data,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      scroll="body"
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 2,
            // background: "linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)",
          }
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        {/* OUTER BOX/CARD */}
        <Card
          elevation={4}
          sx={{
            borderRadius: 5,
            p: 5,
            // background: "rgba(255, 255, 255, 0.9)",
            // backdropFilter: "blur(12px)",
            m: 4, // Increase this value for a thicker border
            // boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
            border: '1px solid rgba( 255, 255, 255, 0.3 )'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 3, pb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mr: 2 }}>
                <EventIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={700} color="primary.main" letterSpacing={1}>
                Custom Recurrence
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, mx: 4 }} />
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Frequency + Interval */}
              <Box display="flex" gap={2} mb={2}>
                <Controller
                  name="interval"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Every"
                      type="number"
                      inputProps={{ min: 1 }}
                      fullWidth
                      error={!!errors.interval}
                      helperText={errors.interval?.message}
                    />
                  )}
                />
                <Controller
                  name="frequency"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select {...field} label="Unit">
                        {frequencies.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              {/* Weekly: Repeat On */}
              {frequency === "weekly" && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Repeat on
                  </Typography>
                  <Controller
                    name="repeatOn"
                    control={control}
                    rules={{
                      validate: (val) =>
                        (val && val.length > 0) || "Select at least one day",
                    }}
                    render={({ field }) => (
                      <ToggleButtonGroup
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                        size="small"
                        fullWidth
                      >
                        {weekdays.map((day) => (
                          <ToggleButton key={day.value} value={day.value}>
                            {day.label}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    )}
                  />
                  {errors.repeatOn && (
                    <FormHelperText error>{errors.repeatOn.message}</FormHelperText>
                  )}
                </Box>
              )}

              {/* Ends */}
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Ends
                </Typography>
                <Controller
                  name="ends"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <Select {...field}>
                        <MenuItem value="never">Never</MenuItem>
                        <MenuItem value="on">On a date</MenuItem>
                        <MenuItem value="after">After N occurrences</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              {ends === "on" && (
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Date"
                      type="date"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                    />
                  )}
                />
              )}

              {ends === "after" && (
                <Controller
                  name="occurrences"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Occurrences"
                      type="number"
                      fullWidth
                      inputProps={{ min: 1 }}
                      error={!!errors.occurrences}
                      helperText={errors.occurrences?.message}
                    />
                  )}
                />
              )}
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="text">
                  Cancel
                </Button>
                <Button type="submit" variant="contained">
                  Save
                </Button>
              </DialogActions>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}