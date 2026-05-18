// src/pages/MenuAppearance.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { saveAppearance, MENU_BASE_URL } from '../services/api';

// ── Defaults (aligned with backend whitelist + template CSS vars) ─────────────
const DEFAULT_THEME = {
  // Core colors
  bgColor:         '#FFFFFF',
  textColor:       '#1A1714',
  accentColor:     '#B8722A',
  cardBgColor:     '#F8F6F3',
  // Per-element colors (empty = fallback to accent/text)
  categoryColor:   '',
  productColor:    '',
  priceColor:      '',
  descColor:       '',
  // Global type
  fontFamily:      'DM Sans',
  fontSize:        'medium',
  // Title (shop name in header)
  titleFont:       'Georgia',
  titleSize:       '2.4rem',
  titleWeight:     '400',
  titleSpacing:    '0.14em',
  titleAlign:      'center',
  // Category header
  categoryFont:    'DM Sans',
  categorySize:    '1.1rem',
  categoryWeight:  '400',
  categorySpacing: '0.08em',
  categoryAlign:   'left',
  // Item name
  productFont:     'DM Sans',
  productSize:     '0.9rem',
  productWeight:   '400',
  // Price
  priceFont:       'Georgia',
  priceSize:       '0.95rem',
  priceWeight:     '400',
  // Description
  descFont:        'DM Sans',
  descSize:        '0.76rem',
  // Layout & style
  layout:          'list',
  borderRadius:    'soft',
  cardStyle:       'flat',
  animationStyle:  'fade',
  // Toggles
  showPrices:        true,
  showDescriptions:  true,
  showStationBadges: false,
  // Custom CSS
  customCss:       '',
};

// ── Static option lists ───────────────────────────────────────────────────────
const PRESET_THEMES = [
  { name: 'Minimal',  bgColor:'#FFFFFF', textColor:'#1A1A1A', accentColor:'#111111', cardBgColor:'#F5F5F5', categoryColor:'#111111', productColor:'#1A1A1A', priceColor:'#111111', descColor:'#7A7A7A' },
  { name: 'Warm',     bgColor:'#FBF7F2', textColor:'#2A1F14', accentColor:'#B8722A', cardBgColor:'#F0E8DC', categoryColor:'#B8722A', productColor:'#2A1F14', priceColor:'#8B4513', descColor:'#8A7A68' },
  { name: 'Dark',     bgColor:'#0C0C0D', textColor:'#F0EBE0', accentColor:'#C9A84C', cardBgColor:'#1A1A1B', categoryColor:'#C9A84C', productColor:'#F0EBE0', priceColor:'#C9A84C', descColor:'#7A7268' },
  { name: 'Forest',   bgColor:'#F4F7F2', textColor:'#1E2A1A', accentColor:'#4A7C59', cardBgColor:'#E8EFE5', categoryColor:'#4A7C59', productColor:'#1E2A1A', priceColor:'#3A6B49', descColor:'#6A7A65' },
  { name: 'Wine',     bgColor:'#FDFAF5', textColor:'#1E1610', accentColor:'#6B2D3E', cardBgColor:'#F5EDE8', categoryColor:'#6B2D3E', productColor:'#1E1610', priceColor:'#6B2D3E', descColor:'#7A6558' },
  { name: 'Azure',    bgColor:'#F5F8FF', textColor:'#0F1A2E', accentColor:'#2563EB', cardBgColor:'#EBF0FF', categoryColor:'#2563EB', productColor:'#0F1A2E', priceColor:'#1D4ED8', descColor:'#64748B' },
];

