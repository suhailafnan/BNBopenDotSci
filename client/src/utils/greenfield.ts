// FILE: src/utils/greenfield.ts
import { ethers } from 'ethers';
import { Client } from "@bnb-chain/greenfield-js-sdk";
import { VisibilityType} from '@bnb-chain/greenfield-js-sdk';
import Long from 'long';
import { RedundancyType } from '@bnb-chain/greenfield-js-sdk';
// Initialize the Greenfield client
const client = Client.create(
  process.env.NEXT_PUBLIC_GREENFIELD_RPC_URL!,
  process.env.NEXT_PUBLIC_GREEN_CHAIN_ID!,
);

// Helper functions from the blog post
const getSps = async () => {
  const sps = await client.sp.getStorageProviders();
  const finalSps = (sps ?? []).filter((v) => v.endpoint.includes('nodereal'));
  return finalSps;
};

const selectSp = async () => {
  const finalSps = await getSps();
  const selectIndex = Math.floor(Math.random() * finalSps.length);
  
  const secondarySpAddresses = [
    ...finalSps.slice(0, selectIndex),
    ...finalSps.slice(selectIndex + 1),
  ].map((item) => item.operatorAddress);
  
  return {
    id: finalSps[selectIndex].id,
    endpoint: finalSps[selectIndex].endpoint,
    primarySpAddress: finalSps[selectIndex]?.operatorAddress,
    sealAddress: finalSps[selectIndex].sealAddress,
    secondarySpAddresses,
  };
};

export const uploadToGreenfield = async (
  signer: ethers.Signer,
  file: File,
  setStatusMessage: (msg: string) => void
): Promise<string> => {
  if (!signer.provider) {
    throw new Error("Signer must be connected to a provider.");
  }
  
  const userAddress = await signer.getAddress();
  // const network = await signer.provider.getNetwork();
  // const chainId = network.chainId;

  // 1. Select a storage provider
  setStatusMessage("Selecting storage provider...");
  const spInfo = await selectSp();

  // 2. Create a unique bucket name from the user's address
  const bucketName = `user-${userAddress.toLowerCase().substring(2, 10)}`;

  // 3. Check if the bucket exists or create it
setStatusMessage("Checking for storage bucket...");
try {
  await client.bucket.headBucket(bucketName);
  console.log("Bucket exists");
} catch (error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    ((error as { message: string }).message.includes('No such bucket'))
  ) {
    setStatusMessage("Creating new bucket...");
    const createBucketTx = await client.bucket.createBucket({
      bucketName: bucketName,
      creator: userAddress,
      visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
      chargedReadQuota: Long.fromNumber(0),
      spInfo: {
        primarySpAddress: spInfo.primarySpAddress,
      },
    });

    const simulateInfo = await createBucketTx.simulate({
      denom: 'BNB',
    });

    const broadcastRes = await createBucketTx.broadcast({
      denom: 'BNB',
      gasLimit: Number(simulateInfo.gasLimit),
      gasPrice: simulateInfo.gasPrice,
      payer: userAddress,
      granter: '',
      // signer and privateKey are not allowed here!
    });

    if (broadcastRes.code !== 0) {
      throw new Error(`Bucket creation failed: ${broadcastRes.rawLog}`); // use .rawLog not .message
    }
  } else {
    throw error;
  }
}


  // 4. Upload the file
  const objectName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  setStatusMessage(`Uploading ${file.name}...`);

  const createObjectTx = await client.object.createObject({
    bucketName,
    objectName,
    creator: userAddress,
       visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
    // fileType: file.type,
    redundancyType: RedundancyType.REDUNDANCY_REPLICA_TYPE,
    body: file,
  });

  const simulateUploadInfo = await createObjectTx.simulate({
    denom: 'BNB',
  });

  const uploadRes = await createObjectTx.broadcast({
    denom: 'BNB',
    gasLimit: Number(simulateUploadInfo.gasLimit),
    gasPrice: simulateUploadInfo.gasPrice,
    payer: userAddress,
    granter: '',
    signer,
    privateKey: '',
  });

  if (uploadRes.code !== 0) {
    throw new Error(`Upload failed: ${uploadRes.message}`);
  }

  setStatusMessage("Upload complete!");
  return `https://${spInfo.endpoint}/view/${bucketName}/${objectName}`;
};