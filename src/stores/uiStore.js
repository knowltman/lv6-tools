import { create } from "zustand";

export const uiStore = create((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (newSidebarOpen) => set({ sidebarOpen: newSidebarOpen }),
}));
