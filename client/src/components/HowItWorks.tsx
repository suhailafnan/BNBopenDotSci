// This component explains the steps of your platform.

import { motion } from 'framer-motion';
import { UploadCloud, Search, Vote, Award } from 'lucide-react';

const steps = [
  { icon: UploadCloud, title: "Submit Research", description: "Upload your paper and data securely to BNB Greenfield, minting it as a permanent NFT on opBNB." },
  { icon: Search, title: "AI & Peer Review", description: "An AI agent provides an initial review before the paper is opened to the community for stake-based peer voting." },
  { icon: Vote, title: "DAO Funding", description: "Submit grant proposals to the SciDAO and get funded directly by the community based on transparent voting." },
  { icon: Award, title: "Build Reputation", description: "Earn non-transferable Soulbound Tokens (SBTs) for approved papers and successful reproductions, building your on-chain CV." },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-gray-900 text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div key={index} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <div className="flex justify-center mb-4"><div className="p-4 bg-cyan-900/50 rounded-full"><step.icon className="h-8 w-8 text-cyan-400" /></div></div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};