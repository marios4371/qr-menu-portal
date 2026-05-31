// src/hooks/useAuth.jsx
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { getOwnerDashboard } from "../services/api";

const AuthContext = createContext(null);

const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const LAST_ACTIVE_KEY    = "qrmenu_last_active";
const TOKEN_KEY          = "qrmenu_token";

// ── DEV-ONLY mock auth seam ────────────────────────────────────────────────
// Activated only in `vite` dev mode AND when the URL has ?devmock=1. It can
// never run in the production S3 build because import.meta.env.DEV is false
// there. Used purely to preview authenticated pages locally. REMOVE before ship.
const DEV_MOCK = import.meta.env.DEV &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("devmock");
const MOCK_OWNER = { firstName: "Μάριος", lastName: "Καλογεράκης", email: "demo@resto.gr", plan: "EXCLUSIVE" };
const MOCK_SHOPS = [{
  shop_id: "SHOP#demo", shopName: "POSADA", shopSlug: "posada",
  menu: [
    { id: "c1", name: "Cocktails", items: [{ id: "p1", name: "Margarita", price: 8.5, description: "Tequila, lime, triple sec", station: "BAR" }] },
    { id: "c2", name: "Beers",     items: [{ id: "p2", name: "Alfa", price: 4, description: "", station: "BAR" }] },
    { id: "c3", name: "Drinks",    items: [{ id: "p3", name: "Coca-Cola", price: 3, description: "", station: "BAR" }] },
  ],
}];

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
    if (DEV_MOCK) {
      setOwner(MOCK_OWNER);
      setShops(MOCK_SHOPS);
      setCurrentShopId(MOCK_SHOPS[0].shop_id);
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
