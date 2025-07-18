// This file configures our Redux store.

import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './features/wallet/walletSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Ethers provider/signer are not serializable
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;