const FONT_OPTIONS   = ['DM Sans', 'Georgia', 'Palatino', 'Garamond', 'Helvetica Neue', 'Inter', 'Playfair Display', 'Libre Baskerville'];
const SIZE_OPTIONS   = [{value:'small',label:'S'},{value:'medium',label:'M'},{value:'large',label:'L'}];
const LAYOUT_OPTIONS = [
  {value:'list',      label:'List'},
  {value:'cards',     label:'Cards'},
  {value:'accordion', label:'Accordion'},
  {value:'compact',   label:'Compact'},
];
const RADIUS_OPTIONS = [{value:'sharp',label:'Sharp'},{value:'soft',label:'Soft'},{value:'round',label:'Round'}];
const CARD_STYLES    = [{value:'flat',label:'Flat'},{value:'border',label:'Border'},{value:'shadow',label:'Shadow'}];
const ANIM_OPTIONS   = [{value:'fade',label:'Fade'},{value:'slide',label:'Slide'},{value:'none',label:'None'}];
const ALIGN_OPTIONS  = [{value:'left',label:'L'},{value:'center',label:'C'},{value:'right',label:'R'}];
const WEIGHT_OPTIONS = [{value:'300',label:'Light'},{value:'400',label:'Normal'},{value:'700',label:'Bold'}];
const FONT_SIZE_PX   = ['', '0.65rem', '0.72rem', '0.76rem', '0.82rem', '0.9rem', '1rem', '1.1rem', '1.2rem', '1.4rem', '1.8rem', '2rem', '2.4rem', '2.8rem'];

