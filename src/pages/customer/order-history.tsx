import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import MyConnectButton from "../../assets/components/connectbutton";
import { useActiveAccount } from "thirdweb/react";

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const account = useActiveAccount();
  
  // Modal State Management
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  useEffect(() => {
    if (account?.address) {
      setLoading(true);
      fetch(`https://phydigital-nft-apparel.onrender.com/shipping-orders?wallet_address=${account.address}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setOrders(data.orders);
        })
        .catch((err) => console.error("History fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [account?.address]);

  return (
    <div style={containerStyle}>
      {/* --- RESPONSIVE BRAND NAVIGATION --- */}
      <nav style={navStyle}>
        <h2 style={logoStyle}>PHYGITAL<span style={{ color: '#f8df00' }}>.</span></h2>
        <div style={navRightSideStyle}>
          <Link to="/customer/catalog" style={linkStyle}>← Back to Catalog</Link>
          <MyConnectButton />
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ marginBottom: '60px' }}>
        <h1 style={heroTitleStyle}>Order History</h1>
        <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '10px' }}>
          Track your premium phygital asset fulfillment updates.
        </p>
      </header>

      {/* --- ORDER ARCHIVE LIST --- */}
      {!account ? (
        <div style={loaderStyle}>Connect your wallet to review order status archive ledger.</div>
      ) : loading ? (
        <div style={loaderStyle}>Retrieving provenance files...</div>
      ) : orders.length === 0 ? (
        <div style={loaderStyle}>No orders found under this secure account wallet signature.</div>
      ) : (
        <div style={listContainerStyle}>
          {orders.map((order) => (
            <div key={order.id} style={cardStyle}>
              {/* Product Visual */}
              <div style={imageWrapperStyle}>
                <img src={order.item_image} alt={order.item_name} style={imageStyle} />
              </div>

              {/* Content and Alignment Block */}
              <div style={infoContainerStyle}>
                <div style={metaHeaderStyle}>
                  <h3 style={itemTitleStyle}>{order.item_name}</h3>
                  <div style={{
                    ...statusBadgeStyle,
                    backgroundColor: order.status === 'Completed' ? '#2ecc71' : '#e67e22'
                  }}>
                    Status: {order.status}
                  </div>
                </div>

                <div style={dividerStyle} />

                <div style={detailRowStyle}>
                  <span style={labelStyle}>SHIPPING TO</span>
                  <p style={dataStyle}>{order.full_name}</p>
                </div>

                <div style={detailRowStyle}>
                  <span style={labelStyle}>DELIVERY LOCATION</span>
                  <p style={dataStyle}>{order.shipping_address}</p>
                </div>

                {/* --- LEFT ALIGNED QR SECTION WITH BLUE LINK --- */}
                <div style={leftAlignedQrContainer}>
                  <div 
                    style={qrWrapperStyle} 
                    onClick={() => setSelectedTx(order.transaction_hash)}
                    title="Click for full breakdown details"
                  >
                    <QRCodeSVG 
                      value={`https://sepolia.etherscan.io/tx/${order.transaction_hash}`} 
                      size={60} 
                      bgColor="transparent" 
                      fgColor="#fff" 
                    />
                  </div>
                  <div>
                    <span style={receiptLabelStyle}>Cryptographic Receipt</span>
                    <button onClick={() => setSelectedTx(order.transaction_hash)} style={popupTriggerLink}>
                    </button>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${order.transaction_hash}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={explorerLinkStyle}
                    >
                      View Etherscan Core Explorer ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PREMIUM TRANSACTIONS MODAL POPUP --- */}
      {selectedTx && (
        <div style={modalOverlayStyle} onClick={() => setSelectedTx(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f8df00', fontSize: '1.4rem' }}>Receipt Identity Token</h3>
              <button style={closeBtnStyle} onClick={() => setSelectedTx(null)}>✕</button>
            </div>
            <div style={dividerStyle} />
            
            <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
              <div>
                <span style={labelStyle}>CHAIN NETWORK</span>
                <p style={{ color: '#fff', margin: '4px 0' }}>Ethereum Sepolia Testnet Node</p>
              </div>
              <div>
                <span style={labelStyle}>PROVENANCE SECURE LINK</span>
                <p style={{ color: '#aaa', margin: '4px 0', fontSize: '0.85rem', wordBreak: 'break-all' }}>{selectedTx}</p>
              </div>
              <div>
                <span style={labelStyle}>VALIDATION PROTOCOL</span>
                <p style={{ color: '#2ecc71', margin: '4px 0', fontWeight: 'bold' }}>✓ DEPLOYED & SIGNED VIA LAZY MINT</p>
              </div>
            </div>
            
            <a 
              href={`https://sepolia.etherscan.io/tx/${selectedTx}`} 
              target="_blank" 
              rel="noreferrer" 
              style={modalActionBtnStyle}
            >
              EXTERNAL EXPLORER RECORD
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// CORE DESIGN MATRIX WITH MODAL LAYERS
// ===================================================================

const containerStyle: React.CSSProperties = {
  backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '0 6% 120px 6%', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box',
};

const navStyle: React.CSSProperties = {
  minHeight: '110px', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '60px', width: '100%',
};

const logoStyle = { fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, flexShrink: 0 };
const navRightSideStyle = { display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' as const };
const linkStyle = { color: '#888', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' };
const heroTitleStyle = { fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: '900', margin: '0', letterSpacing: '-3px', textTransform: 'uppercase' as const };
const listContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' };

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', borderRadius: '24px', border: '1px solid #1a1a1a', display: 'flex', flexWrap: 'wrap' as const, padding: '30px', gap: '30px', alignItems: 'flex-start',
};

const imageWrapperStyle: React.CSSProperties = { width: '140px', height: '140px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 };
const imageStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const infoContainerStyle: React.CSSProperties = { flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column' };
const metaHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '15px' };
const itemTitleStyle = { fontSize: '1.6rem', fontWeight: '700', margin: '0', color: '#f8df00' };
const statusBadgeStyle = { padding: '6px 14px', borderRadius: '100px', color: '#000', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' as const };
const dividerStyle = { height: '1px', backgroundColor: '#1a1a1a', margin: '16px 0' };
const detailRowStyle = { marginBottom: '14px' };
const labelStyle = { display: 'block', fontSize: '0.65rem', color: '#444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };
const dataStyle = { margin: '4px 0 0 0', fontSize: '0.95rem', color: '#aaa', fontWeight: '500' };

const leftAlignedQrContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginTop: '15px',
  padding: '15px',
  backgroundColor: '#111',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.02)',
  width: '100%',
  maxWidth: '450px',
};

const qrWrapperStyle = {
  padding: '8px', backgroundColor: '#151515', borderRadius: '10px', border: '1px solid #222', display: 'inline-block', cursor: 'pointer', transition: 'transform 0.2s',
};

const receiptLabelStyle: React.CSSProperties = { display: 'block', fontSize: '0.65rem', color: '#444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };
const popupTriggerLink = { background: 'none', border: 'none', color: '#f8df00', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', padding: 0, display: 'block', marginTop: '4px', textAlign: 'left' as const };
const loaderStyle = { textAlign: 'center' as const, padding: '100px 0', color: '#444', letterSpacing: '2px', fontWeight: '800' };

// CUSTOM BLUE HYPERLINK MATRIX RULES
const explorerLinkStyle = { 
  color: '#00a6ff', 
  textDecoration: 'none', 
  fontSize: '0.8rem', 
  fontWeight: '600', 
  display: 'block', 
  marginTop: '4px',
  transition: 'color 0.2s ease'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', border: '1px solid #222', padding: '40px', borderRadius: '28px', width: '90%', maxWidth: '500px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
};

const closeBtnStyle = { background: 'none', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer' };
const modalActionBtnStyle: React.CSSProperties = {
  display: 'block', textAlign: 'center', backgroundColor: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '12px', marginTop: '30px', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '1px',
};