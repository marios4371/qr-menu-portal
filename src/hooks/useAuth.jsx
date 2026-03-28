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
  if (!lastActive) return true; // Αν δεν υπάρχει timestamp → expired
  return Date.now() - Number(lastActive) > SESSION_TIMEOUT_MS;
}

export function AuthProvider({ children }) {
  const [owner,   setOwner]   = useState(null);
  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef(null); // reference για χρήση μέσα στους listeners

  // ─── Activity listeners: ανανέωση timestamp με κάθε interaction ──────────
  useEffect(() => {
    const events = ["click", "keydown", "mousemove", "touchstart", "scroll"];
    const handler = () => {
      // Ανανέωση μόνο αν υπάρχει ενεργή session
      if (localStorage.getItem(TOKEN_KEY)) touchActivity();
    };
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  // ─── Periodic check: κάθε λεπτό ελέγχουμε αν η session έχει λήξει ───────
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem(TOKEN_KEY) && isSessionExpired()) {
        logoutRef.current?.();
      }
    }, 60_000); // κάθε 1 λεπτό
    return () => clearInterval(interval);
  }, []);

  // ─── Rehydration κατά το mount ────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    // Πρώτος έλεγχος: inactivity timeout ΠΡΙΝ καλέσουμε το API
    if (isSessionExpired()) {
      clearSession();
      setLoading(false);
      return;
    }

    getOwnerDashboard()
      .then((data) => {
        setOwner(data.owner);
        setShops(data.shops);
        touchActivity(); // Επιτυχής rehydration → refresh timestamp
      })
      .catch(() => {
        // Token expired (backend) ή network error → καθαρίζουμε
        clearSession();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, ownerData, shopsData) => {
    localStorage.setItem(TOKEN_KEY, token);
    touchActivity(); // Ξεκινάμε το inactivity clock από το login
    setOwner(ownerData);
    setShops(shopsData || []);
  };

  const logout = () => {
    clearSession();
    setOwner(null);
    setShops([]);
  };

  // Κρατάμε ref ενημερωμένο ώστε ο periodic check να έχει πρόσβαση
  logoutRef.current = logout;

  return (
    <AuthContext.Provider value={{ owner, shops, loading, login, logout, setShops }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);