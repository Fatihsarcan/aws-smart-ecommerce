import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from "aws-amplify/auth";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Orders from "./pages/Orders";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      region: "eu-central-1",
    },
  },
});

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshUser(); }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ fontSize: 18, color: "#555" }}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser }}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/products" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/products" replace />} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/products/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="*" element={<Navigate to={user ? "/products" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
