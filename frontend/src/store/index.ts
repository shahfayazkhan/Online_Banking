import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import accountsReducer from './slices/accountsSlice';
import transactionsReducer from './slices/transactionsSlice';
import cardsReducer from './slices/cardsSlice';
import billsReducer from './slices/billsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    cards: cardsReducer,
    bills: billsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
