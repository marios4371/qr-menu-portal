import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ownerLogin, getOwnerDashboard } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import styles from "./Auth.module.css";

export default function Login() {
  const navigate        = useNavigate();
  const { login }       = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Βήμα 1: login → πάρε JWT
      const loginData = await ownerLogin({ email, password });
      // Βήμα 2: αποθήκευσε token στο localStorage πρώτα
      localStorage.setItem("qrmenu_token", loginData.token);
      // Βήμα 3: φόρτωσε dashboard data με το νέο token
      const dashData = await getOwnerDashboard();
      // Βήμα 4: ενημέρωσε το AuthContext
      login(loginData.token, loginData.owner, dashData.shops);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
      localStorage.removeItem("qrmenu_token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 420 }}>
        <div className={styles.logo}>QR<span>Menu</span></div>
        <h2 className={styles.title}>Σύνδεση</h2>
        <p className={styles.sub}>Καλώς ήρθατε πίσω.</p>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Κωδικός πρόσβασης</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="msg-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : "Σύνδεση"}
          </button>
        </form>

        <p className={styles.footer}>
          Δεν έχετε λογαριασμό; <Link to="/register">Εγγραφή δωρεάν</Link>
        </p>
      </div>
    </div>
  );
}
