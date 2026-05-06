// src/pages/Analytics.jsx
// Order analytics with DynamoDB filter builder — Premium/Exclusive only
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { getOrdersAnalytics } from '../services/api';

// ── Status labels & colours ───────────────────────────────────────────────────
const STATUS_META = {
  NEW:     { label: 'NEW',     color: '#FFB800' },
  CLAIMED: { label: 'CLAIMED', color: '#00C8FF' },
  PARTIAL: { label: 'PARTIAL', color: '#9B5DE5' },
  READY:   { label: 'READY',   color: '#00FF88' },
  CLOSED:  { label: 'CLOSED',  color: '#3A4A5A' },
};

const FILTER_FIELDS = [
  { key: 'from',          label: 'Από',              dbField: 'orderId',       type: 'date',   hint: 'SK ≥ ORDER#<date>' },
  { key: 'to',            label: 'Έως',              dbField: 'orderId',       type: 'date',   hint: 'SK ≤ ORDER#<date>~' },
  { key: 'status',        label: 'Status',           dbField: 'status',        type: 'select', options: ['', 'NEW','CLAIMED','PARTIAL','READY','CLOSED'] },
  { key: 'paymentStatus', label: 'Πληρωμή',          dbField: 'paymentStatus', type: 'select', options: ['', 'UNPAID','PAID'] },
  { key: 'source',        label: 'Πηγή',             dbField: 'source',        type: 'select', options: ['', 'CUSTOMER_QR','WAITER_APP'] },
  { key: 'tableNumber',   label: 'Τραπέζι #',        dbField: 'tableNumber',   type: 'number', hint: 'FilterExpr' },
  { key: 'minAmount',     label: 'Min ποσό (€)',     dbField: 'totalAmount',   type: 'number', hint: 'FilterExpr ≥' },
];

function buildQueryPreview(shopId, filters) {
  const lines = [`shopId = "${shopId}"`];
  if (filters.from || filters.to) {
    const f = filters.from ? `ORDER#${filters.from}` : 'ORDER#0000';
    const t = filters.to   ? `ORDER#${filters.to}T23:59:59Z~` : 'ORDER#￿';
    lines.push(`AND orderId BETWEEN "${f}" AND "${t}"`);
  }
  if (filters.status)        lines.push(`AND #status = "${filters.status}"`);
  if (filters.paymentStatus) lines.push(`AND paymentStatus = "${filters.paymentStatus}"`);
  if (filters.source)        lines.push(`AND #source = "${filters.source}"`);
  if (filters.tableNumber)   lines.push(`AND tableNumber = "${filters.tableNumber}"`);
  if (filters.minAmount)     lines.push(`AND totalAmount >= ${filters.minAmount}`);
  return lines;
}

