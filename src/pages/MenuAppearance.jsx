import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveAppearance } from "../services/api";
import layout from "./Layout.module.css";
import styles from "./MenuAppearance.module.css";

const LAMBDA_URL = "https://jqh5mcshzzlag7z26d76elkf6u0vtgzw.lambda-url.eu-central-1.on.aws";

const FONTS      = ["Inter", "Playfair Display", "Lato", "Roboto", "Syne", "DM Sans"];
const FONT_SIZES = ["small", "medium", "large"];
const RADII      = ["sharp", "soft", "rounded"];
const BORDERS    = ["none", "minimal", "full"];
const CARDS      = ["glass", "solid", "outline", "flat"];
const HEADERS    = ["centered", "left", "logo-only"];
const LAYOUTS    = ["grid", "list", "compact"];
const SPACINGS   = ["compact", "normal", "relaxed"];
const OPACITIES  = ["subtle", "medium", "strong"];
const ANIMATIONS = ["none", "fade", "slide"];

const DEFAULT_THEME = {
  primaryColor:      "#000000",
  accentColor:       "#ffffff",
  backgroundColor:   "#0a0a0a",
  textColor:         "#f0f0f0",
  secondaryBgColor:  "#111111",
  fontFamily:        "Inter",
  fontSize:          "medium",
  borderRadius:      "soft",
  borderStyle:       "minimal",
  cardStyle:         "glass",
  headerStyle:       "centered",
  layoutMode:        "grid",
  spacing:           "normal",
  glassOpacity:      "medium",
  animationStyle:    "fade",
  logoUrl:           null,
  coverImageUrl:     null,
  showPrices:        true,
  showDescriptions:  true,
  showStationBadges: false,
  showCategoryCount: true,
  showItemImages:    false,
  stickyHeader:      true,
  customCss:         "",
};

