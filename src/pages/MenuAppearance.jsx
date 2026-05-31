// src/pages/MenuAppearance.jsx — appearance/theme editor + live preview
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader, ShopSelectPill } from '../components/Primitives';
import { saveMenu, saveAppearance, MENU_BASE_URL } from '../services/api';
import ui from './MenuAppearance.module.css';

// ── Theme model ───────────────────────────────────────────────────────────────
const FONT_STACKS = {
  sans:  "'Inter', system-ui, -apple-system, sans-serif",
  serif: "'Georgia', 'Times New Roman', serif",
  mono:  "'JetBrains Mono', ui-monospace, monospace",
};
const FONT_LABELS   = { sans: 'Sans', serif: 'Serif', mono: 'Mono' };
const RADII         = { none: 0, sm: 8, md: 14, lg: 22 };
const HEADING_SIZES = { small: 15, normal: 19, large: 24 };

const PRESETS = {
  dark:  { background: '#1A1A1E', text: '#F4F4F5', accent: '#C9A24B', price: '#C9A24B' },
  light: { background: '#FFFFFF', text: '#1A1714', accent: '#1C62CC', price: '#1A1714' },
  cream: { background: '#F3ECE0', text: '#3B2F25', accent: '#B5793A', price: '#B5793A' },
  night: { background: '#0E0E10', text: '#E6E6E6', accent: '#8AB4F8', price: '#8AB4F8' },
};
const PRESET_LABELS = { dark: 'Dark', light: 'Light', cream: 'Cream', night: 'Night', custom: 'Custom' };

const DEFAULT_THEME = {
  preset: 'dark',
  colors: { ...PRESETS.dark },
  fontFamily: 'serif',
  headingSize: 'normal',
  layout: 'list',          // list | cards | compact
  radius: 'md',
  showDescriptions: true,
  showPrices: true,
  showDividers: true,
  currency: '€',
};

const COLOR_FIELDS = [
  { key: 'background', label: 'Φόντο' },
  { key: 'text',       label: 'Κείμενο' },
  { key: 'accent',     label: 'Τίτλοι / γραμμές' },
  { key: 'price',      label: 'Τιμές' },
];

const LAYOUT_OPTS  = [{ v: 'list', l: 'Λίστα' }, { v: 'cards', l: 'Κάρτες' }, { v: 'compact', l: 'Συμπαγής' }];
const RADIUS_OPTS  = [{ v: 'none', l: '0' }, { v: 'sm', l: 'S' }, { v: 'md', l: 'M' }, { v: 'lg', l: 'L' }];
const SIZE_OPTS    = [{ v: 'small', l: 'S' }, { v: 'normal', l: 'M' }, { v: 'large', l: 'L' }];
const CURRENCY_OPTS = ['€', '$', '£', '₺'];

