import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveMenu } from "../services/api";
import styles from "./MenuEditor.module.css";

const genId = () => Math.random().toString(36).substring(2, 10);
const STATIONS = [
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BAR",     label: "Bar" },
];
const newProduct = () => ({ id: genId(), name: "", price: "", description: "", station: "KITCHEN" });

function InlineEdit({ value, onSave, placeholder = "Χωρίς όνομα", className }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const inputRef              = useRef(null);
  const start   = () => { setDraft(value); setEditing(true); };
  const confirm = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
    else setDraft(value);
  };
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  if (editing) {
    return <input ref={inputRef} className={`${styles.inlineInput} ${className || ""}`} value={draft} onChange={e => setDraft(e.target.value)} onBlur={confirm} onKeyDown={e => { if (e.key === "Enter") confirm(); if (e.key === "Escape") setEditing(false); }} />;
  }
  return (
    <span className={`${styles.inlineText} ${className || ""}`} onClick={start} title="Κλικ για επεξεργασία">
      {value || <em style={{ color: "var(--text-muted)" }}>{placeholder}</em>}
      <span className={styles.editIcon}>✎</span>
    </span>
  );
}

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
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:14 }}>
            <div className="form-group">
              <label>Τιμή (€)</label>
              <input type="number" min="0" step="0.50" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Σταθμός</label>
              <select value={form.station} onChange={e => set("station", e.target.value)}>
                {STATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop:14 }}>
            <label>Περιγραφή</label>
            <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Προαιρετική περιγραφή..." rows={3} style={{ resize:"vertical" }} />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-ghost" onClick={onClose}>Ακύρωση</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim()}>Αποθήκευση</button>
        </div>
      </div>
    </div>
  );
}

