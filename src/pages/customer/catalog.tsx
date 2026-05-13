import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// Helper function to shorten long strings like CIDs or Hashes
function truncate(str: string, start: number, end: number) {
  if (!str || str.length <= start + end) return str;
  return `${str.substring(0, start)}...${str.substring(str.length - end)}`;
}

export default function Catalog() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from your Express backend
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

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Latest Drops</h1>
      <p>Browse our exclusive phygital collection.</p>

      {loading ? (
        <p>Loading catalog...</p>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", // Forces 3 cards per row
          gap: "20px", 
          marginTop: "20px" 
        }}>
          {listings.length === 0 ? (
            <p style={{ gridColumn: "span 3" }}>No shirts available right now.</p>
          ) : (
            listings.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  border: "1px solid #ccc", 
                  borderRadius: "8px", 
                  padding: "15px", 
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* 1. TOP: The Shirt Image */}
                <div style={{ width: "100%", height: "250px", marginBottom: "15px" }}>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} 
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                      No Image Provided
                    </div>
                  )}
                </div>

                {/* 2. MIDDLE: Split Data Layout */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "15px", flexGrow: 1 }}>
                  
                  {/* Left Side: Metadata / Details */}
                  <div style={{ flex: 1, fontSize: "13px", textAlign: "left" }}>
                    <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", color: "#f8df00", fontWeight: "bold"  }}>{item.name}</h3>
                    <p style={{ margin: "0 0 10px 0", color: "#fff", fontWeight: "normal" }}>{item.description}</p>
                    <h4 style={{ margin: "0 0 10px 0", color: "#fff", fontWeight: "normal" }}> Price: {item.price} Eth</h4>
                    
                    {/* Display clean & TRUNCATED IPFS CID */}
                    <p style={{ fontSize: "11px", color: "#fff", marginTop: "0 0 10px 0", fontWeight: "normal", wordBreak: "break-all" }}>
                      <strong>IPFS CID: </strong>
                      {item.metadata_uri ? truncate(item.metadata_uri.replace("ipfs://", ""), 6, 6) : "N/A"}
                    </p>
                  </div>

                  {/* Right Side: Etherscan Link & QR */}
                  <div style={{ width: "120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: "10px" }}>
                    {item.transaction_hash ? (
                      <>

                        {/* BIGGER & CLEANER QR CODE */}
                        <div style={{ background: "white", padding: "8px", border: "1px solid #eee", borderRadius: "4px" }}>
                          <QRCodeSVG 
                            value={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} 
                            size={100} // Increased size
                          />
                        </div>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontSize: "12px", textAlign: "center", color: "#007bff", textDecoration: "underline" }}
                        >
                          View Explorer
                        </a>
                      </>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#aaa" }}>No Tx Hash</span>
                    )}
                  </div>
                </div>

                {/* 3. BOTTOM: Purchase Button */}
                <button style={{ 
                  width: "100%", 
                  padding: "12px", 
                  backgroundColor: "black", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px", 
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginTop: "auto"
                }}>
                  Purchase
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}