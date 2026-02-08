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

      const loadedMeetingTime = response.data.meetingTime || "9:00 AM";
      const loadedGreeting = response.data.greeting || DEFAULT_GREETING;

      // Ensure greeting matches meeting time
      const timeOfDay = loadedMeetingTime.includes("AM")
        ? "morning"
        : "afternoon";
      const correctedGreeting = loadedGreeting.replace(
        /Good (morning|afternoon)/i,
        `Good ${timeOfDay}`,
      );

      set({
        meetingTime: loadedMeetingTime,
        greeting: correctedGreeting,
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

      // Update greeting based on meeting time
      const timeOfDay = newTime.includes("AM") ? "morning" : "afternoon";
      const currentGreeting = settingsStore.getState().greeting;
      const updatedGreeting = currentGreeting.replace(
        /Good (morning|afternoon)/i,
        `Good ${timeOfDay}`,
      );

      set({ meetingTime: newTime, greeting: updatedGreeting });
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
