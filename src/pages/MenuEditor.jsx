import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveMenu, getOwnerDashboard } from "../services/api";
import styles from "./MenuEditor.module.css";
import layout from "./Layout.module.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).substring(2, 10);

const STATIONS = [
  { value: "KITCHEN", label: "🍳 Kitchen" },
  { value: "BAR",     label: "🍹 Bar" },
];

// Empty templates
const newCategory = (name = "") => ({ id: genId(), name, items: [] });
const newProduct  = () => ({ id: genId(), name: "", price: "", description: "", station: "KITCHEN" });

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline editable text — click to edit, Enter/blur to confirm */
function InlineEdit({ value, onSave, placeholder = "Χωρίς όνομα", className }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const inputRef              = useRef(null);

  const start = () => { setDraft(value); setEditing(true); };
  const confirm = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
    else setDraft(value);
  };

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`${styles.inlineInput} ${className || ""}`}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={confirm}
        onKeyDown={e => { if (e.key === "Enter") confirm(); if (e.key === "Escape") setEditing(false); }}
      />
    );
  }
  return (
    <span className={`${styles.inlineText} ${className || ""}`} onClick={start} title="Κλικ για επεξεργασία">
      {value || <em style={{ color: "var(--text-muted)" }}>{placeholder}</em>}
      <span className={styles.editIcon}>✎</span>
    </span>
  );
}

