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
    fetch("http://localhost:3001/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setListings(data.listings);
      })
      .catch((err) => console.error("Failed to fetch listings:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ marginTop: "40px" }}>
      <h2 style={sectionHeaderStyle}>Inventory Archive</h2>
      {loading ? (
        <p style={loaderStyle}>Loading collection...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100%, 1fr))", gap: "25px" }}>
          {listings.map((item) => (
            <div key={item.id} style={cardStyle}>
              <img src={item.image_url} alt={item.name} style={thumbStyle} />
              <div style={{ flex: 1 }}>
                <h3 style={itemTitleStyle}>{item.name}</h3>
                <p style={descriptionStyle}>{item.description}</p>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                   <p style={statStyle}><span style={labelStyle}>Price:</span> {item.price} ETH</p>
                   <p style={statStyle}><span style={labelStyle}>Supply:</span> {item.supply}</p>
                </div>
              </div>
              <div style={qrContainerStyle}>
                <div style={qrWrapperStyle}>
                  <QRCodeSVG value={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} size={80} bgColor="transparent" fgColor="#fff" />
                </div>
                <a href={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} target="_blank" rel="noreferrer" style={goldLinkStyle}>View Tx ↗</a>
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
    const form = e.currentTarget;
    const formData = new FormData(form);
    const attributes = [{ trait_type: "Color", value: color }, { trait_type: "Country", value: country }, { trait_type: "Value", value: value }];
    formData.append("attributes", JSON.stringify(attributes));

    try {
      const res = await fetch("http://localhost:3001/mint", { method: "POST", body: formData });
      const data = await res.json();
      setResponse(data);
      if(data.success) form.reset();
    } catch (err: any) {
      setResponse({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "40px", display: 'flex', justifyContent: 'center' }}>
      <div style={formCardStyle}>
        <h2 style={sectionHeaderStyle}>Register Physical Asset</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Upload item details to generate a blockchain-verified listing.</p>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <input name="name" placeholder="Shirt Name" required style={inputStyle} />
          <textarea name="description" placeholder="Item Narrative / Description" required style={{...inputStyle, height: '100px'}} />
          <div style={{ display: 'flex', gap: '15px' }}>
            <input name="supply" type="number" placeholder="Supply" defaultValue="100" style={inputStyle} />
            <input name="price" type="number" step="0.0001" placeholder="Price (ETH)" style={inputStyle} />
          </div>
          <input placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} style={inputStyle} />
          <input placeholder="Manufacturing Origin" value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle} />
          <input placeholder="Rarity Value (e.g. Premium)" value={value} onChange={(e) => setValue(e.target.value)} style={inputStyle} />
          
          <div style={fileInputContainer}>
             <label style={labelStyle}>Product Image</label>
             <input type="file" name="image" accept="image/*" required style={{ color: '#888' }} />
          </div>

          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? "AUTHENTICATING..." : "CREATE LISTING"}
          </button>
        </form>

        {response && (
          <div style={{ marginTop: "20px", color: response.success ? "#2ecc71" : "#e74c3c" }}>
            {response.success ? "✓ Asset successfully lazy-minted." : `Error: ${response.error}`}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================================================================
// 3. MAIN ADMIN PAGE
// ===================================================================
export default function Listing() {
  const [view, setView] = useState('create');
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <nav style={navStyle}>
        <h2 style={logoStyle}>PHYGITAL<span style={{ color: '#f8df00' }}>.</span></h2>
        <button onClick={() => navigate("/admin/dashboard")} style={secondaryButtonStyle}>
           SALES ↗
        </button>
      </nav>

      <div style={tabHeaderStyle}>
        <h1 style={heroTitleStyle}>Product Management</h1>
        <div style={tabContainerStyle}>
           <button onClick={() => setView('create')} style={view === 'create' ? activeTabStyle : inactiveTabStyle}>CREATE</button>
           <button onClick={() => setView('product')} style={view === 'product' ? activeTabStyle : inactiveTabStyle}>PRODUCTS</button>
        </div>
      </div>

      {view === 'create' ? <CreateForm /> : <ProductList />}
    </div>
  );
}

// ===================================================================
// SHARED PREMIUM STYLES
// ===================================================================
const containerStyle: React.CSSProperties = {
  backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '0 6% 100px 6%', fontFamily: '"Inter", sans-serif',
};

const navStyle: React.CSSProperties = {
  height: '100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a1a', marginBottom: '40px',
};

const logoStyle = { fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-1px' };

const tabHeaderStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px'
};

const heroTitleStyle = { fontSize: '3.5rem', fontWeight: '900', margin: '0', letterSpacing: '-2px' };

const tabContainerStyle = { backgroundColor: '#0c0c0c', padding: '6px', borderRadius: '14px', border: '1px solid #1a1a1a' };

const activeTabStyle = { padding: '10px 25px', backgroundColor: '#f8df00', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' };

const inactiveTabStyle = { padding: '10px 25px', backgroundColor: 'transparent', color: '#666', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' };

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', borderRadius: '24px', padding: '25px', border: '1px solid #1a1a1a', display: 'flex', gap: '25px', alignItems: 'center'
};

const thumbStyle = { width: "120px", height: "120px", objectFit: "cover" as const, borderRadius: "12px" };

const itemTitleStyle = { fontSize: '1.4rem', fontWeight: '700', color: '#f8df00', margin: '0 0 5px 0' };

const descriptionStyle = { color: '#888', fontSize: '0.9rem', margin: '0' };

const labelStyle = { fontSize: '0.65rem', color: '#444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };

const statStyle = { margin: '0', fontSize: '0.9rem', color: '#fff' };

const qrContainerStyle: React.CSSProperties = { textAlign: 'center', paddingLeft: '25px', borderLeft: '1px solid #1a1a1a' };

const qrWrapperStyle = { padding: '8px', backgroundColor: '#151515', borderRadius: '10px', border: '1px solid #222' };

const goldLinkStyle = { color: '#f8df00', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600', marginTop: '8px', display: 'block' };

const formCardStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', padding: '50px', borderRadius: '30px', border: '1px solid #1a1a1a', width: '100%', maxWidth: '600px'
};

const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };

const inputStyle = {
  backgroundColor: '#111', border: '1px solid #222', color: '#fff', padding: '14px', borderRadius: '12px', outline: 'none', fontSize: '0.9rem'
};

const primaryButtonStyle = {
  padding: '16px', backgroundColor: '#fff', color: '#000', borderRadius: '14px', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '10px'
};

const secondaryButtonStyle = {
  padding: '10px 20px', backgroundColor: 'transparent', color: '#888', borderRadius: '10px', border: '1px solid #222', cursor: 'pointer', fontWeight: '600'
};

const sectionHeaderStyle = { fontSize: '1.8rem', fontWeight: '800', margin: '0 0 10px 0' };

const fileInputContainer = { backgroundColor: '#151515', padding: '15px', borderRadius: '12px', border: '1px dashed #333' };

const loaderStyle = { textAlign: 'center' as const, padding: '100px', color: '#444', letterSpacing: '2px', fontWeight: '800' };