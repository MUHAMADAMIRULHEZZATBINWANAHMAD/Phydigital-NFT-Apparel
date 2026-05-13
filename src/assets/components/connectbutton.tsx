import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { sepolia } from "thirdweb/chains"; 
import { createWallet } from "thirdweb/wallets"; // <-- Remove WalletId cast, no longer needed

const clientId = "2b0023810373344471b9343f003fbba8"; 

const client = createThirdwebClient({
  clientId: clientId,
});

// Configure it to specifically use the Uniswap Wallet with the exact correct ID
const wallets = [
  createWallet("org.uniswap"),
];

export default function MyConnectButton() {
  return (
    <ConnectButton 
      client={client} 
      chain={sepolia} 
      wallets={wallets} 
      appMetadata={{
        name: "Sunday Clothing",
        url: "http://localhost:5173",
      }}
    />
  );
}