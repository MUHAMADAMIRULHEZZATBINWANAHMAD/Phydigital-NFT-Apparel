import { PinataSDK } from "pinata";
import fs from "fs";
import "dotenv/config";
import {
  createThirdwebClient,
  getContract,
  sendAndConfirmTransaction,
  Engine,
} from "thirdweb";
import { createClient } from "@supabase/supabase-js";
import { sepolia } from "thirdweb/chains";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721"; 

// ==========================================
// 1. INITIALIZE PINATA
// ==========================================
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY_URL!, 
});

// ==========================================
// 2. INITIALIZE SUPABASE
// ==========================================
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// ==========================================
// 3. INITIALIZE THIRDWEB
// ==========================================
const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

const serverWallet = Engine.serverWallet({
  client,
  address: process.env.SERVER_WALLET_ADDRESS!,
  vaultAccessToken: process.env.VAULT_ACCESS_TOKEN!,
});

const contract = getContract({
  client,
  address: process.env.THIRDWEB_SMART_CONTRACT_ADDRESS!,
  chain: sepolia, 
});

// ==========================================
// FUNCTION 1: Upload to Supabase Storage + Pinata IPFS
// ==========================================
export async function uploadToPinata(filePath: string, shirtName: string, description: string, attributes: any[]) {
  console.log("Uploading image to Supabase Storage...");
  
  const fileData = fs.readFileSync(filePath);
  const fileName = `${Date.now()}-${shirtName}.png`; 
  
  const { data: storageData, error: storageError } = await supabase.storage
    .from('listing-image')
    .upload(fileName, fileData, { contentType: 'image/png' });

  if (storageError) throw new Error(`Supabase Storage failed: ${storageError.message}`);

  const { data: { publicUrl } } = supabase.storage.from('listing-image').getPublicUrl(fileName);
  console.log("✅ Image uploaded to Supabase Storage:", publicUrl);

  const metadata = {
    name: shirtName,
    description: description,
    image: publicUrl, // Using fast Supabase URL
    attributes: attributes
  };

  // We keep this just so your database still has a record of it
  const jsonUpload = await pinata.upload.public.json(metadata);
  const metadataUri = `ipfs://${jsonUpload.cid}`; 

  //  NEW: Return the raw 'metadata' object as well
  return { imageUrl: publicUrl, metadataUri, cid: jsonUpload.cid, metadata };
}


//  NEW: Accept 'metadata: any' instead of a string URL
export async function prepareNFTForStore(metadata: any, price: string, supply: number) {
  console.log(`Lazy minting ${supply} identical copies using Thirdweb's auto-uploader...`);
  
  //  NEW: Duplicate the single metadata object into an array to match your supply exactly
  const metadataArray = Array(supply).fill(metadata);

  const lazyMintTx = lazyMint({
    contract,
    //  NEW: Pass the full array so Thirdweb creates a metadata file for EVERY copy
    nfts: metadataArray, 
  });

  const lazyMintReceipt = await sendAndConfirmTransaction({
    transaction: lazyMintTx,
    account: serverWallet,
  });
  console.log("✅ NFT registered to contract!", lazyMintReceipt.transactionHash);

  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() - 5);

  const conditionTx = setClaimConditions({
    contract,
    phases: [
      {
        maxClaimableSupply: BigInt(supply),
        price: price,
        currencyAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        startTime: startTime,
      },
    ],
  });
  const conditionReceipt = await sendAndConfirmTransaction({
    transaction: conditionTx,
    account: serverWallet,
  });
  console.log("✅ Claim conditions updated!", conditionReceipt.transactionHash);

  return { lazyMintHash: lazyMintReceipt.transactionHash };
}