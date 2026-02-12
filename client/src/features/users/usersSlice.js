import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const data = await apiFetch("/api/admin/users", { token });
      return data.users;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async ({ email, password, full_name, role }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const data = await apiFetch("/api/admin/users", {
        method: "POST",
        token,
        body: { email, password, full_name, role },
      });
      return data.user;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

export const setUserStatus = createAsyncThunk(
  "users/setUserStatus",
  async ({ userId, is_active }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const data = await apiFetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        token,
        body: { is_active },
      });
      return data.user;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchUsers.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.items = a.payload;
      })
      .addCase(fetchUsers.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload || "Failed to load users";
      })
      .addCase(createUser.fulfilled, (s, a) => {
        s.items = [a.payload, ...s.items];
      })
      .addCase(setUserStatus.fulfilled, (s, a) => {
        s.items = s.items.map((u) => (u.id === a.payload.id ? a.payload : u));
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
