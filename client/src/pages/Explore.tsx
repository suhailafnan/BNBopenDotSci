// UPDATED FILE: This page now fetches and displays real, live data.

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import type { RootState } from '../redux/store';
import { logicContractAddress, logicContractABI } from '../contracts';
import { Book, User, ExternalLink } from 'lucide-react';

interface Paper {
  id: number;
  title: string;
  description: string;
  author: string;
  pdfUrl: string;
}

export const Explore = () => {
    const { provider } = useSelector((state: RootState) => state.wallet);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchPapers = async () => {
            if (!provider) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setErrorMessage("");
            try {
                const contract = new ethers.Contract(logicContractAddress, logicContractABI, provider);
                const paperCount = await contract.paperCounter();
                const items: Paper[] = [];

                for (let i = 1; i <= Number(paperCount); i++) {
                    try {
                        const tokenUri = await contract.tokenURI(i);
                        const owner = await contract.ownerOf(i);
                        
                        // This is a crucial step for the "Best Use of Greenfield" bounty.
                        // We are fetching the metadata JSON directly from the Greenfield URL.
                        const response = await fetch(tokenUri.replace("gnfd://", "https://gnfd-testnet-sp-1.nodereal.io/view/"));
                        if (!response.ok) {
                            console.error(`Failed to fetch metadata for token ${i}: ${response.statusText}`);
                            continue; // Skip this paper if metadata fails
                        }
                        const metadata = await response.json();

                        items.push({
                            id: i,
                            title: metadata.name || `Paper #${i}`,
                            description: metadata.description || "No description available.",
                            author: owner,
                            pdfUrl: metadata.pdf_url.replace("gnfd://", "https://gnfd-testnet-sp-1.nodereal.io/view/"),
                        });
                    } catch (e) {
                        console.error(`Error processing token #${i}:`, e);
                        // This might happen if a token was burned or metadata is invalid.
                    }
                }
                setPapers(items.reverse());
            } catch (error) {
                console.error("Failed to fetch papers:", error);
                setErrorMessage("Could not load papers. Please ensure your wallet is connected to the opBNB Testnet and refresh.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPapers();
    }, [provider]);

    if (isLoading) {
        return <div className="text-center py-20 text-gray-400">Loading research papers from the blockchain...</div>;
    }
    
    if (errorMessage) {
        return <div className="text-center py-20 text-red-400">{errorMessage}</div>;
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <h2 className="text-4xl font-bold text-center mb-2">Explore Research</h2>
            <p className="text-center text-gray-400 mb-8">Browse all research papers minted on the OpenDotSci platform.</p>
            
            {papers.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-800/30 rounded-lg">
                    <p>No papers have been submitted yet.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {papers.map((paper) => (
                        <div key={paper.id} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col transition-all duration-300 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/10">
                            <div className="flex-grow">
                                <Book className="h-8 w-8 text-cyan-400 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">{paper.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{paper.description}</p>
                            </div>
                            <div>
                                <div className="flex items-center text-xs text-gray-500 mb-4">
                                    <User className="h-4 w-4 mr-2" />
                                    <span className="truncate">{paper.author}</span>
                                </div>
                                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md text-sm font-medium">
                                    View on Greenfield <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};