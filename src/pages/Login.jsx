import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ownerLogin, getOwnerDashboard } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import styles from "./Auth.module.css";

// Eye icon components
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { login }      = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // navigate(-1) goes exactly where the user came from — handles all cases:
  // from nav → back to admin/
  // from plans section → back to admin/ scrolled to plans
  // from hero → back to admin/
  const handleBack = () => navigate(-1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loginData = await ownerLogin({ email, password });
      localStorage.setItem("qrmenu_token", loginData.token);
      const dashData = await getOwnerDashboard();
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
      <button onClick={handleBack} className={styles.back}>←</button>

      <div className={styles.card} style={{ maxWidth: 420 }}>
        <span className={styles.logo}>QRMenu</span>

        <h2 className={styles.title}>Σύνδεση</h2>
        <p className={styles.sub}>Καλώς ήρθατε πίσω. Εισάγετε τα στοιχεία σας.</p>

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
            <div className={styles.passwordWrap}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                aria-label={showPass ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
              >
                {showPass ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
          </div>

          {error && <div className="msg-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <span className="spinner" /> : "Σύνδεση"}
          </button>
        </form>

        <p className={styles.footer}>
          Δεν έχετε λογαριασμό; <Link to="/register" state={location.state}>Εγγραφή δωρεάν</Link>
        </p>
      </div>
    </div>
  );
}