export default function MenuAppearance() {
  const { owner, shops, logout } = useAuth();
  const navigate    = useNavigate();
  const shop        = shops?.[0];
  const currentPlan = owner?.plan || "STANDARD";
  const iframeRef   = useRef(null);

  const [theme, setTheme]   = useState({ ...DEFAULT_THEME, ...shop?.theme });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

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
      setTimeout(() => {
        refreshPreview();
        setSaved(false);
      }, 800);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={layout.layout}>
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
          <div className={styles.controls}>

            {/* 1. ΧΡΩΜΑΤΑ */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Χρώματα</div>
              <div className={styles.colorGrid}>
                {[
                  { key: "primaryColor",     label: "Κύριο χρώμα" },
                  { key: "accentColor",      label: "Accent" },
                  { key: "backgroundColor",  label: "Φόντο" },
                  { key: "textColor",        label: "Κείμενο" },
                  { key: "secondaryBgColor", label: "Φόντο κάρτας" },
                ].map(c => (
                  <div key={c.key} className={styles.colorItem}>
                    <label className={styles.controlLabel}>{c.label}</label>
                    <div className={styles.colorRow}>
                      <input type="color" value={theme[c.key] || "#000000"} onChange={e => set(c.key, e.target.value)} className={styles.colorInput} />
                      <span className={styles.colorHex}>{theme[c.key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. ΓΡΑΜΜΑΤΟΣΕΙΡΑ */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Γραμματοσειρά</div>
              <div className={styles.chipGroup}>
                {FONTS.map(f => (
                  <button key={f} className={`${styles.chip} ${theme.fontFamily === f ? styles.chipActive : ""}`}
                    onClick={() => set("fontFamily", f)} style={{ fontFamily: f }}>
                    {f}
                  </button>
                ))}
              </div>
              <div className={styles.subLabel}>Μέγεθος κειμένου</div>
              <div className={styles.chipGroup}>
                {FONT_SIZES.map(s => (
                  <button key={s} className={`${styles.chip} ${theme.fontSize === s ? styles.chipActive : ""}`}
                    onClick={() => set("fontSize", s)}>
                    {s === "small" ? "Μικρό" : s === "medium" ? "Μεσαίο" : "Μεγάλο"}
                  </button>
                ))}
              </div>
            </section>

            {/* 3. ΓΩΝΙΕΣ & BORDERS */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Γωνίες & Borders</div>
              <div className={styles.subLabel}>Στυλ γωνιών</div>
              <div className={styles.chipGroup}>
                {RADII.map(r => (
                  <button key={r} className={`${styles.chip} ${theme.borderRadius === r ? styles.chipActive : ""}`}
                    onClick={() => set("borderRadius", r)}>
                    {r === "sharp" ? "Αιχμηρές" : r === "soft" ? "Απαλές" : "Στρογγυλές"}
                  </button>
                ))}
              </div>
              <div className={styles.subLabel}>Περίγραμμα</div>
              <div className={styles.chipGroup}>
                {BORDERS.map(b => (
                  <button key={b} className={`${styles.chip} ${theme.borderStyle === b ? styles.chipActive : ""}`}
                    onClick={() => set("borderStyle", b)}>
                    {b === "none" ? "Κανένα" : b === "minimal" ? "Minimal" : "Full"}
                  </button>
                ))}
              </div>
            </section>

            {/* 4. ΣΤΥΛ ΚΑΡΤΑΣ */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Στυλ Κάρτας Προϊόντος</div>
              <div className={styles.chipGroup}>
                {CARDS.map(c => (
                  <button key={c} className={`${styles.chip} ${theme.cardStyle === c ? styles.chipActive : ""}`}
                    onClick={() => set("cardStyle", c)}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
              <div className={styles.subLabel}>Αδιαφάνεια glass effect</div>
              <div className={styles.chipGroup}>
                {OPACITIES.map(o => (
                  <button key={o} className={`${styles.chip} ${theme.glassOpacity === o ? styles.chipActive : ""}`}
                    onClick={() => set("glassOpacity", o)}>
                    {o === "subtle" ? "Ελαφρύ" : o === "medium" ? "Μεσαίο" : "Έντονο"}
                  </button>
                ))}
              </div>
            </section>

            {/* 5. HEADER & LAYOUT */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Header & Layout</div>
              <div className={styles.subLabel}>Στυλ header</div>
              <div className={styles.chipGroup}>
                {HEADERS.map(h => (
                  <button key={h} className={`${styles.chip} ${theme.headerStyle === h ? styles.chipActive : ""}`}
                    onClick={() => set("headerStyle", h)}>
                    {h === "centered" ? "Κεντραρισμένο" : h === "left" ? "Αριστερά" : "Logo only"}
                  </button>
                ))}
              </div>
              <div className={styles.subLabel}>Layout μενού</div>
              <div className={styles.chipGroup}>
                {LAYOUTS.map(l => (
                  <button key={l} className={`${styles.chip} ${theme.layoutMode === l ? styles.chipActive : ""}`}
                    onClick={() => set("layoutMode", l)}>
                    {l === "grid" ? "Grid" : l === "list" ? "Λίστα" : "Compact"}
                  </button>
                ))}
              </div>
              <div className={styles.subLabel}>Spacing</div>
              <div className={styles.chipGroup}>
                {SPACINGS.map(s => (
                  <button key={s} className={`${styles.chip} ${theme.spacing === s ? styles.chipActive : ""}`}
                    onClick={() => set("spacing", s)}>
                    {s === "compact" ? "Compact" : s === "normal" ? "Normal" : "Relaxed"}
                  </button>
                ))}
              </div>
            </section>

            {/* 6. ANIMATIONS */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Animations</div>
              <div className={styles.chipGroup}>
                {ANIMATIONS.map(a => (
                  <button key={a} className={`${styles.chip} ${theme.animationStyle === a ? styles.chipActive : ""}`}
                    onClick={() => set("animationStyle", a)}>
                    {a === "none" ? "Καμία" : a === "fade" ? "Fade" : "Slide"}
                  </button>
                ))}
              </div>
            </section>

            {/* 7. ΟΡΑΤΟΤΗΤΑ */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Ορατότητα Στοιχείων</div>
              {[
                { key: "showPrices",        label: "Εμφάνιση τιμών" },
                { key: "showDescriptions",  label: "Εμφάνιση περιγραφών" },
                { key: "showStationBadges", label: "Badge σταθμού (Bar/Kitchen)" },
                { key: "showCategoryCount", label: "Αριθμός προϊόντων ανά κατηγορία" },
                { key: "showItemImages",    label: "Εικόνες προϊόντων" },
                { key: "stickyHeader",      label: "Sticky header κατά το scroll" },
              ].map(t => (
                <div key={t.key} className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>{t.label}</span>
                  <button
                    className={`${styles.toggle} ${theme[t.key] ? styles.toggleOn : ""}`}
                    onClick={() => set(t.key, !theme[t.key])}
                  >
                    <span className={`${styles.toggleKnob} ${theme[t.key] ? styles.toggleKnobOn : ""}`} />
                  </button>
                </div>
              ))}
            </section>

            {/* 8. CUSTOM CSS */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                Custom CSS <span className={styles.advancedBadge}>Advanced</span>
              </div>
              <p style={{ fontSize:"0.76rem", color:"var(--text-muted)", marginBottom:10, fontWeight:300 }}>
                Χρησιμοποίησε τις CSS variables: <code style={{ fontSize:"0.72rem" }}>--theme-primary</code>, <code style={{ fontSize:"0.72rem" }}>--theme-accent</code>, <code style={{ fontSize:"0.72rem" }}>--theme-bg</code>, <code style={{ fontSize:"0.72rem" }}>--theme-text</code>
              </p>
              <textarea
                className={styles.cssInput}
                value={theme.customCss}
                onChange={e => set("customCss", e.target.value)}
                placeholder={"/* Παράδειγμα:\n.menu-item { border-radius: 12px; }\n.category-title { letter-spacing: 0.2em; } */"}
                rows={7}
              />
            </section>

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