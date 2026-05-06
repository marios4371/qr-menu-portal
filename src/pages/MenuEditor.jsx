// src/pages/MenuEditor.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { saveMenu, saveAppearance } from '../services/api';

// ── Layout modes (display-mode picker) ────────────────────────────────────────
const LAYOUT_MODES = [
  { key: 'accordion', name: 'Vertical Accordion', desc: 'Όλες οι κατηγορίες stacked, ξεδιπλώνουν με click. Compact.', tier: 'STANDARD' },
  { key: 'sticky-tabs', name: 'Sticky Tab Bar',     desc: 'efood-style: tabs sticky στο header, click → scroll στη section.', tier: 'PREMIUM' },
  { key: 'side-tabs',   name: 'Side Tabs',          desc: 'Desktop: vertical λίστα κατηγοριών αριστερά, προϊόντα δεξιά.',   tier: 'PREMIUM' },
  { key: 'grid-mosaic', name: 'Grid Mosaic',        desc: 'Pinterest/masonry. Image-heavy. Bars, signature dishes.',         tier: 'PREMIUM' },
  { key: 'magazine',    name: 'Magazine Pages',     desc: 'One category per scroll page. Hero + items. Cinematic.',          tier: 'PREMIUM' },
  { key: 'compact',     name: 'Compact List',       desc: 'Text-only. Πολύ γρήγορο για παραδοσιακά μεγάλα μενού.',           tier: 'PREMIUM' },
  { key: 'hero',        name: 'Hero Featured',      desc: '2-4 highlighted items πάνω, υπόλοιπα σε compact list.',           tier: 'PREMIUM' },
];

const TIER_ORDER = { STANDARD: 0, PREMIUM: 1, EXCLUSIVE: 2 };

function LayoutThumb({ mode }) {
  switch (mode) {
    case 'accordion':
      return (
        <div className="lay-thumb">
          <div className="lay-thumb-bar short"/>
          <div className="lay-thumb-row dark"/>
          <div className="lay-thumb-row"/>
          <div className="lay-thumb-row"/>
          <div className="lay-thumb-row dark"/>
          <div className="lay-thumb-row dark"/>
        </div>
      );
    case 'sticky-tabs':
      return (
        <div className="lay-thumb">
          <div className="lay-thumb-bar short"/>
          <div className="lay-thumb-tabs">
            <span className="lay-thumb-tab on"/>
            <span className="lay-thumb-tab"/>
            <span className="lay-thumb-tab"/>
            <span className="lay-thumb-tab"/>
          </div>
          <div className="lay-thumb-row"/>
          <div className="lay-thumb-row"/>
          <div className="lay-thumb-row"/>
        </div>
      );
    case 'side-tabs':
      return (
        <div className="lay-thumb">
          <div className="lay-thumb-bar short"/>
          <div className="lay-thumb-side">
            <div/>
            <div><span/><span/><span/></div>
          </div>
        </div>
      );
    case 'grid-mosaic':
      return (
        <div className="lay-thumb">
          <div className="lay-thumb-bar short"/>
          <div className="lay-thumb-grid" style={{ flex: 1 }}>
            <div className="lay-thumb-cell tall"/>
            <div className="lay-thumb-cell"/>
            <div className="lay-thumb-cell"/>
            <div className="lay-thumb-cell"/>
            <div className="lay-thumb-cell tall"/>
          </div>
        </div>
      );
    case 'magazine':
      return (
        <div className="lay-thumb">
          <div className="lay-thumb-hero"/>
          <div className="lay-thumb-row"/>
          <div className="lay-thumb-row"/>
        </div>
      );
    case 'compact':
      return (
        <div className="lay-thumb">
          <div className="lay-thumb-bar short"/>
          <div className="lay-thumb-line"><span/><span/></div>
          <div className="lay-thumb-line"><span/><span/></div>
          <div className="lay-thumb-line"><span/><span/></div>
          <div className="lay-thumb-line"><span/><span/></div>
          <div className="lay-thumb-line"><span/><span/></div>
        </div>
      );
    case 'hero':
      return (
        <div className="lay-thumb">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 3 }}>
            <div className="lay-thumb-cell lime" style={{ height: 28 }}/>
            <div className="lay-thumb-cell" style={{ height: 28 }}/>
            <div className="lay-thumb-cell" style={{ height: 28 }}/>
            <div className="lay-thumb-cell" style={{ height: 28 }}/>
          </div>
          <div className="lay-thumb-line"><span/><span/></div>
          <div className="lay-thumb-line"><span/><span/></div>
        </div>
      );
    default: return <div className="lay-thumb"/>;
  }
}

