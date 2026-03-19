import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./userReducer";
import cartReducer from "./cartSlice";
import toastReducer from "./toastSlice";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
    toast: toastReducer,
  },
});
