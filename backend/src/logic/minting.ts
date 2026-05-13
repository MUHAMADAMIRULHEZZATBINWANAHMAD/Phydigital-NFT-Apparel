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
  const fileName = `${Date.now()}-${shirtName}.png`; // Unique filename
  
  // Upload to Supabase Storage bucket
  const { data: storageData, error: storageError } = await supabase.storage
    .from('listing-image')
    .upload(fileName, fileData, { contentType: 'image/png' });

  if (storageError) throw new Error(`Supabase Storage upload failed: ${storageError.message}`);

  // Get public URL for the image
  const { data: { publicUrl } } = supabase.storage
    .from('listing-image')
    .getPublicUrl(fileName);

  console.log("✅ Image uploaded to Supabase Storage:", publicUrl);

  // Still upload metadata to Pinata for blockchain permanence
  console.log("Uploading metadata to Pinata...");
  const metadata = {
    name: shirtName,
    description: description,
    image: publicUrl, // Use the Supabase URL (faster than IPFS)
    attributes: attributes
  };

  const jsonUpload = await pinata.upload.public.json(metadata);
  const metadataUri = `ipfs://${jsonUpload.cid}`;
  console.log("✅ Metadata CID:", jsonUpload.cid);

  return { imageUrl: publicUrl, metadataUri, cid: jsonUpload.cid };
}

// ==========================================
// FUNCTION 2: Lazy Mint (Add to Store)
// ==========================================
export async function prepareNFTForStore(metadataUri: string, price: string, supply: number) {
  console.log(`Lazy minting NFT to contract from ${metadataUri}...`);
  
  const lazyMintTx = lazyMint({
    contract,
    nfts: [{ uri: metadataUri }],
  });

  const lazyMintReceipt = await sendAndConfirmTransaction({
    transaction: lazyMintTx,
    account: serverWallet,
  });
  console.log("✅ NFT registered to contract!", lazyMintReceipt.transactionHash);

  console.log(`Setting price to ${price} ETH and supply to ${supply}...`);
  
  // Set start time to 5 minutes ago to ensure it's immediately active on the blockchain
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() - 5);

  const conditionTx = setClaimConditions({
    contract,
    phases: [
      {
        maxClaimableSupply: BigInt(supply),
        price: price,
        currencyAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        startTime: startTime, // <-- THIS IS THE CRITICAL CHANGE
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