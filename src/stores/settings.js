import { create } from "zustand";
import axios from "axios";

const DEFAULT_GREETING =
  "Good afternoon and thank you for joining us for the [WARD_NAME] Sacrament Meeting.";

const DEFAULT_WARD_NAME = "Lakeview 6th Ward";

const DEFAULT_USHERS_TEXT =
  "We would also like to thank our Young Women ushers ____________________________________________, and our reverence examples ____________________________________________ we'll excuse them to sit with their families.";

const DEFAULT_ROOT_FONT_SIZE = "small"; // small, medium, large

export const settingsStore = create((set) => ({
  meetingTime: "9:00 AM",
  greeting: DEFAULT_GREETING,
  wardName: DEFAULT_WARD_NAME,
  ushersText: DEFAULT_USHERS_TEXT,
  // Print/layout settings
  showSectionBeforeSacrament: true,
  showSectionBeforeClosingAnnouncements: true,
  rootFontSize: DEFAULT_ROOT_FONT_SIZE,
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
      const loadedRootFontSize =
        response.data.rootFontSize ?? DEFAULT_ROOT_FONT_SIZE;
      const loadedShowSectionBeforeSacrament =
        response.data.showSectionBeforeSacrament ?? true;
      const loadedShowSectionBeforeClosingAnnouncements =
        response.data.showSectionBeforeClosingAnnouncements ?? true;

      set({
        meetingTime: loadedMeetingTime,
        greeting: loadedGreeting,
        wardName: loadedWardName,
        ushersText: loadedUshersText,
        rootFontSize: loadedRootFontSize,
        showSectionBeforeSacrament: loadedShowSectionBeforeSacrament,
        showSectionBeforeClosingAnnouncements:
          loadedShowSectionBeforeClosingAnnouncements,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      set({ loading: false });
    }
  },
  setRootFontSize: async (size) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "rootFontSize",
        setting_value: size,
      });
      set({ rootFontSize: size });
    } catch (error) {
      console.error("Error saving root font size:", error);
      throw error;
    }
  },
  setShowSectionBeforeSacrament: async (value) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showSectionBeforeSacrament",
        setting_value: value,
      });
      set({ showSectionBeforeSacrament: value });
    } catch (error) {
      console.error("Error saving showSectionBeforeSacrament:", error);
      throw error;
    }
  },
  setShowSectionBeforeClosingAnnouncements: async (value) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showSectionBeforeClosingAnnouncements",
        setting_value: value,
      });
      set({ showSectionBeforeClosingAnnouncements: value });
    } catch (error) {
      console.error(
        "Error saving showSectionBeforeClosingAnnouncements:",
        error,
      );
      throw error;
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
