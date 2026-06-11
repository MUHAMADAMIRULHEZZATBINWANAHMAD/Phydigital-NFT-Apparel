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
import {
  lazyMint,
  setClaimConditions,
  nextTokenIdToMint,
} from "thirdweb/extensions/erc1155";

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
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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
export async function uploadToPinata(
  filePath: string,
  shirtName: string,
  description: string,
  attributes: any[],
) {
  console.log("Uploading image to Supabase Storage...");

  const fileData = fs.readFileSync(filePath);
  const fileName = `${Date.now()}-${shirtName}.png`;

  const { data: storageData, error: storageError } = await supabase.storage
    .from("listing-image")
    .upload(fileName, fileData, { contentType: "image/png" });

  if (storageError) {
    throw new Error(`Supabase Storage failed: ${storageError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("listing-image")
    .getPublicUrl(fileName);

  console.log("✅ Image uploaded to Supabase Storage:", publicUrl);

  const metadata = {
    name: shirtName,
    description,
    image: publicUrl,
    attributes,
  };

  const jsonUpload = await pinata.upload.public.json(metadata);
  const metadataUri = `ipfs://${jsonUpload.cid}`;

  return { imageUrl: publicUrl, metadataUri, cid: jsonUpload.cid, metadata };
}

// ==========================================
// FUNCTION 2: Lazy mint one ERC1155 token ID
// ==========================================
export async function prepareNFTForStore(
  metadata: any,
  price: string,
  supply: number,
) {
  console.log(`Lazy minting 1 ERC1155 token for ${metadata.name}...`);

  // This is the token ID that the next lazyMint call will create.
  const tokenId = await nextTokenIdToMint({ contract });

  // Create exactly one token ID for this product
  const lazyMintTx = lazyMint({
    contract,
    nfts: [metadata],
  });

  const lazyMintReceipt = await sendAndConfirmTransaction({
    transaction: lazyMintTx,
    account: serverWallet,
  });

  console.log("✅ NFT registered to contract!", lazyMintReceipt.transactionHash);

  // Claim supply for this token ID
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() - 5);

  const conditionTx = setClaimConditions({
    contract,
    tokenId,
    phases: [
      {
        maxClaimableSupply: BigInt(supply),
        price,
        currencyAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        startTime,
      },
    ],
  });

  const conditionReceipt = await sendAndConfirmTransaction({
    transaction: conditionTx,
    account: serverWallet,
  });

  console.log("✅ Claim conditions updated!", conditionReceipt.transactionHash);

  return {
    lazyMintHash: lazyMintReceipt.transactionHash,
    tokenId: tokenId.toString(),
  };
}