const fmtPrice = (n) => Number(n || 0).toFixed(2).replace('.', ',');
function hexA(hex, a) {
  const h = String(hex || '#000').replace('#', '');
  const full = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(0,0,0,${a})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ── Small primitives ──────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button type="button" className={`${ui.toggle} ${on ? ui.toggleOn : ''}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className={`${ui.toggleKnob} ${on ? ui.toggleKnobOn : ''}`}/>
    </button>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div className={ui.chipGroup}>
      {options.map(o => (
        <button
          key={o.v}
          type="button"
          className={`${ui.chip} ${value === o.v ? ui.chipActive : ''}`}
          onClick={() => onChange(o.v)}
        >{o.l}</button>
      ))}
    </div>
  );
}

// ── Live preview (renders the menu styled by the current theme) ─────────────────
function PreviewMenu({ shop, menu, theme }) {
  const c = theme.colors || {};
  const font = FONT_STACKS[theme.fontFamily] || FONT_STACKS.sans;
  const radius = RADII[theme.radius] ?? 14;
  const headSize = HEADING_SIZES[theme.headingSize] ?? 19;

  return (
    <div className="ma-prev" style={{ background: c.background, color: c.text, fontFamily: font }}>
      <div className="ma-prev-brand" style={{ color: c.accent }}>{shop.shopName}</div>
      {menu.length === 0 && <div className="ma-prev-empty" style={{ color: hexA(c.text, 0.5) }}>Δεν υπάρχουν κατηγορίες.</div>}
      {menu.map(cat => (
        <div key={cat.id} className="ma-prev-cat">
          <div className="ma-prev-cat-name" style={{ color: c.accent, fontSize: headSize }}>{cat.name}</div>
          {theme.showDividers && <div className="ma-prev-div" style={{ background: hexA(c.accent, 0.5) }}/>}
          <div className={`ma-prev-items ma-prev-${theme.layout}`}>
            {(cat.items || []).map(p => (
              <div
                key={p.id}
                className="ma-prev-item"
                style={theme.layout === 'cards'
                  ? { borderRadius: radius, border: `1px solid ${hexA(c.text, 0.15)}`, background: hexA(c.text, 0.04) }
                  : undefined}
              >
                <div className="ma-prev-item-row">
                  <span className="ma-prev-item-name">{p.name}</span>
                  {theme.showPrices && (
                    <span className="ma-prev-item-price" style={{ color: c.price }}>{fmtPrice(p.price)} {theme.currency}</span>
                  )}
                </div>
                {theme.showDescriptions && p.description && (
                  <div className="ma-prev-item-desc" style={{ color: hexA(c.text, 0.62) }}>{p.description}</div>
                )}
              </div>
            ))}
            {(cat.items || []).length === 0 && (
              <div className="ma-prev-item-empty" style={{ color: hexA(c.text, 0.4) }}>—</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const [menu, setMenu]             = useState(shop?.menu || []);
  const [theme, setTheme]           = useState({ ...DEFAULT_THEME, ...(shop?.theme || {}) });
  const [dirty, setDirty]           = useState(false);
  const [busy, setBusy]             = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [saveErr, setSaveErr]       = useState('');

  // Modals
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [editCatId, setEditCatId]   = useState(null);

  useEffect(() => {
    if (shop) {
      setMenu(shop.menu || []);
      setTheme({ ...DEFAULT_THEME, ...(shop.theme || {}) });
      setDirty(false);
    }
  }, [shop?.shop_id]);

  if (!shop) return null;

  // STANDARD plan gate
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

  const updateMenu  = (nm) => { setMenu(nm); setDirty(true); };
  const updateTheme = (patch) => { setTheme(t => ({ ...t, ...patch })); setDirty(true); };
  const updateColor = (key, val) => { setTheme(t => ({ ...t, preset: 'custom', colors: { ...t.colors, [key]: val } })); setDirty(true); };
  const applyPreset = (key) => { setTheme(t => ({ ...t, preset: key, colors: { ...PRESETS[key] } })); setDirty(true); };

  const editingCat = editCatId ? menu.find(c => c.id === editCatId) : null;
  const addCat    = (name) => updateMenu([...menu, { id: 'c' + Date.now(), name, items: [] }]);
  const renameCat = (id, name) => updateMenu(menu.map(c => c.id === id ? { ...c, name } : c));
  const deleteCat = (id) => {
    if (!window.confirm('Διαγραφή κατηγορίας; Θα διαγραφούν και όλα τα προϊόντα της.')) return;
    updateMenu(menu.filter(c => c.id !== id));
  };

  const save = async () => {
    if (busy || !dirty) return;
    setBusy(true); setSaveErr('');
    try {
      await saveMenu({ shopId: shop.shop_id, data: { menu } });
      // Theme persistence is best-effort: the public menu renderer may not consume
      // `theme` yet, so a failure here must not block the (successful) menu save.
      try { await saveAppearance({ shopId: shop.shop_id, theme }); } catch {}
      setShops(prev => prev.map(sh => sh.shop_id === shop.shop_id ? { ...sh, menu, theme } : sh));
      setDirty(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      setSaveErr(e.message || 'Σφάλμα αποθήκευσης.');
    } finally {
      setBusy(false);
    }
  };

  const resetTheme = () => { setTheme({ ...DEFAULT_THEME }); setDirty(true); };

  const centerPill = (
    <ShopSelectPill value={currentShopId} onChange={e => setCurrentShopId(e.target.value)} shops={shops}/>
  );
  const menuUrl = `${MENU_BASE_URL}/menu/${shop.shopSlug}`;

  return (
    <main className="page-main" style={{ overflow: 'hidden' }}>
      <PageHeader topbarLabel="Εμφάνιση Μενού" center={centerPill}/>

      {saveErr && <div className="msg-error" style={{ margin: '12px 28px 0', flexShrink: 0 }}>{saveErr}</div>}

      <div className="ma-layout">
        {/* ── Controls (left) ── */}
        <div className="ma-acc">
          <div className="ma-acc-scroll">

            {/* Κατηγορίες */}
            <section className="ma-sec">
              <div className="ma-sec-head">
                <span className="ma-sec-title">Κατηγορίες</span>
                <button className="btn btn-primary btn-sm" onClick={() => setNewCatOpen(true)}>
                  <Icon name="plus" size={11}/>Νέα Κατηγορία
                </button>
              </div>
              <div className="ma-sec-list">
                {menu.length === 0 && <div className="ma-cat-empty">Δεν υπάρχουν κατηγορίες ακόμα.</div>}
                {menu.map(cat => (
                  <div key={cat.id} className="ma-cat-item">
                    <div className="ma-cat-info">
                      <span className="ma-cat-name">{cat.name}</span>
                      <span className="ma-cat-count">{cat.items?.length || 0} προϊόντα</span>
                    </div>
                    <div className="ma-cat-acts">
                      <button className="ma-cat-iconbtn" onClick={() => setEditCatId(cat.id)} title="Επεξεργασία">
                        <Icon name="edit-solid" size={13}/>
                      </button>
                      <button className="ma-cat-iconbtn ma-cat-iconbtn-del" onClick={() => deleteCat(cat.id)} title="Διαγραφή">
                        <Icon name="trash-solid" size={13}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="ma-cat-hint-reorder">// Η σειρά των κατηγοριών αλλάζει με drag &amp; drop στην Επεξεργασία Μενού</p>
            </section>

            {/* Θέμα (presets) */}
            <section className="ma-sec">
              <div className="ma-sec-head"><span className="ma-sec-title">Θέμα</span></div>
              <div className={ui.controlGroup}>
                <div className={ui.controlLabel}>Έτοιμα στυλ</div>
                <Chips
                  options={Object.keys(PRESETS).map(k => ({ v: k, l: PRESET_LABELS[k] }))}
                  value={theme.preset}
                  onChange={applyPreset}
                />
              </div>
            </section>

            {/* Χρώματα */}
            <section className="ma-sec">
              <div className="ma-sec-head"><span className="ma-sec-title">Χρώματα</span></div>
              <div className={ui.colorSection}>
                {COLOR_FIELDS.map(f => (
                  <div className={ui.colorRow} key={f.key}>
                    <span className={ui.colorLabel}>{f.label}</span>
                    <div className={ui.colorRight}>
                      <span className={ui.colorHex}>{(theme.colors[f.key] || '').toUpperCase()}</span>
                      <input
                        type="color"
                        className={ui.colorInput}
                        value={theme.colors[f.key] || '#000000'}
                        onChange={e => updateColor(f.key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Τυπογραφία */}
            <section className="ma-sec">
              <div className="ma-sec-head"><span className="ma-sec-title">Τυπογραφία</span></div>
              <div className={ui.controlGroup}>
                <div className={ui.controlLabel}>Γραμματοσειρά</div>
                <Chips
                  options={Object.keys(FONT_STACKS).map(k => ({ v: k, l: FONT_LABELS[k] }))}
                  value={theme.fontFamily}
                  onChange={v => updateTheme({ fontFamily: v })}
                />
              </div>
              <div className={ui.controlGroup}>
                <div className={ui.controlLabel}>Μέγεθος τίτλων</div>
                <Chips options={SIZE_OPTS} value={theme.headingSize} onChange={v => updateTheme({ headingSize: v })}/>
              </div>
            </section>

            {/* Διάταξη & κάρτες */}
            <section className="ma-sec">
              <div className="ma-sec-head"><span className="ma-sec-title">Διάταξη &amp; κάρτες</span></div>
              <div className={ui.controlGroup}>
                <div className={ui.controlLabel}>Στυλ προϊόντων</div>
                <Chips options={LAYOUT_OPTS} value={theme.layout} onChange={v => updateTheme({ layout: v })}/>
              </div>
              <div className={ui.controlGroup}>
                <div className={ui.controlLabel}>Στρογγυλεμένες γωνίες</div>
                <Chips options={RADIUS_OPTS} value={theme.radius} onChange={v => updateTheme({ radius: v })}/>
              </div>
            </section>

            {/* Στοιχεία μενού */}
            <section className="ma-sec">
              <div className="ma-sec-head"><span className="ma-sec-title">Στοιχεία μενού</span></div>
              <div className={ui.toggleRow}>
                <span className={ui.toggleLabel}>Εμφάνιση τιμών</span>
                <Toggle on={theme.showPrices} onChange={v => updateTheme({ showPrices: v })}/>
              </div>
              <div className={ui.toggleRow}>
                <span className={ui.toggleLabel}>Εμφάνιση περιγραφών</span>
                <Toggle on={theme.showDescriptions} onChange={v => updateTheme({ showDescriptions: v })}/>
              </div>
              <div className={ui.toggleRow}>
                <span className={ui.toggleLabel}>Διαχωριστικές γραμμές</span>
                <Toggle on={theme.showDividers} onChange={v => updateTheme({ showDividers: v })}/>
              </div>
              <div className={ui.controlGroup}>
                <div className={ui.controlLabel}>Νόμισμα</div>
                <Chips options={CURRENCY_OPTS.map(s => ({ v: s, l: s }))} value={theme.currency} onChange={v => updateTheme({ currency: v })}/>
              </div>
            </section>

          </div>

          {/* Save bar */}
          <div className="ma-save-bar">
            <button className="ma-save-btn" onClick={save} disabled={busy || !dirty}>
              {busy ? <><span className="spinner"/>Αποθήκευση…</> : <><Icon name="save" size={14}/>Αποθήκευση Αλλαγών</>}
            </button>
            <button className="ma-save-reset" onClick={resetTheme} type="button">Επαναφορά στυλ</button>
          </div>
        </div>

        {/* ── Live preview (right) ── */}
        <div className="ma-preview">
          <div className="ma-preview-head">
            <span className="ma-preview-lab">Προεπισκόπηση</span>
            <button className="ma-preview-link" onClick={() => window.open(menuUrl, '_blank')} title="Άνοιγμα live μενού">
              <Icon name="ext" size={12}/>Live
            </button>
          </div>
          <div className="ma-preview-frame">
            <div className="ma-preview-inner">
              <PreviewMenu shop={shop} menu={menu} theme={theme}/>
            </div>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            // Ζωντανή προεπισκόπηση στυλ — πατήστε Αποθήκευση για εφαρμογή στο μενού
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
