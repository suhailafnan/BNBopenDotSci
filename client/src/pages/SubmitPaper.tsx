// This is the form for submitting new research.

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { RootState } from '../redux/store';
import { logicContractAddress, logicContractABI } from '../contracts';
import { UploadCloud, FileText, Hash } from 'lucide-react';

// --- MOCK GREENFIELD UPLOAD ---
// In a real app, this would use the Greenfield SDK. For the hackathon, we simulate it.
const uploadToGreenfield = async (file: File): Promise<string> => {
    console.log(`Simulating upload of ${file.name} to Greenfield...`);
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Return a fake but valid-looking Greenfield CID (Content ID)
    const fakeCID = `gnfd://gnfd-testnet-sp-1/0x...${Date.now()}`;
    console.log(`Upload successful. Fake CID: ${fakeCID}`);
    return fakeCID;
};

export const SubmitPaper = () => {
    const { signer } = useSelector((state: RootState) => state.wallet);
    const [title, setTitle] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [scriptFile, setScriptFile] = useState<File | null>(null);
    const [outputHash, setOutputHash] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !pdfFile || !title || !outputHash) {
            alert("Please fill all fields and connect your wallet.");
            return;
        }

        setIsLoading(true);
        setStatusMessage("Uploading files to BNB Greenfield...");

        try {
            // 1. Upload files to Greenfield (simulated)
            const pdfCID = await uploadToGreenfield(pdfFile);
            // In a real app, you would also upload the script file and get its CID.
            // For the demo, we'll focus on the PDF.

            // 2. Create the NFT Metadata and upload it
            const metadata = {
                name: title,
                description: "A research paper submitted to OpenDotSci.",
                pdf_cid: pdfCID,
                // script_cid: scriptCID, // You would include this in a real app
            };
            const metadataString = JSON.stringify(metadata);
            const metadataFile = new File([metadataString], "metadata.json", { type: "application/json" });
            const metadataCID = await uploadToGreenfield(metadataFile);

            // 3. Call the smart contract
            setStatusMessage("Minting your research paper as an NFT on opBNB...");
            const contract = new ethers.Contract(logicContractAddress, logicContractABI, signer);
            
            // Convert the output hash string to bytes32
            const formattedHash = ethers.utils.formatBytes32String(outputHash.slice(0, 31));

            const tx = await contract.submitPaper(metadataCID, pdfCID, formattedHash);
            await tx.wait();

            setStatusMessage("Success! Your paper has been submitted and minted as an NFT.");
            // Reset form
            setTitle('');
            setPdfFile(null);
            setScriptFile(null);
            setOutputHash('');

        } catch (error) {
            console.error("Submission failed:", error);
            setStatusMessage("An error occurred during submission. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <h2 className="text-4xl font-bold text-center mb-2">Submit Your Research</h2>
            <p className="text-center text-gray-400 mb-8">Secure your work on-chain and open it up to the world for review and funding.</p>
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gray-800/50 p-8 rounded-lg border border-gray-700 space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Paper Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" required />
                </div>

                <div>
                    <label htmlFor="pdf" className="block text-sm font-medium text-gray-300 mb-2">Research Paper (PDF)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-500" />
                            <div className="flex text-sm text-gray-400">
                                <label htmlFor="pdf" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-cyan-400 hover:text-cyan-500 focus-within:outline-none p-1">
                                    <span>Upload a file</span>
                                    <input id="pdf" name="pdf" type="file" className="sr-only" onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)} accept=".pdf" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">{pdfFile ? pdfFile.name : 'PDF up to 10MB'}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="hash" className="block text-sm font-medium text-gray-300 mb-2">Expected Output Hash (for Reproducibility)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type="text" id="hash" value={outputHash} onChange={(e) => setOutputHash(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="A cryptographic hash of your script's output" required />
                    </div>
                </div>

                <button type="submit" disabled={isLoading || !signer} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Submitting...' : 'Submit to Greenfield & Mint NFT'}
                </button>

                {statusMessage && <p className="text-center text-sm text-gray-400 mt-4">{statusMessage}</p>}
                {!signer && <p className="text-center text-sm text-yellow-400 mt-4">Please connect your wallet to submit.</p>}
            </form>
        </div>
    );
};
