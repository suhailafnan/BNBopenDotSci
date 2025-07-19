// FILE: src/utils/greenfield.ts

import { Client } from '@bnb-chain/greenfield-js-sdk';
import { ethers } from 'ethers';

// Hardcoded testnet URLs and Service Provider address
const GRN_RPC_URL = 'https://gnfd-testnet-fullnode-tendermint-us.nodereal.io';
const CHAIN_ID = '5600'; // testnet chain ID as string
const PRIMARY_SP_ADDRESS = '0x2E123363d512482e2552bC74722a55BC2C355a7a';

// Initialize the Greenfield client
export const gfClient = Client.create(GRN_RPC_URL, CHAIN_ID);

export const uploadToGreenfield = async (
  signer: ethers.Signer,
  file: File,
  setStatusMessage: (msg: string) => void
): Promise<string> => {
  if (!signer.provider) {
    throw new Error('Signer must be connected to a provider.');
  }

  const provider = signer.provider;
  const userAddress = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  const bucketName = userAddress.toLowerCase();

  setStatusMessage('Checking for Greenfield storage bucket...');
  try {
    await gfClient.bucket.headBucket(bucketName);
    console.log('Storage bucket already exists.');
  } catch (error: any) {
    if (error?.message?.includes('No such bucket')) {
      console.log('Bucket not found, creating a new one...');
      setStatusMessage('Creating a new storage bucket (one-time setup)...');
      const createBucketTx = await gfClient.bucket.createBucket({
        bucketName: bucketName,
        creator: userAddress,
        visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
        chargedReadQuota: '0',
        spInfo: {
          primarySpAddress: PRIMARY_SP_ADDRESS,
        },
      });

      const bucketSignedTx = await createBucketTx.broadcast({
        signer,
        domain: window.location.origin,
        chainId,
        rpcUrl: GRN_RPC_URL,
      });

      const bucketBroadcastResult = await bucketSignedTx.broadcast();
      if (bucketBroadcastResult.code !== 0) {
        throw new Error(`Failed to create bucket: ${bucketBroadcastResult.message}`);
      }
      setStatusMessage('Storage bucket created successfully!');
    } else {
      throw error;
    }
  }

  const objectName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
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
    rpcUrl: GRN_RPC_URL,
  });

  const objectBroadcastResult = await objectSignedTx.broadcast();

  if (objectBroadcastResult.code === 0) {
    setStatusMessage('File uploaded successfully!');
    const viewUrl = `https://gnfd-testnet-sp-1.nodereal.io/view/${bucketName}/${objectName}`;
    const gnfdUrl = `gnfd://${bucketName}/${objectName}`;
    console.log(`File available at: ${viewUrl}`);
    return gnfdUrl; // Return the gnfd:// URI for the smart contract
  } else {
    throw new Error(`Failed to upload file: ${objectBroadcastResult.message}`);
  }
};
