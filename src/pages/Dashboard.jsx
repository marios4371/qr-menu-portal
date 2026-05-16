// src/pages/Dashboard.jsx
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { PLAN_FEATURES } from '../constants';
import { MENU_BASE_URL, claimShop } from '../services/api';
import s from './Dashboard.module.css';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Καλημέρα';
  if (h < 18) return 'Καλησπέρα';
  return 'Καληνύχτα';
}

// ── ClaimShopModal ────────────────────────────────────────────────────────────
function ClaimShopModal({ onClose }) {
  const { setShops, setCurrentShopId } = useAuth();
  const [shopId,   setShopId]   = useState('');
  const [password, setPassword] = useState('');
  const [busy,     setBusy]     = useState(false);
  const [err,      setErr]      = useState('');
  const [showPw,   setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopId.trim() || !password.trim()) {
      setErr('Συμπληρώστε Shop ID και κωδικό.');
      return;
    }
    setBusy(true); setErr('');
    try {
      const res = await claimShop({ shopId: shopId.trim(), password: password.trim() });
      setShops(prev => {
        const exists = prev.some(sh => sh.shop_id === res.shop.shop_id);
        return exists ? prev.map(sh => sh.shop_id === res.shop.shop_id ? res.shop : sh) : [...prev, res.shop];
      });
      setCurrentShopId(res.shop.shop_id);
      onClose();
    } catch (e) {
      setErr(e.message || 'Αποτυχία σύνδεσης καταστήματος.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <span className={s.modalTitle}>Σύνδεση υπάρχοντος καταστήματος</span>
          <button className={s.modalClose} onClick={onClose} type="button" aria-label="Κλείσιμο">
            <Icon name="x" size={14}/>
          </button>
        </div>
        <form className={s.modalBody} onSubmit={handleSubmit}>
          <p className={s.modalSub}>
            Συνδέστε ένα υπάρχον κατάστημα (π.χ. nissos, rakoumel) με τον λογαριασμό σας χρησιμοποιώντας το Shop ID και τον legacy κωδικό πρόσβασης.
          </p>

          <div className={s.formField}>
            <label className={s.formLabel}>Shop ID</label>
            <input
              className={s.formInput}
              type="text"
              placeholder="π.χ. nissos"
              value={shopId}
              onChange={e => setShopId(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className={s.formField}>
            <label className={s.formLabel}>Κωδικός πρόσβασης καταστήματος</label>
            <div className={s.pwWrap}>
              <input
                className={s.formInput}
                type={showPw ? 'text' : 'password'}
                placeholder="legacy password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                className={s.pwToggle}
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Απόκρυψη' : 'Εμφάνιση'}
              >
                <Icon name={showPw ? 'eye-off' : 'eye'} size={14}/>
              </button>
            </div>
          </div>

          {err && <div className={s.msgError}>{err}</div>}
        </form>
        <div className={s.modalFoot}>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={onClose} type="button">Ακύρωση</button>
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            onClick={handleSubmit}
            disabled={busy || !shopId.trim() || !password.trim()}
            type="button"
          >
            {busy ? <><span className={s.spinner}/>Σύνδεση…</> : <><Icon name="shop" size={12}/>Σύνδεση καταστήματος</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { onPlanClick } = useOutletContext();
  const { owner, shops, currentShopId, setCurrentShopId } = useAuth();
  const [claimOpen, setClaimOpen] = useState(false);

  const shop = shops.find(sh => sh.shop_id === currentShopId) || shops[0];
  if (!shop) return null;

  const totalProducts   = shop.menu?.reduce((acc, c) => acc + (c.items?.length || 0), 0) || 0;
  const planFeatures    = PLAN_FEATURES[owner?.plan] || [];
  const enabledFeatures = planFeatures.length;
  const isExclusive     = owner?.plan === 'EXCLUSIVE';

  const LEGACY_MENU_BASE = 'https://1f6nesbrjk.execute-api.eu-central-1.amazonaws.com/default/';
  const isLegacy = !shop?.shop_id?.startsWith('SHOP#');
  const menuUrl  = isLegacy
    ? `${LEGACY_MENU_BASE}?shop=${shop.shop_id}`
    : `${MENU_BASE_URL}/menu/${shop.shopSlug}`;
  const menuUrlShort = isLegacy
    ? `1f6nesbrjk…/default/?shop=${shop.shop_id}`
    : `${MENU_BASE_URL.replace('https://','').split('.')[0]}…/menu/${shop.shopSlug}`;
  const copyUrl = () => navigator.clipboard?.writeText(menuUrl);

  const right = (
    <div className={s.headerActions}>
      <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setClaimOpen(true)}>
        <Icon name="shop" size={12}/>Σύνδεση καταστήματος
      </button>
      <select
        className={s.shopSelect}
        value={currentShopId}
        onChange={e => setCurrentShopId(e.target.value)}
      >
        {shops.map(sh => (
          <option key={sh.shop_id} value={sh.shop_id}>
            {sh.shopName}{!sh.shop_id?.startsWith('SHOP#') ? ' (Legacy)' : ''}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <main className={s.pageMain}>
      <PageHeader
        topbarLabel="Dashboard"
        title={`${greeting()}, ${owner?.firstName} — αυτό είναι η επισκόπηση του καταστήματός σου.`}
        right={right}
      />

      {/* ── Top row: shop card + stats ── */}
      <div className={s.topRow}>
        <div className={s.shopCard}>
          <div className={s.shopCardTop}>
            <div>
              <div className={s.shopMetaLabel}>Ενεργό κατάστημα</div>
              <div className={s.shopName}>
                {shop.shopName}
                {isLegacy && <span className={s.shopTag}>LEGACY</span>}
              </div>
              <div className={s.shopType}>{shop.businessType}</div>
            </div>
            <span className={s.livePill}>
              <span className={s.liveDot}/>Ενεργό
            </span>
          </div>
          <div className={s.urlRow}>
            <div className={s.urlCode}>
              <Icon name="qr" size={14}/>
              <span className={s.urlCodeText}>{menuUrlShort}</span>
            </div>
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={copyUrl}>
              <Icon name="copy" size={12}/>Αντιγραφή
            </button>
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.open(menuUrl, '_blank')}>
              <Icon name="ext" size={12}/>Άνοιγμα
            </button>
          </div>
        </div>

        <div className={s.statsCol}>
          <div className={s.statCard}>
            <div className={s.statCardTop}>
              <span className={s.statLabel}>ORDERS / TODAY</span>
              <span className={s.statIcon}><Icon name="bolt" size={14}/></span>
            </div>
            <div className={`${s.statValue} ${s.statValueMuted}`}>—</div>
            <div className={s.statMeta}>0 αρχικά δεδομένα</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statCardTop}>
              <span className={s.statLabel}>REVENUE / MTD</span>
              <span className={s.statIcon}><Icon name="stat" size={14}/></span>
            </div>
            <div className={`${s.statValue} ${s.statValueMuted}`}>—</div>
            <div className={s.statMeta}>0 αρχικά δεδομένα</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statCardTop}>
              <span className={s.statLabel}>MENU</span>
              <span className={s.statIcon}><Icon name="grid" size={14}/></span>
            </div>
            <div className={s.statValue}>{totalProducts}</div>
            <div className={s.statMeta}>{totalProducts} προϊόντα · {shop.menu?.length || 0} κατηγορίες</div>
          </div>
        </div>
      </div>

      {/* ── Menu overview ── */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <div>
            <h2 className={s.sectionTitle}>Επισκόπηση μενού</h2>
            <p className={s.sectionSub}>
              {shop.menu?.length || 0} κατηγορίες · {totalProducts} προϊόντα
            </p>
          </div>
          <div className={s.sectionActions}>
            <button
              className={`${s.btn} ${s.btnSecondary}`}
              onClick={() => window.open(menuUrl, '_blank')}
            >
              <Icon name="ext" size={12}/>Ανοίξτε Live
            </button>
            <button
              className={`${s.btn} ${s.btnPrimary}`}
              onClick={() => navigate('/menu-editor')}
            >
              <Icon name="edit" size={12}/>Επεξεργασία Μενού
            </button>
          </div>
        </div>

        <div className={s.catGrid}>
          {(shop.menu || []).map(cat => (
            <div key={cat.id} className={s.catCard}>
              <span className={s.catName}>{cat.name}</span>
              <span className={s.catCount}>{cat.items?.length || 0} προϊόντα</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <div>
            <h2 className={s.sectionTitle}>Λειτουργίες</h2>
            <p className={s.sectionSub}>
              {enabledFeatures} ενεργές · πλάνο {owner?.plan}
            </p>
          </div>
          {!isExclusive ? (
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={onPlanClick}>
              <Icon name="bolt" size={12}/>Αναβάθμιση πλάνου
            </button>
          ) : (
            <span className={s.planMaxNote}>Μέγιστο πλάνο</span>
          )}
        </div>

        <div className={s.featGrid}>
          {planFeatures.map((f) => (
            <div key={f.key} className={s.featCard}>
              <div className={s.featHead}>
                <span className={s.featName}>{f.label}</span>
                <span className={s.featCheck}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              </div>
              <span className={s.featDesc}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {claimOpen && <ClaimShopModal onClose={() => setClaimOpen(false)}/>}
    </main>
  );
}
