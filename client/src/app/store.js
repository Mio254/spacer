import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Features/auth/authSlice";
import usersReducer from "../Features/users/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
  },
});
