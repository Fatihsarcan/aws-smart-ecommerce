import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, createOrder } from "../services/api";

const styles = {
  container: { maxWidth: 800, margin: "40px auto", padding: "0 24px" },
  back: { color: "#e47911", cursor: "pointer", fontSize: 14, marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "none" },
  card: { background: "#fff", borderRadius: 8, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", gap: 32 },
  emoji: { fontSize: 80, width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f3f3", borderRadius: 8, flexShrink: 0 },
  info: { flex: 1 },
  category: { fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  name: { fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 16 },
  price: { fontSize: 32, fontWeight: 700, color: "#e47911", marginBottom: 24 },
  buyBtn: { padding: "14px 32px", background: "#ff9900", border: "none", borderRadius: 4, fontWeight: 700, fontSize: 16, cursor: "pointer", color: "#111", width: "100%" },
  success: { background: "#d4edda", color: "#155724", padding: 12, borderRadius: 4, marginTop: 12, textAlign: "center", fontSize: 14 },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(() => setError("Ürün bulunamadı"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    setBuying(true);
    setError("");
    try {
      await createOrder(product);
      setSuccess(true);
    } catch {
      setError("Sipariş oluşturulamadı, lütfen tekrar dene");
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#888" }}>Yükleniyor...</div>;
  if (error || !product) return (
    <div style={styles.container}>
      <p style={{ color: "#c0392b", textAlign: "center", padding: 40 }}>{error || "Ürün bulunamadı"}</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate("/products")}>← Ürünlere Dön</button>
      <div style={styles.card}>
        <div style={styles.emoji}>{product.emoji || "📦"}</div>
        <div style={styles.info}>
          <div style={styles.category}>{product.category}</div>
          <h1 style={styles.name}>{product.name}</h1>
          <div style={styles.price}>€{product.price}</div>
          {product.description && (
            <p style={{ color: "#555", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{product.description}</p>
          )}
          {success ? (
            <>
              <div style={styles.success}>✓ Siparişin alındı! Öneri emaili yakında gelecek.</div>
              <button style={{ ...styles.buyBtn, marginTop: 8, background: "#eee", color: "#333" }} onClick={() => navigate("/orders")}>
                Siparişlerime Git →
              </button>
            </>
          ) : (
            <button style={styles.buyBtn} onClick={handleBuy} disabled={buying}>
              {buying ? "Sipariş veriliyor..." : "Şimdi Satın Al"}
            </button>
          )}
          {error && !success && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 8, textAlign: "center" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
