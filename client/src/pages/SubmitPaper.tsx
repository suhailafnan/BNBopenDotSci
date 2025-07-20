// FILE: src/pages/SubmitPaper.tsx

import { useState } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import type { RootState } from "../redux/store";
import { logicContractAddress, logicContractABI } from "../contracts";
import { FileText, Hash, DollarSign, CheckSquare, Square } from "lucide-react";

// Simulated Greenfield Upload (for hackathon/demo use)
const uploadToGreenfield = async (file: File): Promise<string> => {
  console.log(`Simulating upload of ${file.name} to Greenfield...`);
  await new Promise((res) => setTimeout(res, 1500));
  const fakeCID = `https://example.com/${file.name}-${Date.now()}`; // Use real CID/URL when ready
  console.log(`Upload successful. Fake CID: ${fakeCID}`);
  return fakeCID;
};

export const SubmitPaper = () => {
  const { signer } = useSelector((state: RootState) => state.wallet);
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [outputHash, setOutputHash] = useState("");
  const [price, setPrice] = useState("0");
  const [createDAO, setCreateDAO] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signer || !pdfFile || !title || !outputHash) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("⏳ Uploading PDF to Greenfield...");

    try {
      // Simulate upload: PDF
      const pdfCID = await uploadToGreenfield(pdfFile);

      // Construct metadata
      const metadata = {
        name: title,
        description: "Research paper NFT uploaded via OpenDotSci.",
        pdf_cid: pdfCID,
      };
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], "metadata.json");
      const metadataCID = await uploadToGreenfield(metadataFile);

      // Contract interaction
      setStatusMessage("📡 Sending transaction to smart contract...");
      const contract = new ethers.Contract(
        logicContractAddress,
        logicContractABI,
        signer
      );

      const safeHash = ethers.utils.formatBytes32String(
        outputHash.slice(0, 31) || "hash"
      );
      const priceInWei = ethers.utils.parseEther(price || "0");

      const tx = await contract.submitPaper(
        metadataCID,
        pdfCID,
        safeHash,
        priceInWei,
        createDAO
      );

      await tx.wait();

      setStatusMessage("✅ Research paper submitted and NFT minted!");
      setTitle("");
      setPdfFile(null);
      setOutputHash("");
      setPrice("0");
      setCreateDAO(false);
    } catch (err: any) {
      console.error("❌ Submission error:", err);
      const errorMessage =
        err?.error?.message || err?.message || "Unknown error";
      setStatusMessage(
        `❌ Submission failed: ${errorMessage.slice(0, 200)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold text-center mb-4">Submit Your Research</h2>
      <p className="text-center text-gray-400 mb-8">
        Publish your work as an NFT, store it on decentralized storage, and unlock new ways to share, fund, and grow your research.
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6"
      >
        {/* Paper Title */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2"
          />
        </div>

        {/* Upload PDF */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Upload PDF</label>
          <div className="flex items-center space-x-3">
            <FileText className="text-cyan-400 w-5 h-5" />
            <input
              accept=".pdf"
              type="file"
              onChange={(e) =>
                setPdfFile(e.target.files ? e.target.files[0] : null)
              }
              required
              className="text-sm text-white bg-gray-900 border border-gray-600 rounded-md p-2 w-full"
            />
          </div>
          {pdfFile && (
            <p className="text-xs mt-1 text-green-300">📄 {pdfFile.name}</p>
          )}
        </div>

        {/* Output Hash */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Expected Output Hash</label>
          <div className="relative flex items-center">
            <Hash className="absolute left-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={outputHash}
              onChange={(e) => setOutputHash(e.target.value)}
              required
              className="pl-10 pr-3 py-2 w-full bg-gray-700 text-white border border-gray-600 rounded-md"
              placeholder="e.g., hash of model results"
            />
          </div>
        </div>

        {/* Price (Optional) */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Price in BNB (Optional)</label>
          <div className="relative flex items-center">
            <DollarSign className="absolute left-3 w-4 h-4 text-gray-500" />
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-10 pr-3 py-2 w-full bg-gray-700 text-white border border-gray-600 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* DAO Creation Toggle */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setCreateDAO(!createDAO)}
            className="focus:outline-none"
          >
            {createDAO ? (
              <CheckSquare className="h-6 w-6 text-cyan-400" />
            ) : (
              <Square className="h-6 w-6 text-gray-400" />
            )}
          </button>
          <span className="text-sm text-gray-300">
            Also create a DAO for this paper
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !signer}
          className="w-full py-3 px-4 bg-cyan-600 text-white font-medium rounded-md hover:bg-cyan-700 disabled:opacity-50"
        >
          {isLoading ? "Submitting..." : "Submit Paper & Mint NFT"}
        </button>

        {/* Status Message */}
        {statusMessage && (
          <p className="text-center text-sm text-gray-300 mt-2">{statusMessage}</p>
        )}
      </form>
    </div>
  );
};
