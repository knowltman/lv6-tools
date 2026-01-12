import { create } from "zustand";
import axios from "axios";
import { getNextSunday } from "../pages/Dashboard.logic";
import { format } from "date-fns";
const apiURL = import.meta.env.VITE_API_URL;

export const dataStore = create((set) => {
  const nextSunday = getNextSunday(); // Store it in a variable first

  return {
    hymns: [],
    getAllHymns: async () => {
      try {
        const response = await axios.get(`${apiURL}/api/hymns`);
        set({ hymns: response.data });
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    },
    setHymns: (newHymns) => set({ hymns: newHymns }),
    nextSunday,
    date: format(nextSunday, "yyyy-MM-dd"), // Use the correct variable
  };
});
