// src/hooks/useAuth.jsx
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { getOwnerDashboard } from "../services/api";

const AuthContext = createContext(null);

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
  const [owner,          setOwner]          = useState(null);
  const [shops,          setShops]          = useState([]);
  const [currentShopId,  setCurrentShopId]  = useState(null);
  const [loading,        setLoading]        = useState(true);
  const logoutRef = useRef(null);

  // Sync currentShopId: αρχικοποίηση στο πρώτο shop όταν φορτωθούν τα shops,
  // αλλά μόνο αν δεν έχει ήδη επιλεγεί κάποιο (π.χ. μετά από login).
  useEffect(() => {
    if (shops.length > 0 && !currentShopId) {
      setCurrentShopId(shops[0].shop_id);
    }
  }, [shops]);

  // Activity listeners
  useEffect(() => {
    const events = ["click", "keydown", "mousemove", "touchstart", "scroll"];
    const handler = () => {
      if (localStorage.getItem(TOKEN_KEY)) touchActivity();
    };
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  // Periodic inactivity check
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem(TOKEN_KEY) && isSessionExpired()) {
        logoutRef.current?.();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Rehydration
  useEffect(() => {
    // DEV-only demo seed (guarded by explicit localStorage flag) — local visual checks only
    if (import.meta.env.DEV && localStorage.getItem("qrmenu_demo") === "1") {
      setOwner({ firstName: "Marios", lastName: "P.", email: "info@posada.gr", plan: "PREMIUM" });
      setShops([{ shop_id: "SHOP#posada", shopName: "POSADA", shopSlug: "posada", businessType: "Εστιατόριο",
        menu: [{ id: 1, name: "Καφέδες", items: [{}, {}] }, { id: 2, name: "Φαγητά", items: [{}, {}, {}] }] }]);
      setCurrentShopId("SHOP#posada");
      setLoading(false);
      return;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    if (isSessionExpired()) { clearSession(); setLoading(false); return; }

    getOwnerDashboard()
      .then((data) => {
        setOwner(data.owner);
        setShops(data.shops);
        if (data.shops?.length > 0) setCurrentShopId(data.shops[0].shop_id);
        touchActivity();
      })
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  const login = (token, ownerData, shopsData) => {
    localStorage.setItem(TOKEN_KEY, token);
    touchActivity();
    setOwner(ownerData);
    setShops(shopsData || []);
    if (shopsData?.length > 0) setCurrentShopId(shopsData[0].shop_id);
  };

  const logout = () => {
    clearSession();
    setOwner(null);
    setShops([]);
    setCurrentShopId(null);
  };

  logoutRef.current = logout;

  return (
    <AuthContext.Provider value={{
      owner, shops, loading,
      login, logout,
      setShops, setOwner,
      currentShopId, setCurrentShopId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
