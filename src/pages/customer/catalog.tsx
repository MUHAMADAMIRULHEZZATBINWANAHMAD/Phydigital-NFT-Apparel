import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import MyConnectButton from "../../assets/components/connectbutton";

// --- NEW IMPORTS FOR PURCHASING ---
import { TransactionButton, useActiveAccount } from "thirdweb/react";
import { claimTo } from "thirdweb/extensions/erc721";
import { getContract, createThirdwebClient } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { Link } from "react-router-dom";

const client = createThirdwebClient({
  clientId: "2b0023810373344471b9343f003fbba8", 
});

const contract = getContract({
  client,
  address: "0xe2E14c2351f3C19D1aaE477525c4D38B7FD325b0", // Your contract address
  chain: sepolia,
});



function truncate(str: string, start: number, end: number) {
  if (!str || str.length <= start + end) return str;
  return `${str.substring(0, start)}...${str.substring(str.length - end)}`;
}

export default function Catalog() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- NEW STATE FOR SHIPPING MODAL ---
  const account = useActiveAccount(); // Get connected user's wallet
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [purchaseTxHash, setPurchaseTxHash] = useState("");

  const [purchasedItem, setPurchasedItem] = useState<any>(null); // <-- NEW


  useEffect(() => {
    fetch("http://localhost:3001/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setListings(data.listings);
        }
      })
      .catch((err) => console.error("Failed to fetch listings:", err))
      .finally(() => setLoading(false));
  }, []);

  // Submit shipping data to backend
  async function handleShippingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      wallet_address: account?.address,
      transaction_hash: purchaseTxHash,
      full_name: formData.get("fullName"),
      email: formData.get("email"),
      shipping_address: formData.get("address"),
      phone_number: formData.get("phone"),
      item_name: purchasedItem?.name,
      item_image: purchasedItem?.image_url,
      amount: purchasedItem?.price,
    };

    try {
      const res = await fetch("http://localhost:3001/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert("Purchase and shipping details saved successfully!");
        setShowShippingModal(false);
      } else {
        alert("Error saving shipping data: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend.");
    }
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>


      <div style={{ position: "absolute", top: "40px", right: "20px", display: "flex", alignItems: "center", gap: "15px" }}>
        <Link to="/customer/order-history" style={{ color: "#fff", textDecoration: "none" }}>
           Order History
        </Link>
        <MyConnectButton />
      </div>
            
      <div style={{ position: "absolute", top: "40px", right: "20px", }}>
        <MyConnectButton />
      </div>

      <div style={{ textAlign: "left", marginBottom: "40px", fontSize: "35px", color: "#fff" }}>
        <h1>Latest Drops</h1>
      </div>
      <div style={{ textAlign: "left", marginBottom: "20px", fontSize: "15px", color: "#aaa" }}>
        <p>Browse our exclusive phygital collection.</p>
      </div>  

      {loading ? (
        <p>Loading catalog...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" }}>
          {listings.length === 0 ? (
            <p style={{ gridColumn: "span 3" }}>No shirts available right now.</p>
          ) : (
            listings.map((item) => (
              <div 
                key={item.id} 
                style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "15px", display: "flex", flexDirection: "column" }}
              >
                <div style={{ width: "100%", height: "250px", marginBottom: "15px" }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                      No Image Provided
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "15px", flexGrow: 1 }}>
                  <div style={{ flex: 1, fontSize: "13px", textAlign: "left" }}>
                    <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", color: "#f8df00", fontWeight: "bold" }}>{item.name}</h3>
                    <p style={{ margin: "0 0 10px 0", color: "#fff", fontWeight: "normal" }}>{item.description}</p>
                    <h4 style={{ margin: "0 0 10px 0", color: "#fff", fontWeight: "normal" }}> Price: {item.price} Eth</h4>
                    <p style={{ fontSize: "11px", color: "#fff", marginTop: "0 0 10px 0", fontWeight: "normal", wordBreak: "break-all" }}>
                      <strong>IPFS CID: </strong>
                      {item.metadata_uri ? truncate(item.metadata_uri.replace("ipfs://", ""), 6, 6) : "N/A"}
                    </p>
                  </div>

                  <div style={{ width: "120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: "10px" }}>
                    {item.transaction_hash ? (
                      <>
                        <div style={{ background: "white", padding: "8px", border: "1px solid #eee", borderRadius: "4px" }}>
                          <QRCodeSVG value={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} size={100} />
                        </div>
                        <a href={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", textAlign: "center", color: "#007bff", textDecoration: "underline" }}>
                          View Explorer
                        </a>
                      </>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#aaa" }}>No Tx Hash</span>
                    )}
                  </div>
                </div>

                {/* --- THIRDWEB SMART TRANSACTION BUTTON --- */}
                {!account ? (
                  <p style={{ textAlign: "center", color: "red", fontSize: "12px" }}>Connect wallet to purchase</p>
                ) : (
                  <TransactionButton
                    transaction={() =>
                      claimTo({
                        contract: contract,
                        to: account.address, // Send to the connected user
                        quantity: 1n, // Buy 1 shirt
                        
                      })
                    }
                    onTransactionConfirmed={(receipt) => {
                      // WHEN SUCCESSFUL: Open the shipping form
                      setPurchaseTxHash(receipt.transactionHash);
                      setPurchasedItem(item);
                      setShowShippingModal(true);
                    }}
                    onError={(error) => {
                      alert("Transaction failed! Make sure you have Sepolia ETH.");
                      console.error("Tx Error", error);
                    }}
                    style={{
                      width: "100%", padding: "12px", backgroundColor: "black", color: "white",
                      border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "auto"
                    }}
                  >
                    Purchase NFT
                  </TransactionButton>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* --- SHIPPING MODAL --- */}
      {showShippingModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
        }}>
          <div style={{ background: "#222", padding: "30px", borderRadius: "8px", width: "400px" }}>
            <h2 style={{ marginTop: 0 }}>🎉 Payment Successful!</h2>
            <p>Please enter your shipping details for the physical shirt.</p>
            
            <form onSubmit={handleShippingSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input name="fullName" placeholder="Full Name" required style={{ padding: "10px" }} />
              <input name="email" type="email" placeholder="Email Address" required style={{ padding: "10px" }} />
              <textarea name="address" placeholder="Full Shipping Address" required style={{ padding: "10px", height: "80px" }} />
              <input name="phone" placeholder="Phone Number" required style={{ padding: "10px" }} />
              
              <button type="submit" style={{ padding: "12px", background: "white", color: "black", fontWeight: "bold", border: "none", cursor: "pointer" }}>
                Submit Shipping Details
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}