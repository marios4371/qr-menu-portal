import { useState, useEffect, createContext, useContext } from "react";
import { getOwnerDashboard } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [owner, setOwner]   = useState(null);
  const [shops, setShops]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Κατά το mount: αν υπάρχει token, φόρτωσε τα δεδομένα του owner
  useEffect(() => {
    const token = localStorage.getItem("qrmenu_token");
    if (!token) { setLoading(false); return; }

    getOwnerDashboard()
      .then((data) => {
        setOwner(data.owner);
        setShops(data.shops);
      })
      .catch(() => {
        // Token expired ή invalid — καθάρισε
        localStorage.removeItem("qrmenu_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, ownerData, shopsData) => {
    localStorage.setItem("qrmenu_token", token);
    setOwner(ownerData);
    setShops(shopsData || []);
  };

  const logout = () => {
    localStorage.removeItem("qrmenu_token");
    setOwner(null);
    setShops([]);
  };

  return (
    <AuthContext.Provider value={{ owner, shops, loading, login, logout, setShops }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
