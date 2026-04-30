// src/pages/MenuAppearance.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { saveAppearance } from '../services/api';

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_THEME = {
  // Global palette
  bgColor:      '#FFFFFF',
  textColor:    '#1A1714',
  accentColor:  '#B8722A',
  cardColor:    '#F8F6F3',
  borderColor:  '#E4E0DA',
  // Global typography
  fontFamily:   'system-ui',
  headingFont:  'Georgia',
  fontSize:     'medium',
  // Layout
  density:      'comfortable',
  borderRadius: 'soft',
  layout:       'list',
  showImages:   false,
  // Per-element overrides (empty = inherit from global)
  elemCategoryFont:  '',
  elemCategorySize:  '',
  elemCategoryColor: '',
  elemCategoryBold:  true,
  elemItemFont:      '',
  elemItemSize:      '',
  elemItemColor:     '',
  elemPriceFont:     '',
  elemPriceSize:     '',
  elemPriceColor:    '',
  elemDescFont:      '',
  elemDescSize:      '',
  elemDescColor:     '',
};

const FONT_OPTIONS    = ['system-ui', 'Georgia', 'Palatino', 'Helvetica Neue', 'Inter', 'Garamond'];
const SIZE_OPTIONS    = [{value:'small',label:'S'},{value:'medium',label:'M'},{value:'large',label:'L'}];
const DENSITY_OPTIONS = [{value:'compact',label:'Compact'},{value:'comfortable',label:'Άνετο'},{value:'spacious',label:'Ευρύ'}];
const RADIUS_OPTIONS  = [{value:'sharp',label:'Sharp'},{value:'soft',label:'Soft'},{value:'round',label:'Round'}];
const LAYOUT_OPTIONS  = [{value:'list',label:'List'},{value:'cards',label:'Cards'}];
const ELEM_SIZE_PX    = ['', '11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px'];

// ── Sub-components ────────────────────────────────────────────────────────────
function ColorRow({ label, value, onChange }) {
  return (
    <div className="ma-color-row">
      <span className="ma-color-lab">{label}</span>
      <div className="ma-color-r">
        <span className="ma-color-hex">{value?.toUpperCase()}</span>
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="ma-color-input"/>
      </div>
    </div>
  );
}

