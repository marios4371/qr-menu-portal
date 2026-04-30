// src/pages/Dashboard.jsx
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { PLAN_FEATURES } from '../constants';
import { MENU_BASE_URL } from '../services/api';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Καλημέρα';
  if (h < 18) return 'Καλησπέρα';
  return 'Καληνύχτα';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { onPlanClick } = useOutletContext();
  const { owner, shops, currentShopId, setCurrentShopId } = useAuth();

  const shop = shops.find(s => s.shop_id === currentShopId) || shops[0];
  if (!shop) return null;

  const totalProducts  = shop.menu?.reduce((acc, c) => acc + (c.items?.length || 0), 0) || 0;
  const planFeatures   = PLAN_FEATURES[owner?.plan] || [];
  // Ο αριθμός ενεργών λειτουργιών = οι λειτουργίες που συμπεριλαμβάνει το πλάνο
  const enabledFeatures = planFeatures.length;
  const isExclusive    = owner?.plan === 'EXCLUSIVE';

  const menuUrl = `${MENU_BASE_URL}/menu/${shop.shopSlug}`;
  const copyUrl = () => navigator.clipboard?.writeText(menuUrl);

  const right = (
    <div className="dash-shop-select-wrap">
      <span className="dash-shop-select-lab">SHOP</span>
      <select className="dash-shop-select" value={currentShopId} onChange={e => setCurrentShopId(e.target.value)}>
        {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shopName}</option>)}
      </select>
    </div>
  );

  return (
    <main className="page-main">
      <PageHeader
        kicker="01 / Αρχική"
        title={`${greeting()}, ${owner?.firstName}.`}
        sub="Σύνοψη του καταστήματός σας. Πατήστε σε οποιαδήποτε κάρτα για περισσότερα."
        right={right}
      />

      {/* Metrics row */}
      <div className="dash-metrics">
        <div className="dash-shop ticks">
          <div className="dash-shop-top">
            <div>
              <div className="dash-shop-lab">CURRENT SHOP</div>
              <div className="dash-shop-name">{shop.shopName}</div>
              <div className="dash-shop-type">{shop.businessType}</div>
            </div>
            <span className="dash-shop-live"><span className="d"/>LIVE</span>
          </div>
          <div className="dash-shop-url">
            <Icon name="qr" size={14}/>
            <span className="dash-shop-url-text" style={{fontSize:'0.7rem'}}>{MENU_BASE_URL.replace('https://','').split('.')[0]}…/menu/{shop.shopSlug}</span>
            <div className="dash-shop-url-act">
              <button onClick={copyUrl}><Icon name="copy" size={11}/>Copy</button>
              <button onClick={() => window.open(menuUrl, '_blank')}><Icon name="ext" size={11}/>Open</button>
            </div>
          </div>
        </div>

        {/* Stat tiles — orders/revenue pending API integration */}
        <div className="stat-tile ticks">
          <div className="stat-tile-top"><span className="stat-tile-lab">ORDERS / TODAY</span><Icon name="bolt" size={13}/></div>
          <div className="stat-tile-num" style={{opacity:0.35}}>—</div>
          <div className="stat-tile-trend" style={{fontFamily:'var(--font-mono)',fontSize:'0.65rem',letterSpacing:'0.04em',opacity:0.5}}>
            // σύντομα διαθέσιμο
          </div>
        </div>

        <div className="stat-tile ticks">
          <div className="stat-tile-top"><span className="stat-tile-lab">REVENUE / MTD</span><Icon name="stat" size={13}/></div>
          <div className="stat-tile-num" style={{opacity:0.35}}>—</div>
          <div className="stat-tile-trend" style={{fontFamily:'var(--font-mono)',fontSize:'0.65rem',letterSpacing:'0.04em',opacity:0.5}}>
            // σύντομα διαθέσιμο
          </div>
        </div>

        <div className="stat-tile ticks">
          <div className="stat-tile-top"><span className="stat-tile-lab">ΜΕΝΟΥ</span><Icon name="grid" size={13}/></div>
          <div className="stat-tile-num">{totalProducts}</div>
          <div className="stat-tile-trend">{totalProducts} προϊόντα · {shop.menu?.length || 0} κατηγορίες</div>
        </div>
      </div>

      {/* Menu overview */}
      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">02 / ΜΕΝΟΥ</span>
            <span className="dash-panel-title">Επισκόπηση μενού — {shop.menu?.length || 0} κατηγορίες, {totalProducts} προϊόντα</span>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/menu-appearance')} disabled={owner?.plan === 'STANDARD'}>
              <Icon name="palette" size={12}/>Εμφάνιση
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/menu-editor')}>
              <Icon name="edit" size={12}/>Επεξεργασία
            </button>
          </div>
        </div>
        <div className="dash-cat-grid">
          {(shop.menu || []).map(cat => (
            <div key={cat.id} className="dash-cat">
              <div className="dash-cat-head">
                <span className="dash-cat-name">{cat.name}</span>
                <span className="dash-cat-count">{cat.items?.length || 0}</span>
              </div>
              <ul className="dash-cat-list">
                {(cat.items || []).slice(0,4).map(p => (
                  <li key={p.id} className="dash-cat-prod">
                    <span className="n">{p.name}</span>
                    <span className="p">{Number(p.price).toFixed(2).replace('.',',')}€</span>
                  </li>
                ))}
                {(cat.items?.length || 0) > 4 && <li className="dash-cat-more">+ {cat.items.length - 4} ακόμα</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">03 / ΛΕΙΤΟΥΡΓΙΕΣ</span>
            <span className="dash-panel-title">{enabledFeatures} λειτουργίες · πλάνο {owner?.plan}</span>
          </div>
          {!isExclusive ? (
            <button className="btn btn-ghost btn-sm" onClick={onPlanClick}>
              <Icon name="bolt" size={12}/>Αναβάθμιση πλάνου
            </button>
          ) : (
            <span style={{fontFamily:'var(--font-mono)', fontSize:'0.65rem', opacity:0.5, letterSpacing:'0.04em'}}>
              // EXCLUSIVE — μέγιστο πλάνο
            </span>
          )}
        </div>
        <div className="dash-feat-grid">
          {planFeatures.map((f, i) => (
            <div key={f.key} className="dash-feat">
              <div className="dash-feat-top">
                <span className="dash-feat-num">{String(i+1).padStart(2,'0')}</span>
                <span className="dash-feat-on"/>
              </div>
              <div className="dash-feat-name">{f.label}</div>
              <div className="dash-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
