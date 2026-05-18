// src/pages/Analytics.jsx — Figma frames 08_before (empty) + 08_after (data) + orders detail table
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { getOrdersAnalytics } from '../services/api';
import s from './Analytics.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  NEW: 'NEW', CLAIMED: 'CLAIMED', PARTIAL: 'PARTIAL', READY: 'READY', CLOSED: 'CLOSED',
};
const STATUS_COLOR = {
  NEW: '#D97706', CLAIMED: '#1C62CC', PARTIAL: '#7C3AED',
  READY: '#2E5C1E', CLOSED: '#575249',
};
const fmt = (n) => Number(n || 0).toLocaleString('el-GR', { minimumFractionDigits: 2 });
const fmtDate = (iso) => iso ? iso.slice(0, 10) : '—';
const fmtTime = (iso) => iso ? iso.slice(11, 16) : '';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ── Stat card (Figma 08_after) ───────────────────────────────────────────────
function StatPill({ label, value, sub, accent }) {
  return (
    <div className={s.statPill}>
      <div className={s.statLabel}>{label}</div>
      <div className={`${s.statValue} ${accent ? s.statValueAccent : ''}`}>{value}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const label = STATUS_LABEL[status] || status;
  const color = STATUS_COLOR[status] || '#575249';
  return (
    <span className={s.statusBadge} style={{ color, borderColor: color + '55', background: color + '12' }}>
      {label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Analytics() {
  const { onPlanClick } = useOutletContext();
  const { owner, shops, currentShopId, setCurrentShopId } = useAuth();

  const isPremium = ['PREMIUM', 'EXCLUSIVE'].includes(owner?.plan);

  const [from, setFrom]       = useState(todayISO());
  const [to, setTo]           = useState(todayISO());
  const [product, setProduct] = useState('');
  const [source, setSource]   = useState('');

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const shop = shops.find(sh => sh.shop_id === currentShopId) || shops[0];

  const productOptions = (shop?.menu || []).flatMap(c => c.items || []).map(p => p.name);

  const runQuery = useCallback(async () => {
    if (!shop?.shop_id || !isPremium) return;
    setLoading(true); setErr('');
    try {
      const data = await getOrdersAnalytics({
        shopId: shop.shop_id,
        from, to,
        source: source === 'QR' ? 'CUSTOMER_QR' : source === 'POS' ? 'WAITER_APP' : '',
      });
      // Filter by product name client-side if specified
      let orders = data.orders || [];
      if (product) {
        orders = orders.filter(o => (o.items || []).some(it => (it.name || '').toLowerCase().includes(product.toLowerCase())));
      }
      setResult({ ...data, orders });
      setHasSearched(true);
    } catch (e) {
      setErr(e.message || 'Σφάλμα ανάκτησης δεδομένων');
    } finally {
      setLoading(false);
    }
  }, [shop?.shop_id, from, to, product, source, isPremium]);

  if (!shop) return null;

  // ── Plan gate ──
  if (!isPremium) {
    return (
      <main className={s.pageMain}>
        <PageHeader kicker="Analytics" title="Order Analytics" sub="Διαθέσιμο σε Premium και Exclusive πλάνο."/>
        <div className={s.planGate}>
          <div className={s.planGateIcon}><Icon name="stat" size={32}/></div>
          <h2 className={s.planGateTitle}>Premium Feature</h2>
          <p className={s.planGateSub}>
            Αναβάθμισε το πλάνο σου για να δεις analytics, trends και φιλτράρισμα παραγγελιών.
          </p>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={onPlanClick}>
            <Icon name="bolt" size={13}/>Αναβάθμιση πλάνου
          </button>
        </div>
      </main>
    );
  }

  // Header right (shop selector pill)
  const right = (
    <div className={s.headerActions}>
      <span className={s.shopLabel}>Κατάστημα :</span>
      <select
        className={s.shopSelect}
        value={currentShopId}
        onChange={e => setCurrentShopId(e.target.value)}
      >
        {shops.map(sh => (
          <option key={sh.shop_id} value={sh.shop_id}>{sh.shopName}</option>
        ))}
      </select>
    </div>
  );

  const sum = result?.summary;
  const topItem = sum?.topItems?.[0];

  return (
    <main className={s.pageMain}>
      <PageHeader
        topbarLabel="Analytics Μενού"
        title="Order Analytics"
        sub="Διαμορφώστε τα φίλτρα και πατήστε «Αναζήτηση» για ανάκτηση δεδομένων."
        right={right}
      />

      {/* ── Search bar (rounded white pill container) ── */}
      <div className={s.searchBar}>
        <div className={s.searchRow}>
          <div className={s.filterPill}>
            <span className={s.filterLabel}>Ημερομηνία ΑΠΟ :</span>
            <input
              className={s.filterInput}
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
            />
          </div>
          <div className={s.filterPill}>
            <span className={s.filterLabel}>Ημερομηνία ΕΩΣ :</span>
            <input
              className={s.filterInput}
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
            />
          </div>
          <div className={s.filterPill}>
            <span className={s.filterLabel}>Προϊόν :</span>
            <select
              className={s.filterSelect}
              value={product}
              onChange={e => setProduct(e.target.value)}
            >
              <option value="">— Όλα —</option>
              {productOptions.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className={s.filterPill}>
            <span className={s.filterLabel}>Πηγή :</span>
            <select
              className={s.filterSelect}
              value={source}
              onChange={e => setSource(e.target.value)}
            >
              <option value="">— Όλες —</option>
              <option value="QR">Customer App</option>
              <option value="POS">Waiter App</option>
            </select>
          </div>
        </div>
        <button
          className={`${s.btnSearch} ${loading ? s.btnSearchBusy : ''}`}
          onClick={runQuery}
          disabled={loading}
        >
          {loading ? <><span className={s.spinner}/>Αναζήτηση…</> : <>Αναζήτηση <Icon name="search" size={13}/></>}
        </button>
      </div>

      {err && <div className={s.msgError}>{err}</div>}

      {/* ── Empty state (08_before) ── */}
      {!hasSearched && !loading && !err && (
        <div className={s.emptyState}>
          <svg className={s.emptyIcon} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 100 L60 70 L100 90 L140 50 L180 20 M180 20 L160 30 M180 20 L170 40"
                  stroke="#9B948C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className={s.emptyText}>Επιλέξτε φίλτρα για εμφάνιση αποτελεσμάτων</p>
        </div>
      )}

      {/* ── Data state (08_after) ── */}
      {hasSearched && sum && (
        <>
          <div className={s.statsRow}>
            <StatPill
              label="ΠΑΡΑΓΓΕΛΙΕΣ"
              value={sum.totalOrders ?? 0}
              sub={`NEW:${sum.byStatus?.NEW || 0} · CLOSED:${sum.closedOrders || 0}`}
            />
            <StatPill
              label="ΕΣΟΔΑ (€)"
              value={fmt(sum.totalRevenue)}
              accent
            />
            <StatPill
              label="ΜΕΣΟΣ ΟΡΟΣ"
              value={`${fmt(sum.avgOrderValue)}€`}
            />
            <StatPill
              label="TOP ITEM"
              value={topItem?.name || '—'}
              sub={topItem ? `${topItem.count} παραγγελίες` : ''}
            />
          </div>

          {/* ── Orders detail panel (extra, requested by user) ── */}
          <div className={s.ordersPanel}>
            <div className={s.ordersPanelHead}>
              <span className={s.ordersPanelTitle}>Αναλυτικές παραγγελίες</span>
              <span className={s.ordersPanelCount}>{result.orders.length} παραγγελίες</span>
            </div>

            {result.orders.length === 0 ? (
              <div className={s.ordersEmpty}>
                Δεν βρέθηκαν παραγγελίες για τα επιλεγμένα φίλτρα.
              </div>
            ) : (
              <>
                <div className={s.ordersTableHead}>
                  <span>Ημ/νία</span>
                  <span>Order ID</span>
                  <span>Τραπέζι</span>
                  <span>Πηγή</span>
                  <span>Status</span>
                  <span>Πληρωμή</span>
                  <span>Ποσό</span>
                </div>
                <div className={s.ordersTableBody}>
                  {result.orders.map((o, idx) => (
                    <div key={o.orderId || idx} className={s.ordersRow}>
                      <span className={s.cellMono}>
                        {fmtDate(o.createdAt)} <span className={s.cellTime}>{fmtTime(o.createdAt)}</span>
                      </span>
                      <span className={s.cellId}>
                        {(o.orderId || '').replace('ORDER#', '').slice(0, 18) || '—'}…
                      </span>
                      <span className={s.cellCenter}>{o.tableNumber || '—'}</span>
                      <span className={s.cellMuted}>
                        {o.source === 'CUSTOMER_QR' ? 'QR' : o.source === 'WAITER_APP' ? 'POS' : '—'}
                      </span>
                      <span><StatusBadge status={o.status}/></span>
                      <span
                        className={s.cellPayment}
                        style={{ color: o.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--text-muted)' }}
                      >
                        {o.paymentStatus || '—'}
                      </span>
                      <span className={s.cellAmount}>{fmt(o.totalAmount)} €</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {loading && !sum && (
        <div className={s.emptyState}>
          <span className={s.spinnerLg}/>
        </div>
      )}
    </main>
  );
}