function ElemSection({ title, fontKey, sizeKey, colorKey, theme, set }) {
  return (
    <div className="ma-elem-section">
      <div className="ma-elem-head">{title}</div>
      <div className="ma-elem-body">
        <div className="ma-group">
          <span className="ma-group-lab">Γραμματοσειρά</span>
          <select className="form-input" value={theme[fontKey] || ''} onChange={e => set(fontKey, e.target.value)}>
            <option value="">Κληρονόμησε από global</option>
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="ma-group">
          <span className="ma-group-lab">Μέγεθος</span>
          <select className="form-input" value={theme[sizeKey] || ''} onChange={e => set(sizeKey, e.target.value)}>
            <option value="">Auto</option>
            {ELEM_SIZE_PX.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <ColorRow
          label="Χρώμα (κενό = auto)"
          value={theme[colorKey] || (theme.textColor || '#1A1714')}
          onChange={v => set(colorKey, v)}
        />
      </div>
    </div>
  );
}

// ── Live preview ──────────────────────────────────────────────────────────────
function PreviewMenu({ theme, shop }) {
  const radiusMap = { sharp: '0px', soft: '6px', round: '14px' };
  const sizeMap   = { small: 13, medium: 14, large: 16 };
  const padMap    = { compact: 6, comfortable: 10, spacious: 14 };

  const radius = radiusMap[theme.borderRadius] || '6px';
  const base   = sizeMap[theme.fontSize] || 14;
  const pad    = padMap[theme.density] || 10;

  const get = (overrideFont, overrideSize, overrideColor, fallbackColor) => ({
    fontFamily: overrideFont || theme.fontFamily,
    fontSize:   overrideSize || base,
    color:      overrideColor || fallbackColor || theme.textColor,
  });

  return (
    <div style={{
      background: theme.bgColor, color: theme.textColor,
      fontFamily: theme.fontFamily, fontSize: base, borderRadius: radius,
      display: 'flex', flexDirection: 'column', width: '100%',
    }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${theme.borderColor}` }}>
        <div style={{ fontFamily: theme.headingFont, fontSize: base + 6, fontWeight: 700, color: theme.textColor, lineHeight: 1.1 }}>
          {shop.shopName}
        </div>
        <div style={{ fontSize: base - 3, opacity: 0.6, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {shop.businessType}
        </div>
      </div>

      <div style={{ padding: '8px' }}>
        {(shop.menu || []).slice(0, 3).map(cat => (
          <div key={cat.id} style={{ marginBottom: pad + 6 }}>
            <div style={{
              ...get(theme.elemCategoryFont, theme.elemCategorySize, theme.elemCategoryColor, theme.accentColor),
              fontWeight: theme.elemCategoryBold ? 700 : 400,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              borderBottom: `1px solid ${theme.borderColor}`, paddingBottom: 4, marginBottom: 6,
            }}>
              {cat.name}
            </div>
            {(cat.items || []).slice(0, 3).map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                background: theme.layout === 'cards' ? theme.cardColor : 'transparent',
                padding: theme.layout === 'cards' ? `${pad - 2}px ${pad}px` : `${pad - 4}px 0`,
                borderRadius: theme.layout === 'cards' ? radius : 0,
                border: theme.layout === 'cards' ? `1px solid ${theme.borderColor}` : 'none',
                marginBottom: 3,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={get(theme.elemItemFont, theme.elemItemSize, theme.elemItemColor, theme.textColor)}>
                    {p.name}
                  </div>
                  {p.description && (
                    <div style={{ ...get(theme.elemDescFont, theme.elemDescSize, theme.elemDescColor, null), opacity: theme.elemDescColor ? 1 : 0.65, marginTop: 2 }}>
                      {p.description}
                    </div>
                  )}
                </div>
                <span style={{ ...get(theme.elemPriceFont, theme.elemPriceSize, theme.elemPriceColor, theme.accentColor), fontWeight: 600, flexShrink: 0 }}>
                  {Number(p.price).toFixed(2).replace('.', ',')}€
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MenuAppearance() {
  const { owner, shops, setShops, currentShopId, setCurrentShopId } = useAuth();
  const shop = shops.find(s => s.shop_id === currentShopId) || shops[0];

  const [theme,       setTheme]       = useState({ ...DEFAULT_THEME, ...(shop?.theme || {}) });
  const [openSection, setOpenSection] = useState('colors');
  const [busy,        setBusy]        = useState(false);
  const [savedToast,  setSavedToast]  = useState(false);
  const [saveErr,     setSaveErr]     = useState('');

  useEffect(() => {
    if (shop) setTheme({ ...DEFAULT_THEME, ...(shop.theme || {}) });
  }, [shop?.shop_id]);

  const set = (k, v) => setTheme(t => ({ ...t, [k]: v }));

  const save = async () => {
    if (busy) return;
    setBusy(true); setSaveErr('');
    try {
      await saveAppearance({ shopId: shop.shop_id, theme });
      setShops(prev => prev.map(s => s.shop_id === shop.shop_id ? { ...s, theme } : s));
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      setSaveErr(e.message || 'Σφάλμα αποθήκευσης. Ελέγξτε τη σύνδεσή σας.');
    } finally {
      setBusy(false);
    }
  };

  const sections = [
    { id: 'colors',     icon: 'color',   title: 'Χρώματα' },
    { id: 'typography', icon: 'type',    title: 'Γραμματοσειρά' },
    { id: 'elements',   icon: 'list',    title: 'Στοιχεία μενού' },
    { id: 'layout',     icon: 'grid',    title: 'Διάταξη' },
  ];

  const right = (
    <>
      <div className="dash-shop-select-wrap">
        <span className="dash-shop-select-lab">SHOP</span>
        <select className="dash-shop-select" value={currentShopId} onChange={e => setCurrentShopId(e.target.value)}>
          {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shopName}</option>)}
        </select>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={() => setTheme(DEFAULT_THEME)} disabled={busy}>
        Επαναφορά
      </button>
      <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
        {busy ? <><span className="spinner"/>Αποθήκευση…</> : <><Icon name="save" size={12}/>Αποθήκευση</>}
      </button>
    </>
  );

  if (!shop) return null;

  if (owner?.plan === 'STANDARD') {
    return (
      <main className="page-main">
        <PageHeader kicker="03 / Εμφάνιση" title="Εμφάνιση μενού" sub="Διαθέσιμο σε Premium και Exclusive πλάνα."/>
        <div className="me-gate" style={{ marginTop: 40 }}>
          <div className="me-gate-icon"><Icon name="lock" size={22}/></div>
          <h3>Απαιτείται Premium ή Exclusive</h3>
          <p>Η προσαρμογή εμφάνισης σας επιτρέπει να σχεδιάσετε το ψηφιακό μενού στα μέτρα του καταστήματός σας.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main" style={{ overflow: 'hidden' }}>
      <PageHeader
        kicker="03 / Εμφάνιση Μενού"
        title="Σχεδίαση μενού"
        sub="Προσαρμόστε την εμφάνιση του ψηφιακού μενού σας."
        right={right}
      />

      {saveErr && <div className="msg-error" style={{ margin: '0 28px 0', flexShrink: 0 }}>{saveErr}</div>}

      <div className="ma-layout">
        {/* Accordion panel */}
        <div className="ma-acc">
          {sections.map(sec => {
            const isOpen = openSection === sec.id;
            return (
              <div key={sec.id} className={`ma-acc-item${isOpen ? ' open' : ''}`}>
                <button className="ma-acc-head" onClick={() => setOpenSection(isOpen ? null : sec.id)}>
                  <span className="ma-acc-icon"><Icon name={sec.icon} size={14}/></span>
                  <span className="ma-acc-title">{sec.title}</span>
                  <span className={`ma-acc-chev${isOpen ? ' on' : ''}`}><Icon name="chev-r" size={12}/></span>
                </button>

                {isOpen && (
                  <div className="ma-acc-body">
                    {/* ── Colors ─────────────────────────────────── */}
                    {sec.id === 'colors' && (
                      <>
                        <ColorRow label="Φόντο"        value={theme.bgColor}     onChange={v => set('bgColor', v)}/>
                        <ColorRow label="Κείμενο"      value={theme.textColor}   onChange={v => set('textColor', v)}/>
                        <ColorRow label="Accent"       value={theme.accentColor} onChange={v => set('accentColor', v)}/>
                        <ColorRow label="Κάρτες"       value={theme.cardColor}   onChange={v => set('cardColor', v)}/>
                        <ColorRow label="Περιγράμματα" value={theme.borderColor} onChange={v => set('borderColor', v)}/>
                      </>
                    )}

                    {/* ── Typography ─────────────────────────────── */}
                    {sec.id === 'typography' && (
                      <>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γραμματοσειρά κειμένου</span>
                          <div className="chip-group">
                            {FONT_OPTIONS.map(f => (
                              <button key={f} className={`chip${theme.fontFamily === f ? ' on' : ''}`}
                                onClick={() => set('fontFamily', f)} style={{ fontFamily: f }}>{f}</button>
                            ))}
                          </div>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γραμματοσειρά τίτλων</span>
                          <div className="chip-group">
                            {FONT_OPTIONS.map(f => (
                              <button key={f} className={`chip${theme.headingFont === f ? ' on' : ''}`}
                                onClick={() => set('headingFont', f)} style={{ fontFamily: f }}>{f}</button>
                            ))}
                          </div>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Βασικό μέγεθος</span>
                          <div className="chip-group">
                            {SIZE_OPTIONS.map(o => (
                              <button key={o.value} className={`chip${theme.fontSize === o.value ? ' on' : ''}`}
                                onClick={() => set('fontSize', o.value)}>{o.label}</button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ── Elements ───────────────────────────────── */}
                    {sec.id === 'elements' && (
                      <>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          Ορίστε ξεχωριστή γραμματοσειρά, μέγεθος και χρώμα για κάθε στοιχείο του μενού. Αφήστε κενό για να κληρονομήσει τις global ρυθμίσεις.
                        </p>
                        <ElemSection title="Κατηγορία"   fontKey="elemCategoryFont" sizeKey="elemCategorySize" colorKey="elemCategoryColor" theme={theme} set={set}/>
                        <ElemSection title="Όνομα προϊόντος" fontKey="elemItemFont" sizeKey="elemItemSize"     colorKey="elemItemColor"     theme={theme} set={set}/>
                        <ElemSection title="Τιμή"         fontKey="elemPriceFont"   sizeKey="elemPriceSize"    colorKey="elemPriceColor"    theme={theme} set={set}/>
                        <ElemSection title="Περιγραφή"    fontKey="elemDescFont"    sizeKey="elemDescSize"     colorKey="elemDescColor"     theme={theme} set={set}/>
                      </>
                    )}

                    {/* ── Layout ─────────────────────────────────── */}
                    {sec.id === 'layout' && (
                      <>
                        <div className="ma-group">
                          <span className="ma-group-lab">Διάταξη</span>
                          <div className="chip-group">
                            {LAYOUT_OPTIONS.map(o => (
                              <button key={o.value} className={`chip${theme.layout === o.value ? ' on' : ''}`}
                                onClick={() => set('layout', o.value)}>{o.label}</button>
                            ))}
                          </div>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Εικόνες</span>
                          <div className="chip-group">
                            <button className={`chip${theme.showImages ? ' on' : ''}`} onClick={() => set('showImages', true)}>Εμφάνιση</button>
                            <button className={`chip${!theme.showImages ? ' on' : ''}`} onClick={() => set('showImages', false)}>Απόκρυψη</button>
                          </div>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Πυκνότητα</span>
                          <div className="chip-group">
                            {DENSITY_OPTIONS.map(o => (
                              <button key={o.value} className={`chip${theme.density === o.value ? ' on' : ''}`}
                                onClick={() => set('density', o.value)}>{o.label}</button>
                            ))}
                          </div>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γωνίες</span>
                          <div className="chip-group">
                            {RADIUS_OPTIONS.map(o => (
                              <button key={o.value} className={`chip${theme.borderRadius === o.value ? ' on' : ''}`}
                                onClick={() => set('borderRadius', o.value)}>{o.label}</button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Preview panel */}
        <div className="ma-preview">
          <div className="ma-preview-head">
            <span className="ma-preview-lab">Προεπισκόπηση</span>
            <span className="tag tag-live"><span className="tag-dot"/>Live</span>
          </div>
          <div className="ma-preview-frame">
            <div className="ma-preview-inner" style={{ borderColor: theme.borderColor }}>
              <PreviewMenu theme={theme} shop={shop}/>
            </div>
          </div>
        </div>
      </div>

      {savedToast && <div className="toast">✓ Αποθηκεύτηκε</div>}
    </main>
  );
}
