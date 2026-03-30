import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveAppearance } from "../services/api";
import layout from "./Layout.module.css";
import styles from "./MenuAppearance.module.css";

const FONTS     = ["Inter", "Playfair Display", "Lato", "Roboto", "Syne", "DM Sans"];
const FONT_SIZES = ["small", "medium", "large"];
const RADII     = ["sharp", "soft", "rounded"];
const BORDERS   = ["none", "minimal", "full"];
const CARDS     = ["glass", "solid", "outline", "flat"];
const HEADERS   = ["centered", "left", "logo-only"];
const LAYOUTS   = ["grid", "list", "compact"];

const DEFAULT_THEME = {
  primaryColor:      "#000000",
  accentColor:       "#ffffff",
  backgroundColor:   "#0a0a0a",
  textColor:         "#f0f0f0",
  fontFamily:        "Inter",
  fontSize:          "medium",
  borderRadius:      "soft",
  borderStyle:       "minimal",
  cardStyle:         "glass",
  headerStyle:       "centered",
  layoutMode:        "grid",
  logoUrl:           null,
  coverImageUrl:     null,
  showPrices:        true,
  showDescriptions:  true,
  showStationBadges: false,
  customCss:         "",
};

export default function MenuAppearance() {
  const { owner, shops, logout } = useAuth();
  const navigate = useNavigate();
  const shop     = shops?.[0];
  const currentPlan = owner?.plan || "STANDARD";

  const [theme, setTheme]       = useState({ ...DEFAULT_THEME, ...shop?.theme });
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved]      = useState(false);
  const [error,  setError]      = useState("");

  const set = (key, val) => setTheme(t => ({ ...t, [key]: val }));

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      await saveAppearance({ shopId: shop.shop_id, theme });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
            {saved  && <span className="msg-success" style={{ fontSize:13 }}>Αποθηκεύτηκε ✓</span>}
            {error  && <span className="msg-error"   style={{ fontSize:13 }}>{error}</span>}
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : "Αποθήκευση"}
            </button>
          </div>
        </header>

        <div className={styles.appearanceLayout}>

          {/* ── LEFT: Controls ── */}
          <div className={styles.controls}>

            {/* Χρώματα */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Χρώματα</div>
              <div className={styles.colorGrid}>
                {[
                  { key: "primaryColor",    label: "Κύριο χρώμα" },
                  { key: "accentColor",     label: "Accent" },
                  { key: "backgroundColor", label: "Φόντο" },
                  { key: "textColor",       label: "Κείμενο" },
                ].map(c => (
                  <div key={c.key} className={styles.colorItem}>
                    <label className={styles.controlLabel}>{c.label}</label>
                    <div className={styles.colorRow}>
                      <input type="color" value={theme[c.key]} onChange={e => set(c.key, e.target.value)} className={styles.colorInput} />
                      <span className={styles.colorHex}>{theme[c.key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Γραμματοσειρά */}
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

            {/* Γωνίες & Borders */}
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

            {/* Στυλ κάρτας */}
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
            </section>

            {/* Header & Layout */}
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
            </section>

            {/* Ορατότητα */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Ορατότητα Στοιχείων</div>
              {[
                { key: "showPrices",        label: "Εμφάνιση τιμών" },
                { key: "showDescriptions",  label: "Εμφάνιση περιγραφών" },
                { key: "showStationBadges", label: "Εμφάνιση badge σταθμού (Bar/Kitchen)" },
              ].map(t => (
                <div key={t.key} className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>{t.label}</span>
                  <button
                    className={`${styles.toggle} ${theme[t.key] ? styles.toggleOn : ""}`}
                    onClick={() => set(t.key, !theme[t.key])}
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
              ))}
            </section>

            {/* Custom CSS */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Custom CSS <span className={styles.advancedBadge}>Advanced</span></div>
              <textarea
                className={styles.cssInput}
                value={theme.customCss}
                onChange={e => set("customCss", e.target.value)}
                placeholder="/* π.χ. .menu-item { font-size: 16px; } */"
                rows={6}
              />
            </section>

          </div>

          {/* ── RIGHT: Preview ── */}
          <div className={styles.preview}>
            <div className={styles.previewLabel}>Preview</div>
            <div className={styles.previewCard} style={{
              backgroundColor: theme.backgroundColor,
              color:           theme.textColor,
              fontFamily:      theme.fontFamily,
              borderRadius:    theme.borderRadius === "sharp" ? 2 : theme.borderRadius === "soft" ? 8 : 16,
            }}>
              <div className={styles.previewHeader} style={{
                textAlign: theme.headerStyle === "centered" ? "center" : "left",
                borderBottom: `1px solid ${theme.accentColor}22`,
                color: theme.primaryColor,
              }}>
                {shop?.shopName || "Το Κατάστημά σας"}
              </div>
              <div className={styles.previewCategories}>
                {(shop?.menu?.slice(0, 2) || [{ name: "Ποτά", items: [{name:"Καφές", price:2.5}, {name:"Τσάι", price:2}] }]).map(cat => (
                  <div key={cat.name} className={styles.previewCat}>
                    <div className={styles.previewCatName} style={{ color: theme.accentColor }}>{cat.name}</div>
                    {(cat.items || []).slice(0, 3).map(item => (
                      <div key={item.name} className={styles.previewItem} style={{
                        background: theme.cardStyle === "glass"   ? `${theme.primaryColor}11` :
                                    theme.cardStyle === "solid"   ? `${theme.primaryColor}22` :
                                    theme.cardStyle === "outline" ? "transparent" : "transparent",
                        border: theme.borderStyle !== "none" ? `1px solid ${theme.accentColor}22` : "none",
                        borderRadius: theme.borderRadius === "sharp" ? 2 : theme.borderRadius === "soft" ? 6 : 12,
                      }}>
                        <span>{item.name}</span>
                        {theme.showPrices && <span style={{ color: theme.accentColor }}>{item.price?.toFixed(2)} €</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}