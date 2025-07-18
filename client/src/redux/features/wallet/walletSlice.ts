// This file defines the global state for our wallet connection.

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  provider: null,
  signer: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallet: (state, action: PayloadAction<Partial<WalletState>>) => {
      state.address = action.payload.address ?? state.address;
      state.provider = action.payload.provider ?? state.provider;
      state.signer = action.payload.signer ?? state.signer;
      state.isConnected = !!action.payload.address;
    },
    resetWallet: (state) => {
      state.address = null;
      state.isConnected = false;
      state.provider = null;
      state.signer = null;
    },
  },
});

export const { setWallet, resetWallet } = walletSlice.actions;
export default walletSlice.reducer;