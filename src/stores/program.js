import { create } from "zustand";
import { dataStore } from "./data";
import axios from "axios";
import { formStore } from "./formValues";

export const programStore = create((set) => ({
  programData: [],
  programsList: [],
  selectedProgramDate: "",
  getProgramsList: async () => {
    const response = await axios.get(`/api/all-programs`);
    set({ programsList: response.data.reverse() });
  },
  getProgramData: async (date) => {
    //const date = dataStore.getState().date;
    set({ selectedProgramDate: date });
    let finalData = {};
    try {
      const response = await axios.get(`/api/programs/${date}`);
      const programDataString = response.data?.[0]?.program_data;

      if (programDataString) {
        try {
          finalData = JSON.parse(programDataString);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
        }
      }
      set({ programData: finalData });

      // Clear old speaker fields from formValues2 before updating
      const clearedState = { ...formStore.getState().formValues2 };
      for (let i = 1; i <= 20; i++) {
        delete clearedState[`speaker_${i}`];
      }

      formStore.setState(() => ({
        formValues2: {
          ...clearedState,
          ...finalData,
        },
      }));
      //set the checkboxes for the program
      set(() => ({
        haveNewMembers: Array.isArray(finalData.new_members)
          ? finalData.new_members.some((item) => item && item.trim() !== "")
          : false,
      }));

      const content = finalData?.releases?.[0] || "";
      const contentLength = content.trim().length;

      set(() => ({
        haveReleases: contentLength === 0 ? false : true,
      }));

      set(() => ({
        haveCallings: Array.isArray(finalData.callings)
          ? !(
              finalData.callings.length === 0 ||
              (finalData.callings.length === 1 && finalData.callings[0] === "")
            )
          : false,
      }));

      set(() => ({
        haveOtherWardBusiness: Array.isArray(finalData.other_ward_business)
          ? finalData.other_ward_business.some((item) => item.trim() !== "")
          : false,
      }));

      set(() => ({
        haveStakeBusiness: Array.isArray(finalData.stake_business)
          ? finalData.stake_business.some((item) => item.trim() !== "")
          : false,
      }));

      set(() => ({
        haveAnnouncements: Array.isArray(finalData.announcements)
          ? !(
              finalData.announcements.length === 0 ||
              (finalData.announcements.length === 1 &&
                finalData.announcements[0] === "")
            )
          : false,
      }));
    } catch (error) {
      console.error("Error fetching program data:", error);
    }
  },
  setProgramData: (newProgramData) => set({ programData: newProgramData }),
  isSimple: true,
  specialSundays: [],
  setSpecialSundays: (newSpecialSundays) =>
    set({ specialSundays: newSpecialSundays }),
  haveNewMembers: false,
  setHaveNewMembers: (newHasNewMembers) =>
    set({ haveNewMembers: newHasNewMembers }),
  haveCallings: false,
  setHaveCallings: (newHasCallings) => set({ haveCallings: newHasCallings }),
  haveReleases: false,
  setHaveReleases: (newHasReleases) => set({ haveReleases: newHasReleases }),
  haveSpeakers: false,
  setHaveSpeakers: (newHasSpeakers) => set({ haveSpeakers: newHasSpeakers }),
  haveOtherWardBusiness: false,
  setHaveOtherWardBusiness: (newHasOtherWardBusiness) =>
    set({ haveOtherWardBusiness: newHasOtherWardBusiness }),
  haveStakeBusiness: false,
  setHaveStakeBusiness: (newHasStakeBusiness) =>
    set({ haveStakeBusiness: newHasStakeBusiness }),
  haveAnnouncements: false,
  setHaveAnnouncements: (newHasAnnouncements) =>
    set({ haveAnnouncements: newHasAnnouncements }),
}));
