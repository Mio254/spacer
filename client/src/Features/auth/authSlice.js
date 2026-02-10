import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";

const tokenKey = "spacer_token";

const initialState = {
  user: null,
  token: localStorage.getItem(tokenKey) || null,
  status: "idle",
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async ({ email, password, full_name }, thunkAPI) => {
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: { email, password, full_name },
      });
      return data; // { token, user }
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      return data; // { token, user }
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);


export const loginWithFirebase = createAsyncThunk(
  "auth/loginWithFirebase",
  async ({ id_token }, thunkAPI) => {
    try {
      const data = await apiFetch("/api/auth/firebase", {
        method: "POST",
        body: { id_token },
      });
      return data; // { token, user }
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    if (!token) return thunkAPI.rejectWithValue("No token");
    try {
      const data = await apiFetch("/api/auth/me", { token });
      return data.user; // { user: {...} }
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(tokenKey);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      // REGISTER
      .addCase(register.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.token = a.payload.token;
        s.user = a.payload.user;
        localStorage.setItem(tokenKey, s.token);
      })
      .addCase(register.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload || "Register failed";
      })

      // LOGIN 
      .addCase(login.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.token = a.payload.token;
        s.user = a.payload.user;
        localStorage.setItem(tokenKey, s.token);
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload || "Login failed";
      })

      .addCase(loginWithFirebase.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(loginWithFirebase.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.token = a.payload.token;
        s.user = a.payload.user;
        localStorage.setItem(tokenKey, s.token);
      })
      .addCase(loginWithFirebase.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload || "Google login failed";
      })

      
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload;
      })
      .addCase(fetchMe.rejected, (s) => {
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
