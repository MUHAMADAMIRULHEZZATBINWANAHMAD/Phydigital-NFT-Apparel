import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Mint from "./pages/admin/listing"; 
import Catalog from "./pages/customer/catalog"; 
import OrderHistory from "./pages/customer/order-history"; 
import SalesDashboard from "./pages/admin/sales-dashboard";

// --- IMPORT YOUR MODULAR UI-VERSE BUTTON COMPONENT ---
import Button from "./assets/components/button"; 

// --- IMPORT YOUR HERO IMAGE ---
// Make sure to save the image you attached in the assets folder!
import heroImage from "./assets/hero-image.png"; 

// --- FLUID ADAPTIVE HOME COMPONENT ---
function Home() {
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    const pin = window.prompt("Please note: admin panel works best on desktop. Enter Admin PIN:");
    
    if (pin === "0101") {
      navigate("/admin/listing");
    } else if (pin !== null) { // If they didn't press cancel
      alert("Access Denied: Incorrect PIN.");
    }
  };

  return (
    <div style={homeContainerStyle}>
      {/* 
        Injecting a scoped style block to handle the responsive layout via media queries.
        Mobile defaults to `column-reverse` (Image top, Text bottom).
        Desktop switches to `row` (Text left, Image right).
      */}
      <style>{`
        .hero-layout {
          display: flex;
          flex-direction: column-reverse; /* MOBILE: Text bottom, Image top */
          width: 100%;
          gap: 80px; /* <-- INCREASED GAP FOR MOBILE */
          align-items: center;
        }
        .hero-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        .hero-img-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .hero-img-container img {
          width: 100%;
          max-width: 500px; /* Keep mobile image contained */
          height: auto;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(248, 223, 0, 0.15);
        }

        /* DESKTOP STYLES (Applies when screen width is > 768px) */
        @media (min-width: 768px) {
          .hero-layout {
            flex-direction: row; /* DESKTOP: Text left, Image right */
            justify-content: space-between;
            align-items: center;
          }
          .hero-text {
            flex: 1;
            padding-right: 20px;
          }
          .hero-img-container {
            flex: 1.2; /* <-- GIVES IMAGE CONTAINER MORE SPACE ON DESKTOP */
            justify-content: flex-end; 
          }
          .hero-img-container img {
            max-width: 800px; /* <-- MAKES THE IMAGE MUCH BIGGER ON DESKTOP */
            width: 100%;
          }
        }
      `}</style>

      {/* Brand Header */}
      <nav style={homeNavStyle}>
        <h2 style={logoStyle}>PHYDIGITAL<span style={{ color: '#f8df00' }}>.</span></h2>
      </nav>

      {/* Main Feature Layout */}
      <div style={homeContentStyle}>
        <div className="hero-layout">
          
          {/* TEXT CONTENT (Left on Desktop, Bottom on Mobile) */}
          <div className="hero-text">
            <h1 style={heroTitleStyle}>TOKENIZED<br/>CULTURE</h1>
            <p style={heroSubtitleStyle}>
              NFT-powered apparel with verifiable digital ownership.<br/>
              Redefining fashion for the Web3 generation.
            </p>
            
            <div style={buttonGroupStyle}>
              <Link to="/customer/catalog" style={linkWrapperStyle}>
                <Button label="Browse" />
              </Link>
              <div style={linkWrapperStyle}>
                <Button label="Admin" onClick={handleAdminAccess} />
              </div>
            </div>
          </div>

          {/* HERO IMAGE (Right on Desktop, Top on Mobile) */}
          <div className="hero-img-container">
            <img src={heroImage} alt="Phydigital Culture" />
          </div>

        </div>
      </div>
      
      {/* Ambient Lighting Accent */}
      <div style={accentCircleStyle} />
    </div>
  );
}

// --- MAIN APPLICATION ROUTER ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/listing" element={<Mint />} />
        <Route path="/customer/catalog" element={<Catalog />} />
        <Route path="/customer/order-history" element={<OrderHistory />} />
        <Route path="/admin/dashboard" element={<SalesDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

// ===================================================================
// FLUID & STABLE BOUTIQUE STYLES 
// ===================================================================

const homeContainerStyle: React.CSSProperties = {
  backgroundColor: '#050505',
  color: '#fff',
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  fontFamily: '"Inter", sans-serif',
  overflowX: 'hidden',       
  boxSizing: 'border-box',
};

const homeNavStyle: React.CSSProperties = {
  minHeight: '110px',
  padding: '20px 6%',
  display: 'flex',
  alignItems: 'center',
  zIndex: 10,
  flexShrink: 0,
};

const logoStyle = { 
  fontSize: '1.2rem', 
  fontWeight: '900', 
  letterSpacing: '2px',
  margin: 0,
};

const homeContentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', 
  padding: '0px 6% 80px 6%', /* Reduced top padding to accommodate the image */
  zIndex: 10,
};

const heroTitleStyle = {
  fontSize: 'clamp(2.5rem, 9vw, 6.5rem)', 
  fontWeight: '900',
  lineHeight: '0.9',
  margin: '0 0 24px 0',
  letterSpacing: '-2px',
  textTransform: 'uppercase' as const,
};

const heroSubtitleStyle = {
  fontSize: '1.1rem',
  color: '#666',
  maxWidth: '500px',
  lineHeight: '1.6',
  margin: '0 0 40px 0',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap' as const, 
  width: '100%',
};

const linkWrapperStyle = {
  display: 'inline-block',
  textDecoration: 'none'
};

const accentCircleStyle: React.CSSProperties = {
  position: 'absolute',
  width: '60vw',
  height: '60vw',
  right: '-10vw',
  top: '5vh',
  background: 'radial-gradient(circle, rgba(248, 223, 0, 0.05) 0%, rgba(0,0,0,0) 70%)',
  zIndex: 1,
  pointerEvents: 'none',
};

export default App;