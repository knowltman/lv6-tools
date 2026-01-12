import { create } from "zustand";
import axios from "axios";
const apiURL = import.meta.env.VITE_API_URL;

const currentUser = localStorage.getItem("user");

export const membersStore = create((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
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
  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),
  removeMember: async (id) => {
    try {
      await axios.delete(`${apiURL}/api/delete-member/${id}`);
      set((state) => ({
        members: state.members.filter((member) => member.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  },
  updateMemberField: async (memberId, field, value) => {
    // Optimistically update state for members
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, [field]: value } : m
      ),
      // Set a flag to indicate that an update is in progress
      isUpdating: true,
    }));

    try {
      // Send PATCH request to update the server
      await axios.patch(`${apiURL}/api/update-member/${memberId}`, {
        [field]: value,
      });

      // Update memberData only after the API call succeeds
      set((state) => ({
        memberData:
          state.memberData.id === memberId
            ? { ...state.memberData, [field]: value }
            : state.memberData,
        isUpdating: false, // Reset the loading flag
      }));
    } catch (error) {
      console.error("Error updating member:", error);
      // Revert to previous value if the API request fails
      set((state) => ({
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, [field]: value ? 0 : 1 } : m
        ),
        memberData:
          state.memberData.id === memberId
            ? { ...state.memberData, [field]: value ? 0 : 1 }
            : state.memberData,
        isUpdating: false, // Reset the loading flag
      }));
    }
  },
}));
