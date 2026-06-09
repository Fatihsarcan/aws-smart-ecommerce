import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { getCurrentUser } from "aws-amplify/auth";
import { useAuth } from "../App";

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 56px)", padding: 24 },
  card: { background: "#fff", borderRadius: 8, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: "center", color: "#111" },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#333" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, marginBottom: 16, outline: "none" },
  btn: { width: "100%", padding: 12, background: "#ff9900", border: "none", borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: "pointer", color: "#111" },
  error: { color: "#c0392b", fontSize: 13, marginBottom: 12, textAlign: "center" },
  footer: { textAlign: "center", marginTop: 16, fontSize: 13, color: "#555" },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const u = await getCurrentUser();
      setUser(u);
      navigate("/products");
    } catch (err) {
      setError(err.message || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Giriş Yap</h1>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>E-posta</label>
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" required />
          <label style={styles.label}>Şifre</label>
          <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <button style={styles.btn} type="submit" disabled={loading}>{loading ? "Giriş yapılıyor..." : "Giriş Yap"}</button>
        </form>
        <div style={styles.footer}>
          Hesabın yok mu? <Link to="/register" style={{ color: "#e47911" }}>Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
