import { create } from "zustand";
import { dataStore } from "./data";
import axios from "axios";
import { formStore } from "./formValues";
const apiURL = import.meta.env.VITE_API_URL;

export const programStore = create((set) => ({
  programData: [],
  programsList: [],
  selectedProgramDate: "",
  getProgramsList: async () => {
    const response = await axios.get(`${apiURL}/api/all-programs`);
    set({ programsList: response.data.reverse() });
  },
  getProgramData: async (date) => {
    //const date = dataStore.getState().date;
    set({ selectedProgramDate: date });
    let finalData = {};
    try {
      const response = await axios.get(`${apiURL}/api/programs/${date}`);
      const programDataString = response.data?.[0]?.program_data;

      if (programDataString) {
        try {
          finalData = JSON.parse(programDataString);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
        }
      }
      set({ programData: finalData });

      formStore.setState((state) => ({
        formValues2: {
          ...state.formValues2,
          ...finalData,
        },
      }));
      //set the checkboxes for the program
      set(() => ({
        haveNewMembers: Array.isArray(finalData.new_members)
          ? finalData.new_members.length > 0
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
        haveStakeBusiness: !(
          finalData.stakeBusiness?.length === 0 ||
          (finalData.stakeBusiness?.length === 1 &&
            finalData.stakeBusiness[0] === "") ||
          finalData.stakeBusiness === undefined
        ),
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
