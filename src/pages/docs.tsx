import { useState } from 'react';
import { Link } from 'react-router-dom';

// --- DATA FOR OUR DOCUMENTATION TOPICS (No changes here) ---
const docTopics = {
  connect: {
    title: "Connecting Your Wallet",
    content: (
      <>
        <p>To interact with our platform, you need a Web3 wallet. We highly recommend using the official Uniswap Wallet mobile app for the best experience, available on both iOS and Android.</p>
        <p>Our platform uses WalletConnect, which allows you to securely link your mobile wallet by scanning a QR code. Please note that the Uniswap browser extension is not supported at this time.</p>
        <strong>Steps to Connect:</strong>
        <ol>
          <li>Click the "Connect Wallet" button on our site.</li>
          <li>A QR code will appear in a popup window.</li>
          <li>Open your Uniswap Wallet app on your phone.</li>
          <li>Tap the QR scanner icon (usually in the top right corner).</li>
          <li>Scan the code on your screen to establish a secure connection.</li>
        </ol>
      </>
    )
  },
  transaction: {
    title: "Understanding Transactions",
    content: (
      <>
        <p>Every purchase on our platform is a blockchain transaction that you must approve and sign directly from your wallet. This ensures you have full control over your funds.</p>
        <p>The price for each item is listed in ETH (Ethereum). The final cost in your local currency (like RM) will depend on the live exchange rate of ETH at the moment of purchase. Your wallet will show you the final cost, including a small network fee (known as a "gas fee"), before you confirm.</p>
        <strong>Key Points:</strong>
        <ul>
          <li>You are always in control. No transaction happens without your signature.</li>
          <li>Prices are denominated in ETH.</li>
          <li>A small, variable network fee is required for every transaction on the blockchain.</li>
        </ul>
      </>
    )
  },
  shipping: {
    title: "Physical Item Shipping",
    content: (
      <>
        <p>Once your blockchain transaction is successfully confirmed, a form will appear asking for your shipping details. This is a crucial step to ensure your physical apparel reaches you.</p>
        <p>Please fill out your full name, contact information, and complete shipping address accurately. After submitting, your order status will be marked as 'Pending' in your Order History.</p>
        <p>Our fulfillment team will then process your order. You can expect your physical item to be shipped and delivered within <strong>2-5 working days</strong>.</p>
      </>
    )
  },
  nft: {
    title: "Your NFT: Verifiable Ownership",
    content: (
      <>
        <p>The NFT (Non-Fungible Token) you receive is more than just a digital collectible; it is your cryptographic proof of ownership for the physical item you purchased. It is permanently recorded on the Ethereum blockchain and credited directly to the wallet address you used for the purchase.</p>
        <p>This token represents your unique claim to the item, verifying its authenticity and your place in the history of that product. You can view it in your wallet's NFT section, trade it on marketplaces, or simply hold it as a badge of authentic ownership in the phygital world.</p>
      </>
    )
  }
};

type TopicKey = keyof typeof docTopics;

export default function Docs() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('connect');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to control sidebar

  const handleTopicSelect = (key: TopicKey) => {
    setActiveTopic(key);
    setIsSidebarOpen(false); // Close sidebar after selecting a topic
  };

  return (
    <div style={containerStyle}>
      {/* --- OVERLAPPING SIDEBAR --- */}
      {isSidebarOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <aside style={{...sidebarStyle, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
          <h3 style={sidebarTitleStyle}>TOPICS</h3>
          <button style={closeButtonStyle} onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          {Object.keys(docTopics).map((key) => (
            <button
              key={key}
              onClick={() => handleTopicSelect(key as TopicKey)}
              style={activeTopic === key ? activeSidebarLinkStyle : sidebarLinkStyle}
            >
              {docTopics[key as TopicKey].title}
            </button>
          ))}
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT --- */}
      <div style={{ opacity: isSidebarOpen ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        <nav style={navStyle}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 style={logoStyle}>PHYGITAL<span style={{ color: '#f8df00' }}>.</span></h2>
          </Link>
          {/* Button to open the sidebar */}
          <button style={topicsButtonStyle} onClick={() => setIsSidebarOpen(true)}>
            ☰ Topics
          </button>
        </nav>
        <header style={{ marginBottom: '60px' }}>
          <h1 style={heroTitleStyle}>Guidance & Support</h1>
          <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '10px' }}>
            Your guide to navigating the phygital experience.
          </p>
        </header>
        <main style={contentStyle}>
          <h2 style={contentTitleStyle}>{docTopics[activeTopic].title}</h2>
          <div style={contentBodyStyle}>
            {docTopics[activeTopic].content}
          </div>
        </main>
      </div>
    </div>
  );
}

// ===================================================================
// STYLES
// ===================================================================

const containerStyle: React.CSSProperties = {
  backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '0 6% 120px 6%', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box', position: 'relative', overflowX: 'hidden'
};

const navStyle: React.CSSProperties = {
  minHeight: '110px', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '60px', width: '100%',
};

const logoStyle = { fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 };
const heroTitleStyle = { fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: '900', margin: '0', letterSpacing: '-3px' };

const topicsButtonStyle: React.CSSProperties = {
  background: '#111', color: '#888', border: '1px solid #222', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
};

// --- Sidebar Styles (Now for Overlapping) ---
const sidebarStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  width: '300px',
  maxWidth: '80vw',
  backgroundColor: '#0c0c0c',
  borderRight: '1px solid #1a1a1a',
  zIndex: 1001,
  transition: 'transform 0.3s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
};

const sidebarTitleStyle: React.CSSProperties = {
  fontSize: '0.8rem', color: '#666', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: 0
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer'
};

const sidebarLinkStyle: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left', padding: '12px 18px', marginBottom: '8px', background: 'transparent', border: 'none', color: '#888', fontSize: '1rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer',
};

const activeSidebarLinkStyle: React.CSSProperties = {
  ...sidebarLinkStyle,
  backgroundColor: 'rgba(248, 223, 0, 0.1)',
  color: '#f8df00',
};

// --- Overlay Style ---
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000,
};

// --- Content Styles ---
const contentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0, // This is still important!
};

const contentTitleStyle: React.CSSProperties = {
  fontSize: '2rem', fontWeight: '800', color: '#f8df00', margin: '0 0 25px 0', paddingBottom: '20px', borderBottom: '1px solid #1a1a1a',
};

const contentBodyStyle: React.CSSProperties = {
  color: '#aaa', fontSize: '1rem', lineHeight: '1.7',
};