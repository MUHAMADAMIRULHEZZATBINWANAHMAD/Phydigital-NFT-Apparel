import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { QRCodeSVG } from "qrcode.react";
import MyConnectButton from "../../assets/components/connectbutton";

export default function OrderHistory() {
  const account = useActiveAccount();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account?.address) return;

    setLoading(true);
    // Fetch this specific wallet's shipping history
    fetch(`http://localhost:3001/orders/${account.address}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, [account?.address]);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
      {/* Global Connect Button at the top right */}
      <div style={{ position: "absolute", top: "40px", right: "20px" }}>
        <MyConnectButton />
      </div>

      <div style={{ textAlign: "left", marginBottom: "40px", fontSize: "35px", color: "#fff" }}>
      <h1>Your Order History</h1>
      </div>


      <Link to="/customer/catalog" style={{ color: "#007bff", textDecoration: "none", marginBottom: "30px", display: "inline-block" }}>
        ← Back to Catalog
      </Link>

      {!account ? (
        <div style={{ textAlign: "center", padding: "50px", border: "1px dashed #ccc", borderRadius: "8px" }}>
          <h2>Please connect your wallet to view your purchases.</h2>
        </div>
      ) : loading ? (
        <p>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <p>You haven't made any purchases yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                border: "1px solid #ccc", 
                borderRadius: "8px", 
                padding: "20px", 
                display: "flex", 
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              {/* LEFT SIDE (70% WIDTH) - Image & Status */}
              <div style={{ flex: "0 0 70%", display: "flex", flexDirection: "row", gap: "20px", paddingRight: "20px" }}>
                
                {/* The Shirt Image */}
                <div style={{ width: "150px", height: "150px", flexShrink: 0 }}>
                  {item.item_image ? (
                    <img src={item.item_image} alt={item.item_name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "#eee", color: "#666", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* The Order Text Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", justifyContent: "center" }}>
                  <h3 style={{ margin: 0, color: "#f8df00" }}>{item.item_name || `Order #${item.id}`}</h3>
                  <p style={{ margin: "5px 0" }}><strong>Shipping to:</strong> {item.full_name}</p>
                  <p style={{ margin: "0" }}><strong>Address:</strong> {item.shipping_address}</p>
                  
                  <div style={{ marginTop: "15px" }}>
                     <span style={{
                       padding: "6px 14px",
                       borderRadius: "20px",
                       backgroundColor: item.status === "Pending" ? "#e67e22" : "#2ecc71",
                       color: "white",
                       fontWeight: "bold",
                       fontSize: "12px"
                     }}>
                       Status: {item.status || "Pending"}
                     </span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE (30% WIDTH) - Blockchain verification */}
              <div style={{ flex: "0 0 30%", borderLeft: "1px solid #ccc", paddingLeft: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold" }}>Blockchain Receipt</p>
                
                <div style={{ background: "white", padding: "10px", borderRadius: "8px", display: "inline-block" }}>
                  <QRCodeSVG
                    value={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`}
                    size={100}
                  />
                </div>
                
                <a 
                  href={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginTop: "10px", fontSize: "14px", color: "#007bff", textDecoration: "none" }}
                >
                  View on Sepolia Etherscan ↗
                </a>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}