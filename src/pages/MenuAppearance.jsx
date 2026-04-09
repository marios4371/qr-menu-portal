import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveAppearance } from "../services/api";
import layout from "./Layout.module.css";
import styles from "./MenuAppearance.module.css";

const LAMBDA_URL = "https://jqh5mcshzzlag7z26d76elkf6u0vtgzw.lambda-url.eu-central-1.on.aws";

const FONTS = [
  "DM Sans", "Inter", "Playfair Display", "Lato",
  "Roboto", "Syne", "Merriweather", "Montserrat",
];

const DEFAULT_THEME = {
  // ── Χρώματα ────────────────────────────────────────────────
  titleColor:       "#F0EBE0",
  categoryColor:    "#C9A84C",
  productColor:     "#F0EBE0",
  priceColor:       "#C9A84C",
  descColor:        "#7A7268",
  bgColor:          "#0C0C0D",
  accentColor:      "#C9A84C",
  cardBgColor:      "#1A1A1B",

  // ── Γραμματοσειρές ─────────────────────────────────────────
  titleFont:        "Playfair Display",
  titleSize:        "2.4rem",
  titleWeight:      "400",
  titleSpacing:     "0.18em",
  titleAlign:       "center",

  categoryFont:     "DM Sans",
  categorySize:     "1.1rem",
  categoryWeight:   "400",
  categorySpacing:  "0.08em",
  categoryAlign:    "left",

  productFont:      "DM Sans",
  productSize:      "0.9rem",
  productWeight:    "400",

  descFont:         "DM Sans",
  descSize:         "0.76rem",

  priceFont:        "Playfair Display",
  priceSize:        "0.95rem",
  priceWeight:      "400",

  // ── Εφέ & Layout ────────────────────────────────────────────
  layoutMode:       "tabs",       // "tabs" | "accordion"
  cardStyle:        "flat",       // "flat" | "glass" | "solid" | "outline"
  spacing:          "normal",     // "compact" | "normal" | "relaxed"
  animationStyle:   "fade",       // "none" | "fade" | "slide"
  borderRadius:     "soft",       // "sharp" | "soft" | "rounded"
  stickyHeader:     true,
  showPrices:       true,
  showDescriptions: true,
  showStationBadges:false,

  customCss: "",
};

