
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 top-0 -translate-x-1/3 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(6,182,212,0.15),rgba(255,255,255,0))]"></div>
      </div>
      <motion.div className="container mx-auto px-4 text-center z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">OpenDotSci</h1>
        <p className="mt-4 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">A full-stack DeSci protocol designed to decentralize and democratize scientific publishing, peer review, and funding on the BNB Chain.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-left max-w-3xl mx-auto">
          <div className="flex items-center space-x-2"><CheckCircle className="text-cyan-400 h-5 w-5" /><span>AI-Vetted Peer Review</span></div>
          <div className="flex items-center space-x-2"><CheckCircle className="text-cyan-400 h-5 w-5" /><span>Decentralized Grant DAOs</span></div>
          <div className="flex items-center space-x-2"><CheckCircle className="text-cyan-400 h-5 w-5" /><span>On-Chain Reputation (SBTs)</span></div>
        </div>
        <motion.button onClick={onGetStarted} className="mt-10 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full text-lg flex items-center justify-center mx-auto transition-all duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Get Started<ArrowRight className="ml-2 h-5 w-5" /></motion.button>
      </motion.div>
    </div>
  );
};