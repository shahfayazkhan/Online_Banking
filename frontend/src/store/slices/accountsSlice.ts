import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Account {
  _id: string;
  userId: string;
  accountNumber: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  status: 'active' | 'blocked' | 'frozen';
  alias?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountsState {
  items: Account[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AccountsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch accounts');
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData: { type: 'checking' | 'savings' | 'credit'; alias?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/accounts', accountData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create account');
    }
  }
);

export const triggerFaucet = createAsyncThunk(
  'accounts/triggerFaucet',
  async ({ accountId, amount }: { accountId: string; amount: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/accounts/${accountId}/faucet`, { amount });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to trigger faucet');
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch accounts
    builder.addCase(fetchAccounts.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<Account[]>) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
    builder.addCase(fetchAccounts.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Create account
    builder.addCase(createAccount.fulfilled, (state, action: PayloadAction<Account>) => {
      state.items.push(action.payload);
    });

    // Faucet
    builder.addCase(triggerFaucet.fulfilled, (state, action: PayloadAction<Account>) => {
      const index = state.items.findIndex(acc => acc._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
  },
});

export default accountsSlice.reducer;
