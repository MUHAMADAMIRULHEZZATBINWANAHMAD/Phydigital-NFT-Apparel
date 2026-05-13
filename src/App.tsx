import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Mint from "./pages/admin/listing"; // Admin page
import Catalog from "./pages/customer/catalog"; // Customer catalog page

// A simple temporary Home component
function Home() {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Welcome to Sunday Clothing</h1>
      <p>This is the main hub.</p>
      
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
        <Link to="/customer/catalog">
          <button style={{ padding: "10px 20px", cursor: "pointer" }}>
            View Customer Catalog
          </button>
        </Link>

        <Link to="/admin/listing">
          <button style={{ padding: "10px 20px", cursor: "pointer" }}>
            Go to Admin Listing Page
          </button>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The default home page (http://localhost:5173/) */}
        <Route path="/" element={<Home />} />
        
        {/* The admin minting page (http://localhost:5173/admin/listing) */}
        <Route path="/admin/listing" element={<Mint />} />

        {/* The customer catalog page (http://localhost:5173/customer/catalog) */}
        <Route path="/customer/catalog" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;