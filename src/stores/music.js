import { create } from "zustand";
import axios from "axios";
import { formStore } from "./formValues";
import { getSundayAdmin, getSundayMusic } from "../pages/Dashboard.logic";
import { membersStore } from "./members";

export const musicStore = create((set) => {
  return {
    musicHistory2: [],

    musicAdmin: [],

    setMusicHistory2: (musicHistory) => set({ musicHistory2: musicHistory }),

    sundayMusic: [],

    getMusicHistory2: async (date) => {
      try {
        const response = await axios.get(`/api/music-history`);
        const musicAdminResponse = await axios.get(`/api/music-admin`);

        // const musicHistory = response.data;
        // const musicAdmin = musicAdminResponse.data;

        set({
          musicHistory2: response.data,
          musicAdmin: musicAdminResponse.data,
        });

        const hasMusicAdmin = getSundayAdmin(
          musicAdminResponse.data,
          date,
          membersStore.getState().members
        );

        //console.log("hasMusicAdmin in musicStore:", hasMusicAdmin);
        // console.log(musicAdmin.filter((p) => p.date === date));
        // const hasMusicAdmin = musicAdmin.filter(
        //   (p) => format(parseISO(p.date), "yyyy-MM-dd") === date
        // );

        // This coming sundays music
        const hasMusic = getSundayMusic(response.data, date);

        //const hasMusicAdmin = getNextSundayAdmin(musicAdminResponse.data);

        //console.log("hasMusicAdmin:", hasMusicAdmin);

        formStore.setState((state) => {
          const shouldIncludeAdmin =
            hasMusicAdmin?.chorister != null || hasMusicAdmin?.organist != null;

          return {
            formValues2: {
              ...state.formValues2,
              ...hasMusic,
              ...(shouldIncludeAdmin ? hasMusicAdmin : {}),
            },
          };
        });

        //set sunday music
        set({
          sundayMusic: {
            ...hasMusic,
          },
        });
      } catch (error) {
        //console.error("Error fetching music:", error);
        return { musicHistory: [], hymns: {} };
      }
    },
  };
});
