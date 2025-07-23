import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const daysOfWeek = [
  { label: "Mon", value: "MO" },
  { label: "Tue", value: "TU" },
  { label: "Wed", value: "WE" },
  { label: "Thu", value: "TH" },
  { label: "Fri", value: "FR" },
  { label: "Sat", value: "SA" },
  { label: "Sun", value: "SU" },
];

const RecurrenceForm = ({ recurrence, setRecurrence }) => {
  const [endCondition, setEndCondition] = useState(
    recurrence.until ? "until" : "never"
  );

  useEffect(() => {
    if (["weekly", "monthly", "yearly"].includes(recurrence.frequency) && !recurrence.interval) {
      setRecurrence((prev) => ({ ...prev, interval: 1 }));
    }
  }, [recurrence.frequency]);

  useEffect(() => {
    if (recurrence.frequency === "daily") {
      switch (recurrence.dailyOption) {
        case "alldays":
          handleChange("byDay", ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]);
          break;
        case "weekdays":
          handleChange("byDay", ["MO", "TU", "WE", "TH", "FR"]);
          break;
        case "weekends":
          handleChange("byDay", ["SA", "SU"]);
          break;
        case "custom":
          handleChange("byDay", []);
          break;
        default:
          handleChange("byDay", []);
      }
    }
  }, [recurrence.dailyOption]);

  const handleChange = (field, value) => {
    setRecurrence((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (dayValue) => {
    const current = recurrence.byDay || [];
    const updated = current.includes(dayValue)
      ? current.filter((d) => d !== dayValue)
      : [...current, dayValue];
    handleChange("byDay", updated);
  };

  const getIntervalLabel = () => {
    switch (recurrence.frequency) {
      case "weekly":
        return "Every X week(s)";
      case "monthly":
        return "Every X month(s)";
      case "yearly":
        return "Every X year(s)";
      default:
        return "Interval";
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box mt={3} p={3} borderRadius={2} border="1px solid #ddd" bgcolor="#f9f9f9">
        <Typography variant="subtitle1" gutterBottom>
          Recurrence Options
        </Typography>

        <Stack spacing={2}>
          {/* Frequency */}
          <FormControl fullWidth>
            <InputLabel id="frequency-label">Frequency</InputLabel>
            <Select
              labelId="frequency-label"
              value={recurrence.frequency || ""}
              onChange={(e) => handleChange("frequency", e.target.value)}
              label="Frequency"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>

          {/* Daily sub-options */}
          {recurrence.frequency === "daily" && (
            <FormControl fullWidth>
              <InputLabel id="daily-option-label">Repeat On</InputLabel>
              <Select
                labelId="daily-option-label"
                value={recurrence.dailyOption || ""}
                onChange={(e) => handleChange("dailyOption", e.target.value)}
                label="Repeat On"
              >
                <MenuItem value="alldays">All Days (Sun–Sat)</MenuItem>
                <MenuItem value="weekdays">Weekdays (Mon–Fri)</MenuItem>
                <MenuItem value="weekends">Weekends (Sat–Sun)</MenuItem>
                <MenuItem value="custom">Custom Days</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Custom Day Selector for Daily or Weekly */}
          {(recurrence.frequency === "weekly" ||
            (recurrence.frequency === "daily" && recurrence.dailyOption === "custom")) && (
            <Box>
              <Typography variant="body2" mb={1}>
                Select Days
              </Typography>
              <Grid container spacing={1}>
                {daysOfWeek.map((day) => (
                  <Grid item xs={6} sm={4} md={3} key={day.value}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={(recurrence.byDay || []).includes(day.value)}
                          onChange={() => toggleDay(day.value)}
                        />
                      }
                      label={day.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Interval */}
          {["weekly", "monthly", "yearly"].includes(recurrence.frequency) && (
            <FormControl fullWidth>
              <InputLabel id="interval-label">{getIntervalLabel()}</InputLabel>
              <Select
                labelId="interval-label"
                value={recurrence.interval ?? 1}
                onChange={(e) => handleChange("interval", parseInt(e.target.value))}
                label={getIntervalLabel()}
              >
                {[1, 2, 3, 4, 5, 6].map((val) => (
                  <MenuItem key={val} value={val}>
                    Every {val}{" "}
                    {recurrence.frequency === "weekly"
                      ? "week(s)"
                      : recurrence.frequency === "monthly"
                      ? "month(s)"
                      : "year(s)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Monthly */}
          {recurrence.frequency === "monthly" && (
            <TextField
              label="Day of Month"
              type="number"
              value={recurrence.byMonthDay ?? ""}
              onChange={(e) => handleChange("byMonthDay", e.target.value)}
              InputProps={{ inputProps: { min: 1, max: 31 } }}
              fullWidth
            />
          )}

          {/* Yearly */}
          {recurrence.frequency === "yearly" && (
            <Stack direction="row" spacing={2}>
              <TextField
                label="Month (1–12)"
                type="number"
                value={recurrence.byMonth ?? ""}
                onChange={(e) => handleChange("byMonth", e.target.value)}
                InputProps={{ inputProps: { min: 1, max: 12 } }}
                fullWidth
              />
              <TextField
                label="Day of Month"
                type="number"
                value={recurrence.byMonthDay ?? ""}
                onChange={(e) => handleChange("byMonthDay", e.target.value)}
                InputProps={{ inputProps: { min: 1, max: 31 } }}
                fullWidth
              />
            </Stack>
          )}

          {/* Ends */}
          <FormControl fullWidth>
            <InputLabel id="ends-label">Ends</InputLabel>
            <Select
              labelId="ends-label"
              value={endCondition}
              onChange={(e) => {
                const val = e.target.value;
                setEndCondition(val);
                if (val === "never") handleChange("until", null);
              }}
              label="Ends"
            >
              <MenuItem value="never">Never</MenuItem>
              <MenuItem value="until">Until a specific date</MenuItem>
            </Select>
          </FormControl>

          {endCondition === "until" && (
            <DatePicker
              label="Until Date"
              value={recurrence.until || null}
              onChange={(date) => handleChange("until", date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          )}
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default RecurrenceForm;