// ── Reusable sub-components ───────────────────────────────────────────────────
function ColorRow({ label, value, onChange }) {
  const safeVal = value || '#888888';
  return (
    <div className="ma-color-row">
      <span className="ma-color-lab">{label}</span>
      <div className="ma-color-r">
        <span className="ma-color-hex">{(value || '').toUpperCase() || '—'}</span>
        <input type="color" value={safeVal} onChange={e => onChange(e.target.value)} className="ma-color-input"/>
      </div>
    </div>
  );
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="chip-group">
      {options.map(o => (
        <button key={o.value} className={`chip${value === o.value ? ' on' : ''}`}
          onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

function FontSelect({ value, onChange, placeholder }) {
  return (
    <select className="form-input" value={value || ''} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {FONT_OPTIONS.map(f => <option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}
    </select>
  );
}

function SizeSelect({ value, onChange, placeholder }) {
  return (
    <select className="form-input" value={value || ''} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {FONT_SIZE_PX.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="ma-color-row">
      <span className="ma-color-lab">{label}</span>
      <div className="chip-group" style={{marginTop:0}}>
        <button className={`chip${value ? ' on' : ''}`} onClick={() => onChange(true)}>On</button>
        <button className={`chip${!value ? ' on' : ''}`} onClick={() => onChange(false)}>Off</button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MenuAppearance() {
  const { owner, shops, setShops, currentShopId, setCurrentShopId } = useAuth();
  const shop = shops.find(s => s.shop_id === currentShopId) || shops[0];
  const isLegacy = !shop?.shop_id?.startsWith('SHOP#');

  const [theme,       setTheme]       = useState({ ...DEFAULT_THEME, ...(shop?.theme || {}) });
  const [openSection, setOpenSection] = useState('colors');
  const [busy,        setBusy]        = useState(false);
  const [savedToast,  setSavedToast]  = useState(false);
  const [saveErr,     setSaveErr]     = useState('');
  const [previewKey,  setPreviewKey]  = useState(0);

  useEffect(() => {
    if (shop) setTheme({ ...DEFAULT_THEME, ...(shop.theme || {}) });
  }, [shop?.shop_id]);

  const set = (k, v) => setTheme(t => ({ ...t, [k]: v }));

  const applyPreset = (preset) => {
    const { name, ...colors } = preset;
    setTheme(t => ({ ...t, ...colors }));
  };

  const save = async () => {
    if (busy) return;
    setBusy(true); setSaveErr('');
    try {
      await saveAppearance({ shopId: shop.shop_id, theme });
      setShops(prev => prev.map(s => s.shop_id === shop.shop_id ? { ...s, theme } : s));
      setSavedToast(true);
      setPreviewKey(k => k + 1);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      setSaveErr(e.message || 'Σφάλμα αποθήκευσης.');
    } finally {
      setBusy(false);
    }
  };

  const sections = [
    { id: 'presets',    icon: 'bolt',    title: 'Προκαθορισμένα' },
    { id: 'colors',     icon: 'color',   title: 'Χρώματα' },
    { id: 'global-type',icon: 'type',    title: 'Γραμματοσειρά' },
    { id: 'title',      icon: 'shop',    title: 'Τίτλος & Επικεφαλίδα' },
    { id: 'categories', icon: 'list',    title: 'Κατηγορίες' },
    { id: 'products',   icon: 'grid',    title: 'Προϊόντα & Τιμές' },
    { id: 'layout',     icon: 'palette', title: 'Διάταξη & Στυλ' },
    { id: 'css',        icon: 'edit',    title: 'Custom CSS' },
  ];

  const right = (
    <div className="dash-shop-select-wrap">
      <span className="dash-shop-select-lab">SHOP</span>
      <select className="dash-shop-select" value={currentShopId} onChange={e => setCurrentShopId(e.target.value)}>
        {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shopName}</option>)}
      </select>
    </div>
  );

  if (!shop) return null;

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

  return (
    <main className="page-main" style={{ overflow: 'hidden' }}>
      <PageHeader
        topbarLabel="Εμφάνιση"
        title="Σχεδίαση μενού"
        sub="Προσαρμόστε χρώματα, γραμματοσειρές, διάταξη και στυλ του ψηφιακού μενού."
        right={right}
      />

      {saveErr && <div className="msg-error" style={{ margin: '0 28px 0', flexShrink: 0 }}>{saveErr}</div>}

      <div className="ma-layout">
        {/* ── Accordion panel ─────────────────────────────────── */}
        <div className="ma-acc">
          <div className="ma-acc-items">
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

                    {/* ── Presets ──────────────────────────────── */}
                    {sec.id === 'presets' && (
                      <>
                        <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:14,lineHeight:1.6}}>
                          Επιλέξτε ένα έτοιμο χρωματικό σχήμα. Μπορείτε να το τροποποιήσετε στη συνέχεια.
                        </p>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                          {PRESET_THEMES.map(preset => (
                            <button
                              key={preset.name}
                              onClick={() => applyPreset(preset)}
                              style={{
                                background: preset.bgColor,
                                border: `2px solid ${preset.accentColor}33`,
                                borderRadius: 6,
                                padding: '10px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                textAlign: 'left',
                              }}
                            >
                              <div style={{display:'flex',gap:4,marginBottom:2}}>
                                {[preset.bgColor, preset.accentColor, preset.cardBgColor].map((c,i) => (
                                  <div key={i} style={{width:14,height:14,borderRadius:'50%',background:c,border:'1px solid rgba(0,0,0,0.1)'}}/>
                                ))}
                              </div>
                              <span style={{fontSize:11,fontWeight:600,color:preset.textColor,fontFamily:'var(--font-mono)',letterSpacing:'0.04em'}}>{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* ── Colors ───────────────────────────────── */}
                    {sec.id === 'colors' && (
                      <>
                        <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',marginBottom:10}}>// Βασικά χρώματα</div>
                        <ColorRow label="Φόντο"        value={theme.bgColor}     onChange={v => set('bgColor', v)}/>
                        <ColorRow label="Κείμενο"      value={theme.textColor}   onChange={v => set('textColor', v)}/>
                        <ColorRow label="Accent"       value={theme.accentColor} onChange={v => set('accentColor', v)}/>
                        <ColorRow label="Φόντο κάρτας" value={theme.cardBgColor} onChange={v => set('cardBgColor', v)}/>
                        <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',margin:'14px 0 10px'}}>// Στοιχεία μενού (κενό = auto)</div>
                        <ColorRow label="Κατηγορίες"   value={theme.categoryColor || theme.accentColor} onChange={v => set('categoryColor', v)}/>
                        <ColorRow label="Προϊόντα"     value={theme.productColor  || theme.textColor}   onChange={v => set('productColor', v)}/>
                        <ColorRow label="Τιμές"        value={theme.priceColor    || theme.accentColor} onChange={v => set('priceColor', v)}/>
                        <ColorRow label="Περιγραφές"   value={theme.descColor     || '#7A7268'}          onChange={v => set('descColor', v)}/>
                      </>
                    )}

                    {/* ── Global Typography ─────────────────────── */}
                    {sec.id === 'global-type' && (
                      <>
                        <div className="ma-group">
                          <span className="ma-group-lab">Βασική γραμματοσειρά</span>
                          <FontSelect value={theme.fontFamily} onChange={v => set('fontFamily', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Βασικό μέγεθος</span>
                          <ChipGroup options={SIZE_OPTIONS} value={theme.fontSize} onChange={v => set('fontSize', v)}/>
                        </div>
                      </>
                    )}

                    {/* ── Title & Header ───────────────────────── */}
                    {sec.id === 'title' && (
                      <>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γραμματοσειρά τίτλου</span>
                          <FontSelect value={theme.titleFont} onChange={v => set('titleFont', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Μέγεθος τίτλου</span>
                          <SizeSelect value={theme.titleSize} onChange={v => set('titleSize', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Βάρος τίτλου</span>
                          <ChipGroup options={WEIGHT_OPTIONS} value={theme.titleWeight} onChange={v => set('titleWeight', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Στοίχιση</span>
                          <ChipGroup options={ALIGN_OPTIONS} value={theme.titleAlign} onChange={v => set('titleAlign', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Letter spacing τίτλου</span>
                          <select className="form-input" value={theme.titleSpacing || '0.14em'} onChange={e => set('titleSpacing', e.target.value)}>
                            {['0em','0.04em','0.08em','0.10em','0.14em','0.18em','0.22em','0.28em'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {/* ── Categories ───────────────────────────── */}
                    {sec.id === 'categories' && (
                      <>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γραμματοσειρά</span>
                          <FontSelect value={theme.categoryFont} onChange={v => set('categoryFont', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Μέγεθος</span>
                          <SizeSelect value={theme.categorySize} onChange={v => set('categorySize', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Βάρος</span>
                          <ChipGroup options={WEIGHT_OPTIONS} value={theme.categoryWeight} onChange={v => set('categoryWeight', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Στοίχιση</span>
                          <ChipGroup options={ALIGN_OPTIONS} value={theme.categoryAlign} onChange={v => set('categoryAlign', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Letter spacing</span>
                          <select className="form-input" value={theme.categorySpacing || '0.08em'} onChange={e => set('categorySpacing', e.target.value)}>
                            {['0em','0.04em','0.06em','0.08em','0.10em','0.14em','0.18em'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {/* ── Products & Prices ────────────────────── */}
                    {sec.id === 'products' && (
                      <>
                        <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',marginBottom:10}}>// Όνομα προϊόντος</div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γραμματοσειρά</span>
                          <FontSelect value={theme.productFont} onChange={v => set('productFont', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Μέγεθος</span>
                          <SizeSelect value={theme.productSize} onChange={v => set('productSize', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Βάρος</span>
                          <ChipGroup options={WEIGHT_OPTIONS} value={theme.productWeight} onChange={v => set('productWeight', v)}/>
                        </div>
                        <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',margin:'14px 0 10px'}}>// Τιμή</div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γραμματοσειρά τιμής</span>
                          <FontSelect value={theme.priceFont} onChange={v => set('priceFont', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Μέγεθος τιμής</span>
                          <SizeSelect value={theme.priceSize} onChange={v => set('priceSize', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Βάρος τιμής</span>
                          <ChipGroup options={WEIGHT_OPTIONS} value={theme.priceWeight} onChange={v => set('priceWeight', v)}/>
                        </div>
                        <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',margin:'14px 0 10px'}}>// Περιγραφή</div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γραμματοσειρά περιγραφής</span>
                          <FontSelect value={theme.descFont} onChange={v => set('descFont', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Μέγεθος περιγραφής</span>
                          <SizeSelect value={theme.descSize} onChange={v => set('descSize', v)}/>
                        </div>
                        <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',margin:'14px 0 10px'}}>// Εμφάνιση</div>
                        <ToggleRow label="Εμφάνιση τιμών"      value={theme.showPrices}       onChange={v => set('showPrices', v)}/>
                        <ToggleRow label="Εμφάνιση περιγραφών" value={theme.showDescriptions} onChange={v => set('showDescriptions', v)}/>
                        <ToggleRow label="Badges σταθμών"      value={theme.showStationBadges} onChange={v => set('showStationBadges', v)}/>
                      </>
                    )}

                    {/* ── Layout & Style ───────────────────────── */}
                    {sec.id === 'layout' && (
                      <>
                        <div className="ma-group">
                          <span className="ma-group-lab">Διάταξη</span>
                          <ChipGroup options={LAYOUT_OPTIONS} value={theme.layout} onChange={v => set('layout', v)}/>
                          <span style={{fontSize:10,color:'var(--text-muted)',marginTop:6,display:'block',lineHeight:1.5}}>
                            {theme.layout === 'accordion' && 'Οι κατηγορίες ανοίγουν / κλείνουν με κλικ.'}
                            {theme.layout === 'cards' && 'Τα προϊόντα εμφανίζονται ως κάρτες.'}
                            {theme.layout === 'compact' && 'Μικρότερα margins, πιο πυκνό layout.'}
                            {theme.layout === 'list' && 'Κλασσική εμφάνιση με tabs ανά κατηγορία.'}
                          </span>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Στυλ κάρτας</span>
                          <ChipGroup options={CARD_STYLES} value={theme.cardStyle} onChange={v => set('cardStyle', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Γωνίες</span>
                          <ChipGroup options={RADIUS_OPTIONS} value={theme.borderRadius} onChange={v => set('borderRadius', v)}/>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">Animation</span>
                          <ChipGroup options={ANIM_OPTIONS} value={theme.animationStyle} onChange={v => set('animationStyle', v)}/>
                        </div>
                      </>
                    )}

                    {/* ── Custom CSS ────────────────────────────── */}
                    {sec.id === 'css' && (
                      <>
                        <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:10,lineHeight:1.6}}>
                          Για προχωρημένους. Ο κώδικας εφαρμόζεται απευθείας στο live μενού.
                        </p>
                        <textarea
                          className="form-input"
                          style={{fontFamily:'var(--font-mono)',fontSize:11,height:180,resize:'vertical'}}
                          placeholder=".header { background: #222; } .tab.active { color: red; }"
                          value={theme.customCss || ''}
                          onChange={e => set('customCss', e.target.value)}
                        />
                      </>
                    )}

                  </div>
                )}
              </div>
            );
          })}
          </div>

          {/* Save bar at the bottom of the accordion card (Figma frame 07) */}
          <div className="ma-save-bar">
            <button className="ma-save-btn" onClick={save} disabled={busy}>
              {busy ? <><span className="spinner"/>Αποθήκευση…</> : <><Icon name="save" size={14}/>Αποθήκευση Θέματος</>}
            </button>
            <button className="ma-save-reset" onClick={() => setTheme(DEFAULT_THEME)} disabled={busy}>
              Επαναφορά στις προεπιλογές
            </button>
          </div>
        </div>

        {/* ── Preview panel ───────────────────────────────────── */}
        <div className="ma-preview">
          <div className="ma-preview-head">
            <span className="ma-preview-lab">Προεπισκόπηση</span>
            {isLegacy
              ? <span className="tag" style={{fontSize:10,color:'var(--text-muted)'}}>Legacy template</span>
              : <span className="tag tag-live"><span className="tag-dot"/>Live</span>
            }
          </div>
          <div className="ma-preview-frame">
            <div className="ma-preview-inner" style={{ borderColor: theme.accentColor + '33' }}>
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
          <p style={{fontSize:10,color:'var(--text-muted)',textAlign:'center',padding:'8px 0',fontFamily:'var(--font-mono)',letterSpacing:'0.04em'}}>
            // Πατήστε Αποθήκευση για να ανανεωθεί η προεπισκόπηση
          </p>
        </div>
      </div>

      {savedToast && <div className="toast">✓ Αποθηκεύτηκε</div>}
    </main>
  );
}
