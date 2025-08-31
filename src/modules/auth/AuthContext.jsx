// src/modules/auth/AuthContext.jsx
/* eslint react-refresh/only-export-components: "off" */  // opcional: silencia warning

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../../shared/api.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [basic, setBasic] = useState(() => localStorage.getItem("basic"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!basic) {
      localStorage.removeItem("basic");
      setUser(null);
      return;
    }
    localStorage.setItem("basic", basic);
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        const roles = (data?.authorities || []).map(a => a?.authority).filter(Boolean);
        setUser({ email: data?.username, roles });
      } catch {
        localStorage.removeItem("basic");
        setUser(null);
        setBasic(null);
      }
    })();
  }, [basic]);

  const login = async (email, password) => {
    const token = btoa(`${email}:${password}`);
    try {
      const { data } = await api.get("/auth/me", {
        headers: { Authorization: `Basic ${token}` },
      });
      const roles = (data?.authorities || []).map(a => a?.authority).filter(Boolean);
      setBasic(token);
      setUser({ email: data?.username, roles });
    } catch {
      throw new Error("Credenciales inválidas");
    }
  };

  const logout = () => {
    localStorage.removeItem("basic");
    setBasic(null);
    setUser(null);
  };

  const isAuthenticated = !!basic;
  const value = useMemo(() => ({ isAuthenticated, user, login, logout }), [isAuthenticated, user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
