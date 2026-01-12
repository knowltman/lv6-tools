import { create } from "zustand";
import { defaultFormValues } from "../app.logic";

export const formStore = create((set) => {
  return {
    formValues2: defaultFormValues,
    setFormValues2: (newValues) =>
      set(() => ({
        formValues2: newValues,
      })),
    updateFormValue: (key, value) =>
      set((state) => ({
        formValues2: {
          ...state.formValues2,
          [key]: value,
        },
      })),
    resetForm: () => set({ formValues2: defaultFormValues }),
  };
});
