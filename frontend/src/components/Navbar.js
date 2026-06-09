import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { logout } from "../services/auth";

const styles = {
  nav: {
    background: "#232f3e",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: { color: "#ff9900", fontWeight: 700, fontSize: 20, textDecoration: "none" },
  links: { display: "flex", gap: 8, alignItems: "center" },
  link: {
    color: "#ccc",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: 4,
    fontSize: 14,
    transition: "color 0.2s",
  },
  btn: {
    background: "#ff9900",
    color: "#111",
    border: "none",
    padding: "6px 16px",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
};

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/products" style={styles.logo}>Smart E-Commerce</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <Link to="/products" style={styles.link}>Ürünler</Link>
            <Link to="/orders" style={styles.link}>Siparişlerim</Link>
            <button onClick={handleLogout} style={styles.btn}>Çıkış</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Giriş</Link>
            <Link to="/register" style={{ ...styles.link, ...styles.btn }}>Kayıt Ol</Link>
          </>
        )}
      </div>
    </nav>
  );
}
