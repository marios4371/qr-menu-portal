import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { register, checkSlug, getOwnerDashboard } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import styles from "./Auth.module.css";

// Eye icons
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

const STEPS = ["Επιλογή πλάνου", "Στοιχεία λογαριασμού", "Το μαγαζί σας", "Επιβεβαίωση"];

const BUSINESS_TYPES = [
  { value: "RESTAURANT", label: "Εστιατόριο" },
  { value: "CAFE",       label: "Καφέ" },
  { value: "BAR",        label: "Bar" },
];

const PLANS = [
  {
    value: "STANDARD",
    name: "Standard",
    price: "12,00 € / μήνα",
    features: ["Digital menu", "Επεξεργασία μενού", "URL: /menu/{slug}"],
  },
  {
    value: "PREMIUM",
    name: "Premium",
    price: "16,70 € / μήνα",
    features: ["Όλα του Standard", "Παραγγελιοληψία", "Κρατήσεις", "Gallery templates"],
  },
  {
    value: "EXCLUSIVE",
    name: "Exclusive",
    price: "25,00 € / μήνα",
    features: ["Όλα του Premium", "Analytics", "Κάβα & απόθεμα", "Export CSV"],
  },
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function previewSlug(name) {
  return name.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 50);
}

export default function Register() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { login }  = useAuth();
  const handleBack = () => navigate(-1);

  // If coming from a plan card in Landing, pre-select that plan and start at step 1
  const preselectedPlan = location.state?.selectedPlan || null;

  const [step, setStep]       = useState(preselectedPlan ? 1 : 0);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Step 0 — Plan
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);

  // Step 1 — Account
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  const [showPass, setShowPass]           = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [businessType, setBusinessType]   = useState("RESTAURANT");

  // Step 2 — Shop
  const [shopName, setShopName]         = useState("");
  const [slugAvailable, setSlugAvail]   = useState(null);
  const [slugChecking, setSlugChecking] = useState(false);

  const slug          = previewSlug(shopName);
  const debouncedSlug = useDebounce(slug, 450);

  useEffect(() => {
    if (debouncedSlug.length < 2) { setSlugAvail(null); return; }
    setSlugChecking(true);
    checkSlug(debouncedSlug)
      .then(res => setSlugAvail(res.available))
      .catch(() => setSlugAvail(null))
      .finally(() => setSlugChecking(false));
  }, [debouncedSlug]);

  const validateStep0 = () => {
    if (!selectedPlan) return "Παρακαλώ επιλέξτε ένα πλάνο για να συνεχίσετε.";
    return null;
  };
  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) return "Συμπληρώστε όνομα και επώνυμο";
    if (!email.trim() || !email.includes("@")) return "Εισάγετε έγκυρο email";
    if (password.length < 8) return "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες";
    if (password !== confirmPassword) return "Οι κωδικοί δεν ταιριάζουν";
    return null;
  };
  const validateStep2 = () => {
    if (!shopName.trim()) return "Εισάγετε όνομα μαγαζιού";
    if (slug.length < 2)  return "Το όνομα μαγαζιού είναι πολύ κοντό";
    if (slugAvailable === false) return "Αυτό το URL χρησιμοποιείται ήδη.";
    return null;
  };

  const validators = [validateStep0, validateStep1, validateStep2, () => null];

  const nextStep = () => {
    setError("");
    const err = validators[step]();
    if (err) { setError(err); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const data = await register({
        firstName, lastName, email, password,
        businessType, shopName,
        plan: selectedPlan,           // ← περνάμε το επιλεγμένο πλάνο
      });
      localStorage.setItem("qrmenu_token", data.token);
      const dashData = await getOwnerDashboard();
      login(data.token, dashData.owner, dashData.shops);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
      localStorage.removeItem("qrmenu_token");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const planInfo = PLANS.find(p => p.value === selectedPlan);

  return (
    <div className={styles.page}>
      <button onClick={handleBack} className={styles.back}>←</button>

      <div className={styles.card} style={{ maxWidth: step === 0 ? 720 : 490 }}>
        <span className={styles.logo}>QRMenu</span>

        {/* Step indicator */}
        <div className={`${styles.steps} ${step === 0 ? styles.stepsCompact : ""}`}>
          {STEPS.map((label, i) => (
            <div key={i} className={`${styles.stepItem} ${i === step ? styles.stepActive : ""} ${i < step ? styles.stepDone : ""}`}>
              <div className={styles.stepCircle}>{i < step ? "✓" : i + 1}</div>
              <span className={styles.stepLabel}>{label}</span>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        <hr className="divider" />

        {/* ── Step 0: Plan selection ── */}
        {step === 0 && (
          <div className="fade-up">
            <h2 className={styles.title}>Επιλέξτε πλάνο</h2>
            <p className={styles.sub}>Μπορείτε να αλλάξετε πλάνο οποιαδήποτε στιγμή από το dashboard σας.</p>

            <div className={styles.planGrid}>
              {PLANS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`${styles.planCard} ${selectedPlan === p.value ? styles.planCardSelected : ""}`}
                  onClick={() => { setSelectedPlan(p.value); setError(""); }}
                >
                  <div className={styles.planCardName}>{p.name}</div>
                  <div className={styles.planCardPrice}>{p.price}</div>
                  <ul className={styles.planCardFeatures}>
                    {p.features.map(f => (
                      <li key={f} className={styles.planCardFeature}>
                        <span className={styles.planCardCheck}>—</span>{f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Account ── */}
        {step === 1 && (
          <div className="fade-up">
            <h2 className={styles.title}>Δημιουργία λογαριασμού</h2>
            <div className={styles.planChip}>{planInfo?.name} Πακέτο — {planInfo?.price}</div>

            <div className={styles.formGrid}>
              <div className="form-group">
                <label>Όνομα</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="π.χ. Νίκος" />
              </div>
              <div className="form-group">
                <label>Επώνυμο</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="π.χ. Παπαδόπουλος" />
              </div>
            </div>
            <div className="form-group" style={{ marginTop:14 }}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="form-group" style={{ marginTop:14 }}>
              <label>Κωδικός πρόσβασης</label>
              <div className={styles.passwordWrap}>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Τουλάχιστον 8 χαρακτήρες" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginTop:14 }}>
              <label>Επιβεβαίωση κωδικού</label>
              <div className={styles.passwordWrap}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Επαναλάβετε τον κωδικό"
                  style={confirmPassword && password !== confirmPassword ? { borderColor:"var(--error)" }
                    : confirmPassword && password === confirmPassword ? { borderColor:"var(--success)" } : {}}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                  {showConfirm ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginTop:14 }}>
              <label>Τύπος επιχείρησης</label>
              <select value={businessType} onChange={e => setBusinessType(e.target.value)}>
                {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── Step 2: Shop ── */}
        {step === 2 && (
          <div className="fade-up">
            <h2 className={styles.title}>Το μαγαζί σας</h2>
            <p className={styles.sub}>Δώστε όνομα στο μαγαζί σας. Αυτό θα γίνει το URL του μενού σας.</p>
            <div className="form-group" style={{ marginTop:8 }}>
              <label>Όνομα μαγαζιού</label>
              <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="π.χ. Souvlaki tou Niku" autoFocus />
            </div>
            {shopName.trim().length > 0 && (
              <div className={styles.slugPreview}>
                <span className={styles.slugLabel}>URL μενού:</span>
                <code className={styles.slugCode}>…/menu/<strong>{slug || "…"}</strong></code>
                {slugChecking && <span className="spinner" style={{ width:13, height:13 }} />}
                {!slugChecking && slugAvailable === true  && <span className={styles.slugOk}>✓ Διαθέσιμο</span>}
                {!slugChecking && slugAvailable === false && <span className={styles.slugTaken}>✗ Μη διαθέσιμο</span>}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Confirmation ── */}
        {step === 3 && (
          <div className="fade-up">
            <h2 className={styles.title}>Όλα έτοιμα!</h2>
            <p className={styles.sub}>Ελέγξτε τα στοιχεία σας πριν δημιουργήσετε τον λογαριασμό.</p>
            <div className={styles.summary}>
              {[
                ["Πλάνο",      `${planInfo?.name} — ${planInfo?.price}`],
                ["Όνομα",      `${firstName} ${lastName}`],
                ["Email",      email],
                ["Επιχείρηση", BUSINESS_TYPES.find(t => t.value === businessType)?.label],
                ["Μαγαζί",     shopName],
                ["URL μενού",  `…/menu/${slug}`],
              ].map(([k, v]) => (
                <div key={k} className={styles.summaryRow}>
                  <span className={styles.summaryKey}>{k}</span>
                  <span className={styles.summaryVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="msg-error" style={{ marginTop:16 }}>{error}</div>}

        <div className={styles.actions}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => { setError(""); setStep(s => s - 1); }}>
              ← Πίσω
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" style={{ flex:1 }} onClick={nextStep}>
              Συνέχεια →
            </button>
          ) : (
            <button className="btn btn-primary" style={{ flex:1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="spinner" /> : "Δημιουργία λογαριασμού"}
            </button>
          )}
        </div>

        <p className={styles.footer}>
          Έχετε ήδη λογαριασμό; <Link to="/login" state={location.state}>Σύνδεση</Link>
        </p>
      </div>
    </div>
  );
}