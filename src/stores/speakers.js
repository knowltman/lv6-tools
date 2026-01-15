import { create } from "zustand";
import axios from "axios";
import { formStore } from "./formValues";
import { getNextSundaySpeakers } from "../pages/Dashboard.logic";
import { programStore } from "./program";

export const speakersStore = create((set) => {
  return {
    speakerHistory2: [],

    setSpeakerHistory2: (musicHistory) => set({ musicHistory2: musicHistory }),

    sundaySpeakers: [],

    getSpeakerHistory2: async () => {
      try {
        const response = await axios.get(`/api/speaker-history`);
        set(() => ({
          speakerHistory2: response.data,
        }));
        const hasSpeakers = getNextSundaySpeakers(response.data);

        // if (hasSpeakers && hasSpeakers.length > 0) {
        //   programStore.setState({ haveSpeakers: true });
        //   const speaker1 = hasSpeakers.find((speaker) => speaker.order === 1) ??
        //     hasSpeakers[0] ?? { first_name: "", last_name: "" };
        //   const speaker2 = hasSpeakers.find((speaker) => speaker.order === 2) ??
        //     hasSpeakers[1] ?? { first_name: "", last_name: "" };
        //   const speaker3 = hasSpeakers.find((speaker) => speaker.order === 3) ??
        //     hasSpeakers[2] ?? { first_name: "", last_name: "" };
        //   const speaker4 = hasSpeakers.find((speaker) => speaker.order === 4) ??
        //     hasSpeakers[3] ?? { first_name: "", last_name: "" };
        //   const speaker5 = hasSpeakers.find((speaker) => speaker.order === 5) ??
        //     hasSpeakers[4] ?? { first_name: "", last_name: "" };
        //   const speaker6 = hasSpeakers.find((speaker) => speaker.order === 6) ??
        //     hasSpeakers[5] ?? { first_name: "", last_name: "" };

        //   formStore.setState((state) => ({
        //     formValues2: {
        //       ...state.formValues2,
        //       speaker_1: speaker1,
        //       speaker_2: speaker2,
        //       speaker_3: speaker3,
        //       speaker_4: speaker4,
        //       speaker_5: speaker5,
        //       speaker_6: speaker6,
        //     },
        //   }));
        if (hasSpeakers && hasSpeakers.length > 0) {
          programStore.setState({ haveSpeakers: true });

          // Sort speakers by order if available, or just use the array order
          const sortedSpeakers = hasSpeakers.sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );

          const speakersToSet = {};
          // Only add speaker_1 if valid
          if (sortedSpeakers[0]?.first_name && sortedSpeakers[0]?.last_name) {
            speakersToSet.speaker_1 = sortedSpeakers[0];
            // For subsequent speakers, only add if the previous one is valid
            for (let i = 1; i < sortedSpeakers.length && i < 6; i++) {
              if (
                sortedSpeakers[i]?.first_name?.length > 1 &&
                sortedSpeakers[i]?.last_name?.length > 1
              ) {
                speakersToSet[`speaker_${i + 1}`] = sortedSpeakers[i];
              } else {
                break; // stop if a speaker is missing either first_name or last_name
              }
            }
          }

          let sundaySpeakers = {
            speaker_1: { first_name: "", last_name: "" },
            speaker_2: { first_name: "", last_name: "" },
            speaker_3: { first_name: "", last_name: "" },
            speaker_4: { first_name: "", last_name: "" },
            speaker_5: { first_name: "", last_name: "" },
            speaker_6: { first_name: "", last_name: "" },
          };

          //console.log(speakersToSet);
          formStore.setState((state) => ({
            formValues2: {
              ...state.formValues2,
              ...speakersToSet,
            },
          }));

          // // Fill in speakers sequentially; if any speaker is invalid, stop adding further speakers
          // for (let i = 0; i < Math.min(sortedSpeakers.length, 6); i++) {
          //   const candidate = sortedSpeakers[i];
          //   if (candidate.first_name && candidate.last_name) {
          //     // For the first speaker, always assign if valid
          //     if (i === 0) {
          //       sundaySpeakers.speaker_1 = candidate;
          //     } else {
          //       // Only assign subsequent speakers if the previous speaker is valid
          //       const prevSpeaker = sundaySpeakers[`speaker_${i}`];
          //       if (prevSpeaker.first_name && prevSpeaker.last_name) {
          //         sundaySpeakers[`speaker_${i + 1}`] = candidate;
          //       } else {
          //         break;
          //       }
          //     }
          //   } else {
          //     break;
          //   }
          //}
          set({
            sundaySpeakers,
          });
        }
      } catch (error) {
        console.error("Error fetching speakers:", error);
      }
    },
  };
});
