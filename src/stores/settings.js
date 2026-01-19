import { create } from "zustand";
import axios from "axios";

const DEFAULT_MORNING_GREETINGS = [
  "Good morning, brothers and sisters. Welcome to our sacrament meeting.",
  "Good morning. We're grateful to have you join us for sacrament meeting today.",
  "Welcome to sacrament meeting. We're happy to have you with us this morning.",
];

const DEFAULT_AFTERNOON_GREETINGS = [
  "Good afternoon, brothers and sisters. Welcome to our sacrament meeting.",
  "Good afternoon. We're grateful to have you join us for sacrament meeting today.",
  "Welcome to sacrament meeting. We're happy to have you with us this afternoon.",
];

export const settingsStore = create((set) => ({
  meetingTime: "9:00 AM",
  morningGreetings: DEFAULT_MORNING_GREETINGS,
  afternoonGreetings: DEFAULT_AFTERNOON_GREETINGS,
  loading: true,

  fetchSettings: async () => {
    try {
      const response = await axios.get("/api/settings");

      // Parse JSON strings for greeting arrays
      let morningGreetings = DEFAULT_MORNING_GREETINGS;
      let afternoonGreetings = DEFAULT_AFTERNOON_GREETINGS;

      if (response.data.morningGreetings) {
        try {
          morningGreetings = JSON.parse(response.data.morningGreetings);
        } catch (e) {
          console.error("Failed to parse morning greetings:", e);
        }
      }

      if (response.data.afternoonGreetings) {
        try {
          afternoonGreetings = JSON.parse(response.data.afternoonGreetings);
        } catch (e) {
          console.error("Failed to parse afternoon greetings:", e);
        }
      }

      set({
        meetingTime: response.data.meetingTime || "9:00 AM",
        morningGreetings,
        afternoonGreetings,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      set({ loading: false });
    }
  },

  setMeetingTime: async (newTime) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "meetingTime",
        setting_value: newTime,
      });
      set({ meetingTime: newTime });
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  },

  saveGreetings: async (morningGreetings, afternoonGreetings) => {
    try {
      // Save morning greetings
      await axios.post("/api/settings", {
        setting_key: "morningGreetings",
        setting_value: JSON.stringify(morningGreetings),
      });

      // Save afternoon greetings
      await axios.post("/api/settings", {
        setting_key: "afternoonGreetings",
        setting_value: JSON.stringify(afternoonGreetings),
      });

      set({ morningGreetings, afternoonGreetings });
    } catch (error) {
      console.error("Error saving greetings:", error);
      throw error;
    }
  },
}));
