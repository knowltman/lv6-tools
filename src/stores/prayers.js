import { create } from "zustand";
import axios from "axios";
import { getSundayPrayers } from "../pages/Dashboard.logic";
import { formStore } from "./formValues";

const apiURL = import.meta.env.VITE_API_URL;

export const prayersStore = create((set, get) => {
  return {
    scheduledPrayer: [],
    prayerHistory2: [],
    sundayPrayers: {},

    updateSundayPrayers: (date) => {
      const { prayerHistory2 } = get();
      const hasPrayers = getSundayPrayers(prayerHistory2, date);

      if (hasPrayers?.length > 0) {
        const invocation = hasPrayers.find(
          (prayer) => prayer.type === "invocation"
        );
        const benediction = hasPrayers.find(
          (prayer) => prayer.type === "benediction"
        );

        set({
          sundayPrayers: { invocation, benediction },
        });

        formStore.setState((state) => ({
          formValues2: {
            ...state.formValues2,
            invocation,
            benediction,
          },
        }));
      }
    },

    setPrayerHistory: (history, date) => {
      set({ prayerHistory2: history });
      get().updateSundayPrayers(date); // Ensure sundayPrayers is updated
    },

    addPrayer: async (updatedState, type) => {
      try {
        const response = await axios.post(`${apiURL}/api/prayer`, {
          newDates: [updatedState.date],
          speakerId: updatedState.speaker_id,
          speakerName: updatedState.speaker_name,
          type: type,
        });

        if (response.status === 200) {
          await get().getPrayerHistory2(updatedState.date);

          // Now call setPrayerHistory with the updated prayerHistory2 and the new date
          get().setPrayerHistory(get().prayerHistory2, updatedState.date);
        }
      } catch (e) {
        console.error("Error adding prayer", e);
      }
    },

    deletePrayer: async (id, date) => {
      try {
        await axios.delete(`${apiURL}/api/delete-prayer`, { params: { id } });

        set((state) => ({
          prayerHistory2: state.prayerHistory2.filter(
            (prayer) => prayer.id !== id
          ),
        }));

        get().updateSundayPrayers(date);
      } catch (e) {
        console.error("Error deleting prayer", e);
      }
    },

    getSundayPrayers: (prayers, date) => {
      const hasPrayers = getSundayPrayers(prayers, date);

      if (hasPrayers?.length > 0) {
        const invocation = hasPrayers.find(
          (prayer) => prayer.type === "invocation"
        );
        const benediction = hasPrayers.find(
          (prayer) => prayer.type === "benediction"
        );
        set({
          sundayPrayers: {
            invocation,
            benediction,
          },
        });
      }
    },

    getPrayerHistory2: async (date) => {
      try {
        const response = await axios.get(`${apiURL}/api/prayer-history`);
        const prayerHistory = response.data;

        //console.log("Fetched prayer history:", prayerHistory);

        set({ prayerHistory2: prayerHistory });
        get().updateSundayPrayers(date);
      } catch (error) {
        console.error("Error fetching prayers:", error);
      }
    },
  };
});
// import { create } from "zustand";
// import axios from "axios";
// import { getSundayPrayers } from "../pages/Dashboard.logic";
// import { formStore } from "./formValues";
// const apiURL = import.meta.env.VITE_API_URL;

// export const prayersStore = create((set) => {
//   return {
//     scheduledPrayer: [],

//     prayerHistory2: [],

//     sundayPrayers: [],

//     getSundayPrayers: (prayers, date) => {
//       const hasPrayers = getSundayPrayers(prayers, date);

//       if (hasPrayers?.length > 0) {
//         const invocation = hasPrayers.find(
//           (prayer) => prayer.type === "invocation"
//         );
//         const benediction = hasPrayers.find(
//           (prayer) => prayer.type === "benediction"
//         );
//         set({
//           sundayPrayers: {
//             invocation,
//             benediction,
//           },
//         });
//       }
//     },

//     setPrayerHistory: (history) => set({ prayerHistory2: history }),

//     deletePrayer: async (id) => {
//       try {
//         await axios.delete(`${apiURL}/api/delete-prayer`, {
//           params: { id },
//         });

//         set((state) => ({
//           prayerHistory2: state.prayerHistory2.filter(
//             (prayer) => prayer.id !== id
//           ),
//         }));
//       } catch (e) {
//         console.error("Error deleting prayer", e);
//       }
//     },

//     getPrayerHistory2: async (date) => {
//       try {
//         const response = await axios.get(`${apiURL}/api/prayer-history`);
//         const prayerHistory = response.data;

//         set({ prayerHistory2: response.data });

//         const hasPrayers = getSundayPrayers(prayerHistory, date);

//         if (hasPrayers?.length > 0) {
//           const invocation = hasPrayers.find(
//             (prayer) => prayer.type === "invocation"
//           );
//           const benediction = hasPrayers.find(
//             (prayer) => prayer.type === "benediction"
//           );

//           formStore.setState((state) => ({
//             formValues2: {
//               ...state.formValues2,
//               invocation,
//               benediction,
//             },
//           }));
//           //set sunday prayers
//           set({
//             sundayPrayers: {
//               invocation,
//               benediction,
//             },
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching prayers:", error);
//         return null;
//       }
//     },
//   };
// });
