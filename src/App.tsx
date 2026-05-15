import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Mint from "./pages/admin/listing"; 
import Catalog from "./pages/customer/catalog"; 
import OrderHistory from "./pages/customer/order-history"; 
import SalesDashboard from "./pages/admin/sales-dashboard";

// --- IMPORT YOUR MODULAR UI-VERSE BUTTON COMPONENT ---
import Button from "./assets/components/button"; 

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
      {/* Brand Header */}
      <nav style={homeNavStyle}>
        <h2 style={logoStyle}>SUNDAY CLOTHING<span style={{ color: '#f8df00' }}>.</span></h2>
      </nav>

      {/* Main Feature Layout */}
      <div style={homeContentStyle}>
        <h1 style={heroTitleStyle}>Phygital<br/>Excellence</h1>
        <p style={heroSubtitleStyle}>
          Verifiable digital ownership. Premium physical quality. <br/>
          Experience the future of apparel.
        </p>
        
        <div style={buttonGroupStyle}>
          <Link to="/customer/catalog" style={linkWrapperStyle}>
            <Button label="Enter Shop" />
          </Link>

          {/* Replaced <Link> with an onClick handler */}
          <div style={linkWrapperStyle}>
            <Button label="Forge Assets" onClick={handleAdminAccess} />
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
// FLUID & STABLE BOUTIQUE STYLES (DESKTOP MAX WITH SAFE RESPONSIVENESS)
// ===================================================================

const homeContainerStyle: React.CSSProperties = {
  backgroundColor: '#050505',
  color: '#fff',
  minHeight: '100vh',      // Safer than absolute height for mobile viewport elements
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  fontFamily: '"Inter", sans-serif',
  overflow: 'hidden',       
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
  alignItems: 'flex-start', 
  padding: '40px 6% 80px 6%',
  zIndex: 10,
  textAlign: 'left',
};

const heroTitleStyle = {
  /* Fluid Text Scaling: Min size 2.5rem (Mobile), auto-scales with viewport, max size 6.5rem (Desktop) */
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
  flexWrap: 'wrap' as const, // Allows buttons to cleanly stack on phone screens instead of overflowing
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
  background: 'radial-gradient(circle, rgba(248, 223, 0, 0.06) 0%, rgba(0,0,0,0) 70%)',
  zIndex: 1,
  pointerEvents: 'none',
};

export default App;