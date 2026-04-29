// src/hooks/useAuth.jsx
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { getOwnerDashboard } from "../services/api";

const AuthContext = createContext(null);

// 8 ώρες αδράνεια -> αυτόματο logout
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const LAST_ACTIVE_KEY    = "qrmenu_last_active";
const TOKEN_KEY          = "qrmenu_token";

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
}

function touchActivity() {
  localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
}

function isSessionExpired() {
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!lastActive) return true;
  return Date.now() - Number(lastActive) > SESSION_TIMEOUT_MS;
}

export function AuthProvider({ children }) {
  const [owner,   setOwner]   = useState(null);
  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef(null);

  useEffect(() => {
    const events = ["click", "keydown", "mousemove", "touchstart", "scroll"];
    const handler = () => {
      if (localStorage.getItem(TOKEN_KEY)) touchActivity();
    };
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem(TOKEN_KEY) && isSessionExpired()) {
        logoutRef.current?.();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    if (isSessionExpired()) {
      clearSession();
      setLoading(false);
      return;
    }

    getOwnerDashboard()
      .then((data) => {
        setOwner(data.owner);
        setShops(data.shops);
        touchActivity();
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, ownerData, shopsData) => {
    localStorage.setItem(TOKEN_KEY, token);
    touchActivity();
    setOwner(ownerData);
    setShops(shopsData || []);
  };

  const logout = () => {
    clearSession();
    setOwner(null);
    setShops([]);
  };

  logoutRef.current = logout;

  return (
    <AuthContext.Provider value={{ owner, shops, loading, login, logout, setShops, setOwner }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