/** Modal για add/edit product */
function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({ ...product });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const price = parseFloat(String(form.price).replace(",", "."));
    onSave({ ...form, price: isNaN(price) ? 0 : price, name: form.name.trim(), description: form.description?.trim() || "" });
  };

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{product.name ? "Επεξεργασία προϊόντος" : "Νέο προϊόν"}</h3>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className="form-group">
            <label>Όνομα προϊόντος *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="π.χ. Μπριζόλα χοιρινή" autoFocus />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            <div className="form-group">
              <label>Τιμή (€)</label>
              <input
                type="number" min="0" step="0.50"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Σταθμός</label>
              <select value={form.station} onChange={e => set("station", e.target.value)}>
                {STATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Περιγραφή</label>
            <textarea
              value={form.description || ""}
              onChange={e => set("description", e.target.value)}
              placeholder="Προαιρετική περιγραφή..."
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-ghost" onClick={onClose}>Ακύρωση</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim()}>
            Αποθήκευση
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MenuEditor() {
  const { owner, shops, logout, login } = useAuth();
  const navigate          = useNavigate();
  const [selectedShopIdx, setSelectedShopIdx] = useState(0);
  const shop              = shops?.[selectedShopIdx] ?? shops?.[0];

  // Αντιγραφή του menu σε local state — δεν αλλάζει το global state μέχρι το Save
  const [categories, setCategories] = useState([]);
  const [openCats, setOpenCats]     = useState({});   // { catId: bool }
  const [modal, setModal]           = useState(null);  // { catId, product } | null
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState("");
  const [dirty, setDirty]           = useState(false); // unsaved changes

  // Αρχικοποίηση από shop.menu (DynamoDB format)
  useEffect(() => {
    if (!shop) return;
    // Format: [ { name, items: [ { name, price, description, station } ] } ]
    // Προσθέτουμε client-side id για React keys
    const hydrated = (shop.menu || []).map(cat => ({
      id:    cat.id    || genId(),
      name:  cat.name  || "",
      items: (cat.items || []).map(p => ({ id: p.id || genId(), ...p })),
    }));
    setCategories(hydrated);
    // Άνοιξε την πρώτη κατηγορία αυτόματα
    if (hydrated.length > 0) setOpenCats({ [hydrated[0].id]: true });
  }, [shop]);

  // Mark dirty on every change
  const mark = fn => (...args) => { fn(...args); setDirty(true); setSaved(false); };

  // ── Category operations ───────────────────────────────────────────────────

  const addCategory = mark(() => {
    const cat = newCategory("Νέα Κατηγορία");
    setCategories(c => [...c, cat]);
    setOpenCats(o => ({ ...o, [cat.id]: true }));
  });

  const renameCategory = mark((catId, name) =>
    setCategories(c => c.map(cat => cat.id === catId ? { ...cat, name } : cat))
  );

  const deleteCategory = mark((catId) => {
    if (!window.confirm("Διαγραφή κατηγορίας και όλων των προϊόντων της;")) return;
    setCategories(c => c.filter(cat => cat.id !== catId));
  });

  const toggleCat = (catId) =>
    setOpenCats(o => ({ ...o, [catId]: !o[catId] }));

  // ── Product operations ────────────────────────────────────────────────────

  const openAddProduct = (catId) =>
    setModal({ catId, product: newProduct() });

  const openEditProduct = (catId, product) =>
    setModal({ catId, product });

  const saveProduct = mark(({ catId, product }) => {
    setCategories(c => c.map(cat => {
      if (cat.id !== catId) return cat;
      const exists = cat.items.find(p => p.id === product.id);
      return {
        ...cat,
        items: exists
          ? cat.items.map(p => p.id === product.id ? product : p)
          : [...cat.items, product],
      };
    }));
    setModal(null);
  });

  const deleteProduct = mark((catId, productId) => {
    setCategories(c => c.map(cat =>
      cat.id === catId
        ? { ...cat, items: cat.items.filter(p => p.id !== productId) }
        : cat
    ));
  });

  // ── Save to DynamoDB ──────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true);
    setError("");
    try {
      // Strip client-side id from items before saving — server doesn't need it
      // (αλλά το κρατάμε ούτως ή άλλως γιατί δεν βλάπτει και βοηθά στο future)
      const menuToSave = categories.map(cat => ({
        id:    cat.id,
        name:  cat.name,
        items: cat.items.map(p => ({
          id:          p.id,
          name:        p.name,
          price:       p.price,
          description: p.description,
          station:     p.station,
        })),
      }));

      await saveMenu({ shopId: shop.shop_id, data: { menu: menuToSave } });

      // Ανανέωση AuthContext ώστε το shop.menu να είναι up-to-date
      // χωρίς αυτό, το useEffect([shop]) δεν ξανά-τρέχει και η σελίδα
      // δείχνει κενό κατά το επόμενο mount
      const token = localStorage.getItem("qrmenu_token");
      if (token) {
        const dashData = await getOwnerDashboard();
        login(token, dashData.owner, dashData.shops);
      }

      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  // ─────────────────────────────────────────────────────────────────────────

  const totalProducts = categories.reduce((a, c) => a + c.items.length, 0);

  return (
    <div className={layout.layout}>

      {/* Sidebar */}
      <aside className={layout.sidebar}>
        <div className={layout.sidebarLogo}>QRMenu</div>
        <nav className={layout.nav}>
          <Link to="/dashboard" className={layout.navItem}>Αρχική</Link>
          <a className={`${layout.navItem} ${layout.navActive}`}>Επεξεργασία Μενού</a>
          {owner?.plan && owner.plan !== "STANDARD" && (
            <Link to="/menu-appearance" className={layout.navItem}>Εμφάνιση Μενού</Link>
          )}
        </nav>
        <div className={layout.sidebarFooter}>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width:"100%" }}>
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={layout.main}>

        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={layout.heading}>Επεξεργασία Μενού</h1>
            <p className={layout.headingSub}>
              {categories.length} κατηγορίες · {totalProducts} προϊόντα
              {dirty && <span className={styles.dirtyDot} title="Μη αποθηκευμένες αλλαγές"> ●</span>}
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {shops && shops.length > 0 && (
              <div className={styles.shopSelector}>
                <span className={styles.shopSelectorLabel}>Επιλογή Καταστήματος</span>
                <select
                  className={styles.shopSelectorSelect}
                  value={selectedShopIdx}
                  onChange={e => setSelectedShopIdx(Number(e.target.value))}
                >
                  {shops.map((s, i) => (
                    <option key={s.shop_id} value={i}>
                      {s.shopName || s.settings?.shopName || s.shop_id}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {saved && <span className={styles.savedMsg}>✓ Αποθηκεύτηκε</span>}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              {saving ? <span className="spinner" /> : "Αποθήκευση"}
            </button>
          </div>
        </div>

        {error && <div className="msg-error" style={{ marginBottom:20 }}>{error}</div>}

        {/* Category list */}
        <div className={styles.catList}>
          {categories.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>◈</div>
              <p>Δεν υπάρχουν κατηγορίες ακόμα.</p>
              <p style={{ fontSize:"0.85rem", color:"var(--text-muted)" }}>Προσθέστε την πρώτη σας κατηγορία παρακάτω.</p>
            </div>
          )}

          {categories.map((cat, catIdx) => (
            <div key={cat.id} className={styles.catCard}>

              {/* Category header */}
              <div className={styles.catHeader}>
                <button
                  className={styles.catToggle}
                  onClick={() => toggleCat(cat.id)}
                  aria-expanded={!!openCats[cat.id]}
                >
                  <span className={`${styles.chevron} ${openCats[cat.id] ? styles.chevronOpen : ""}`}>›</span>
                </button>

                <InlineEdit
                  value={cat.name}
                  onSave={(name) => renameCategory(cat.id, name)}
                  placeholder="Όνομα κατηγορίας"
                  className={styles.catName}
                />

                <span className={styles.catCount}>{cat.items.length} προϊόντα</span>

                <div className={styles.catActions}>
                  <button
                    className={`btn btn-ghost btn-sm ${styles.addProductBtn}`}
                    onClick={() => { openAddProduct(cat.id); setOpenCats(o => ({ ...o, [cat.id]: true })); }}
                  >
                    + Προϊόν
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteCategory(cat.id)}
                    title="Διαγραφή κατηγορίας"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Products */}
              {openCats[cat.id] && (
                <div className={styles.productList}>
                  {cat.items.length === 0 && (
                    <div className={styles.emptyProducts}>
                      Καμία προϊόν — πατήστε «+ Προϊόν» για να προσθέσετε.
                    </div>
                  )}
                  {cat.items.map((product) => (
                    <div key={product.id} className={styles.productRow}>
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.name || <em style={{color:"var(--text-muted)"}}>Χωρίς όνομα</em>}</span>
                        {product.description && (
                          <span className={styles.productDesc}>{product.description}</span>
                        )}
                      </div>
                      <div className={styles.productMeta}>
                        <span className={`${styles.stationBadge} ${product.station === "BAR" ? styles.stationBar : styles.stationKitchen}`}>
                          {product.station === "BAR" ? "🍹 Bar" : "🍳 Kitchen"}
                        </span>
                        <span className={styles.productPrice}>
                          {product.price != null && product.price !== ""
                            ? `${Number(product.price).toFixed(2)} €`
                            : "—"}
                        </span>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEditProduct(cat.id, product)}
                        >
                          Επεξεργασία
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteProduct(cat.id, product.id)}
                          title="Διαγραφή"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add category button */}
        <button className={styles.addCatBtn} onClick={addCategory}>
          + Νέα Κατηγορία
        </button>
      </main>

      {/* Product Modal */}
      {modal && (
        <ProductModal
          product={modal.product}
          onSave={(product) => saveProduct({ catId: modal.catId, product })}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}