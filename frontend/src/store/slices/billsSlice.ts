import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Biller {
  name: string;
  code: string;
  category: string;
}

export interface BillPayment {
  _id: string;
  userId: string;
  accountId: any;
  billerName: string;
  billerCode: string;
  referenceNumber: string;
  amount: number;
  status: 'success' | 'failed';
  transactionId: string;
  createdAt: string;
}

interface BillsState {
  billers: Biller[];
  history: BillPayment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  payStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  payError: string | null;
}

const initialState: BillsState = {
  billers: [],
  history: [],
  status: 'idle',
  payStatus: 'idle',
  error: null,
  payError: null,
};

export const fetchBillers = createAsyncThunk(
  'bills/fetchBillers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bills/billers');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch billers');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'bills/fetchPaymentHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bills/history');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch billing history');
    }
  }
);

export const payBiller = createAsyncThunk(
  'bills/payBiller',
  async (
    paymentData: { accountId: string; billerCode: string; referenceNumber: string; amount: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/bills/pay', paymentData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Bill payment failed');
    }
  }
);

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    resetPayStatus: (state) => {
      state.payStatus = 'idle';
      state.payError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch billers
    builder.addCase(fetchBillers.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchBillers.fulfilled, (state, action: PayloadAction<Biller[]>) => {
      state.status = 'succeeded';
      state.billers = action.payload;
    });
    builder.addCase(fetchBillers.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Fetch history
    builder.addCase(fetchPaymentHistory.fulfilled, (state, action: PayloadAction<BillPayment[]>) => {
      state.history = action.payload;
    });

    // Pay biller
    builder.addCase(payBiller.pending, (state) => {
      state.payStatus = 'loading';
      state.payError = null;
    });
    builder.addCase(payBiller.fulfilled, (state, action: PayloadAction<any>) => {
      state.payStatus = 'succeeded';
      state.history.unshift(action.payload.billPayment);
    });
    builder.addCase(payBiller.rejected, (state, action) => {
      state.payStatus = 'failed';
      state.payError = action.payload as string;
    });
  },
});

export const { resetPayStatus } = billsSlice.actions;
export default billsSlice.reducer;