// ─── Accordion Section Component ──────────────────────────────
function AccordionSection({ id, title, icon, openId, setOpenId, children }) {
  const isOpen = openId === id;
  return (
    <div className={`${styles.accordionItem} ${isOpen ? styles.accordionOpen : ""}`}>
      <button
        className={styles.accordionHeader}
        onClick={() => setOpenId(isOpen ? null : id)}
      >
        <span className={styles.accordionIcon}>{icon}</span>
        <span className={styles.accordionTitle}>{title}</span>
        <span className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ""}`}>›</span>
      </button>
      {isOpen && (
        <div className={styles.accordionBody}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Reusable Controls ─────────────────────────────────────────
function ColorRow({ label, value, onChange }) {
  return (
    <div className={styles.colorRow}>
      <span className={styles.colorLabel}>{label}</span>
      <div className={styles.colorRight}>
        <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)} className={styles.colorInput} />
        <span className={styles.colorHex}>{value}</span>
      </div>
    </div>
  );
}

function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className={styles.controlGroup}>
      {label && <div className={styles.controlLabel}>{label}</div>}
      <div className={styles.chipGroup}>
        {options.map(opt => (
          <button
            key={opt.value}
            className={`${styles.chip} ${value === opt.value ? styles.chipActive : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className={styles.toggleRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <button
        className={`${styles.toggle} ${value ? styles.toggleOn : ""}`}
        onClick={() => onChange(!value)}
      >
        <span className={`${styles.toggleKnob} ${value ? styles.toggleKnobOn : ""}`} />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function MenuAppearance() {
  const { owner, shops, logout } = useAuth();
  const navigate    = useNavigate();
  const shop        = shops?.[0];
  const currentPlan = owner?.plan || "STANDARD";
  const iframeRef   = useRef(null);

  const [theme, setTheme]     = useState({ ...DEFAULT_THEME, ...shop?.theme });
  const [openId, setOpenId]   = useState("colors"); // πρώτο section ανοιχτό
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [error,  setError]    = useState("");

  const set = (key, val) => setTheme(t => ({ ...t, [key]: val }));

  const menuPreviewUrl = shop?.shopSlug
    ? `${LAMBDA_URL}/menu/${shop.shopSlug}`
    : null;

  const refreshPreview = () => {
    if (iframeRef.current && menuPreviewUrl) {
      iframeRef.current.src = `${menuPreviewUrl}?t=${Date.now()}`;
    }
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      await saveAppearance({ shopId: shop.shop_id, theme });
      setSaved(true);
      setTimeout(() => { refreshPreview(); setSaved(false); }, 800);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={layout.layout}>
      {/* ── SIDEBAR ── */}
      <aside className={layout.sidebar}>
        <div className={layout.sidebarLogo}>QRMenu</div>
        <nav className={layout.nav}>
          <Link to="/dashboard"       className={layout.navItem}>Αρχική</Link>
          <Link to="/menu-editor"     className={layout.navItem}>Επεξεργασία Μενού</Link>
          <Link to="/menu-appearance" className={`${layout.navItem} ${layout.navActive}`}>Εμφάνιση Μενού</Link>
        </nav>
        <div className={layout.sidebarFooter}>
          <button className={styles.upgradePlanBtn} onClick={() => navigate("/dashboard")}>
            <span className={styles.upgradePlanLabel}>{currentPlan} Πακέτο</span>
            <span className={styles.upgradePlanArrow}>↑ Αναβάθμιση</span>
          </button>
          <div className={layout.ownerInfo}>
            <div className={layout.ownerAvatar}>{owner?.firstName?.[0]}{owner?.lastName?.[0]}</div>
            <div className={layout.ownerInfoText}>
              <div className={layout.ownerName}>{owner?.firstName} {owner?.lastName}</div>
              <div className={layout.ownerEmail}>{owner?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/login"); }} style={{ width:"100%", marginTop:12 }}>
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={layout.main}>
        <header className={layout.header}>
          <div>
            <h1 className={layout.heading}>Εμφάνιση Μενού</h1>
            <p className={layout.headingSub}>Προσαρμόστε την εμφάνιση του μενού σας.</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {saved && <span className="msg-success" style={{ fontSize:13 }}>Αποθηκεύτηκε ✓</span>}
            {error && <span className="msg-error"   style={{ fontSize:13 }}>{error}</span>}
            <button className="btn btn-ghost btn-sm" onClick={refreshPreview}>↻ Preview</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : "Αποθήκευση"}
            </button>
          </div>
        </header>

        <div className={styles.appearanceLayout}>

          {/* ── LEFT: Accordion Controls ── */}
          <div className={styles.controls}>

            {/* 1. ΧΡΩΜΑΤΑ */}
            <AccordionSection id="colors" title="Επεξεργασία Χρωμάτων" icon="◈" openId={openId} setOpenId={setOpenId}>
              <div className={styles.colorSection}>
                <div className={styles.colorGroupLabel}>Κείμενο</div>
                <ColorRow label="Τίτλος καταστήματος" value={theme.titleColor}    onChange={v => set("titleColor", v)} />
                <ColorRow label="Κατηγορίες"           value={theme.categoryColor} onChange={v => set("categoryColor", v)} />
                <ColorRow label="Προϊόντα"             value={theme.productColor}  onChange={v => set("productColor", v)} />
                <ColorRow label="Τιμές"                value={theme.priceColor}    onChange={v => set("priceColor", v)} />
                <ColorRow label="Περιγραφή"            value={theme.descColor}     onChange={v => set("descColor", v)} />
                <div className={styles.colorGroupLabel} style={{ marginTop:16 }}>Φόντο & Accent</div>
                <ColorRow label="Φόντο σελίδας"        value={theme.bgColor}       onChange={v => set("bgColor", v)} />
                <ColorRow label="Φόντο κάρτας"         value={theme.cardBgColor}   onChange={v => set("cardBgColor", v)} />
                <ColorRow label="Accent / Διακοσμητικά" value={theme.accentColor}  onChange={v => set("accentColor", v)} />
              </div>
            </AccordionSection>

            {/* 2. ΓΡΑΜΜΑΤΟΣΕΙΡΕΣ — Sprint C2 */}
            <AccordionSection id="typography" title="Επεξεργασία Γραμματοσειράς" icon="Aa" openId={openId} setOpenId={setOpenId}>
              <div className={styles.comingSoon}>
                <span className={styles.comingSoonIcon}>⊕</span>
                <span>Έρχεται στο Sprint C2</span>
              </div>
            </AccordionSection>

            {/* 3. ΕΦΕ — Sprint C3 */}
            <AccordionSection id="effects" title="Επεξεργασία Εφέ" icon="⟳" openId={openId} setOpenId={setOpenId}>
              <div className={styles.comingSoon}>
                <span className={styles.comingSoonIcon}>⊕</span>
                <span>Έρχεται στο Sprint C3</span>
              </div>
            </AccordionSection>

            {/* Custom CSS */}
            <AccordionSection id="css" title="Custom CSS" icon="{}" openId={openId} setOpenId={setOpenId}>
              <p style={{ fontSize:"0.76rem", color:"var(--text-muted)", marginBottom:10, fontWeight:300 }}>
                Διαθέσιμες variables: <code style={{ fontSize:"0.72rem" }}>--theme-bg</code>, <code style={{ fontSize:"0.72rem" }}>--theme-accent</code>, <code style={{ fontSize:"0.72rem" }}>--theme-title-color</code> κ.α.
              </p>
              <textarea
                className={styles.cssInput}
                value={theme.customCss}
                onChange={e => set("customCss", e.target.value)}
                placeholder={"/* Παράδειγμα:\n.shop-name { letter-spacing: 0.3em; }\n.pprice { font-style: italic; } */"}
                rows={7}
              />
            </AccordionSection>

          </div>

          {/* ── RIGHT: Live Preview ── */}
          <div className={styles.preview}>
            <div className={styles.previewLabelRow}>
              <span className={styles.previewLabel}>Live Preview</span>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>
                  Αποθήκευσε για να δεις τις αλλαγές
                </span>
                {menuPreviewUrl && (
                  <a href={menuPreviewUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm" style={{ fontSize:"0.72rem", padding:"4px 10px" }}>
                    Άνοιγμα ↗
                  </a>
                )}
              </div>
            </div>
            {menuPreviewUrl ? (
              <div className={styles.iframeWrapper}>
                <iframe
                  ref={iframeRef}
                  src={menuPreviewUrl}
                  className={styles.previewIframe}
                  title="Menu Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className={styles.previewEmpty}>
                <p>Δεν υπάρχει διαθέσιμο URL μενού.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}