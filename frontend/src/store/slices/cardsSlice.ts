import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Card {
  _id: string;
  userId: string;
  accountId: any; // Can be object or ID
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  type: 'debit' | 'credit';
  status: 'active' | 'blocked' | 'frozen';
  dailySpendLimit: number;
  dailyWithdrawLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface CardsState {
  items: Card[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CardsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cards');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cards');
    }
  }
);

export const toggleCardBlock = createAsyncThunk(
  'cards/toggleCardBlock',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/cards/${cardId}/block`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to block/unblock card');
    }
  }
);

export const updateCardLimits = createAsyncThunk(
  'cards/updateCardLimits',
  async (
    { cardId, dailySpendLimit, dailyWithdrawLimit }: { cardId: string; dailySpendLimit: number; dailyWithdrawLimit: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/cards/${cardId}/limits`, { dailySpendLimit, dailyWithdrawLimit });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update limits');
    }
  }
);

export const updateCardPin = createAsyncThunk(
  'cards/updateCardPin',
  async ({ cardId, pin }: { cardId: string; pin: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/cards/${cardId}/pin`, { pin });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to change PIN');
    }
  }
);

export const orderNewCard = createAsyncThunk(
  'cards/orderNewCard',
  async ({ accountId, type }: { accountId: string; type: 'debit' | 'credit' }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cards', { accountId, type });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to order card');
    }
  }
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch cards
    builder.addCase(fetchCards.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchCards.fulfilled, (state, action: PayloadAction<Card[]>) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
    builder.addCase(fetchCards.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Toggle block
    builder.addCase(toggleCardBlock.fulfilled, (state, action: PayloadAction<Card>) => {
      const index = state.items.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });

    // Update limits
    builder.addCase(updateCardLimits.fulfilled, (state, action: PayloadAction<Card>) => {
      const index = state.items.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });

    // Update PIN
    builder.addCase(updateCardPin.fulfilled, (state, action: PayloadAction<Card>) => {
      const index = state.items.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });

    // Order card
    builder.addCase(orderNewCard.fulfilled, (state, action: PayloadAction<Card>) => {
      state.items.push(action.payload);
    });
  },
});

export default cardsSlice.reducer;
