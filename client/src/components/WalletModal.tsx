// FILE: src/components/WalletModal.tsx
// UPDATED FILE: Replaced Binance Wallet with Trust Wallet and fixed provider logic.

import { useState } from 'react';
import type { FC } from 'react';
import { ethers } from 'ethers';
import { useDispatch } from 'react-redux';
import { setWallet } from '../redux/features/wallet/walletSlice';
import type { AppDispatch } from '../redux/store';

import MetaMaskIcon from '../assets/metamask.png';
import TrustWalletIcon from '../assets/trustWallet.png';
import PhantomIcon from '../assets/phantom.jpg';
import BitgetIcon from '../assets/bitget.png';

// Define wallet types for clarity
type WalletId = 'metamask' | 'trustwallet' | 'phantom' | 'bitget';

type Eip1193Provider = ethers.providers.ExternalProvider;

interface Wallet {
  id: WalletId;
  name: string;
  iconUrl: string;
  getProvider: () => Eip1193Provider | undefined;
}

// --- Wallet Definitions with corrected provider logic ---
const wallets: Wallet[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    iconUrl: MetaMaskIcon,
    getProvider: () => {
        const providers = window.ethereum?.providers;
        if (providers) {
            return providers.find((p) => p.isMetaMask && !p.isTrust);
        }
        return window.ethereum?.isMetaMask ? window.ethereum : undefined;
    },
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    iconUrl: TrustWalletIcon,
    getProvider: () => {
        if (window.trustwallet) return window.trustwallet;
        const providers = window.ethereum?.providers;
        if (providers) {
            return providers.find((p) => p.isTrust);
        }
        return window.ethereum?.isTrust ? window.ethereum : undefined;
    },
  },
  {
    id: 'phantom',
    name: 'Phantom',
    iconUrl: PhantomIcon,
    getProvider: () => {
        if (window.phantom?.ethereum) return window.phantom.ethereum;
        const providers = window.ethereum?.providers;
        if (providers) {
            return providers.find((p) => p.isPhantom);
        }
        return window.ethereum?.isPhantom ? window.ethereum : undefined;
    },
  },
  {
    id: 'bitget',
    name: 'Bitget Wallet',
    iconUrl: BitgetIcon,
    getProvider: () => {
        // Bitget uses the `isBitKeep` flag in its provider
        const providers = window.ethereum?.providers;
        if (providers) {
            return providers.find((p: any) => p.isBitKeep);
        }
        return (window as any).bitkeep?.ethereum || (window.ethereum as any)?.isBitKeep ? window.ethereum : undefined;
    },
  },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loadingWallet, setLoadingWallet] = useState<WalletId | null>(null);

  const connect = async (walletId: WalletId) => {
    setLoadingWallet(walletId);
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) {
      alert("Wallet not found");
      setLoadingWallet(null);
      return;
    }

    const injectedProvider = wallet.getProvider();
    if (!injectedProvider) {
      alert(`${wallet.name} is not installed or another wallet is overriding it. Please check your browser extensions.`);
      setLoadingWallet(null);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(injectedProvider);
      await provider.send("eth_requestAccounts", []); // This prompts the user to connect
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      const message = `Welcome to OpenDotSci! Sign this message to authenticate. Timestamp: ${Date.now()}`;
      await signer.signMessage(message);

      dispatch(setWallet({ address, provider, signer }));
      onClose(); // Close modal on successful connection
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
        setLoadingWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div className="bg-gray-800 text-white p-6 rounded-xl shadow-2xl w-96 max-w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-center mb-6">Connect a Wallet</h2>
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => connect(wallet.id)}
              disabled={loadingWallet !== null}
              className="w-full flex items-center py-3 px-4 bg-gray-700 hover:bg-cyan-600 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src={wallet.iconUrl} alt={`${wallet.name} icon`} className="h-8 w-8" />
              <span className="ml-4 font-semibold flex-grow text-left">{wallet.name}</span>
              {loadingWallet === wallet.id && <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

