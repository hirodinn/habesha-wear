import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  show: false,
  message: "",
  type: "info",
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.show = true;
      state.message = action.payload?.message ?? "";
      state.type = action.payload?.type ?? "info";
    },
    hideToast: (state) => {
      state.show = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
