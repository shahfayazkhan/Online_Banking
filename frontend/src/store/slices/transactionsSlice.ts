import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Transaction {
  _id: string;
  userId: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'bill_payment';
  amount: number;
  description: string;
  category: 'food' | 'shopping' | 'utilities' | 'housing' | 'transfer' | 'income' | 'leisure' | 'other';
  referenceId: string;
  recipientName?: string;
  recipientAccount?: string;
  createdAt: string;
}

interface TransactionsState {
  items: Transaction[];
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  transferStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  transferError: string | null;
}

const initialState: TransactionsState = {
  items: [],
  total: 0,
  status: 'idle',
  error: null,
  transferStatus: 'idle',
  transferError: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (filters: { limit?: number; skip?: number; category?: string; accountId?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/transactions', { params: filters });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const executeTransfer = createAsyncThunk(
  'transactions/executeTransfer',
  async (
    transferData: { fromAccountId: string; toAccountNumber: string; amount: number; description: string; category?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/transactions/transfer', transferData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Transfer failed');
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    resetTransferStatus: (state) => {
      state.transferStatus = 'idle';
      state.transferError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder.addCase(fetchTransactions.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<{ items: Transaction[]; total: number }>) => {
      state.status = 'succeeded';
      state.items = action.payload.items;
      state.total = action.payload.total;
    });
    builder.addCase(fetchTransactions.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Execute transfer
    builder.addCase(executeTransfer.pending, (state) => {
      state.transferStatus = 'loading';
      state.transferError = null;
    });
    builder.addCase(executeTransfer.fulfilled, (state) => {
      state.transferStatus = 'succeeded';
    });
    builder.addCase(executeTransfer.rejected, (state, action) => {
      state.transferStatus = 'failed';
      state.transferError = action.payload as string;
    });
  },
});

export const { resetTransferStatus } = transactionsSlice.actions;
export default transactionsSlice.reducer;
