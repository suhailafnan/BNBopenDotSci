
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
  pdfUrl: string; // We'll construct a link to a Greenfield explorer
}

export const Explore = () => {
    const { provider } = useSelector((state: RootState) => state.wallet);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPapers = async () => {
            if (!provider) {
                setIsLoading(false);
                return;
            }
            try {
                const contract = new ethers.Contract(logicContractAddress, logicContractABI, provider);
                const paperCount = await contract.paperCounter();
                const items: Paper[] = [];

                for (let i = 1; i <= Number(paperCount); i++) {
                    const tokenUri = await contract.tokenURI(i);
                    const owner = await contract.ownerOf(i);
                    
                    // For the demo, we'll use a placeholder for the metadata fetch.
                    // In a real app, you'd fetch the JSON from the tokenUri (which is a Greenfield link).
                    // const response = await fetch(tokenUri);
                    // const metadata = await response.json();
                    const metadata = { name: `Paper #${i}: A Study on...`, description: "This is a sample description." };

                    items.push({
                        id: i,
                        title: metadata.name,
                        description: metadata.description,
                        author: owner,
                        pdfUrl: `#`, // Placeholder link
                    });
                }
                setPapers(items.reverse());
            } catch (error) {
                console.error("Failed to fetch papers:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPapers();
    }, [provider]);

    if (isLoading) {
        return <div className="text-center py-20">Loading research papers...</div>;
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <h2 className="text-4xl font-bold text-center mb-2">Explore Research</h2>
            <p className="text-center text-gray-400 mb-8">Browse all research papers minted on the OpenDotSci platform.</p>
            
            {papers.length === 0 ? (
                <p className="text-center text-gray-500">No papers have been submitted yet.</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {papers.map((paper) => (
                        <div key={paper.id} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col">
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
