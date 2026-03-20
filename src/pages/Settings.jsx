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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { settingsStore } from "../stores/settings";
import SnackBar from "../components/SnackBar";

const Settings = () => {
  const {
    meetingTime,
    greeting,
    wardName,
    ushersText,
    rootFontSize,
    closingLine,
    showDividerAfterInvocation,
    showDividerBeforeBusiness,
    showDividerBeforeSacrament,
    showDividerBeforeProgram,
    showDividerBeforeClosing,
    loading,
    fetchSettings,
    setMeetingTime,
    saveGreeting,
    setWardName,
    setClosingLine,
    setUshersText,
    setRootFontSize,
    setShowDividerAfterInvocation,
    setShowDividerBeforeBusiness,
    setShowDividerBeforeSacrament,
    setShowDividerBeforeProgram,
    setShowDividerBeforeClosing,
  } = settingsStore();

  // Local state for editing greeting
  const [localGreeting, setLocalGreeting] = useState("");
  const [localWardName, setLocalWardName] = useState("");
  const [localUshersText, setLocalUshersText] = useState("");
  const [saving, setSaving] = useState(false);
  const [localRootFontSize, setLocalRootFontSize] = useState("small");
  const [localShowDividerAfterInvocation, setLocalShowDividerAfterInvocation] =
    useState(true);
  const [localShowDividerBeforeBusiness, setLocalShowDividerBeforeBusiness] =
    useState(true);
  const [localShowDividerBeforeSacrament, setLocalShowDividerBeforeSacrament] =
    useState(true);
  const [localShowDividerBeforeProgram, setLocalShowDividerBeforeProgram] =
    useState(true);
  const [localShowDividerBeforeClosing, setLocalShowDividerBeforeClosing] =
    useState(true);
  const [localClosingLine, setLocalClosingLine] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load settings from database on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update local state when store value changes
  useEffect(() => {
    setLocalGreeting(greeting);
    setLocalWardName(wardName);
    setLocalUshersText(ushersText);
    setLocalRootFontSize(rootFontSize || "small");
    setLocalClosingLine(closingLine || "");
    setLocalShowDividerAfterInvocation(
      showDividerAfterInvocation !== undefined
        ? showDividerAfterInvocation
        : true,
    );
    setLocalShowDividerBeforeBusiness(
      showDividerBeforeBusiness !== undefined
        ? showDividerBeforeBusiness
        : true,
    );
    setLocalShowDividerBeforeSacrament(
      showDividerBeforeSacrament !== undefined
        ? showDividerBeforeSacrament
        : true,
    );
    setLocalShowDividerBeforeProgram(
      showDividerBeforeProgram !== undefined ? showDividerBeforeProgram : true,
    );
    setLocalShowDividerBeforeClosing(
      showDividerBeforeClosing !== undefined ? showDividerBeforeClosing : true,
    );
  }, [
    greeting,
    wardName,
    ushersText,
    rootFontSize,
    closingLine,
    showDividerAfterInvocation,
    showDividerBeforeBusiness,
    showDividerBeforeSacrament,
    showDividerBeforeProgram,
    showDividerBeforeClosing,
  ]);

  // Save meeting time to database when it changes
  const handleMeetingTimeChange = (event) => {
    const newTime = event.target.value;
    setMeetingTime(newTime);
  };

  // Handle greeting text changes
  const handleGreetingChange = (value) => {
    setLocalGreeting(value);
  };

  // Handle ward name changes
  const handleWardNameChange = (value) => {
    setLocalWardName(value);
    settingsStore.setState({ wardName: value }); // Instantly update UI
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

  // Save ward name to database
  const handleSaveWardName = async () => {
    setSaving(true);
    try {
      await setWardName(localWardName);
      setShowSuccessToast(true);
    } catch (error) {
      console.error("Failed to save ward name:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save all settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveGreeting(localGreeting),
        setWardName(localWardName),
        setUshersText(localUshersText),
        setRootFontSize(localRootFontSize),
        setClosingLine(localClosingLine),
        setShowDividerAfterInvocation(localShowDividerAfterInvocation),
        setShowDividerBeforeBusiness(localShowDividerBeforeBusiness),
        setShowDividerBeforeSacrament(localShowDividerBeforeSacrament),
        setShowDividerBeforeProgram(localShowDividerBeforeProgram),
        setShowDividerBeforeClosing(localShowDividerBeforeClosing),
      ]);
      setShowSuccessToast(true);
    } catch (error) {
      console.error("Failed to save settings:", error);
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
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 100 }}>
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
          <InputLabel id="root-font-size-label">Font Size</InputLabel>
          <Select
            labelId="root-font-size-label"
            id="root-font-size-select"
            value={localRootFontSize}
            label="Font Size"
            onChange={(e) => setLocalRootFontSize(e.target.value)}
          >
            <MenuItem value="small">Small</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="large">Large</MenuItem>
          </Select>
        </FormControl>
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
          Ward Name
        </Typography>
        <TextField
          fullWidth
          label="Ward Name"
          value={localWardName}
          onChange={(e) => handleWardNameChange(e.target.value)}
          sx={{ mb: 4 }}
        />

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, textTransform: "uppercase", fontWeight: 600 }}
        >
          Program Dividers
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={localShowDividerAfterInvocation}
              onChange={(e) =>
                setLocalShowDividerAfterInvocation(e.target.checked)
              }
            />
          }
          label="After invocation"
        />

        <FormControlLabel
          control={
            <Switch
              checked={localShowDividerBeforeSacrament}
              onChange={(e) =>
                setLocalShowDividerBeforeSacrament(e.target.checked)
              }
            />
          }
          label="Before sacrament"
        />

        <FormControlLabel
          control={
            <Switch
              checked={localShowDividerBeforeProgram}
              onChange={(e) =>
                setLocalShowDividerBeforeProgram(e.target.checked)
              }
            />
          }
          label="Before program"
        />

        <FormControlLabel
          control={
            <Switch
              checked={localShowDividerBeforeClosing}
              onChange={(e) =>
                setLocalShowDividerBeforeClosing(e.target.checked)
              }
            />
          }
          label="Before closing"
        />

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, mt: 4, textTransform: "uppercase", fontWeight: 600 }}
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
          sx={{ mb: 4 }}
        />

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, textTransform: "uppercase", fontWeight: 600 }}
        >
          Ushers & Reverence Text
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          label="Ushers & Reverence Text"
          value={localUshersText}
          onChange={(e) => setLocalUshersText(e.target.value)}
          sx={{ mb: 4 }}
        />
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ textTransform: "uppercase", fontWeight: 600 }}
        >
          Closing Line
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Closing line"
          value={localClosingLine}
          onChange={(e) => setLocalClosingLine(e.target.value)}
          sx={{ mt: 2 }}
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
          onClick={handleSaveSettings}
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