function fmt(n) { return Number(n || 0).toLocaleString('el-GR', { minimumFractionDigits: 2 }); }
function fmtDate(iso) { return iso ? iso.slice(0, 10) : '—'; }

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, accent }) {
  return (
    <div className="an-card ticks">
      <div className="an-card-lab">{label}</div>
      <div className="an-card-val" style={accent ? { color: 'var(--accent)' } : {}}>{value}</div>
      {sub && <div className="an-card-sub">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, color: '#888' };
  return (
    <span className="an-badge" style={{ borderColor: m.color + '55', color: m.color, background: m.color + '12' }}>
      {m.label}
    </span>
  );
}

function OrdersTable({ orders }) {
  if (!orders.length) return (
    <div className="an-empty">// Δεν βρέθηκαν παραγγελίες για τα επιλεγμένα φίλτρα</div>
  );
  return (
    <div className="an-table-wrap">
      <table className="an-table">
        <thead>
          <tr>
            <th>Ημ/νία</th>
            <th>Order ID</th>
            <th>Τραπέζι</th>
            <th>Πηγή</th>
            <th>Status</th>
            <th>Πληρωμή</th>
            <th>Ποσό</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.orderId}>
              <td className="mono">{fmtDate(o.createdAt)}</td>
              <td className="mono muted small">{o.orderId?.replace('ORDER#','').slice(0,22)}…</td>
              <td className="mono center">{o.tableNumber || '—'}</td>
              <td className="mono small">{o.source === 'CUSTOMER_QR' ? 'QR' : o.source === 'WAITER_APP' ? 'POS' : '—'}</td>
              <td><StatusBadge status={o.status}/></td>
              <td className="mono small" style={{ color: o.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--text-muted)' }}>
                {o.paymentStatus}
              </td>
              <td className="mono accent">{fmt(o.totalAmount)} €</td>
              <td className="mono small muted">{o.items?.length || 0} items</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopItemsBar({ items }) {
  if (!items?.length) return null;
  const max = items[0]?.count || 1;
  return (
    <div className="an-top-items">
      {items.map((it, i) => (
        <div key={it.name} className="an-top-item">
          <span className="an-top-rank mono">{String(i+1).padStart(2,'0')}</span>
          <span className="an-top-name">{it.name}</span>
          <div className="an-top-bar-wrap">
            <div className="an-top-bar" style={{ width: `${(it.count / max) * 100}%` }}/>
          </div>
          <span className="an-top-count mono">{it.count}×</span>
        </div>
      ))}
    </div>
  );
}

function ByDayChart({ byDay }) {
  const entries = Object.entries(byDay).sort((a,b) => a[0].localeCompare(b[0])).slice(-30);
  if (!entries.length) return null;
  const max = Math.max(...entries.map(e => e[1]), 1);
  return (
    <div className="an-day-chart">
      {entries.map(([day, count]) => (
        <div key={day} className="an-day-col" title={`${day}: ${count} orders`}>
          <div className="an-day-bar" style={{ height: `${Math.max(4, (count/max)*100)}%` }}/>
          <span className="an-day-label">{day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const EMPTY_FILTERS = {
  from: '', to: '', status: '', paymentStatus: '',
  source: '', tableNumber: '', minAmount: '',
};

// Default: current month
function defaultFilters() {
  const now = new Date();
  const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0');
  return { ...EMPTY_FILTERS, from: `${y}-${m}-01`, to: `${y}-${m}-${String(now.getDate()).padStart(2,'0')}` };
}

export default function Analytics() {
  const { onPlanClick } = useOutletContext();
  const { owner, shops, currentShopId, setCurrentShopId } = useAuth();

  const isPremium = ['PREMIUM','EXCLUSIVE'].includes(owner?.plan);

  const [filters, setFilters]   = useState(defaultFilters);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');
  const debounceRef = useRef(null);

  const shop = shops.find(s => s.shop_id === currentShopId) || shops[0];

  const runQuery = useCallback(async (shopId, activeFilters) => {
    if (!shopId || !isPremium) return;
    setLoading(true); setErr('');
    try {
      const data = await getOrdersAnalytics({ shopId, ...activeFilters });
      setResult(data);
    } catch(e) {
      setErr(e.message || 'Σφάλμα ανάκτησης δεδομένων');
    } finally {
      setLoading(false);
    }
  }, [isPremium]);

  // Auto-run with 800ms debounce when filters or shop change
  useEffect(() => {
    if (!shop) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runQuery(shop.shop_id, filters), 800);
    return () => clearTimeout(debounceRef.current);
  }, [filters, shop?.shop_id, runQuery]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters(defaultFilters());

  const queryLines = shop ? buildQueryPreview(shop.shop_id, filters) : [];
  const activeCount = Object.values(filters).filter(Boolean).length;

  // Plan gate
  if (!isPremium) {
    return (
      <main className="page-main">
        <PageHeader kicker="Analytics" title="Order Analytics" sub="Διαθέσιμο σε Premium και Exclusive πλάνο."/>
        <div className="an-gate ticks">
          <div className="an-gate-icon"><Icon name="stat" size={32}/></div>
          <div className="an-gate-title">Premium Feature</div>
          <div className="an-gate-sub">Αναβάθμισε το πλάνο σου για να δεις analytics, trends και φιλτράρισμα παραγγελιών.</div>
          <button className="btn btn-primary" onClick={onPlanClick}>
            <Icon name="bolt" size={13}/>Αναβάθμιση πλάνου
          </button>
        </div>
      </main>
    );
  }

  // Shop selector for header
  const right = (
    <div className="dash-shop-select-wrap">
      <span className="dash-shop-select-lab">SHOP</span>
      <select className="dash-shop-select" value={currentShopId} onChange={e => setCurrentShopId(e.target.value)}>
        {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shopName || s.shop_id}</option>)}
      </select>
    </div>
  );

  const s = result?.summary;

  return (
    <main className="page-main">
      <PageHeader
        kicker="Analytics"
        title="Order Analytics"
        sub="Φιλτράρισε παραγγελίες. Κάθε επιλογή χτίζει ένα DynamoDB query."
        right={right}
      />

      <div className="an-layout">
        {/* ── Left: Filter Builder ── */}
        <div className="an-sidebar">
          <div className="an-sidebar-head">
            <span className="kicker">Filter Builder</span>
            {activeCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Reset</button>
            )}
          </div>

          <div className="an-fields">
            {FILTER_FIELDS.map(f => (
              <div key={f.key} className="an-field">
                <div className="an-field-meta">
                  <span className="an-field-label">{f.label}</span>
                  <span className="an-field-db" title={f.hint || f.dbField}>.{f.dbField}</span>
                </div>
                {f.type === 'select' ? (
                  <select value={filters[f.key]} onChange={e => setFilter(f.key, e.target.value)}>
                    {f.options.map(o => <option key={o} value={o}>{o || '— Όλα —'}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={filters[f.key]}
                    onChange={e => setFilter(f.key, e.target.value)}
                    placeholder={f.type === 'date' ? 'YYYY-MM-DD' : '0'}
                    min={f.type === 'number' ? '0' : undefined}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Query Preview */}
          <div className="an-query-preview">
            <div className="an-query-head">
              <Icon name="list" size={11}/>
              <span>DynamoDB Query</span>
            </div>
            <div className="an-query-body">
              <div className="an-query-line dim">{'{'}</div>
              <div className="an-query-line">
                <span className="an-q-key">  Table</span>
                <span className="an-q-sep">: </span>
                <span className="an-q-val">"orders"</span>
              </div>
              <div className="an-query-line">
                <span className="an-q-key">  KeyCondition</span>
                <span className="an-q-sep">: </span>
              </div>
              {queryLines.map((l, i) => (
                <div key={i} className={`an-query-line ${i === 0 ? 'an-q-val' : 'an-q-filter'}`}>
                  {'    '}{l}
                </div>
              ))}
              <div className="an-query-line dim">{'}'}</div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={() => runQuery(shop?.shop_id, filters)}
            disabled={loading || !shop}
          >
            {loading ? <><span className="spinner"/>Εκτέλεση…</> : <><Icon name="search" size={13}/>Εκτέλεση Query</>}
          </button>
        </div>

        {/* ── Right: Results ── */}
        <div className="an-results">
          {err && <div className="msg-error" style={{ marginBottom: 16 }}>{err}</div>}

          {/* Summary tiles */}
          {s && (
            <>
              <div className="an-summary">
                <SummaryCard label="TOTAL ORDERS"  value={s.totalOrders}  sub={`${s.closedOrders} κλειστές`}/>
                <SummaryCard label="REVENUE (PAID)" value={`${fmt(s.totalRevenue)} €`} accent/>
                <SummaryCard label="AVG ORDER"     value={`${fmt(s.avgOrderValue)} €`} sub="ανά κλειστή"/>
                <SummaryCard label="STATUS MIX"
                  value={Object.entries(s.byStatus).sort((a,b) => b[1]-a[1])[0]?.[0] || '—'}
                  sub={Object.entries(s.byStatus).map(([k,v]) => `${k}:${v}`).join(' · ')}/>
              </div>

              {/* Daily chart */}
              {Object.keys(s.byDay).length > 0 && (
                <div className="dash-panel ticks">
                  <div className="dash-panel-head">
                    <div className="dash-panel-head-l">
                      <span className="dash-panel-kicker">ORDERS / DAY</span>
                      <span className="dash-panel-title">Παραγγελίες ανά ημέρα (τελευταίες 30)</span>
                    </div>
                  </div>
                  <ByDayChart byDay={s.byDay}/>
                </div>
              )}

              {/* Top items */}
              {s.topItems?.length > 0 && (
                <div className="dash-panel ticks">
                  <div className="dash-panel-head">
                    <div className="dash-panel-head-l">
                      <span className="dash-panel-kicker">TOP ITEMS</span>
                      <span className="dash-panel-title">Κορυφαία προϊόντα κατά παραγγελία</span>
                    </div>
                  </div>
                  <TopItemsBar items={s.topItems}/>
                </div>
              )}

              {/* Orders table */}
              <div className="dash-panel ticks">
                <div className="dash-panel-head">
                  <div className="dash-panel-head-l">
                    <span className="dash-panel-kicker">ORDERS</span>
                    <span className="dash-panel-title">{result.orders.length} παραγγελίες</span>
                  </div>
                </div>
                <OrdersTable orders={result.orders}/>
              </div>
            </>
          )}

          {!s && !loading && !err && (
            <div className="an-empty">
              // Ορίσε τα φίλτρα και πάτα «Εκτέλεση Query»
            </div>
          )}
          {loading && !s && (
            <div className="an-empty"><span className="spinner" style={{width:24,height:24}}/></div>
          )}
        </div>
      </div>
    </main>
  );
}
