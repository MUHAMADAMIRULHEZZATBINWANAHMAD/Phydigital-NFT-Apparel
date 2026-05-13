import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

// Helper function to truncate long strings
function truncate(str: string, start: number, end: number) {
  if (!str || str.length <= start + end) return str;
  return `${str.substring(0, start)}...${str.substring(str.length - end)}`;
}

// ===================================================================
// 1. VIEW FOR DISPLAYING ALL CREATED PRODUCTS
// ===================================================================
function ProductList() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all listings from the backend
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
    <div style={{ marginTop: "40px" }}>
      <h2>All Created Products</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : listings.length === 0 ? (
        <p>No products have been created yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {listings.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                border: "1px solid #ccc", 
                borderRadius: "8px", 
                padding: "20px", 
                display: "flex", 
                gap: "20px",
                alignItems: "center"
              }}
            >
              {/* Image */}
              <img 
                src={item.image_url} 
                alt={item.name} 
                style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "4px" }} 
              />

              {/* Metadata */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#f8df00" }}>{item.name}</h3>
                <p><strong>Description:</strong> {item.description}</p>
                <p><strong>Price:</strong> {item.price} ETH | <strong>Supply:</strong> {item.supply}</p>
                <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
                  <strong>Metadata URI:</strong> <a href={`https://gateway.pinata.cloud/ipfs/${item.metadata_uri.replace("ipfs://", "")}`} target="_blank" rel="noreferrer">{item.metadata_uri}</a>
                </p>
              </div>

              {/* Blockchain Info */}
              <div style={{ width: "150px", textAlign: "center", borderLeft: "1px solid #444", paddingLeft: "20px" }}>
                <div style={{ background: "white", padding: "8px", borderRadius: "4px", display: "inline-block" }}>
                  <QRCodeSVG value={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} size={100} />
                </div>
                <a href={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", display: "block", marginTop: "10px" }}>
                  View on Etherscan
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ===================================================================
// 2. VIEW FOR THE CREATION FORM
// ===================================================================
function CreateForm() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [color, setColor] = useState("");
  const [country, setCountry] = useState("");
  const [value, setValue] = useState(""); 

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const attributes = [{ trait_type: "Color", value: color }, { trait_type: "Country", value: country }, { trait_type: "Value", value: value }];
    formData.append("attributes", JSON.stringify(attributes));

    try {
      const res = await fetch("http://localhost:3001/mint", { method: "POST", body: formData });
      const data = await res.json();
      setResponse(data);
      form.reset(); // Clear form on success
      setColor(""); setCountry(""); setValue("");
    } catch (err: any) {
      setResponse({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>Create New Shirt Listing</h2>
      <p>Fill out this form to upload the shirt and lazy-mint it to the store.</p>
      
      <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        <input name="name" type="text" placeholder="Shirt Name" required style={{ width: '100%', padding: '8px' }} />
        <textarea name="description" placeholder="Description" required style={{ width: '100%', height: '80px', padding: '8px' }} />
        <input name="supply" type="number" placeholder="Total Supply" defaultValue="100" required style={{ width: '100%', padding: '8px' }} />
        <input name="price" type="number" placeholder="Price (in ETH)" step="0.0001" defaultValue="0.007" required style={{ width: '100%', padding: '8px' }} />
        <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        <input type="text" placeholder="Manufacturing Country" value={country} onChange={(e) => setCountry(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        <input type="text" placeholder="Value (e.g., Premium)" value={value} onChange={(e) => setValue(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        <div>
          <label>Shirt Image:</label><br />
          <input type="file" name="image" accept="image/*" required />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px', marginTop: '10px' }}>
          {loading ? "Processing..." : "Create Listing"}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: "30px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
          {response.success ? (
            <>
              <h2 style={{ color: "green" }}>✅ Listing Created!</h2>
              <p><strong>Tx Hash:</strong> {truncate(response.lazyMintHash, 10, 10)}</p>
            </>
          ) : (
            <p style={{ color: "red" }}>❌ Error: {response.error}</p>
          )}
        </div>
      )}
    </div>
  );
}


// ===================================================================
// 3. MAIN ADMIN PAGE COMPONENT
// ===================================================================
export default function Listing() {
  const [view, setView] = useState('create'); // 'create' or 'product'
  const navigate = useNavigate();

  const activeButtonStyle = {
    padding: '10px 20px',
    cursor: 'pointer',
    border: '1px solid #f8df00',
    backgroundColor: '#f8df00',
    color: '#000',
    fontWeight: 'bold',
  };

  const inactiveButtonStyle = {
    padding: '10px 20px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    backgroundColor: 'transparent',
    color: '#fff',
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Product Management</h1>
        <div>
          <button type="button" onClick={() => navigate("/admin/dashboard")} style={inactiveButtonStyle}>
              Go to Dashboard ↗
          </button>
        </div>
      </div>

      {/* View Switcher Buttons */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => setView('create')} 
          style={view === 'create' ? activeButtonStyle : inactiveButtonStyle}
        >
          Create
        </button>
        <button 
          onClick={() => setView('product')} 
          style={view === 'product' ? activeButtonStyle : inactiveButtonStyle}
        >
          Products
        </button>
      </div>

      {/* Conditional Rendering based on view */}
      {view === 'create' ? <CreateForm /> : <ProductList />}
    </div>
  );
}