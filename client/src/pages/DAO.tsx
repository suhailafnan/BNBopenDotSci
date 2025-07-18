// FILE: src/pages/DAO.tsx
// UPDATED FILE: Fixed the `await` syntax error inside the polling loop.

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import type { RootState } from '../redux/store';
import { logicContractAddress, logicContractABI } from '../contracts';

const statusMap = ["Pending", "AI_Approved", "Rejected", "Funded"];

// A helper type for our proposal state
interface Proposal {
    id: number;
    proposer: string;
    title: string;
    forVotes: number;
    againstVotes: number;
    status: string;
}

export const DAO = () => {
    const { provider, signer } = useSelector((state: RootState) => state.wallet);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const fetchProposals = async (): Promise<Proposal[]> => {
        if (!provider) return [];
        
        try {
            const contract = new ethers.Contract(logicContractAddress, logicContractABI, provider);
            const counter = await contract.getProposalCounter();
            const items: Proposal[] = [];
            for (let i = 1; i <= Number(counter); i++) {
                const p = await contract.getProposal(i);
                if (p.proposer !== ethers.constants.AddressZero) {
                    items.push({
                        id: Number(p.id),
                        proposer: p.proposer,
                        title: p.description,
                        forVotes: Number(p.forVotes),
                        againstVotes: Number(p.againstVotes),
                        status: statusMap[p.status],
                    });
                }
            }
            setProposals(items.reverse());
            return items;
        } catch (error) {
            console.error("Could not fetch proposals:", error);
            setStatusMessage("Failed to fetch proposals. The network might be busy.");
            return [];
        }
    };

    useEffect(() => {
        setIsLoading(true);
        setStatusMessage("Fetching initial proposals...");
        fetchProposals().finally(() => {
            setIsLoading(false);
            setStatusMessage("");
        });
    }, [provider]);

    const handleCreateProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !description || !amount) {
            alert("Please fill all fields and connect your wallet.");
            return;
        }
        setIsLoading(true);
        setStatusMessage("Sending transaction to create proposal...");
        
        try {
            const contract = new ethers.Contract(logicContractAddress, logicContractABI, signer);
            const amountInWei = ethers.utils.parseEther(amount);
            const tx = await contract.createGrantProposal(description, amountInWei);
            
            setStatusMessage("Waiting for transaction confirmation...");
            await tx.wait();
            
            setStatusMessage("Transaction confirmed! Verifying on-chain...");
            
            // FIX: Get the signer's address *before* the loop
            const userAddress = await signer.getAddress();

            // Poll until the new proposal is visible
            for (let i = 0; i < 15; i++) { // Poll for up to 30 seconds
                const newProposals = await fetchProposals();
                // FIX: Use the stored address in the synchronous find callback
                const found = newProposals.find(p => p.title === description && p.proposer === userAddress);
                if (found) {
                    setStatusMessage("Proposal successfully created and verified!");
                    setDescription('');
                    setAmount('');
                    setIsLoading(false);
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            setStatusMessage("Proposal created, but is taking a moment to appear. It will show up soon.");

        } catch (error) {
            console.error("Proposal creation failed:", error);
            setStatusMessage("Failed to create proposal. Please check the console.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVote = async (proposalId: number, supports: boolean) => {
        if (!signer) {
            alert("Please connect your wallet to vote.");
            return;
        }
        setIsLoading(true);
        setStatusMessage(`Casting your vote for proposal #${proposalId}...`);
        try {
            const contract = new ethers.Contract(logicContractAddress, logicContractABI, signer);
            const votingFee = ethers.utils.parseEther("0.0001");
            const tx = await contract.voteOnProposal(proposalId, supports, { value: votingFee });

            setStatusMessage("Waiting for vote confirmation...");
            await tx.wait();
            
            setStatusMessage("Vote confirmed! Refreshing data...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // Give it a moment to propagate
            await fetchProposals();

            setStatusMessage("Vote cast successfully!");
        } catch (error) {
            console.error("Vote failed:", error);
            setStatusMessage("Failed to cast vote. You may have already voted.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <h2 className="text-4xl font-bold text-center mb-2">SciDAO Dashboard</h2>
            <p className="text-center text-gray-400 mb-8">Vote on grant proposals to direct the future of decentralized science.</p>
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Proposal List */}
                <div className="lg:col-span-2 space-y-4">
                    {proposals.length > 0 ? proposals.map(p => (
                        <div key={p.id} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{p.title}</h3>
                                    <p className="text-sm text-gray-400 truncate">Proposed by: {p.proposer}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${p.status === 'Voting' ? 'bg-blue-900 text-blue-300' : p.status === 'Passed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{p.status}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex space-x-4">
                                    <button onClick={() => handleVote(p.id, true)} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50" disabled={p.status !== 'Voting' || isLoading || !signer}>Vote For ({p.forVotes})</button>
                                    <button onClick={() => handleVote(p.id, false)} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50" disabled={p.status !== 'Voting' || isLoading || !signer}>Vote Against ({p.againstVotes})</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 py-10 bg-gray-800/30 rounded-lg">
                            <p>{isLoading ? "Loading proposals..." : "No proposals have been created yet."}</p>
                        </div>
                    )}
                </div>
                {/* Create Proposal Form */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 h-fit">
                    <h3 className="text-2xl font-bold mb-4">Create a Proposal</h3>
                    <form onSubmit={handleCreateProposal} className="space-y-4">
                        <div>
                            <label htmlFor="proposal-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <textarea id="proposal-desc" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Describe your grant proposal..." required></textarea>
                        </div>
                        <div>
                            <label htmlFor="proposal-amount" className="block text-sm font-medium text-gray-300 mb-1">Amount Requested (tBNB)</label>
                            <input type="number" id="proposal-amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 5" required />
                        </div>
                        <button type="submit" disabled={isLoading || !signer} className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md disabled:opacity-50">
                            {isLoading ? 'Submitting...' : 'Submit Proposal'}
                        </button>
                    </form>
                </div>
            </div>
            {statusMessage && <p className="text-center text-sm text-gray-400 mt-8">{statusMessage}</p>}
        </div>
    );
};