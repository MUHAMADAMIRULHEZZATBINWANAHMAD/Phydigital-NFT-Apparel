import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import MyConnectButton from "../../assets/components/connectbutton";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { claimTo } from "thirdweb/extensions/erc721";
import { getContract, createThirdwebClient } from "thirdweb";
import { sepolia } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: "2b0023810373344471b9343f003fbba8",
});

export default function Catalog() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);
  
  // Blockchain Transaction UI State
  const [txHash, setTxHash] = useState<string | null>(null);

  // --- NEW SHIPPING & DB STATES ---
  const [purchasedItem, setPurchasedItem] = useState<any>(null);
  const [shippingSubmitted, setShippingSubmitted] = useState(false);
  const [shippingData, setShippingData] = useState({ fullName: '', email: '', address: '', phone: '' });

  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending: isTxPending } = useSendTransaction();

  useEffect(() => {
    fetch("https://phydigital-nft-apparel.onrender.com/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setListings(data.listings);
        }
      })
      .catch((err) => console.error("Catalog asset fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleBuyNow = async (item: any) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setBuyingItemId(item.id);
      setTxHash(null);

      const contract = getContract({
        client,
        address: import.meta.env.VITE_CONTRACT_ADDRESS || "0xe2E14c2351f3C19D1aaE477525c4D38B7FD325b0",
        chain: sepolia,
      });
      
      const tx = claimTo({
        contract,
        to: account.address,
        quantity: BigInt(1),
      });

      sendTransaction(tx as any, {
        onSuccess: (receipt: any) => {
          setTxHash(receipt.transactionHash || receipt);
          setPurchasedItem(item); // Save the item data for backend
          setShippingSubmitted(false); // Reset form visibility
          console.log("✅ NFT claimed! Tx:", receipt);
          setBuyingItemId(null);
        },
        onError: (error: any) => {
          console.error("❌ Claim failed:", error);
          alert("Purchase failed. See console for details.");
          setBuyingItemId(null);
        },
      });
    } catch (error) {
      console.error("Error initiating purchase:", error);
      setBuyingItemId(null);
    }
  };

  // --- SUBMIT COMPLETED ORDER TO BACKEND ---
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !txHash || !purchasedItem) return;

    try {
      const res = await fetch("https://phydigital-nft-apparel.onrender.com/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: account.address,
          transaction_hash: txHash,
          full_name: shippingData.fullName,
          email: shippingData.email,
          shipping_address: shippingData.address,
          phone_number: shippingData.phone,
          item_name: purchasedItem.name,
          item_image: purchasedItem.image_url,
          amount: purchasedItem.price
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShippingSubmitted(true); // Move to the ultimate success screen
      } else {
        alert("Failed to save shipping details: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend");
    }
  };

  return (
    <div style={containerStyle}>
      {/* --- RESPONSIVE BRAND NAVIGATION --- */}
      <nav style={navStyle}>
        <h2 style={logoStyle}>PHYGITAL<span style={{ color: '#f8df00' }}>.</span></h2>
        <div style={navRightSideStyle}>
          <Link to="/customer/order-history" style={linkStyle}>Order History</Link>
          <MyConnectButton />
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ marginBottom: '60px' }}>
        <h1 style={heroTitleStyle}>Latest Drops</h1>
      </header>

      {/* --- ASSET GRID --- */}
      {loading ? (
        <div style={loaderStyle}>Syncing takes a minute...</div>
      ) : (
        <div style={gridStyle}>
          {listings.map((item) => (
            <div key={item.id} style={cardStyle}>
              {/* Asset Media Frame */}
              <div style={imageContainerStyle}>
                <img src={item.image_url} alt={item.name} style={productImageStyle} />
                <div style={badgeStyle}>Verified Phygital</div>
              </div>

              {/* Asset Meta Box */}
              <div style={metaContainerStyle}>
                <div style={titlePriceRowStyle}>
                  <h3 style={itemTitleStyle}>{item.name}</h3>
                  <span style={priceTagStyle}>{item.price} ETH</span>
                </div>
                <p style={descriptionStyle}>{item.description}</p>
                
                <div style={dividerStyle} />

                {/* --- PURCHASE BUTTON (ALIGNED RIGHT ABOVE PROVENANCE) --- */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                  <button
                    onClick={() => handleBuyNow(item)}
                    style={{
                      ...buyButtonStyle,
                      opacity: buyingItemId === item.id && isTxPending ? 0.7 : 1,
                      cursor: buyingItemId === item.id && isTxPending ? 'not-allowed' : 'pointer',
                    }}
                    disabled={buyingItemId === item.id && isTxPending}
                  >
                    {buyingItemId === item.id && isTxPending ? 'Process..' : 'Purchase'}
                  </button>
                </div>

                {/* --- PROVENANCE SECTION --- */}
                <div style={provenanceSectionStyle}>
                  <div 
                    style={qrWrapperStyle} 
                    onClick={() => setSelectedTx(item.transaction_hash)}
                    title="Inspect Provenance Details"
                  >
                    <QRCodeSVG 
                      value={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`} 
                      size={50} 
                      bgColor="transparent" 
                      fgColor="#fff" 
                    />
                  </div>
                  <div>
                    <span style={provenanceLabelStyle}>ASSET PROVENANCE</span>
                    <button 
                      onClick={() => setSelectedTx(item.transaction_hash)} 
                      style={popupTriggerStyle}
                    >
                      Inspect Ledger 
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- REFACTORED QR POPUP MODAL --- */}
      {selectedTx && (
        <div style={modalOverlayStyle} onClick={() => setSelectedTx(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f8df00', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                NFT
              </h3>
              <button style={closeBtnStyle} onClick={() => setSelectedTx(null)}>✕</button>
            </div>
            
            <div style={dividerStyle} />
            
            <div style={modalQrContainerStyle}>
              <div style={modalQrWrapperStyle}>
                <QRCodeSVG 
                  value={`https://sepolia.etherscan.io/tx/${selectedTx}`} 
                  size={180}
                  bgColor="transparent" 
                  fgColor="#fff" 
                />
              </div>
              
              <a 
                href={`https://sepolia.etherscan.io/tx/${selectedTx}`} 
                target="_blank" 
                rel="noreferrer" 
                style={modalExplorerLinkStyle}
              >
                View Etherscan Core Explorer ↗
              </a>
            </div>

            <div style={dividerStyle} />
            
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <span style={provenanceLabelStyle}>TRANSACTION HASH RECORD</span>
              <p style={{ color: '#555', margin: '4px 0 0 0', fontSize: '0.8rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {selectedTx}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- SHIPPING INFO MODAL --- */}
      {txHash && purchasedItem && !shippingSubmitted && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ margin: 0, color: '#f8df00', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
              Shipping Details Required
            </h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>
              Blockchain transaction successful! Please provide a destination for your physical asset.
            </p>

            <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" required placeholder="Full Name" 
                value={shippingData.fullName} onChange={(e) => setShippingData({...shippingData, fullName: e.target.value})}
                style={inputStyle} 
              />
              <input 
                type="email" required placeholder="Email Address" 
                value={shippingData.email} onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                style={inputStyle} 
              />
              <input 
                type="tel" required placeholder="Phone Number" 
                value={shippingData.phone} onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                style={inputStyle} 
              />
              <textarea 
                required placeholder="Full Shipping Address" 
                value={shippingData.address} onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} 
              />
              <button type="submit" style={{ ...buyButtonStyle, width: '100%', marginTop: '10px' }}>
                Secure physical delivery
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TRANSACTION SUCCESS OVERVIEW MODAL --- */}
      {txHash && shippingSubmitted && (
        <div style={modalOverlayStyle} onClick={() => setTxHash(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#00d084', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                 Order Logged
              </h3>
              <button style={closeBtnStyle} onClick={() => setTxHash(null)}>✕</button>
            </div>
            
            <div style={dividerStyle} />
            
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '15px' }}>
                The asset has been digitally claimed and physical fulfillment is pending.
              </p>
              <a 
                href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noreferrer" 
                style={modalExplorerLinkStyle}
              >
                View Transaction on Etherscan ↗
              </a>
            </div>

            <div style={dividerStyle} />
            
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button 
                onClick={() => setTxHash(null)}
                style={{ ...buyButtonStyle, width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// STYLES MATRIX
// ===================================================================

const containerStyle: React.CSSProperties = {
  backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '0 6% 120px 6%', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box',
};

const navStyle: React.CSSProperties = {
  minHeight: '110px', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '60px', width: '100%',
};

const logoStyle = { fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 };
const navRightSideStyle = { display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' as const };
const linkStyle = { color: '#888', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' };
const heroTitleStyle = { fontSize: 'clamp(3rem, 10vw, 5.5rem)', fontWeight: '900', margin: '0', letterSpacing: '-3px' };
const loaderStyle = { textAlign: 'center' as const, padding: '100px 0', color: '#444', letterSpacing: '2px', fontWeight: '800' };

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '40px', width: '100%',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', borderRadius: '28px', border: '1px solid #1a1a1a', overflow: 'hidden', display: 'flex', flexDirection: 'column',
};

const imageContainerStyle: React.CSSProperties = { position: 'relative', width: '100%', height: '340px', backgroundColor: '#111' };
const productImageStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const badgeStyle: React.CSSProperties = { position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(12px)', color: '#fff', padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' };

const metaContainerStyle: React.CSSProperties = { padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 };
const titlePriceRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' };
const itemTitleStyle = { fontSize: '1.4rem', fontWeight: '800', margin: '0', color: '#fff' };
const priceTagStyle = { fontSize: '1.1rem', fontWeight: '800', color: '#f8df00' };
const descriptionStyle = { color: '#666', fontSize: '0.9rem', margin: '0 0 20px 0', lineHeight: '1.5' };
const dividerStyle = { height: '1px', backgroundColor: '#1a1a1a', marginBottom: '20px' };

const provenanceSectionStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#111', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.02)'
};

const qrWrapperStyle = {
  padding: '6px', backgroundColor: '#151515', borderRadius: '10px', border: '1px solid #222', display: 'inline-flex', cursor: 'pointer'
};

const provenanceLabelStyle = { display: 'block', fontSize: '0.6rem', color: '#444', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' as const };

const popupTriggerStyle = { background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer', padding: 0, marginTop: '2px', textDecoration: 'underline' };

const buyButtonStyle: React.CSSProperties = {
  padding: '8px 24px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '100px', fontWeight: '800', transform: 'scale(1)', transition: 'transform 0.2s', letterSpacing: '0.5px'
};

// --- MODAL STYLES ---
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', border: '1px solid #222', padding: '40px', borderRadius: '28px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', textAlign: 'left'
};

const modalQrContainerStyle = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '20px', padding: '20px 0' };
const modalQrWrapperStyle = { padding: '15px', backgroundColor: '#151515', borderRadius: '20px', border: '1px solid #222', display: 'inline-flex' };
const closeBtnStyle = { background: 'none', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer' };

const modalExplorerLinkStyle = {
  display: 'inline-block', color: '#00a6ff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', padding: '8px 16px', backgroundColor: 'rgba(0, 166, 255, 0.1)', borderRadius: '100px'
};

// --- FORM STYLES ---
const inputStyle: React.CSSProperties = {
  backgroundColor: '#111', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '8px', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box'
};