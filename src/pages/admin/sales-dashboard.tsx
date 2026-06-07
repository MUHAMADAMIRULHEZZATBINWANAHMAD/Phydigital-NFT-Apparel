import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ===================================================================
// 1. SHIPPING MANAGEMENT VIEW (WITH CONFIRMATION & DISABLE LOGIC)
// ===================================================================
function ShippingView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified state to track both Complete and Cancel actions
  const [pendingAction, setPendingAction] = useState<{ id: number, status: string } | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch("https://phydigital-nft-apparel.onrender.com/shipping-orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`https://phydigital-nft-apparel.onrender.com/shipping-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchOrders();
    } catch (err) {
      alert("Failed to connect to backend.");
    } finally {
      // Always dismiss overlay target window after action completes
      setPendingAction(null);
    }
  };

  return (
    <div style={{ marginTop: "40px", display: 'grid', gap: '20px' }}>
      {loading ? (
        <p style={loaderStyle}>Syncing orders...</p>
      ) : (
        orders.map((order: any) => {
          const isCompleted = order.status === 'Completed';
          const isCancelled = order.status === 'Cancelled';

          return (
            <div key={order.id} style={cardStyle}> 
              <img src={order.item_image} style={thumbStyle} alt={order.item_name} />
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={labelStyle}>Order Details</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '800', color: '#f8df00', fontSize: '1.2rem' }}>
                    {order.item_name} <span style={{ color: '#fff', fontSize: '1.1rem' }}>x {order.quantity || 1}</span>
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#aaa', fontSize: '0.95rem' }}>
                    Total Paid: <span style={{ color: '#2ecc71' }}>{parseFloat(order.amount).toFixed(4)} ETH</span> / RM {(parseFloat(order.amount) * 6447.92).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span style={labelStyle}>Recipient</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#fff' }}>
                    {order.full_name} • {order.email} • {order.phone_number}
                  </p>
                </div>
                <div>
                   <span style={labelStyle}>Shipping Address</span>
                   <p style={{ margin: '2px 0 0 0', color: '#bbb', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                     {order.shipping_address}
                   </p>
                </div>
                <div>
                   <span style={labelStyle}>Wallet Address</span>
                   <p style={{ margin: '2px 0 0 0', color: '#888', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                     {order.wallet_address}
                   </p>
                </div>
                <div>
                  <span style={labelStyle}>Transaction Link</span>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${order.transaction_hash}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ color: '#00a6ff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', display: 'inline-block', marginTop: '3px' }}
                  >
                    View Etherscan ↗
                  </a>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end' }}>
                <div 
                  style={{
                    ...statusBadge, 
                    backgroundColor: isCompleted ? '#2ecc71' : isCancelled ? '#e74c3c' : '#f8df00'
                  }}
                >
                  {order.status}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Complete Button Trigger */}
                  <button 
                    disabled={isCompleted || isCancelled}
                    onClick={() => setPendingAction({ id: order.id, status: 'Completed'})} 
                    style={{
                      ...miniActionBtn,
                      opacity: (isCompleted || isCancelled) ? 0.3 : 1,
                      cursor: (isCompleted || isCancelled) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Complete
                  </button>

                  {/* Cancel Button Trigger */}
                  <button 
                    disabled={isCompleted || isCancelled}
                    onClick={() => setPendingAction({ id: order.id, status: 'Cancelled'})} 
                    style={{
                      ...miniActionBtn, 
                      backgroundColor: '#1a1a1a', 
                      color: isCompleted ? '#444' : '#e74c3c',
                      border: '1px solid #222',
                      opacity: (isCompleted || isCancelled) ? 0.3 : 1,
                      cursor: (isCompleted || isCancelled) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* --- CUSTOM DARK LUXURY CONFIRMATION POPUP OVERLAY --- */}
      {pendingAction !== null && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: pendingAction.status === 'Cancelled' ? '#e74c3c' : '#f8df00', 
              fontSize: '1.4rem', 
              fontWeight: '800' 
            }}>
              MARK AS {pendingAction.status.toUpperCase()}?
            </h3>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 25px 0' }}>
              Please confirm your action.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setPendingAction(null)} 
                style={modalCancelBtn}
              >
                BACK
              </button>
              <button 
                onClick={() => handleUpdateStatus(pendingAction.id, pendingAction.status)} 
                style={{
                  ...modalConfirmBtn,
                  backgroundColor: pendingAction.status === 'Cancelled' ? '#e74c3c' : '#f8df00',
                  color: pendingAction.status === 'Cancelled' ? '#fff' : '#000'
                }}
              >
                CONFIRM 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// 2. SALES OVERVIEW VIEW
// ===================================================================
function SalesView() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [listings, setListings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("https://phydigital-nft-apparel.onrender.com/listings").then(res => res.json()),
      fetch("https://phydigital-nft-apparel.onrender.com/shipping-orders").then(res => res.json())
    ]).then(([listingsRes, ordersRes]) => {
      if (listingsRes.success) {
        const listingsMap = listingsRes.listings.reduce((acc: any, item: any) => {
          acc[item.name] = item;
          return acc;
        }, {});
        setListings(listingsMap);
      }
      if (ordersRes.success) {
        const completedOrders = ordersRes.orders.filter((o: any) => o.status === 'Completed');
        setSalesData(completedOrders);
      }
    }).finally(() => setLoading(false));
  }, []);

  const salesByItem: { [key: string]: { count: number, totalValue: number } } = salesData.reduce((acc, order) => {
    const itemPrice = parseFloat(order.amount) || 0;
    if (!acc[order.item_name]) {
      acc[order.item_name] = { count: 0, totalValue: 0 };
    }
    acc[order.item_name].count += 1;
    acc[order.item_name].totalValue += itemPrice;
    return acc;
  }, {});

  const totalSalesValue = Object.values(salesByItem).reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div style={{ marginTop: "40px" }}>
      <div style={revenueCardStyle}>
        <span style={labelStyle}>Total Revenue</span>
        <h3 style={{ fontSize: '3rem', color: '#f8df00', margin: '10px 0', fontWeight: '900' }}>
          {totalSalesValue.toFixed(4)} <span style={{fontSize: '1.5rem'}}>ETH</span>
        </h3>
      </div>

      {loading ? <p style={loaderStyle}>Analyzing sales statistics...</p> : (
        <div style={gridStyle}>
          {Object.entries(salesByItem).map(([itemName, stats]) => {
            const itemDetails = listings[itemName];
            return (
              <div key={itemName} style={cardStyle}>
                <div style={imageWrapperStyle}>
                  <img src={itemDetails?.image_url} alt={itemName} style={imageStyle} />
                  <div style={badgeStyle}>{stats.count} SOLD</div>
                </div>

                <div style={infoContainerStyle}>
                  <h3 style={itemTitleStyle}>{itemName}</h3>
                  <div style={dividerStyle} />

                  <div style={statRowStyle}>
                    <div>
                      <span style={labelStyle}>REVENUE</span>
                      <p style={dataStyle}>{stats.totalValue.toFixed(4)} ETH</p>
                    </div>
                    <div>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${itemDetails?.transaction_hash}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: '#00a6ff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                      >
                        View Record ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===================================================================
// 3. MAIN DASHBOARD PAGE
// ===================================================================
export default function SalesDashboard() {
  const [view, setView] = useState('sales');
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <nav style={navStyle}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 style={logoStyle}>PHYGITAL<span style={{ color: '#f8df00' }}>.</span></h2>
        </Link>
        <button onClick={() => navigate("/admin/listing")} style={secondaryButtonStyle}>
           INVENTORY ←
        </button>
      </nav>

      <div style={tabHeaderStyle}>
        <h1 style={heroTitleStyle}>{view === 'sales' ? 'Revenue Analytics' : 'Fulfillment'}</h1>
        <div style={tabContainerStyle}>
           <button onClick={() => setView('sales')} style={view === 'sales' ? activeTabStyle : inactiveTabStyle}>SALES</button>
           <button onClick={() => setView('shipping')} style={view === 'shipping' ? activeTabStyle : inactiveTabStyle}>SHIPPING</button>
        </div>
      </div>

      {view === 'sales' ? <SalesView /> : <ShippingView />}
    </div>
  );
}

// ===================================================================
// STYLES MATRIX (COMPREHENSIVELY RESOLVED DEFINITIONS)
// ===================================================================
const containerStyle: React.CSSProperties = {
  backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '0 6% 100px 6%', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box'
};

const navStyle: React.CSSProperties = {
  height: '110px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px',
};

const logoStyle = { fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px' };
const heroTitleStyle = { fontSize: '3.5rem', fontWeight: '900', margin: '0', letterSpacing: '-2px' };
const tabHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' };
const tabContainerStyle = { backgroundColor: '#0c0c0c', padding: '6px', borderRadius: '14px', border: '1px solid #1a1a1a' };
const activeTabStyle = { padding: '10px 25px', backgroundColor: '#f8df00', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' };
const inactiveTabStyle = { padding: '10px 25px', backgroundColor: 'transparent', color: '#666', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' };

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', borderRadius: '24px', overflow: 'hidden', border: '1px solid #1a1a1a', display: 'flex', padding: '24px', gap: '25px', alignItems: 'center'
};

const thumbStyle = { width: "110px", height: "110px", borderRadius: "14px", objectFit: "cover" as const, flexShrink: 0 };
const labelStyle = { display: 'block', fontSize: '0.65rem', color: '#444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };
const statusBadge = { padding: '5px 14px', borderRadius: '100px', color: '#000', fontSize: '0.65rem', fontWeight: '800', display: 'inline-block', textTransform: 'uppercase' as const };
const miniActionBtn = { backgroundColor: '#fff', color: '#000', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' };
const loaderStyle = { textAlign: 'center' as const, padding: '100px', color: '#444', letterSpacing: '2px', fontWeight: '800' };

const revenueCardStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', border: '1px solid #1a1a1a', padding: '40px', borderRadius: '30px', textAlign: 'center', marginBottom: '50px'
};

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px',
};

const imageWrapperStyle: React.CSSProperties = { position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 };
const imageStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const badgeStyle: React.CSSProperties = {
  position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '4px 8px', borderRadius: '100px', fontSize: '0.55rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.1)'
};

const infoContainerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column' };
const itemTitleStyle = { fontSize: '1.4rem', fontWeight: '800', margin: '0', color: '#fff' };
const dividerStyle = { height: '1px', backgroundColor: '#1a1a1a', margin: '12px 0' };
const statRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const dataStyle = { margin: '4px 0 0 0', fontSize: '1rem', color: '#aaa', fontWeight: '600' };
const secondaryButtonStyle = { padding: '10px 20px', backgroundColor: 'transparent', color: '#888', borderRadius: '10px', border: '1px solid #222', cursor: 'pointer', fontWeight: '600' };

/* --- POPUP WINDOW COMPONENT OVERLAYS --- */
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0c', border: '1px solid #222', padding: '40px', borderRadius: '28px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', textAlign: 'left'
};

const modalConfirmBtn: React.CSSProperties = {
  border: 'none', padding: '14px 24px', borderRadius: '10px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.5px'
};

const modalCancelBtn: React.CSSProperties = {
  backgroundColor: 'transparent', color: '#666', border: '1px solid #222', padding: '14px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
};