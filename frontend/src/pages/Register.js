import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, confirmEmail } from "../services/auth";

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 56px)", padding: 24 },
  card: { background: "#fff", borderRadius: 8, padding: 40, width: "100%", maxWidth: 440, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: "center", color: "#111" },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#333" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, marginBottom: 14, outline: "none" },
  btn: { width: "100%", padding: 12, background: "#ff9900", border: "none", borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: "pointer", color: "#111" },
  error: { color: "#c0392b", fontSize: 13, marginBottom: 12, textAlign: "center" },
  footer: { textAlign: "center", marginTop: 16, fontSize: 13, color: "#555" },
  hint: { fontSize: 11, color: "#888", marginBottom: 14, marginTop: -10 },
};

const INTERESTS = ["Elektronik", "Moda", "Kitap", "Spor", "Ev & Yaşam", "Oyun", "Güzellik"];

export default function Register() {
  const [step, setStep] = useState("register"); // register | confirm
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", interests: [] });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, interests: form.interests.join(",") });
      setStep("confirm");
    } catch (err) {
      setError(err.message || "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmEmail(form.email, code);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Doğrulama başarısız");
    } finally {
      setLoading(false);
    }
  };

  if (step === "confirm") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>E-postanı Doğrula</h1>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 20, textAlign: "center" }}>
            {form.email} adresine gönderilen 6 haneli kodu gir
          </p>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleConfirm}>
            <label style={styles.label}>Doğrulama Kodu</label>
            <input style={{ ...styles.input, fontSize: 20, textAlign: "center", letterSpacing: 8 }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" maxLength={6} required />
            <button style={styles.btn} type="submit" disabled={loading}>{loading ? "Doğrulanıyor..." : "Doğrula"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Kayıt Ol</h1>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleRegister}>
          <label style={styles.label}>Ad Soyad</label>
          <input style={styles.input} value={form.name} onChange={set("name")} placeholder="Ali Veli" required />
          <label style={styles.label}>E-posta</label>
          <input style={styles.input} type="email" value={form.email} onChange={set("email")} placeholder="ornek@email.com" required />
          <label style={styles.label}>Şifre</label>
          <input style={styles.input} type="password" value={form.password} onChange={set("password")} placeholder="En az 8 karakter" required />
          <label style={styles.label}>Yaş</label>
          <input style={styles.input} type="number" value={form.age} onChange={set("age")} placeholder="25" min={1} max={120} />
          <label style={styles.label}>İlgi Alanları</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid",
                  fontSize: 13,
                  cursor: "pointer",
                  background: form.interests.includes(interest) ? "#ff9900" : "#fff",
                  borderColor: form.interests.includes(interest) ? "#ff9900" : "#ccc",
                  color: form.interests.includes(interest) ? "#111" : "#555",
                  fontWeight: form.interests.includes(interest) ? 700 : 400,
                }}
              >
                {interest}
              </button>
            ))}
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>{loading ? "Kayıt olunuyor..." : "Kayıt Ol"}</button>
        </form>
        <div style={styles.footer}>
          Hesabın var mı? <Link to="/login" style={{ color: "#e47911" }}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
