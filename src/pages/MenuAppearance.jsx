// src/pages/MenuAppearance.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { saveAppearance } from '../services/api';

const DEFAULT_THEME = {
  bgColor: '#0E0D0B', textColor: '#F5EDD8', accentColor: '#C9A56C',
  cardColor: '#181612', borderColor: '#2A251D',
  fontFamily: 'Geist', headingFont: 'Instrument Serif',
  fontSize: 'medium', density: 'comfortable', borderRadius: 'soft',
  layout: 'list', showImages: true,
};

const FONT_OPTIONS = ['Geist','Inter','Helvetica Neue','Georgia','Instrument Serif','JetBrains Mono'];
const DENSITY_OPTIONS = [{value:'compact',label:'Compact'},{value:'comfortable',label:'Άνετο'},{value:'spacious',label:'Ευρύ'}];
const RADIUS_OPTIONS  = [{value:'sharp',label:'Sharp'},{value:'soft',label:'Soft'},{value:'round',label:'Round'}];
const LAYOUT_OPTIONS  = [{value:'list',label:'List'},{value:'grid',label:'Grid'},{value:'cards',label:'Cards'}];
const SIZE_OPTIONS    = [{value:'small',label:'S'},{value:'medium',label:'M'},{value:'large',label:'L'}];

