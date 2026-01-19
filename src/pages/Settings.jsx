import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { settingsStore } from "../stores/settings";
import SnackBar from "../components/SnackBar";

const Settings = () => {
  const {
    meetingTime,
    morningGreetings,
    afternoonGreetings,
    loading,
    fetchSettings,
    setMeetingTime,
    saveGreetings,
  } = settingsStore();

  // Local state for editing greetings
  const [localMorningGreetings, setLocalMorningGreetings] = useState([]);
  const [localAfternoonGreetings, setLocalAfternoonGreetings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load settings from database on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update local state when store values change
  useEffect(() => {
    setLocalMorningGreetings(morningGreetings);
    setLocalAfternoonGreetings(afternoonGreetings);
  }, [morningGreetings, afternoonGreetings]);

  // Save meeting time to database when it changes
  const handleMeetingTimeChange = (event) => {
    const newTime = event.target.value;
    setMeetingTime(newTime);
  };

  // Handle greeting text changes
  const handleMorningGreetingChange = (index, value) => {
    const updated = [...localMorningGreetings];
    updated[index] = value;
    setLocalMorningGreetings(updated);
  };

  const handleAfternoonGreetingChange = (index, value) => {
    const updated = [...localAfternoonGreetings];
    updated[index] = value;
    setLocalAfternoonGreetings(updated);
  };

  // Save greetings to database
  const handleSaveGreetings = async () => {
    setSaving(true);
    try {
      await saveGreetings(localMorningGreetings, localAfternoonGreetings);
      setShowSuccessToast(true);
    } catch (error) {
      console.error("Failed to save greetings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ pt: "5rem", px: "2rem", pb: "6rem", flex: 1 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 500 }}>
          Settings
        </Typography>

        <Card elevation={0} sx={{ mb: 4 }}>
          <CardContent sx={{ p: 0 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2, textTransform: "uppercase", fontWeight: 600 }}
            >
              General
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="meeting-time-label">Meeting Time</InputLabel>
              <Select
                labelId="meeting-time-label"
                id="meeting-time-select"
                value={meetingTime}
                label="Meeting Time"
                onChange={handleMeetingTimeChange}
              >
                <MenuItem value="9:00 AM">9:00 AM</MenuItem>
                <MenuItem value="10:30 AM">10:30 AM</MenuItem>
                <MenuItem value="12:00 PM">12:00 PM</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Card elevation={0}>
          <CardContent sx={{ p: 0 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2, textTransform: "uppercase", fontWeight: 600 }}
            >
              Program Greetings
            </Typography>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Morning Greetings
            </Typography>
            {localMorningGreetings.map((greeting, index) => (
              <TextField
                key={`morning-${index}`}
                fullWidth
                multiline
                rows={2}
                label={`Morning Greeting ${index + 1}`}
                value={greeting}
                onChange={(e) =>
                  handleMorningGreetingChange(index, e.target.value)
                }
                sx={{ mb: 2 }}
              />
            ))}

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Afternoon Greetings
            </Typography>
            {localAfternoonGreetings.map((greeting, index) => (
              <TextField
                key={`afternoon-${index}`}
                fullWidth
                multiline
                rows={2}
                label={`Afternoon Greeting ${index + 1}`}
                value={greeting}
                onChange={(e) =>
                  handleAfternoonGreetingChange(index, e.target.value)
                }
                sx={{ mb: 2 }}
              />
            ))}
          </CardContent>
        </Card>
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: "1px solid",
          borderColor: "divider",
          p: 2,
          px: "2rem",
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          onClick={handleSaveGreetings}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </Box>
      <SnackBar
        open={showSuccessToast}
        setOpen={setShowSuccessToast}
        severity="success"
        message="Greetings saved successfully"
      />
    </Box>
  );
};

export default Settings;
