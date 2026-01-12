import { create } from "zustand";
import { defaultFormValues } from "../app.logic";
import axios from "axios";
const apiURL = import.meta.env.VITE_API_URL;

const currentUser = localStorage.getItem("user");

export const useStore = create((set) => ({
  apiURL: import.meta.env.VITE_API_URL,
  user: null,
  members: [],
  fetchAllMembers: async () => {
    try {
      const response = await axios.get(`${apiURL}/api/members`);
      const sortedData = response.data.sort((a, b) =>
        a.last_name.localeCompare(b.last_name)
      );

      set({ members: sortedData });
      const filteredUser =
        sortedData.find((user) => user.id === Number(currentUser)) || null;
      set({ user: filteredUser });
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  },
  setMembers: (newMembers) => set({ members: newMembers }),
  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),
  removeMember: (id) =>
    set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
  updateMember: (id, updatedData) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, ...updatedData } : m
      ),
    })),
  hymns: [],
  setHymns: (newHymns) => set({ hymns: newHymns }),
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
  memberData: {},
  setMemberData: (newMemberData) => set({ memberData: newMemberData }),
  fetchMemberData: async (id) => {
    try {
      const response = await axios.get(`${apiURL}/api/members/${id}`);
      set({ memberData: response.data[0] });
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  },
}));