export default function MenuEditor() {
  const { shops, logout } = useAuth();
  const navigate          = useNavigate();

  // ── Shop selector — έτοιμο για multi-shop ──
  const [selectedShopId, setSelectedShopId] = useState(null);
  const shop = shops?.find(s => s.shop_id === selectedShopId) || shops?.[0];

  useEffect(() => {
    if (shops?.length && !selectedShopId) setSelectedShopId(shops[0].shop_id);
  }, [shops]);

  // ── Menu state ──
  const [categories, setCategories] = useState([]);
  const [openCats, setOpenCats]     = useState({});
  const [modal, setModal]           = useState(null);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState("");
  const [dirty, setDirty]           = useState(false);

  // Reload menu when shop changes
  useEffect(() => {
    if (!shop) return;
    setDirty(false); setSaved(false);
    const hydrated = (shop.menu || []).map(cat => ({
      id: cat.id || genId(), name: cat.name || "",
      items: (cat.items || []).map(p => ({ id: p.id || genId(), ...p })),
    }));
    setCategories(hydrated);
    setOpenCats(hydrated.length > 0 ? { [hydrated[0].id]: true } : {});
  }, [selectedShopId, shop?.shop_id]);

  const mark = fn => (...args) => { fn(...args); setDirty(true); setSaved(false); };

  const addCategory    = mark(() => { const c = { id:genId(), name:"Νέα Κατηγορία", items:[] }; setCategories(cs=>[...cs,c]); setOpenCats(o=>({...o,[c.id]:true})); });
  const renameCategory = mark((id, name) => setCategories(cs => cs.map(c => c.id===id ? {...c,name} : c)));
  const deleteCategory = mark((id) => { if (!window.confirm("Διαγραφή κατηγορίας;")) return; setCategories(cs=>cs.filter(c=>c.id!==id)); });
  const toggleCat      = (id) => setOpenCats(o => ({...o,[id]:!o[id]}));

  const openAddProduct  = (catId) => setModal({ catId, product: newProduct() });
  const openEditProduct = (catId, product) => setModal({ catId, product });

  const saveProduct = mark(({ catId, product }) => {
    setCategories(cs => cs.map(cat => {
      if (cat.id !== catId) return cat;
      const exists = cat.items.find(p => p.id === product.id);
      return { ...cat, items: exists ? cat.items.map(p=>p.id===product.id?product:p) : [...cat.items,product] };
    }));
    setModal(null);
  });

  const deleteProduct = mark((catId, prodId) =>
    setCategories(cs => cs.map(cat => cat.id===catId ? {...cat,items:cat.items.filter(p=>p.id!==prodId)} : cat))
  );

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true); setError("");
    try {
      const menuToSave = categories.map(cat => ({
        id: cat.id, name: cat.name,
        items: cat.items.map(p => ({ id:p.id, name:p.name, price:p.price, description:p.description, station:p.station })),
      }));
      await saveMenu({ shopId: shop.shop_id, data: { menu: menuToSave } });
      setDirty(false); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleLogout  = () => { logout(); navigate("/login"); };
  const totalProducts = categories.reduce((a,c) => a + c.items.length, 0);

  return (
    <div className={styles.layout}>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>QRMenu</div>
        <nav className={styles.nav}>
          <Link to="/dashboard" className={styles.navItem}>Αρχική</Link>
          <a className={`${styles.navItem} ${styles.navActive}`}>Επεξεργασία Μενού</a>
        </nav>
        <div className={styles.sidebarFooter}>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width:"100%" }}>Αποσύνδεση</button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.heading}>Επεξεργασία Μενού</h1>
            <p className={styles.headingSub}>
              {categories.length} κατηγορίες · {totalProducts} προϊόντα
              {dirty && <span className={styles.dirtyDot}> ●</span>}
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {saved && <span className={styles.savedMsg}>✓ Αποθηκεύτηκε</span>}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? <span className="spinner" /> : "Αποθήκευση"}
            </button>
          </div>
        </div>

        {/* ── Shop selector ── */}
        <div className={styles.shopSelector}>
          <span className={styles.shopSelectorLabel}>Κατάστημα</span>
          <select
            className={styles.shopSelectorSelect}
            value={selectedShopId || ""}
            onChange={e => setSelectedShopId(e.target.value)}
          >
            {(shops || []).map(s => (
              <option key={s.shop_id} value={s.shop_id}>
                {s.shopName || s.settings?.shopName || s.shop_id}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="msg-error" style={{ marginBottom:16 }}>{error}</div>}

        {/* Category list */}
        <div className={styles.catList}>
          {categories.length === 0 && (
            <div className={styles.emptyState}>
              <p>Δεν υπάρχουν κατηγορίες ακόμα.</p>
              <p className={styles.emptyHint}>Προσθέστε την πρώτη κατηγορία παρακάτω.</p>
            </div>
          )}

          {categories.map((cat) => (
            <div key={cat.id} className={styles.catCard}>
              <div className={styles.catHeader}>
                <button className={styles.catToggle} onClick={() => toggleCat(cat.id)}>
                  <span className={`${styles.chevron} ${openCats[cat.id] ? styles.chevronOpen : ""}`}>›</span>
                </button>
                <InlineEdit value={cat.name} onSave={(name) => renameCategory(cat.id, name)} placeholder="Όνομα κατηγορίας" className={styles.catName} />
                <span className={styles.catCount}>{cat.items.length} προϊόντα</span>
                <div className={styles.catActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { openAddProduct(cat.id); setOpenCats(o=>({...o,[cat.id]:true})); }}>+ Προϊόν</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(cat.id)}>✕</button>
                </div>
              </div>

              {openCats[cat.id] && (
                <div className={styles.productList}>
                  {cat.items.length === 0 && <div className={styles.emptyProducts}>Καμία προϊόν — πατήστε «+ Προϊόν».</div>}
                  {cat.items.map((product) => (
                    <div key={product.id} className={styles.productRow}>
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.name || <em style={{color:"var(--text-muted)"}}>Χωρίς όνομα</em>}</span>
                        {product.description && <span className={styles.productDesc}>{product.description}</span>}
                      </div>
                      <div className={styles.productMeta}>
                        <span className={styles.stationBadge}>{product.station}</span>
                        <span className={styles.productPrice}>{product.price != null && product.price !== "" ? `${Number(product.price).toFixed(2)} €` : "—"}</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditProduct(cat.id, product)}>Επεξεργασία</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(cat.id, product.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button className={styles.addCatBtn} onClick={addCategory}>+ Νέα Κατηγορία</button>
      </main>

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