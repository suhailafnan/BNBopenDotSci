// This is the dashboard for the grants DAO.

import { useState } from 'react';

// Mock data for the DAO proposals. In a real app, this would be fetched from the smart contract.
const mockProposals = [
    { id: 1, title: "Quantum Entanglement Visualizer", proposer: "0x1234...", forVotes: 15, againstVotes: 3, status: 'Voting' },
    { id: 2, title: "Decentralized mRNA Sequencing", proposer: "0x5678...", forVotes: 22, againstVotes: 1, status: 'Passed' },
    { id: 3, title: "AI-Powered Protein Folding Analysis", proposer: "0xABCD...", forVotes: 5, againstVotes: 8, status: 'Failed' },
];

export const DAO = () => {
    // In a real app, you would use a useEffect hook to fetch proposals from the contract.
    const [proposals, setProposals] = useState(mockProposals);

    return (
        <div className="container mx-auto py-12 px-4">
            <h2 className="text-4xl font-bold text-center mb-2">SciDAO Dashboard</h2>
            <p className="text-center text-gray-400 mb-8">Vote on grant proposals to direct the future of decentralized science.</p>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Proposal List */}
                <div className="lg:col-span-2 space-y-4">
                    {proposals.map(p => (
                        <div key={p.id} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{p.title}</h3>
                                    <p className="text-sm text-gray-400">Proposed by: {p.proposer}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    p.status === 'Voting' ? 'bg-blue-900 text-blue-300' :
                                    p.status === 'Passed' ? 'bg-green-900 text-green-300' :
                                    'bg-red-900 text-red-300'
                                }`}>{p.status}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex space-x-4">
                                    <button className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50" disabled={p.status !== 'Voting'}>Vote For ({p.forVotes})</button>
                                    <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50" disabled={p.status !== 'Voting'}>Vote Against ({p.againstVotes})</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Proposal Form */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 h-fit">
                    <h3 className="text-2xl font-bold mb-4">Create a Proposal</h3>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="proposal-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <textarea id="proposal-desc" rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Describe your grant proposal..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="proposal-amount" className="block text-sm font-medium text-gray-300 mb-1">Amount Requested (tBNB)</label>
                            <input type="number" id="proposal-amount" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 5" />
                        </div>
                        <button type="submit" className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md">Submit Proposal</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

