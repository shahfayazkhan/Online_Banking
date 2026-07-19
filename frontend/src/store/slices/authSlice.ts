import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  status: 'idle',
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.accessToken);
      }
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.accessToken);
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Profile
    builder.addCase(fetchProfile.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchProfile.fulfilled, (state, action: PayloadAction<User>) => {
      state.status = 'succeeded';
      state.user = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state) => {
      state.status = 'failed';
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
