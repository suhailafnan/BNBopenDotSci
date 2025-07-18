/// <reference types="vite/client" />

import { ethers } from 'ethers';

type Eip1193Provider = ethers.providers.ExternalProvider;

// This interface helps us type the providers array
interface InjectedProvider extends Eip1193Provider {
    isMetaMask?: boolean;
    isTrust?: boolean;
    isPhantom?: boolean;
    isBitKeep?: boolean; // Bitget was formerly BitKeep
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
        isMetaMask?: boolean;
        isTrust?: boolean;
        isPhantom?: boolean;
        isBitKeep?: boolean;
        providers?: InjectedProvider[];
    };
    trustwallet?: Eip1193Provider;
    BinanceChain?: Eip1193Provider;
    phantom?: {
      ethereum?: Eip1193Provider;
    };
    bitkeep?: {
      ethereum?: Eip1193Provider;
    };
  }
}
