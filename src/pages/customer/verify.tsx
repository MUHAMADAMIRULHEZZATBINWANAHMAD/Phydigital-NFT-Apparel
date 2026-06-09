import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Verify() {
  const { txHash } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`https://phydigital-nft-apparel.onrender.com/verify/${txHash}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecord(data.record);
        } else {
          setError(data.error);
        }
      })
      .catch((err) => setError("Failed to connect to verification server."))
      .finally(() => setLoading(false));
  }, [txHash]);

  if (loading) return <div style={fullScreenCenter}><h3>Authenticating Asset...</h3></div>;
  if (error || !record) return <div style={fullScreenCenter}><h3 style={{ color: '#e74c3c' }}>Verification Failed</h3><p>{error || "Record not found"}</p></div>;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#f8df00', margin: '0', letterSpacing: '2px' }}>CERTIFICATE OF AUTHENTICITY</h2>
          <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Verified Phygital Asset</p>
        </div>

        <img src={record.item_image} alt="Asset" style={imageStyle} />
        
        <h1 style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.8rem' }}>{record.item_name}</h1>
        
        <div style={dataBlock}>
          <span style={labelStyle}>OWNER IDENTITY</span>
          <p style={valueStyle}>{record.full_name}</p>
        </div>

        <div style={dataBlock}>
          <span style={labelStyle}>OWNER WALLET</span>
          <p style={{...valueStyle, wordBreak: 'break-all', fontSize: '0.85rem'}}>{record.wallet_address}</p>
        </div>

        <div style={dataBlock}>
          <span style={labelStyle}>CONTACT INFO</span>
          <p style={valueStyle}>{record.phone_number}</p>
        </div>

        <div style={{ ...dataBlock, backgroundColor: '#111', border: '1px solid #333' }}>
          <span style={{...labelStyle, color: '#f8df00'}}>BLOCKCHAIN PROVENANCE HASH</span>
          <p style={{...valueStyle, wordBreak: 'break-all', fontSize: '0.8rem', color: '#fff'}}>{record.transaction_hash}</p>
          <a href={`https://sepolia.etherscan.io/tx/${record.transaction_hash}`} target="_blank" rel="noreferrer" style={linkStyle}>
            View Original Mint Record ↗
          </a>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link to="/" style={{ color: '#f8df00', textDecoration: 'none', fontWeight: 'bold' }}>PHYGITAL SUNDAY CLOTHING</Link>
      </div>
    </div>
  );
}

// --- Styles ---
const fullScreenCenter = { backgroundColor: '#050505', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', fontFamily: '"Inter", sans-serif' };
const containerStyle = { backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", sans-serif' };
const cardStyle = { backgroundColor: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: '24px', padding: '30px', maxWidth: '450px', margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' };
const imageStyle = { width: '100%', height: 'auto', borderRadius: '16px', border: '1px solid #222' };
const dataBlock = { marginBottom: '20px', backgroundColor: '#151515', padding: '15px', borderRadius: '12px' };
const labelStyle = { display: 'block', fontSize: '0.65rem', color: '#666', fontWeight: '900', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '5px' };
const valueStyle = { margin: '0', fontSize: '1.1rem', color: '#e0e0e0', fontWeight: '700' };
const linkStyle = { color: '#00a6ff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600', display: 'block', marginTop: '10px' };