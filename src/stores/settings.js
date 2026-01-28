import { create } from "zustand";
import axios from "axios";

const DEFAULT_GREETING =
  "Good afternoon and thank you for joining us for the Lakeview 6th Ward Sacrament Meeting.";

export const settingsStore = create((set) => ({
  meetingTime: "9:00 AM",
  greeting: DEFAULT_GREETING,
  loading: true,

  fetchSettings: async () => {
    try {
      const response = await axios.get("/api/settings");

      set({
        meetingTime: response.data.meetingTime || "9:00 AM",
        greeting: response.data.greeting || DEFAULT_GREETING,
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

  saveGreeting: async (greeting) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "greeting",
        setting_value: greeting,
      });

      set({ greeting });
    } catch (error) {
      console.error("Error saving greeting:", error);
      throw error;
    }
  },
}));
