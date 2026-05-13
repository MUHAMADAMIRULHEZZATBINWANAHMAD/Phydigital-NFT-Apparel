import type { Request, Response } from "express";
import express from "express";
import multer from "multer";
import cors from "cors";
import { uploadToPinata, prepareNFTForStore } from "./logic/minting.js"; 
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// 1. MINT ENDPOINT (Admin creates a new shirt listing)
app.post("/mint", upload.single("image"), async (req, res) => {
  try {
    const { name, description, supply, price, attributes } = req.body;
    const imagePath = req.file?.path;

    if (!imagePath) return res.status(400).json({ error: "Image required" });

    // 1. Upload to Supabase Storage + Pinata
    const { imageUrl, metadataUri } = await uploadToPinata(
      imagePath, 
      name, 
      description, 
      attributes ? JSON.parse(attributes) : []
    );

    // 2. Lazy mint to contract
    const { lazyMintHash } = await prepareNFTForStore(metadataUri, price, parseInt(supply));

    // 3. Save listing to Supabase with BOTH image URL and metadata URI
    await supabase.from('store_listings').insert([{
      name, 
      description, 
      image_url: imageUrl,  // ← NEW: Fast Supabase image URL
      metadata_uri: metadataUri,  // ← Still store IPFS metadata for blockchain
      price, 
      supply: parseInt(supply), 
      transaction_hash: lazyMintHash
    }]);

    res.json({ success: true, lazyMintHash, metadataUri, imageUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. SHIPPING ENDPOINT (Triggered by frontend after successful purchase)
app.post("/shipping", async (req, res) => {
  const { wallet_address, transaction_hash, full_name, shipping_address, phone_number } = req.body;

  if (!wallet_address || !transaction_hash || !shipping_address) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase.from('shipping_orders').insert([{
        wallet_address,
        transaction_hash, // Proof of purchase
        full_name,
        shipping_address,
        phone_number,
        status: 'Pending'
    }]);

    if (error) throw error;
    res.json({ success: true, message: "Shipping details saved!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. CATALOG ENDPOINT (Fetch all shirts for the storefront)
app.get("/listings", async (req, res) => {
  try {
    // Fetch all listings from Supabase, newest first
    const { data, error } = await supabase
      .from('store_listings')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json({ success: true, listings: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log("✅ Backend running on port 3001"));