export default function MenuAppearance() {
  const { owner, shops, setShops } = useAuth();
  const [currentShopId, setCurrentShopId] = useState(shops[0]?.shop_id ?? null);
  const shop = shops.find(s => s.shop_id === currentShopId) || shops[0];

  const [theme, setTheme] = useState({ ...DEFAULT_THEME, ...(shop?.theme || {}) });
  const [openSection, setOpenSection] = useState('colors');
  const [savedToast, setSavedToast] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    if (shop) setTheme({ ...DEFAULT_THEME, ...(shop.theme || {}) });
  }, [shop?.shop_id]);

  const set = (k, v) => setTheme(t => ({ ...t, [k]: v }));

  const save = async () => {
    setSaveErr('');
    try {
      await saveAppearance({ shopId: shop.shop_id, theme });
      setShops(prev => prev.map(s => s.shop_id === shop.shop_id ? { ...s, theme } : s));
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 1800);
    } catch (e) {
      setSaveErr(e.message || 'Σφάλμα αποθήκευσης');
    }
  };

  const sections = [
    { id:'colors',     icon:'color',  title:'Χρώματα',          meta: theme.accentColor },
    { id:'typography', icon:'type',   title:'Γραμματοσειρά',    meta: theme.fontFamily },
    { id:'layout',     icon:'grid',   title:'Διάταξη',          meta: theme.layout },
    { id:'spacing',    icon:'menu',   title:'Spacing & Border', meta: `${theme.density} · ${theme.borderRadius}` },
  ];

  const right = (
    <>
      <div className="dash-shop-select-wrap">
        <span className="dash-shop-select-lab">SHOP</span>
        <select className="dash-shop-select" value={currentShopId} onChange={e => setCurrentShopId(e.target.value)}>
          {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shopName}</option>)}
        </select>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={() => setTheme(DEFAULT_THEME)}>Επαναφορά</button>
      <button className="btn btn-primary btn-sm" onClick={save}><Icon name="save" size={12}/>Αποθήκευση</button>
    </>
  );

  if (!shop) return null;

  if (owner?.plan === 'STANDARD') {
    return (
      <main className="page-main">
        <PageHeader kicker="03 / Εμφάνιση" title="Εμφάνιση μενού" sub="Διαθέσιμο σε Premium και Exclusive πλάνα."/>
        <div className="me-empty">
          <Icon name="lock" size={28}/>
          <span>Η προσαρμογή εμφάνισης απαιτεί <strong>Premium</strong> ή <strong>Exclusive</strong> πλάνο.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main">
      <PageHeader
        kicker="03 / Εμφάνιση Μενού"
        title="Σχεδίαση μενού"
        sub="Παραμετροποιήστε το ψηφιακό σας μενού. Οι αλλαγές εμφανίζονται live στην προεπισκόπηση."
        right={right}
      />

      {saveErr && <div className="msg-error" style={{marginBottom:14}}>{saveErr}</div>}

      <div className="ma-layout">
        <div className="ma-acc">
          {sections.map(sec => {
            const isOpen = openSection === sec.id;
            return (
              <div key={sec.id} className={`ma-acc-item ${isOpen ? 'open' : ''} ticks`}>
                <button className="ma-acc-head" onClick={() => setOpenSection(isOpen ? null : sec.id)}>
                  <span className="ma-acc-icon"><Icon name={sec.icon} size={14}/></span>
                  <span className="ma-acc-title">{sec.title}</span>
                  <span className="ma-acc-meta">{sec.meta}</span>
                  <span className={`ma-acc-chev ${isOpen ? 'on' : ''}`}><Icon name="chev-r" size={12}/></span>
                </button>
                {isOpen && (
                  <div className="ma-acc-body fade-up">
                    {sec.id === 'colors' && (
                      <>
                        <ColorRow label="Φόντο"         value={theme.bgColor}     onChange={v => set('bgColor', v)}/>
                        <ColorRow label="Κείμενο"       value={theme.textColor}   onChange={v => set('textColor', v)}/>
                        <ColorRow label="Accent"        value={theme.accentColor} onChange={v => set('accentColor', v)}/>
                        <ColorRow label="Κάρτες"        value={theme.cardColor}   onChange={v => set('cardColor', v)}/>
                        <ColorRow label="Διαχωριστικά"  value={theme.borderColor} onChange={v => set('borderColor', v)}/>
                      </>
                    )}
                    {sec.id === 'typography' && (
                      <>
                        <div className="ma-group">
                          <span className="ma-group-lab">FONT BODY</span>
                          <div className="chip-group">
                            {FONT_OPTIONS.map(f => <button key={f} className={`chip ${theme.fontFamily === f ? 'on' : ''}`} onClick={() => set('fontFamily', f)} style={{fontFamily:f}}>{f}</button>)}
                          </div>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">FONT HEADINGS</span>
                          <div className="chip-group">
                            {FONT_OPTIONS.map(f => <button key={f} className={`chip ${theme.headingFont === f ? 'on' : ''}`} onClick={() => set('headingFont', f)} style={{fontFamily:f}}>{f}</button>)}
                          </div>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">SIZE</span>
                          <div className="chip-group">
                            {SIZE_OPTIONS.map(o => <button key={o.value} className={`chip ${theme.fontSize === o.value ? 'on' : ''}`} onClick={() => set('fontSize', o.value)}>{o.label}</button>)}
                          </div>
                        </div>
                      </>
                    )}
                    {sec.id === 'layout' && (
                      <div className="ma-group">
                        <span className="ma-group-lab">LAYOUT</span>
                        <div className="chip-group">
                          {LAYOUT_OPTIONS.map(o => <button key={o.value} className={`chip ${theme.layout === o.value ? 'on' : ''}`} onClick={() => set('layout', o.value)}>{o.label}</button>)}
                        </div>
                        <span className="ma-group-lab" style={{marginTop:6}}>IMAGES</span>
                        <div className="chip-group">
                          <button className={`chip ${theme.showImages ? 'on' : ''}`} onClick={() => set('showImages', true)}>Εμφάνιση</button>
                          <button className={`chip ${!theme.showImages ? 'on' : ''}`} onClick={() => set('showImages', false)}>Απόκρυψη</button>
                        </div>
                      </div>
                    )}
                    {sec.id === 'spacing' && (
                      <>
                        <div className="ma-group">
                          <span className="ma-group-lab">DENSITY</span>
                          <div className="chip-group">
                            {DENSITY_OPTIONS.map(o => <button key={o.value} className={`chip ${theme.density === o.value ? 'on' : ''}`} onClick={() => set('density', o.value)}>{o.label}</button>)}
                          </div>
                        </div>
                        <div className="ma-group">
                          <span className="ma-group-lab">BORDER RADIUS</span>
                          <div className="chip-group">
                            {RADIUS_OPTIONS.map(o => <button key={o.value} className={`chip ${theme.borderRadius === o.value ? 'on' : ''}`} onClick={() => set('borderRadius', o.value)}>{o.label}</button>)}
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

        <div className="ma-preview">
          <div className="ma-preview-head">
            <span className="ma-preview-lab">/ LIVE PREVIEW</span>
            <span className="tag tag-live"><span className="tag-dot"/>SYNCED</span>
          </div>
          <div className="ma-preview-frame">
            <PreviewMenu theme={theme} shop={shop}/>
          </div>
        </div>
      </div>

      {savedToast && <div className="toast">✓ Το θέμα αποθηκεύτηκε</div>}
    </main>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="ma-color-row">
      <span className="ma-color-lab">{label}</span>
      <div className="ma-color-r">
        <span className="ma-color-hex">{value.toUpperCase()}</span>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="ma-color-input"/>
      </div>
    </div>
  );
}

function PreviewMenu({ theme, shop }) {
  const radiusMap = { sharp: 0, soft: 6, round: 14 };
  const sizeMap   = { small: 13, medium: 14, large: 16 };
  const padMap    = { compact: 6, comfortable: 10, spacious: 14 };
  const radius = radiusMap[theme.borderRadius];
  const size   = sizeMap[theme.fontSize];
  const pad    = padMap[theme.density];

  return (
    <div className="ma-preview-inner" style={{
      background: theme.bgColor, color: theme.textColor,
      fontFamily: theme.fontFamily, fontSize: size, borderRadius: radius,
    }}>
      <div className="ma-preview-shop" style={{borderColor: theme.borderColor}}>
        <div style={{fontFamily: theme.headingFont, fontSize: size+6, lineHeight:1.1, color: theme.textColor}}>{shop.shopName}</div>
        <div style={{fontSize: size-4, opacity:0.6, marginTop:4, letterSpacing:'0.06em', textTransform:'uppercase'}}>{shop.businessType}</div>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap: pad+4, overflowY:'auto'}}>
        {(shop.menu || []).slice(0,3).map(cat => (
          <div key={cat.id} className="ma-preview-cat">
            <div className="ma-preview-cat-h" style={{
              fontFamily: theme.headingFont, color: theme.accentColor,
              borderColor: theme.borderColor, fontSize: size-1, letterSpacing:'0.02em',
            }}>{cat.name}</div>
            {(cat.items || []).slice(0,3).map(p => (
              <div key={p.id} className="ma-preview-prod" style={{
                background: theme.layout === 'cards' ? theme.cardColor : 'transparent',
                padding: theme.layout === 'cards' ? `${pad}px ${pad+2}px` : `${pad-2}px 0`,
                borderRadius: theme.layout === 'cards' ? radius : 0,
                border: theme.layout === 'cards' ? `1px solid ${theme.borderColor}` : 'none',
              }}>
                <div style={{flex:1}}>
                  <div className="nm" style={{fontSize:size-2}}>{p.name}</div>
                  {p.description && <div className="ds" style={{fontSize:size-4}}>{p.description}</div>}
                </div>
                <span className="pr" style={{fontSize:size-2, color:theme.accentColor, fontWeight:500}}>
                  {Number(p.price).toFixed(2).replace('.',',')}€
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