// ── Layout tab body ───────────────────────────────────────────────────────────
function LayoutPicker({ shop, owner, onSaved }) {
  const initial = shop?.theme?.layout || 'accordion';
  const [selected, setSelected] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const userTier = TIER_ORDER[owner?.plan] ?? 0;
  const dirty = selected !== initial;

  const isLocked = (mode) => TIER_ORDER[mode.tier] > userTier;
  const isLegacy = !shop?.shop_id?.startsWith('SHOP#');

  const save = async () => {
    if (!dirty) return;
    setBusy(true); setErr('');
    try {
      const newTheme = { ...(shop.theme || {}), layout: selected };
      await saveAppearance({ shopId: shop.shop_id, theme: newTheme });
      onSaved?.(newTheme);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      setErr(e.message || 'Σφάλμα αποθήκευσης διάταξης');
    } finally {
      setBusy(false);
    }
  };

  if (isLegacy) {
    return (
      <div className="lay-wrap">
        <div className="lay-head">
          <h2>Custom template</h2>
          <p>
            Το κατάστημά σας χρησιμοποιεί δικό του custom HTML/CSS template (legacy shop). Η αλλαγή layout δεν είναι διαθέσιμη — οι αλλαγές περιεχομένου εμφανίζονται όμως κανονικά.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lay-wrap">
      <div className="lay-head">
        <span className="ph-kicker">ΔΙΑΤΑΞΗ</span>
        <h2>Πώς θα βλέπουν οι πελάτες σας το μενού;</h2>
        <p>Επιλέξτε μία από τις {LAYOUT_MODES.length} διατάξεις. Η αλλαγή εφαρμόζεται άμεσα στο live μενού — δεν χάνονται δεδομένα.</p>
      </div>

      <div className="lay-grid">
        {LAYOUT_MODES.map((m, i) => {
          const locked = isLocked(m);
          const isOn = selected === m.key;
          return (
            <button
              key={m.key}
              className={`lay-card ${isOn ? 'on' : ''}`}
              onClick={() => !locked && setSelected(m.key)}
              disabled={locked}
            >
              {isOn && <span className="lay-card-active">ACTIVE</span>}
              {locked && !isOn && <span className="lay-card-lock"><Icon name="lock" size={12}/></span>}
              <span className="lay-card-num">{String(i+1).padStart(2,'0')}</span>
              <LayoutThumb mode={m.key}/>
              <div>
                <div className="lay-card-name">{m.name}</div>
                <div className="lay-card-desc">{m.desc}</div>
                {locked && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.04em' }}>
                    // διαθέσιμο σε {m.tier}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {err && <div className="msg-error" style={{ marginTop: 16 }}>{err}</div>}

      <div className="lay-foot">
        <span className="lay-foot-info">
          Επιλεγμένη: <strong>{LAYOUT_MODES.find(m => m.key === selected)?.name}</strong>
        </span>
        <span className="lay-foot-warn">// αλλαγή εφαρμόζεται άμεσα στο live μενού</span>
        <span className="grow"/>
        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(initial)} disabled={!dirty || busy}>
          Επαναφορά
        </button>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || busy}>
          {busy ? <><span className="spinner"/>Αποθήκευση…</> : <><Icon name="save" size={12}/>Αποθήκευση</>}
        </button>
      </div>

      {savedToast && <div className="toast">✓ Διάταξη αποθηκεύτηκε</div>}
    </div>
  );
}

export default function MenuEditor() {
  const navigate = useNavigate();
  const { owner, shops, setShops, currentShopId, setCurrentShopId } = useAuth();
  const shop = shops.find(s => s.shop_id === currentShopId) || shops[0];

  const [tab, setTab] = useState('content');
  const [menu, setMenu] = useState(shop?.menu || []);
  const [open, setOpen] = useState({ [shop?.menu?.[0]?.id]: true });
  const [editingCat, setEditingCat] = useState(null);
  const [search, setSearch] = useState('');
  const [dirty, setDirty] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [productModalCat, setProductModalCat] = useState(null);

  useEffect(() => {
    if (shop) {
      setMenu(shop.menu || []);
      setOpen({ [shop.menu?.[0]?.id]: true });
      setDirty(false);
    }
  }, [shop?.shop_id]);

  const update = (newMenu) => { setMenu(newMenu); setDirty(true); };
  const toggleCat = (id) => setOpen(o => ({ ...o, [id]: !o[id] }));
  const renameCat = (id, name) => update(menu.map(c => c.id === id ? { ...c, name } : c));
  const deleteCat = (id) => {
    if (window.confirm('Διαγραφή κατηγορίας;')) update(menu.filter(c => c.id !== id));
  };
  const addCat = () => {
    const id = 'c' + Date.now();
    update([...menu, { id, name: 'Νέα κατηγορία', items: [] }]);
    setOpen(o => ({ ...o, [id]: true }));
    setEditingCat(id);
  };
  const addProduct = (catId, productData) => {
    update(menu.map(c => c.id === catId
      ? { ...c, items: [...c.items, productData] }
      : c));
  };
  const updateProduct = (catId, pid, patch) => {
    update(menu.map(c => c.id === catId
      ? { ...c, items: c.items.map(p => p.id === pid ? { ...p, ...patch } : p) }
      : c));
  };
  const deleteProduct = (catId, pid) => {
    if (!window.confirm('Διαγραφή προϊόντος;')) return;
    update(menu.map(c => c.id === catId ? { ...c, items: c.items.filter(p => p.id !== pid) } : c));
  };

  const save = async () => {
    setSaveErr('');
    try {
      await saveMenu({ shopId: shop.shop_id, data: { menu } });
      setShops(prev => prev.map(s => s.shop_id === shop.shop_id ? { ...s, menu } : s));
      setDirty(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      setSaveErr(e.message || 'Σφάλμα αποθήκευσης');
    }
  };

  const totalProducts = menu.reduce((acc, c) => acc + c.items.length, 0);
  const filtered = search
    ? menu.map(c => ({ ...c, items: c.items.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description||'').toLowerCase().includes(search.toLowerCase()))
      })).filter(c => c.items.length > 0 || c.name.toLowerCase().includes(search.toLowerCase()))
    : menu;

  const right = (
    <div className="dash-shop-select-wrap">
      <span className="dash-shop-select-lab">SHOP</span>
      <select className="dash-shop-select" value={currentShopId} onChange={e => setCurrentShopId(e.target.value)}>
        {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shopName}</option>)}
      </select>
    </div>
  );

  if (!shop) return null;

  const isPremiumPlus = owner?.plan === 'PREMIUM' || owner?.plan === 'EXCLUSIVE';

  return (
    <main className="page-main">
      <PageHeader
        title="Επεξεργασία μενού"
        sub="Προσθέστε κατηγορίες και προϊόντα. Οι αλλαγές αποθηκεύονται αυτόματα."
        right={right}
      />

      <div className="me-tabs">
        <button className={`me-tab ${tab === 'content' ? 'on' : ''}`} onClick={() => setTab('content')}>
          <Icon name="list" size={12}/>Περιεχόμενο
        </button>
        <button className={`me-tab ${tab === 'layout' ? 'on' : ''}`} onClick={() => setTab('layout')}>
          <Icon name="grid" size={12}/>Διάταξη
        </button>
        <button
          className="me-tab"
          onClick={() => isPremiumPlus && navigate('/menu-appearance')}
          disabled={!isPremiumPlus}
          title={isPremiumPlus ? 'Ανοιχτό σε /menu-appearance' : 'Διαθέσιμο σε Premium+'}
        >
          <Icon name="palette" size={12}/>Εμφάνιση
          {!isPremiumPlus && <Icon name="lock" size={11} stroke={1.4}/>}
        </button>
      </div>

      {tab === 'layout' && (
        <LayoutPicker
          shop={shop}
          owner={owner}
          onSaved={(newTheme) => setShops(prev => prev.map(s => s.shop_id === shop.shop_id ? { ...s, theme: newTheme } : s))}
        />
      )}

      {tab === 'content' && <>

      <div className="me-toolbar">
        <div className="me-search-wrap">
          <Icon name="search" size={16}/>
          <input className="me-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση προϊόντων…"/>
        </div>
        <div className="me-counter">
          <span className={dirty ? 'me-dirty' : ''}>
            <strong>{menu.length}</strong> κατηγορίες · <strong>{totalProducts}</strong> προϊόντα
            {dirty && ' · μη αποθηκευμένο'}
          </span>
        </div>
        <div className="grow"/>
        <button className="btn btn-ghost btn-sm" onClick={() => { setMenu(shop.menu); setDirty(false); }} disabled={!dirty}>Επαναφορά</button>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={!dirty}>
          <Icon name="save" size={12}/>Αποθήκευση
        </button>
      </div>

      {saveErr && <div className="msg-error" style={{marginBottom:14}}>{saveErr}</div>}

      {filtered.length === 0 && (
        <div className="me-empty">
          <span className="icon">∅</span>
          <span>Δεν βρέθηκαν αποτελέσματα για «{search}»</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Καθαρισμός</button>
        </div>
      )}

      <div className="me-cat-list">
        {filtered.map((cat, i) => (
          <div key={cat.id} className={`me-cat ${open[cat.id] ? 'open' : ''} ticks`}>
            <div className="me-cat-head" onClick={() => toggleCat(cat.id)}>
              <button className={`me-cat-toggle ${open[cat.id] ? 'on' : ''}`}><Icon name="chev-r" size={13}/></button>
              <div className="me-cat-name" onClick={e => { e.stopPropagation(); setEditingCat(cat.id); }}>
                {editingCat === cat.id ? (
                  <input autoFocus value={cat.name}
                         onChange={e => renameCat(cat.id, e.target.value)}
                         onBlur={() => setEditingCat(null)}
                         onKeyDown={e => e.key === 'Enter' && setEditingCat(null)}
                         onClick={e => e.stopPropagation()}/>
                ) : cat.name}
              </div>
              <span className="me-cat-count">{cat.items.length} items</span>
              <div className="me-cat-acts" onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" onClick={() => setProductModalCat(cat.id)}><Icon name="plus" size={11}/>Προϊόν</button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteCat(cat.id)}><Icon name="trash" size={11}/></button>
              </div>
            </div>
            {open[cat.id] && (
              <div className="me-prod-list">
                {cat.items.length === 0 && <div className="me-prod-empty">// Καμία προσθήκη ακόμα — πατήστε «+ Προϊόν»</div>}
                {cat.items.map(p => (
                  <ProductRow key={p.id} product={p}
                              onUpdate={patch => updateProduct(cat.id, p.id, patch)}
                              onDelete={() => deleteProduct(cat.id, p.id)}/>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="me-add-cat" onClick={addCat}><Icon name="plus" size={12}/>Προσθήκη κατηγορίας</button>

      {savedToast && <div className="toast">✓ Οι αλλαγές αποθηκεύτηκαν</div>}

      {productModalCat && (
        <ProductModal
          onClose={() => setProductModalCat(null)}
          onAdd={(productData) => {
            addProduct(productModalCat, productData);
            setProductModalCat(null);
          }}
        />
      )}
      </>}
    </main>
  );
}

/* ─── Product Modal ───────────────────────────────────────────────────── */
function ProductModal({ onClose, onAdd }) {
  const [name, setName]               = useState('');
  const [price, setPrice]             = useState('');
  const [description, setDescription] = useState('');
  const [station, setStation]         = useState('KITCHEN');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      id:          'p' + Date.now(),
      name:        name.trim(),
      price:       parseFloat(price) || 0,
      description: description.trim(),
      station,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Head */}
        <div className="modal-head">
          <h3>Νέο Προϊόν</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Name */}
          <div className="modal-field">
            <label className="modal-label">Όνομα *</label>
            <input
              className="modal-input"
              placeholder="π.χ. Espresso"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Price */}
          <div className="modal-field">
            <label className="modal-label">Τιμή (€)</label>
            <input
              className="modal-input"
              type="number"
              min="0"
              step="0.10"
              placeholder="0.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="modal-field">
            <label className="modal-label">Περιγραφή</label>
            <textarea
              className="modal-textarea"
              placeholder="Προαιρετική περιγραφή…"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Station */}
          <div className="modal-field">
            <label className="modal-label">Σταθμός</label>
            <div className="modal-chips">
              {['KITCHEN', 'BAR', 'GRILL', 'COLD'].map(s => (
                <button
                  key={s}
                  className={'modal-chip' + (station === s ? ' modal-chip-active' : '')}
                  onClick={() => setStation(s)}
                >
                  {s === 'KITCHEN' ? '🍳 Κουζίνα'
                    : s === 'BAR'  ? '🍹 Bar'
                    : s === 'GRILL'? '🔥 Grill'
                    :                '❄️ Cold'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Foot */}
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Ακύρωση</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Προσθήκη
          </button>
        </div>

      </div>
    </div>
  );
}

function ProductRow({ product, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  return (
    <div className="me-prod">
      <div className="me-prod-info">
        {editing === 'name' ? (
          <input autoFocus value={product.name} onChange={e => onUpdate({ name: e.target.value })}
                 onBlur={() => setEditing(null)} onKeyDown={e => e.key === 'Enter' && setEditing(null)}
                 style={{padding:'4px 8px', fontSize:'0.9rem'}}/>
        ) : (
          <span className="me-prod-name" onClick={() => setEditing('name')}>{product.name}</span>
        )}
        {editing === 'desc' ? (
          <input autoFocus value={product.description || ''} onChange={e => onUpdate({ description: e.target.value })}
                 onBlur={() => setEditing(null)} onKeyDown={e => e.key === 'Enter' && setEditing(null)}
                 placeholder="Περιγραφή" style={{padding:'4px 8px', fontSize:'0.78rem'}}/>
        ) : (
          <span className="me-prod-desc" onClick={() => setEditing('desc')}>
            {product.description || <em style={{color:'var(--text-muted)'}}>+ προσθέστε περιγραφή</em>}
          </span>
        )}
      </div>
      <span className={`me-prod-station ${product.station === 'BAR' ? 'bar' : 'kit'}`}
            onClick={() => onUpdate({ station: product.station === 'BAR' ? 'KITCHEN' : 'BAR' })}
            title="Click για εναλλαγή" style={{cursor:'pointer'}}>
        <Icon name={product.station === 'BAR' ? 'bar' : 'kitchen'} size={10}/>
        {product.station === 'BAR' ? 'Bar' : 'Kit'}
      </span>
      {editing === 'price' ? (
        <input autoFocus type="number" step="0.10" value={product.price}
               onChange={e => onUpdate({ price: parseFloat(e.target.value) || 0 })}
               onBlur={() => setEditing(null)} onKeyDown={e => e.key === 'Enter' && setEditing(null)}
               style={{padding:'4px 8px', fontSize:'0.84rem', textAlign:'right', fontFamily:'var(--font-mono)'}}/>
      ) : (
        <span className="me-prod-price" onClick={() => setEditing('price')}>
          {Number(product.price).toFixed(2).replace('.',',')}€
        </span>
      )}
      <div className="me-prod-acts">
        <button className="btn btn-ghost btn-sm" onClick={onDelete}><Icon name="trash" size={11}/></button>
      </div>
    </div>
  );
}
