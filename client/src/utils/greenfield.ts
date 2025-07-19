// FILE: src/utils/greenfield.ts
// NEW FILE: This contains the real logic for interacting with BNB Greenfield.

// FIX: Corrected the import paths to match the latest version of the SDK.
import { GreenfieldClient, GRN_TESTNET_URL } from '@bnb-chain/greenfield-js-sdk';
import { ethers } from 'ethers';

// Initialize the Greenfield client
export const gfClient = GreenfieldClient.getInstance(GRN_TESTNET_URL.GRN_RPC);

// This is a real, simplified upload function for the hackathon.
// It handles creating a bucket (if needed) and uploading a file.
export const uploadToGreenfield = async (
    signer: ethers.Signer, // Use the specific ethers.Signer type
    file: File,
    setStatusMessage: (msg: string) => void
): Promise<string> => {
    
    if (!signer.provider) {
        throw new Error("Signer must be connected to a provider.");
    }
    
    const provider = signer.provider;
    const userAddress = await signer.getAddress();

    // 1. Get Chain ID for transaction signing
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    // 2. Create a unique bucket name from the user's address
    const bucketName = userAddress.toLowerCase();

    // 3. Check if the bucket already exists
    setStatusMessage("Checking for Greenfield storage bucket...");
    try {
        await gfClient.bucket.headBucket(bucketName);
        console.log("Storage bucket already exists.");
    } catch (error: any) {
        // If the bucket doesn't exist, create it. This is a one-time setup per user.
        if (error?.message?.includes('No such bucket')) {
            console.log("Bucket not found, creating a new one...");
            setStatusMessage("Creating a new storage bucket (one-time setup)...");
            const createBucketTx = await gfClient.bucket.createBucket({
                bucketName: bucketName,
                creator: userAddress,
                visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
                chargedReadQuota: '0',
                spInfo: {
                    primarySpAddress: GRN_TESTNET_URL.PRIMARY_SP_ADDRESS,
                },
            });

            const bucketSignedTx = await createBucketTx.broadcast({
                signer,
                domain: window.location.origin,
                chainId,
                rpcUrl: GRN_TESTNET_URL.GRN_RPC,
            });

            const bucketBroadcastResult = await bucketSignedTx.broadcast();

            if (bucketBroadcastResult.code === 0) {
                console.log("Bucket created successfully");
                setStatusMessage("Storage bucket created successfully!");
            } else {
                throw new Error(`Failed to create bucket: ${bucketBroadcastResult.message}`);
            }
        } else {
            throw error; // Re-throw other errors
        }
    }

    // 4. Create and upload the file (object)
    const objectName = `${Date.now()}-${file.name}`;
    setStatusMessage(`Uploading ${file.name} to Greenfield...`);
    const createObjectTx = await gfClient.object.createObject({
        bucketName: bucketName,
        objectName: objectName,
        creator: userAddress,
        visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
        fileType: file.type,
        body: file,
    });

    const objectSignedTx = await createObjectTx.broadcast({
        signer,
        domain: window.location.origin,
        chainId,
        rpcUrl: GRN_TESTNET_URL.GRN_RPC,
    });
    
    const objectBroadcastResult = await objectSignedTx.broadcast();

    if (objectBroadcastResult.code === 0) {
        setStatusMessage("File uploaded successfully!");
        // Construct the viewable URL for the file
        const viewUrl = `https://gnfd-testnet-sp-1.nodereal.io/view/${bucketName}/${objectName}`;
        return viewUrl;
    } else {
        throw new Error(`Failed to upload file: ${objectBroadcastResult.message}`);
    }
};