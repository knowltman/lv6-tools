import { create } from "zustand";
import axios from "axios";

export const usersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/users`);
      set({ users: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ error: error.message, loading: false });
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post(`/api/users`, userData);
      const newUser = response.data;
      set((state) => ({
        users: [...state.users, newUser],
      }));
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      // Only include password if it's provided
      const updateData = { ...userData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await axios.put(`/api/users/${userId}`, updateData);
      const updatedUser = response.data;
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? updatedUser : user,
        ),
      }));
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      }));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
}));
