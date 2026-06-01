import { useState } from 'react';
import { Link } from 'react-router-dom';

// --- DATA FOR OUR DOCUMENTATION TOPICS ---
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

// --- FINAL, CORRECTED COMPONENT ---
export default function Docs() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('connect');

  const finalMediaQuery = `
    @media (max-width: 820px) {
      #docs-layout {
        flex-direction: column;
        gap: 40px;
      }
      #docs-sidebar {
        flex-basis: auto;
        border-right: none;
        padding-right: 0;
        border-bottom: 1px solid #1a1a1a;
        padding-bottom: 30px;
      }
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{finalMediaQuery}</style>
      <nav style={navStyle}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 style={logoStyle}>PHYGITAL<span style={{ color: '#f8df00' }}>.</span></h2>
        </Link>
        <Link to="/" style={linkStyle}>← Back</Link>
      </nav>
      <header style={{ marginBottom: '60px' }}>
        <h1 style={heroTitleStyle}>Guidance & Support</h1>
        <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '10px' }}>
          Your guide to navigating the phygital experience.
        </p>
      </header>
      <div id="docs-layout" style={mainLayoutStyle}>
        <aside id="docs-sidebar" style={sidebarStyle}>
          <h3 style={sidebarTitleStyle}>TOPICS</h3>
          {Object.keys(docTopics).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTopic(key as TopicKey)}
              style={activeTopic === key ? activeSidebarLinkStyle : sidebarLinkStyle}
            >
              {docTopics[key as TopicKey].title}
            </button>
          ))}
        </aside>
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
// STYLES (CONSISTENT WITH YOUR APP'S DESIGN)
// ===================================================================

const containerStyle: React.CSSProperties = {
  backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '0 6% 120px 6%', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box',
};

const navStyle: React.CSSProperties = {
  minHeight: '110px', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '60px', width: '100%',
};

const logoStyle = { fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 };
const linkStyle = { color: '#888', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' };
const heroTitleStyle = { fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: '900', margin: '0', letterSpacing: '-3px' };

const mainLayoutStyle: React.CSSProperties = {
  display: 'flex',
  gap: '60px',
  flexDirection: 'row',
};

const sidebarStyle: React.CSSProperties = {
  flex: '0 0 250px',
  borderRight: '1px solid #1a1a1a',
  paddingRight: '40px',
};

const sidebarTitleStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#444',
  fontWeight: '900',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '20px',
};

const sidebarLinkStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '12px 18px',
  marginBottom: '8px',
  background: 'transparent',
  border: 'none',
  color: '#888',
  fontSize: '0.9rem',
  fontWeight: '600',
  borderRadius: '8px',
  cursor: 'pointer',
};

const activeSidebarLinkStyle: React.CSSProperties = {
  ...sidebarLinkStyle,
  backgroundColor: 'rgba(248, 223, 0, 0.1)',
  color: '#f8df00',
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '0',
};

const contentTitleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: '800',
  color: '#f8df00',
  margin: '0 0 25px 0',
  paddingBottom: '20px',
  borderBottom: '1px solid #1a1a1a',
};

const contentBodyStyle: React.CSSProperties = {
  color: '#aaa',
  fontSize: '1rem',
  lineHeight: '1.7',
};