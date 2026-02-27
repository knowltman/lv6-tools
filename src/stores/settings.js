import { create } from "zustand";
import axios from "axios";

const DEFAULT_GREETING =
  "Good afternoon and thank you for joining us for the [WARD_NAME] Sacrament Meeting.";

const DEFAULT_WARD_NAME = "Lakeview 6th Ward";
const DEFAULT_USHERS_TEXT =
  "We would also like to thank our Young Women ushers ____________________________________________, and our reverence examples ____________________________________________ we'll excuse them to sit with their families.";

export const settingsStore = create((set) => ({
  meetingTime: "9:00 AM",
  greeting: DEFAULT_GREETING,
  wardName: DEFAULT_WARD_NAME,
  ushersText: DEFAULT_USHERS_TEXT,
  loading: true,

  fetchSettings: async () => {
    try {
      const response = await axios.get("/api/settings");

      const loadedMeetingTime = response.data.meetingTime ?? "9:00 AM";
      const loadedGreeting = response.data.greeting ?? DEFAULT_GREETING;
      const loadedWardName = response.data.wardName ?? DEFAULT_WARD_NAME;
      const loadedUshersText =
        response.data.ushersText !== undefined
          ? response.data.ushersText
          : DEFAULT_USHERS_TEXT;

      set({
        meetingTime: loadedMeetingTime,
        greeting: loadedGreeting,
        wardName: loadedWardName,
        ushersText: loadedUshersText,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      set({ loading: false });
    }
  },
  setUshersText: async (newText) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "ushersText",
        setting_value: newText,
      });
      set({ ushersText: newText });
    } catch (error) {
      console.error("Error saving ushers text:", error);
      throw error;
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

  setWardName: async (newWardName) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "wardName",
        setting_value: newWardName,
      });

      set({ wardName: newWardName });
    } catch (error) {
      console.error("Error saving ward name:", error);
      throw error;
    }
  },
}));
