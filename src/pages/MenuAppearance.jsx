// src/pages/MenuAppearance.jsx — Figma frame 07 simplified: categories editor + phone preview
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader, ShopSelectPill } from '../components/Primitives';
import { saveMenu, MENU_BASE_URL } from '../services/api';

// ── Category Modal ──────────────────────────────────────────────────────────
function CategoryModal({ initialName, onClose, onSave }) {
  const [name, setName] = useState(initialName || '');
  const submit = () => { if (name.trim()) onSave(name.trim()); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{initialName ? 'Επεξεργασία κατηγορίας' : 'Νέα κατηγορία'}</h3>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">Όνομα κατηγορίας *</label>
            <input
              className="form-input"
              placeholder="π.χ. Καφέδες"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Ακύρωση</button>
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={!name.trim()}>
            {initialName ? 'Αποθήκευση' : 'Προσθήκη'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function MenuAppearance() {
  const { owner, shops, setShops, currentShopId, setCurrentShopId } = useAuth();
  const shop = shops.find(sh => sh.shop_id === currentShopId) || shops[0];
  const isLegacy = !shop?.shop_id?.startsWith('SHOP#');

  const [menu, setMenu]               = useState(shop?.menu || []);
  const [dirty, setDirty]             = useState(false);
  const [busy, setBusy]               = useState(false);
  const [savedToast, setSavedToast]   = useState(false);
  const [saveErr, setSaveErr]         = useState('');
  const [previewKey, setPreviewKey]   = useState(0);

  // Modals
  const [newCatOpen, setNewCatOpen]   = useState(false);
  const [editCatId, setEditCatId]     = useState(null);

  useEffect(() => {
    if (shop) {
      setMenu(shop.menu || []);
      setDirty(false);
    }
  }, [shop?.shop_id]);

  if (!shop) return null;

  // STANDARD plan gate — same as before
  if (owner?.plan === 'STANDARD') {
    return (
      <main className="page-main">
        <PageHeader topbarLabel="Εμφάνιση" title="Εμφάνιση μενού" sub="Διαθέσιμο σε Premium και Exclusive πλάνα."/>
        <div className="me-gate" style={{ marginTop: 40 }}>
          <div className="me-gate-icon"><Icon name="lock" size={22}/></div>
          <h3>Απαιτείται Premium ή Exclusive</h3>
          <p>Η προσαρμογή εμφάνισης σας επιτρέπει να σχεδιάσετε το ψηφιακό μενού στα μέτρα του καταστήματός σας.</p>
        </div>
      </main>
    );
  }

  const update = (nm) => { setMenu(nm); setDirty(true); };
  const editingCat = editCatId ? menu.find(c => c.id === editCatId) : null;

  const addCat = (name) => {
    const id = 'c' + Date.now();
    update([...menu, { id, name, items: [] }]);
  };
  const renameCat = (id, name) => update(menu.map(c => c.id === id ? { ...c, name } : c));
  const deleteCat = (id) => {
    if (!window.confirm('Διαγραφή κατηγορίας; Θα διαγραφούν και όλα τα προϊόντα της.')) return;
    update(menu.filter(c => c.id !== id));
  };
  const moveCat = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= menu.length) return;
    const nm = [...menu];
    [nm[idx], nm[j]] = [nm[j], nm[idx]];
    update(nm);
  };

  const save = async () => {
    if (busy || !dirty) return;
    setBusy(true); setSaveErr('');
    try {
      await saveMenu({ shopId: shop.shop_id, data: { menu } });
      setShops(prev => prev.map(sh => sh.shop_id === shop.shop_id ? { ...sh, menu } : sh));
      setDirty(false);
      setSavedToast(true);
      setPreviewKey(k => k + 1);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      setSaveErr(e.message || 'Σφάλμα αποθήκευσης.');
    } finally {
      setBusy(false);
    }
  };

  // Topbar: centered shop pill
  const centerPill = (
    <ShopSelectPill
      value={currentShopId}
      onChange={e => setCurrentShopId(e.target.value)}
      shops={shops}
    />
  );

  return (
    <main className="page-main" style={{ overflow: 'hidden' }}>
      <PageHeader
        topbarLabel="Εμφάνιση Μενού"
        center={centerPill}
      />

      {saveErr && <div className="msg-error" style={{ margin: '12px 28px 0', flexShrink: 0 }}>{saveErr}</div>}

      <div className="ma-layout">
        {/* ── Categories editor (left) ── */}
        <div className="ma-acc">
          <div className="ma-cat-head">
            <span className="ma-cat-title">Κατηγορίες</span>
            <button className="btn btn-primary btn-sm" onClick={() => setNewCatOpen(true)}>
              <Icon name="plus" size={11}/>Νέα Κατηγορία
            </button>
          </div>

          <div className="ma-cat-list">
            {menu.length === 0 && (
              <div className="ma-cat-empty">Δεν υπάρχουν κατηγορίες ακόμα.</div>
            )}
            {menu.map((cat, i) => (
              <div key={cat.id} className="ma-cat-item">
                <div className="ma-cat-info">
                  <span className="ma-cat-name">{cat.name}</span>
                  <span className="ma-cat-count">{cat.items?.length || 0} προϊόντα</span>
                </div>
                <div className="ma-cat-acts">
                  <button
                    className="ma-cat-iconbtn"
                    onClick={() => moveCat(i, -1)}
                    disabled={i === 0}
                    title="Πάνω"
                  >▲</button>
                  <button
                    className="ma-cat-iconbtn"
                    onClick={() => moveCat(i, 1)}
                    disabled={i === menu.length - 1}
                    title="Κάτω"
                  >▼</button>
                  <button
                    className="ma-cat-iconbtn"
                    onClick={() => setEditCatId(cat.id)}
                    title="Επεξεργασία"
                  ><Icon name="edit" size={11}/></button>
                  <button
                    className="ma-cat-iconbtn ma-cat-iconbtn-del"
                    onClick={() => deleteCat(cat.id)}
                    title="Διαγραφή"
                  ><Icon name="trash" size={11}/></button>
                </div>
              </div>
            ))}
          </div>

          {/* Save bar at the bottom */}
          <div className="ma-save-bar">
            <button className="ma-save-btn" onClick={save} disabled={busy || !dirty}>
              {busy ? <><span className="spinner"/>Αποθήκευση…</> : <><Icon name="save" size={14}/>Αποθήκευση Αλλαγών</>}
            </button>
          </div>
        </div>

        {/* ── Phone preview (right) — kept as before ── */}
        <div className="ma-preview">
          <div className="ma-preview-head">
            <span className="ma-preview-lab">Προεπισκόπηση</span>
            {isLegacy
              ? <span className="tag" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Legacy template</span>
              : <span className="tag tag-live"><span className="tag-dot"/>Live</span>
            }
          </div>
          <div className="ma-preview-frame">
            <div className="ma-preview-inner">
              {isLegacy
                ? <iframe
                    src={`https://1f6nesbrjk.execute-api.eu-central-1.amazonaws.com/default/?shop=${shop.shop_id}`}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    title="Live menu preview"
                  />
                : <iframe
                    key={previewKey}
                    src={`${MENU_BASE_URL}/menu/${shop.shopSlug}`}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    title="Live menu preview"
                  />
              }
            </div>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            // Πατήστε Αποθήκευση για να ανανεωθεί η προεπισκόπηση
          </p>
        </div>
      </div>

      {savedToast && <div className="toast">✓ Αποθηκεύτηκε</div>}

      {newCatOpen && (
        <CategoryModal
          onClose={() => setNewCatOpen(false)}
          onSave={(name) => { addCat(name); setNewCatOpen(false); }}
        />
      )}

      {editingCat && (
        <CategoryModal
          initialName={editingCat.name}
          onClose={() => setEditCatId(null)}
          onSave={(name) => { renameCat(editCatId, name); setEditCatId(null); }}
        />
      )}
    </main>
  );
}
