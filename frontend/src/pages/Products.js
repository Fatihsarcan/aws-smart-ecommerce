import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";

const CATEGORIES = ["Tümü", "Elektronik", "Moda", "Kitap", "Spor", "Ev & Yaşam", "Oyun", "Güzellik"];

const styles = {
  container: { maxWidth: 1200, margin: "0 auto", padding: 24 },
  title: { fontSize: 22, fontWeight: 700, color: "#111" },
  filters: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 },
  filterBtn: (active) => ({
    padding: "6px 16px",
    borderRadius: 20,
    border: "1px solid",
    background: active ? "#232f3e" : "#fff",
    borderColor: active ? "#232f3e" : "#ccc",
    color: active ? "#fff" : "#333",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 700 : 400,
  }),
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  empty: { textAlign: "center", padding: 60, color: "#888", fontSize: 16 },
  error: { textAlign: "center", padding: 40, color: "#c0392b" },

  spotlightSection: { marginBottom: 36 },
  spotlightHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  spotlightTitle: { fontSize: 18, fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: 8 },
  spotlightDot: { width: 10, height: 10, borderRadius: "50%", background: "#ff9900", display: "inline-block" },
  spotlightScroll: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
  },
  spotlightCard: {
    background: "linear-gradient(135deg, #fff 0%, #fffbf2 100%)",
    border: "1px solid #ffe0a0",
    borderRadius: 10,
    padding: 16,
    cursor: "pointer",
    transition: "box-shadow 0.2s, transform 0.2s",
    position: "relative",
    overflow: "hidden",
  },
  spotlightBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "#ff9900",
    color: "#111",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 20,
    textTransform: "uppercase",
  },
  spotlightEmoji: { fontSize: 40, marginBottom: 10 },
  spotlightCategory: { fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  spotlightName: { fontWeight: 600, fontSize: 13, color: "#111", marginBottom: 6, lineHeight: 1.4 },
  spotlightPrice: { fontSize: 18, fontWeight: 700, color: "#e47911" },

  divider: { border: "none", borderTop: "2px solid #f0f0f0", margin: "0 0 28px" },
};

function SpotlightCard({ product }) {
  const navigate = useNavigate();
  return (
    <div
      style={styles.spotlightCard}
      onClick={() => navigate(`/products/${product.productId}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,153,0,0.2)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <span style={styles.spotlightBadge}>Önerilen</span>
      <div style={styles.spotlightEmoji}>{product.emoji || "📦"}</div>
      <div style={styles.spotlightCategory}>{product.category}</div>
      <div style={styles.spotlightName}>{product.name}</div>
      <div style={styles.spotlightPrice}>€{product.price}</div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [spotlight, setSpotlight] = useState([]);
  const [category, setCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setFiltered(data);
        // Her kategoriden 1 ürün al, max 4
        const seen = new Set();
        const picks = [];
        for (const p of [...data].sort(() => 0.5 - Math.random())) {
          if (!seen.has(p.category) && picks.length < 4) {
            seen.add(p.category);
            picks.push(p);
          }
        }
        setSpotlight(picks);
      })
      .catch(() => setError("Ürünler yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (category !== "Tümü") result = result.filter((p) => p.category === category);
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [category, search, products]);

  if (loading) return <div style={styles.empty}>Yükleniyor...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>

      {spotlight.length > 0 && (
        <div style={styles.spotlightSection}>
          <div style={styles.spotlightHeader}>
            <div style={styles.spotlightTitle}>
              <span style={styles.spotlightDot} />
              Senin İçin Önerilen
            </div>
          </div>
          <div style={styles.spotlightScroll}>
            {spotlight.map((p) => <SpotlightCard key={p.productId} product={p} />)}
          </div>
          <hr style={{ ...styles.divider, marginTop: 28 }} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={styles.title}>Ürünler ({filtered.length})</h1>
        <input
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, width: 200, outline: "none" }}
        />
      </div>
      <div style={styles.filters}>
        {CATEGORIES.map((cat) => (
          <button key={cat} style={styles.filterBtn(category === cat)} onClick={() => setCategory(cat)}>{cat}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>Bu kriterlere uygun ürün bulunamadı</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((product) => <ProductCard key={product.productId} product={product} />)}
        </div>
      )}
    </div>
  );
}
