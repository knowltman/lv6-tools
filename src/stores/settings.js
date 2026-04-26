import { create } from "zustand";
import axios from "axios";

const DEFAULT_GREETING =
  "Good afternoon and thank you for joining us for the [WARD_NAME] Sacrament Meeting.";

const DEFAULT_WARD_NAME = "Lakeview 6th Ward";

const DEFAULT_USHERS_TEXT =
  "We would also like to thank our Young Women ushers ____________________________________________, and our reverence examples ____________________________________________ we'll excuse them to sit with their families.";

const DEFAULT_ROOT_FONT_SIZE = "small"; // small, medium, large
const DEFAULT_CLOSING_LINE =
  "Thanks to all of our speakers... our closing hymn will be...";

export const settingsStore = create((set) => ({
  meetingTime: "9:00 AM",
  greeting: DEFAULT_GREETING,
  wardName: DEFAULT_WARD_NAME,
  ushersText: DEFAULT_USHERS_TEXT,
  rootFontSize: DEFAULT_ROOT_FONT_SIZE,
  closingLine: DEFAULT_CLOSING_LINE,
  loading: true,

  showDividers: true,
  showDividerAfterInvocation: true,
  showDividerBeforeBusiness: true,
  showDividerBeforeSacrament: true,
  showDividerBeforeProgram: true,
  showDividerBeforeClosing: true,
  showSacramentPrayers: true,

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
      const loadedShowDividers =
        response.data.showDividers !== undefined
          ? response.data.showDividers === "true" ||
            response.data.showDividers === true
          : true;
      const loadedShowDividerAfterInvocation =
        response.data.showDividerAfterInvocation !== undefined
          ? response.data.showDividerAfterInvocation === "true" ||
            response.data.showDividerAfterInvocation === true
          : true;
      const loadedShowDividerBeforeBusiness =
        response.data.showDividerBeforeBusiness !== undefined
          ? response.data.showDividerBeforeBusiness === "true" ||
            response.data.showDividerBeforeBusiness === true
          : true;
      const loadedShowDividerBeforeSacrament =
        response.data.showDividerBeforeSacrament !== undefined
          ? response.data.showDividerBeforeSacrament === "true" ||
            response.data.showDividerBeforeSacrament === true
          : true;
      const loadedShowDividerBeforeProgram =
        response.data.showDividerBeforeProgram !== undefined
          ? response.data.showDividerBeforeProgram === "true" ||
            response.data.showDividerBeforeProgram === true
          : true;
      const loadedShowDividerBeforeClosing =
        response.data.showDividerBeforeClosing !== undefined
          ? response.data.showDividerBeforeClosing === "true" ||
            response.data.showDividerBeforeClosing === true
          : true;
      const loadedShowSacramentPrayers =
        response.data.showSacramentPrayers !== undefined
          ? response.data.showSacramentPrayers === "true" ||
            response.data.showSacramentPrayers === true
          : true;
      const loadedClosingLine =
        response.data.closingLine !== undefined
          ? response.data.closingLine
          : DEFAULT_CLOSING_LINE;

      set({
        meetingTime: loadedMeetingTime,
        greeting: loadedGreeting,
        wardName: loadedWardName,
        ushersText: loadedUshersText,
        rootFontSize: loadedRootFontSize,
        closingLine: loadedClosingLine,
        showDividers: loadedShowDividers,
        showDividerAfterInvocation: loadedShowDividerAfterInvocation,
        showDividerBeforeBusiness: loadedShowDividerBeforeBusiness,
        showDividerBeforeSacrament: loadedShowDividerBeforeSacrament,
        showDividerBeforeProgram: loadedShowDividerBeforeProgram,
        showDividerBeforeClosing: loadedShowDividerBeforeClosing,
        showSacramentPrayers: loadedShowSacramentPrayers,
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

  setClosingLine: async (line) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "closingLine",
        setting_value: line,
      });
      set({ closingLine: line });
    } catch (error) {
      console.error("Error saving closingLine:", error);
      throw error;
    }
  },

  setShowDividers: async (show) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showDividers",
        setting_value: show ? "true" : "false",
      });
      set({ showDividers: !!show });
    } catch (error) {
      console.error("Error saving showDividers:", error);
      throw error;
    }
  },

  setShowDividerAfterInvocation: async (show) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showDividerAfterInvocation",
        setting_value: show ? "true" : "false",
      });
      set({ showDividerAfterInvocation: !!show });
    } catch (error) {
      console.error("Error saving showDividerAfterInvocation:", error);
      throw error;
    }
  },

  setShowDividerBeforeBusiness: async (show) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showDividerBeforeBusiness",
        setting_value: show ? "true" : "false",
      });
      set({ showDividerBeforeBusiness: !!show });
    } catch (error) {
      console.error("Error saving showDividerBeforeBusiness:", error);
      throw error;
    }
  },

  setShowDividerBeforeSacrament: async (show) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showDividerBeforeSacrament",
        setting_value: show ? "true" : "false",
      });
      set({ showDividerBeforeSacrament: !!show });
    } catch (error) {
      console.error("Error saving showDividerBeforeSacrament:", error);
      throw error;
    }
  },

  setShowDividerBeforeProgram: async (show) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showDividerBeforeProgram",
        setting_value: show ? "true" : "false",
      });
      set({ showDividerBeforeProgram: !!show });
    } catch (error) {
      console.error("Error saving showDividerBeforeProgram:", error);
      throw error;
    }
  },

  setShowDividerBeforeClosing: async (show) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showDividerBeforeClosing",
        setting_value: show ? "true" : "false",
      });
      set({ showDividerBeforeClosing: !!show });
    } catch (error) {
      console.error("Error saving showDividerBeforeClosing:", error);
      throw error;
    }
  },

  setShowSacramentPrayers: async (show) => {
    try {
      await axios.post("/api/settings", {
        setting_key: "showSacramentPrayers",
        setting_value: show ? "true" : "false",
      });
      set({ showSacramentPrayers: !!show });
    } catch (error) {
      console.error("Error saving showSacramentPrayers:", error);
      throw error;
    }
  },
}));
