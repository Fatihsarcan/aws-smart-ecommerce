import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";

const CATEGORIES = ["Tümü", "Elektronik", "Moda", "Kitap", "Spor", "Ev & Yaşam", "Oyun", "Güzellik"];

const styles = {
  container: { maxWidth: 1200, margin: "0 auto", padding: 24 },
  header: { marginBottom: 24 },
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
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then((data) => { setProducts(data); setFiltered(data); })
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
      <div style={styles.header}>
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
