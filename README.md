# Live Frontend (Vercel): www.phygital.foo

A full-stack, decentralized application that bridges physical apparel with verifiable digital ownership on the blockchain. This platform allows administrators to mint new apparel items as NFTs and enables customers to purchase them, claim the NFT to their wallet, and provide shipping details for the physical product.

## Project Overview
This final year project is built on the conceptual framework of Web3. By utilizing blockchain technology, the mission of this system is to deliver a modern shopping experience. End-users are empowered with true, verifiable ownership of their apparel through an associated NFT, creating a more personalized and valuable connection to the product.

This project demonstrates a split-hosting architecture, with a static React frontend deployed on Vercel for global speed and a dynamic Node.js backend on Render for handling server-side logic and blockchain transactions

## Core Features
- **Admin Asset Forging:** A secure admin panel for creating new apparel listings. The system uploads product images to Supabase Storage for fast retrieval and pins the NFT metadata (including the image URL) to Pinata (IPFS) for decentralized permanence.

- **Server-Wallet Minting:** The backend uses a secure, server-side wallet managed by Thirdweb Engine to handle all blockchain interactions. This means administrators can lazy-mint NFTs without needing to connect a personal wallet or manage gas fees directly.
  
- **Dynamic Customer Catalog:** The frontend fetches all available product listings from the backend, displaying them in a clean, responsive grid for customers to browse.
  
- **Web3 NFT Claiming:** Customers can connect their own Web3 wallets (like MetaMask) to purchase an item. The transaction is processed on the Sepolia testnet via the Thirdweb SDK, transferring the NFT directly to the buyer's address.
- **Post-Purchase Shipping Logistics:** After a successful NFT claim, the user is prompted to enter their shipping details. This information, along with the transaction hash and wallet address, is saved to a private Supabase table for order fulfillment.
- **Order Management Dashboard:** An admin-only dashboard to view all incoming shipping orders and update their fulfillment status (e.g., "Pending" to "Completed").

## System Architecture
This application uses a decoupled frontend and backend architecture:

Frontend (Vercel): A React (Vite) single-page application provides the user interface. It communicates with the backend via REST API calls. All page routing is handled client-side by React Router.
Backend (Render): A Node.js/Express server handles all business logic.
Receives requests from the frontend.
Interacts with the Supabase database for storing listing data and shipping orders.
Uploads image assets to Supabase Storage.
Uploads NFT metadata to Pinata (IPFS).
Uses the Thirdweb Engine server wallet to execute blockchain transactions (lazy minting and setting claim conditions) on the Sepolia network.
Database (Supabase): A PostgreSQL database stores all application data, including store_listings and shipping_orders.
Blockchain (Sepolia Testnet): The Thirdweb ERC-721 smart contract governs the ownership and transfer of the apparel NFTs.

## Tech Stack
- **Frontend:** React Vite + Typescript XML
- **Blockchain:** Thirdweb SDK
- **Network:** Sepolia Testnet
- **Backend:** Typescript
- **Database:** Supabase (PostgreSQL + Storage)
- **IPFS:** Pinata
- **Deployment:** Vercel (Frontend), Render (Backend)

## Get Started
To run this project locally, you will need to set up both the frontend and backend services.

Prerequisites
Node.js (v18 or later)
npm or yarn
A Supabase account (for database and storage)
A Pinata account (for IPFS)
A Thirdweb account (for the smart contract and server wallet)

1. Backend setup
// Navigate to the backend directory
cd backend

// Install dependencies
npm install

// Create a .env file in this directory and add the following variables:
- **SUPABASE_URL**
- **SUPABASE_SERVICE_ROLE_KEY**
- **PINATA_JWT**
- **THIRDWEB_SECRET_KEY**
- **THIRDWEB_SMART_CONTRACT_ADDRESS**
- **SERVER_WALLET_ADDRESS**
- **VAULT_ACCESS_TOKEN**

// Run the backend server
npm run dev

//The backend will be running on http://localhost:3001.

2. Frontend setup
// Navigate to the root project directory
cd ..

// Install dependencies
npm install

// Create a .env file in this directory and add your contract address:
VITE_CONTRACT_ADDRESS

// Run the frontend development server
npm run dev

//The frontend will be running on http://localhost:5173. You can now open this URL in your browser.

