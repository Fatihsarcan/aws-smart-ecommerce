import React from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  card: {
    background: "#fff",
    borderRadius: 8,
    padding: 16,
    cursor: "pointer",
    transition: "box-shadow 0.2s, transform 0.2s",
    border: "1px solid #e0e0e0",
  },
  image: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 4,
    background: "#f3f3f3",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 48,
  },
  category: { fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  name: { fontWeight: 600, fontSize: 15, color: "#111", marginBottom: 8, lineHeight: 1.4 },
  price: { fontSize: 20, fontWeight: 700, color: "#e47911" },
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/products/${product.productId}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <div style={styles.image}>{product.emoji || "📦"}</div>
      <div style={styles.category}>{product.category}</div>
      <div style={styles.name}>{product.name}</div>
      <div style={styles.price}>€{product.price}</div>
    </div>
  );
}
