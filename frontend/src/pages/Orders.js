import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../services/api";

const styles = {
  container: { maxWidth: 800, margin: "0 auto", padding: 24 },
  title: { fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 24 },
  empty: { textAlign: "center", padding: 60, color: "#888" },
  card: { background: "#fff", borderRadius: 8, padding: 20, marginBottom: 12, border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" },
  badge: { display: "inline-block", background: "#d4edda", color: "#155724", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 },
  date: { fontSize: 12, color: "#888", marginTop: 4 },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(() => setError("Siparişler yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.empty}>Yükleniyor...</div>;
  if (error) return <div style={{ ...styles.empty, color: "#c0392b" }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Siparişlerim</h1>
      {orders.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <p>Henüz siparişin yok.</p>
          <button onClick={() => navigate("/products")} style={{ marginTop: 16, padding: "10px 24px", background: "#ff9900", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>
            Alışverişe Başla
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} style={styles.card}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>{order.productName}</div>
              <div style={styles.date}>{new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#e47911", marginBottom: 4 }}>€{order.price}</div>
              <span style={styles.badge}>{order.status}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
