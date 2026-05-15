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
  const { wallet_address, transaction_hash, full_name, email, shipping_address, phone_number, item_name, item_image, amount } = req.body;

  if (!wallet_address || !transaction_hash || !shipping_address) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase.from('shipping_orders').insert([{
        wallet_address,
        transaction_hash,
        full_name,
        email,            // Added email
        shipping_address,
        phone_number,
        item_name,        // Added item name
        item_image,       // Added item image
        amount,
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

// 4. ORDER HISTORY ENDPOINT (Fetch purchases for a specific wallet)
app.get("/orders/:wallet", async (req, res) => {
  try {
    const walletAddress = req.params.wallet;
    
    const { data, error } = await supabase
      .from('shipping_orders')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('id', { ascending: false });

    if (error) throw error;
    res.json({ success: true, orders: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET ALL SHIPPING ORDERS (For Admin Dashboard)
app.get("/shipping-orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipping_orders')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json({ success: true, orders: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. UPDATE SHIPPING ORDER STATUS (For Admin Dashboard)
app.put("/shipping-orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body; // Expecting 'Completed' or 'Cancelled'

    const { data, error } = await supabase
      .from('shipping_orders')
      .update({ status: status })
      .eq('id', orderId)
      .select();

    if (error) throw error;
    res.json({ success: true, updatedOrder: data[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(3001, () => console.log("✅ Backend running on port 3001"));
}
export default app;