import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
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
    greeting,
    loading,
    fetchSettings,
    setMeetingTime,
    saveGreeting,
  } = settingsStore();

  // Local state for editing greeting
  const [localGreeting, setLocalGreeting] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load settings from database on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update local state when store value changes
  useEffect(() => {
    setLocalGreeting(greeting);
  }, [greeting]);

  // Save meeting time to database when it changes
  const handleMeetingTimeChange = (event) => {
    const newTime = event.target.value;
    setMeetingTime(newTime);
  };

  // Handle greeting text changes
  const handleGreetingChange = (value) => {
    setLocalGreeting(value);
  };

  // Save greeting to database
  const handleSaveGreeting = async () => {
    setSaving(true);
    try {
      await saveGreeting(localGreeting);
      setShowSuccessToast(true);
    } catch (error) {
      console.error("Failed to save greeting:", error);
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
        width: "50vw",
      }}
    >
      <Box sx={{ pt: "5rem", px: "2rem", pb: "6rem", flex: 1 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 500 }}>
          Settings
        </Typography>

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, textTransform: "uppercase", fontWeight: 600 }}
        >
          General
        </Typography>
        <FormControl fullWidth sx={{ mb: 4 }}>
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

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, textTransform: "uppercase", fontWeight: 600 }}
        >
          Program Greeting
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Greeting"
          value={localGreeting}
          onChange={(e) => handleGreetingChange(e.target.value)}
        />
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
          onClick={handleSaveGreeting}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </Box>
      <SnackBar
        open={showSuccessToast}
        setOpen={setShowSuccessToast}
        severity="success"
        message="Greeting saved successfully"
      />
    </Box>
  );
};

export default Settings;
