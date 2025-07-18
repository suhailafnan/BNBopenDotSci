// FILE: src/components/Header.tsx
// This is your main Header component, now using the custom modal.

import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { resetWallet } from '../redux/features/wallet/walletSlice';
import { WalletModal } from './WalletModal'; // Import the custom modal
import Logo from '../assets/Logo.png';

export const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { address, isConnected } = useSelector((state: RootState) => state.wallet);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Disconnect logic remains simple
  const disconnectWallet = useCallback(() => {
    // For a fully decentralized approach, we just clear the state.
    // The user can disconnect from the dApp via their wallet extension.
    dispatch(resetWallet());
  }, [dispatch]);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      <header className="bg-gray-900/80 backdrop-blur-md text-white p-4 sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between">
          {/* Left Side: Logo and Nav */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img src={Logo} alt="OpenDotSci Logo" className="h-8 w-8" />
              <span className="text-xl font-bold">OpenDotSci</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-gray-300">
              <a href="#about" className="hover:text-cyan-400 transition">About</a>
              <a href="#whitepaper" className="hover:text-cyan-400 transition">Whitepaper</a>
              <a href="#dao" className="hover:text-cyan-400 transition">DAO</a>
              <a href="#contact" className="hover:text-cyan-400 transition">Contact</a>
            </nav>
          </div>

          {/* Right Side: Buttons */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://telegram.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:inline-block px-4 py-2 text-sm font-semibold bg-blue-500 rounded-lg hover:bg-blue-600 transition"
            >
              Join Telegram
            </a>
            {isConnected && address ? (
              <div className="flex items-center space-x-3 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
                <span className="px-3 py-1 text-sm font-mono text-gray-300">
                  {truncateAddress(address)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1 text-sm font-semibold bg-red-600 rounded-md hover:bg-red-700 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm font-semibold bg-cyan-600 rounded-lg hover:bg-cyan-700 transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>
      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};