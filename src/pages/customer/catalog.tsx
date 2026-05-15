import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import MyConnectButton from "../../assets/components/connectbutton";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { claimTo } from "thirdweb/extensions/erc721";
import { getContract, createThirdwebClient, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: "2b0023810373344471b9343f003fbba8",
});

export default function Catalog() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending: isTxPending } = useSendTransaction();

  useEffect(() => {
    fetch("http://localhost:3001/listings")
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
        address: process.env.REACT_APP_CONTRACT_ADDRESS || "0xe2E14c2351f3C19D1aaE477525c4D38B7FD325b0",
        chain: sepolia,
      });

      // Prepare the claim transaction
      const tx = prepareContractCall({
        contract,
        method: "function claim(address to, uint256 tokenId, uint256 quantity, address currencyAddress, uint256 pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency, uint256 startTime, uint256 endTime, bytes32 merkleRoot, uint128 maxClaimableSupply, uint256 supplyClaimed, uint256 quantityClaimed) data, bytes signature)",
        params: [
          account.address,
          BigInt(item.token_id || 0),
          BigInt(1),
          "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          BigInt(item.price_wei || 0),
        ],
      });

      sendTransaction(tx as any, {
        onSuccess: (receipt: any) => {
          setTxHash(receipt);
          console.log("✅ NFT claimed! Tx:", receipt);
          setBuyingItemId(null);
        },
        onError: (error: any) => {
          console.error("❌ Claim failed:", error);
          setBuyingItemId(null);
        },
      });
    } catch (error) {
      console.error("Error initiating purchase:", error);
      setBuyingItemId(null);
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
        <div style={loaderStyle}>Synchronizing item drop matrix...</div>
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

                {/* --- PROVENANCE & BUY SECTION --- */}
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
                      Inspect Item Ledger 🔍
                    </button>
                  </div>
                  <button
                    onClick={() => handleBuyNow(item)}
                    style={{
                      ...buyButtonStyle,
                      opacity: buyingItemId === item.id && isTxPending ? 0.7 : 1,
                      cursor: buyingItemId === item.id && isTxPending ? 'not-allowed' : 'pointer',
                    }}
                    disabled={buyingItemId === item.id && isTxPending}
                  >
                    {buyingItemId === item.id && isTxPending ? 'Processing...' : 'Buy Now'}
                  </button>
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
                Provenance Token
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

      {/* --- TRANSACTION SUCCESS MODAL --- */}
      {txHash && (
        <div style={modalOverlayStyle} onClick={() => setTxHash(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#00d084', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                ✅ Purchase Complete
              </h3>
              <button style={closeBtnStyle} onClick={() => setTxHash(null)}>✕</button>
            </div>
            
            <div style={dividerStyle} />
            
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '15px' }}>
                Your NFT has been successfully claimed!
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
const popupTriggerStyle = { background: 'none', border: 'none', color: '#f8df00', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', padding: 0, display: 'block', marginTop: '3px', textAlign: 'left' as const };

const buyButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f8df00 0%, #ffd700 100%)',
  border: 'none',
  color: '#000',
  fontSize: '0.85rem',
  fontWeight: '800',
  cursor: 'pointer',
  padding: '8px 16px',
  borderRadius: '8px',
  marginLeft: 'auto',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
};

const loaderStyle = { textAlign: 'center' as const, padding: '120px 0', color: '#444', letterSpacing: '2px', fontWeight: '800' };

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', border: '1px solid #222', padding: '35px', borderRadius: '28px', width: '90%', maxWidth: '440px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
};

const closeBtnStyle = { background: 'none', border: 'none', color: '#555', fontSize: '1.1rem', cursor: 'pointer', transition: 'color 0.2s' };

const modalQrContainerStyle = {
  display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '30px 0 25px 0',
};

const modalQrWrapperStyle = {
  padding: '14px', backgroundColor: '#151515', borderRadius: '18px', border: '1px solid #222', marginBottom: '20px', display: 'inline-flex',
};

const modalExplorerLinkStyle = {
  color: '#00a6ff',
  textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px', transition: 'opacity 0.2s',
};