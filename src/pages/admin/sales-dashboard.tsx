import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

// ===================================================================
// 1. SHIPPING MANAGEMENT VIEW
// ===================================================================
function ShippingView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch("http://localhost:3001/shipping-orders")
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
      const res = await fetch(`http://localhost:3001/shipping-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh the list to show the change
        fetchOrders();
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to connect to backend.");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return '#2ecc71'; // green
    if (status === 'Cancelled') return '#e74c3c'; // red
    return '#e67e22'; // orange
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>Manage Shipping</h2>
      {loading ? <p>Loading orders...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "15px", display: "flex", alignItems: "center", gap: "20px" }}>
              <img src={order.item_image} alt={order.item_name} style={{ width: "100px", height: "100px", borderRadius: "4px", objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <p><strong>Item:</strong> {order.item_name}</p>
                <p><strong>Buyer:</strong> {order.full_name} ({order.email})</p>
                <p><strong>Address:</strong> {order.shipping_address}</p>
                <p><strong>Tx:</strong> <a href={`https://sepolia.etherscan.io/tx/${order.transaction_hash}`} target="_blank" rel="noreferrer">{order.transaction_hash.substring(0, 12)}...</a></p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <span style={{ padding: '5px 10px', borderRadius: '15px', color: 'white', backgroundColor: getStatusColor(order.status), fontSize: '12px' }}>
                  {order.status}
                </span>
                <button onClick={() => handleUpdateStatus(order.id, 'Completed')} style={{ width: '100px', padding: '8px', cursor: 'pointer' }}>Complete</button>
                <button onClick={() => handleUpdateStatus(order.id, 'Cancelled')} style={{ width: '100px', padding: '8px', cursor: 'pointer', backgroundColor: '#555' }}>Cancel</button>
              </div>
            </div>
          ))}
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
    // Fetch both all listings and all shipping orders
    Promise.all([
      fetch("http://localhost:3001/listings").then(res => res.json()),
      fetch("http://localhost:3001/shipping-orders").then(res => res.json())
    ]).then(([listingsRes, ordersRes]) => {
      if (listingsRes.success) {
        // Create a map of listings by name for easy lookup
        const listingsMap = listingsRes.listings.reduce((acc: any, item: any) => {
          acc[item.name] = item;
          return acc;
        }, {});
        setListings(listingsMap);
      }
      if (ordersRes.success) {
        // We only care about completed orders for sales stats
        const completedOrders = ordersRes.orders.filter((o: any) => o.status === 'Completed');
        setSalesData(completedOrders);
      }
    }).finally(() => setLoading(false));
  }, []);

  // Calculate sales statistics
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
      <h2>Sales Overview</h2>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>Total Revenue (from Completed Orders)</h3>
        <p style={{ fontSize: '32px', color: '#2ecc71', margin: '10px 0' }}>{totalSalesValue.toFixed(4)} ETH</p>
      </div>

      {loading ? <p>Loading sales data...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {Object.entries(salesByItem).map(([itemName, stats]) => {
            const itemDetails = listings[itemName];
            const percentage = totalSalesValue > 0 ? (stats.totalValue / totalSalesValue) * 100 : 0;
            return (
              <div key={itemName} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "15px", display: "flex", alignItems: "center", gap: "20px" }}>
                <img src={itemDetails?.image_url} alt={itemName} style={{ width: "100px", height: "100px", borderRadius: "4px", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#f8df00' }}>{itemName}</h4>
                  <p><strong>Units Sold:</strong> {stats.count}</p>
                  <p><strong>Revenue:</strong> {stats.totalValue.toFixed(4)} ETH</p>
                  <p><strong>Contribution:</strong> {percentage.toFixed(2)}% of total sales</p>
                </div>
                <div style={{ width: "120px", textAlign: "center", borderLeft: "1px solid #444", paddingLeft: "20px" }}>
                  <QRCodeSVG value={`https://sepolia.etherscan.io/tx/${itemDetails?.transaction_hash}`} size={80} bgColor="#fff" fgColor="#000" />
                  <a href={`https://sepolia.etherscan.io/tx/${itemDetails?.transaction_hash}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', display: 'block', marginTop: '5px' }}>View Creation Tx</a>
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
// 3. MAIN DASHBOARD PAGE COMPONENT
// ===================================================================
export default function SalesDashboard() {
  const [view, setView] = useState('sales'); // 'sales' or 'shipping'
  const navigate = useNavigate();

  const activeButtonStyle = { padding: '10px 20px', cursor: 'pointer', border: '1px solid #f8df00', backgroundColor: '#f8df00', color: '#000', fontWeight: 'bold' };
  const inactiveButtonStyle = { padding: '10px 20px', cursor: 'pointer', border: '1px solid #ccc', backgroundColor: 'transparent', color: '#fff' };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Sales Dashboard</h1>
        <div>
          <button type="button" onClick={() => navigate("/admin/listing")} style={inactiveButtonStyle}>
              Back to Products ←
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button onClick={() => setView('sales')} style={view === 'sales' ? activeButtonStyle : inactiveButtonStyle}>Sales</button>
        <button onClick={() => setView('shipping')} style={view === 'shipping' ? activeButtonStyle : inactiveButtonStyle}>Shipping</button>
      </div>

      {view === 'sales' ? <SalesView /> : <ShippingView />}
    </div>
  );
}