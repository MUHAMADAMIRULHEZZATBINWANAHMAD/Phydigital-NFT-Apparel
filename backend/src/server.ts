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
    const { name, description, supply, price, rm_price, attributes } = req.body;  // Extract rm_price
    const imagePath = req.file?.path;

    // ADD THESE SAFETY CHECKS:
    if (!imagePath) return res.status(400).json({ error: "Image required" });
    if (!price || parseFloat(price) <= 0) return res.status(400).json({ error: "Valid ETH price required" });
    if (!supply || parseInt(supply) <= 0) return res.status(400).json({ error: "Valid supply count required" });

    // 1. Upload to Supabase Storage + Pinata
    const { imageUrl, metadataUri, metadata } = await uploadToPinata(
      imagePath, 
      name, 
      description, 
      attributes ? JSON.parse(attributes) : []
    );

    // 2. Lazy mint to contract (using ETH price)
    const { lazyMintHash } = await prepareNFTForStore(metadata, price, parseInt(supply));

    // 3. Save listing to Supabase with both ETH and RM prices
    const { error: insertError } = await supabase.from('store_listings').insert([{
      name, 
      description, 
      image_url: imageUrl,
      metadata_uri: metadataUri,
      price,  // ETH price for blockchain
      rm_price: rm_price ? parseFloat(rm_price) : 0,  // FIXED: Handle empty values to avoid NaN
      supply: parseInt(supply), 
      transaction_hash: lazyMintHash
    }]);

    // NEW: Check if database insert failed
    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    res.json({ success: true, lazyMintHash, metadataUri, imageUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. SHIPPING ENDPOINT (Triggered by frontend after successful purchase)
app.post("/shipping", async (req, res) => {
  const { wallet_address, transaction_hash, full_name, email, shipping_address, phone_number, item_name, item_image, amount, quantity } = req.body;

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
        quantity,
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

// 7. GET LIVE ETH PRICE IN MYR
app.get("/eth-price", async (req, res) => {
  try {
    const API_KEY = process.env.COINGECKO_API_KEY;
    // 👇 CHANGED: Use 'api.coingecko.com' for free keys instead of 'pro-api'
    const API_URL = 'https://api.coingecko.com/api/v3/simple/price';
    
    // 👇 CHANGED: Parameter must be 'x_cg_demo_api_key' for free keys
    const response = await fetch(`${API_URL}?ids=ethereum&vs_currencies=myr&x_cg_demo_api_key=${API_KEY}`);
    const data = await response.json();
    
    if (!data.ethereum || !data.ethereum.myr) {
      throw new Error("Invalid response from CoinGecko");
    }

    res.json({ success: true, myrPrice: data.ethereum.myr });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));