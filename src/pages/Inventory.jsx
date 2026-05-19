// src/pages/Inventory.jsx
// Απόθεμα — EXCLUSIVE only. Placeholder UI: table + empty state + add-drawer mock.
// Το backend για inventory δεν υπάρχει ακόμα — αυτή η σελίδα δείχνει το UI και
// διαχειρίζεται in-memory state ώστε να είναι λειτουργική για demo.

import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader, ShopSelectPill } from '../components/Primitives';

// ── Status helpers ────────────────────────────────────────────────────────────
function computeStatus(item) {
  if (item.quantity <= 0) return 'OUT';
  if (item.minStock != null && item.quantity <= item.minStock) return 'LOW';
  if (item.expiry) {
    const days = Math.floor((new Date(item.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'EXPIRED';
    if (days <= 7) return 'EXPIRING';
  }
  return 'OK';
}

const STATUS_META = {
  OK:       { label: 'OK',           color: 'var(--success)',  cls: 'badge-green' },
  LOW:      { label: 'LOW STOCK',    color: 'var(--warning)',  cls: 'badge-amber' },
  EXPIRING: { label: 'EXPIRING',     color: 'var(--warning)',  cls: 'badge-amber' },
  EXPIRED:  { label: 'EXPIRED',      color: 'var(--error)',    cls: 'badge-red'   },
  OUT:      { label: 'OUT OF STOCK', color: 'var(--error)',    cls: 'badge-red'   },
};

const fmtNum = (n) => Number(n || 0).toLocaleString('el-GR');
const fmtPrice = (n) => Number(n || 0).toFixed(2).replace('.', ',');

// ── Add/Edit Drawer ───────────────────────────────────────────────────────────
function ItemDrawer({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    name: '', sku: '', category: '', quantity: 0, unit: 'pcs',
    cost: 0, minStock: '', expiry: '',
  });

  const update = (patch) => setForm(f => ({ ...f, ...patch }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <span className="modal-title">// {item ? 'Επεξεργασία είδους' : 'Νέο είδος αποθέματος'}</span>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">Όνομα είδους</label>
            <input className="form-input" value={form.name} onChange={e => update({ name: e.target.value })} placeholder="π.χ. Ouzo Plomari" autoFocus/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label className="form-label">SKU (προαιρετικό)</label>
              <input className="form-input" value={form.sku} onChange={e => update({ sku: e.target.value })} placeholder="SP-001"/>
            </div>
            <div className="form-field">
              <label className="form-label">Κατηγορία</label>
              <input className="form-input" value={form.category} onChange={e => update({ category: e.target.value })} placeholder="Spirits / Coffee / ..."/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label className="form-label">Ποσότητα</label>
              <input className="form-input" type="number" step="0.1" value={form.quantity} onChange={e => update({ quantity: parseFloat(e.target.value) || 0 })}/>
            </div>
            <div className="form-field">
              <label className="form-label">Μονάδα</label>
              <select value={form.unit} onChange={e => update({ unit: e.target.value })}>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="bottles">bottles</option>
                <option value="boxes">boxes</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Κόστος / μονάδα</label>
              <input className="form-input" type="number" step="0.01" value={form.cost} onChange={e => update({ cost: parseFloat(e.target.value) || 0 })}/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label className="form-label">Min stock alert</label>
              <input className="form-input" type="number" step="0.1" value={form.minStock} onChange={e => update({ minStock: e.target.value })} placeholder="0 (off)"/>
            </div>
            <div className="form-field">
              <label className="form-label">Ημ/νία λήξης</label>
              <input className="form-input" type="date" value={form.expiry} onChange={e => update({ expiry: e.target.value })}/>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
            // Προαιρετικά πεδία: SKU, min-stock, λήξη. Status υπολογίζεται αυτόματα.
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Ακύρωση</button>
          <button className="btn btn-primary btn-sm" onClick={() => onSave(form)} disabled={!form.name.trim()}>
            <Icon name="save" size={12}/>{item ? 'Αποθήκευση' : 'Προσθήκη'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inventory main component ──────────────────────────────────────────────────
export default function Inventory() {
  const { onPlanClick } = useOutletContext();
  const { owner, shops, currentShopId, setCurrentShopId } = useAuth();
  const isExclusive = owner?.plan === 'EXCLUSIVE';

  // In-memory state (backend integration TBD)
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [drawerItem, setDrawerItem] = useState(undefined); // undefined=closed, null=new, object=edit

  const filtered = useMemo(() => {
    let r = items;
    if (search) r = r.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || '').toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) r = r.filter(i => computeStatus(i) === filterStatus);
    return r;
  }, [items, search, filterStatus]);

  const counts = useMemo(() => {
    const c = { total: items.length, ok: 0, low: 0, out: 0, expiring: 0 };
    items.forEach(it => {
      const s = computeStatus(it);
      if (s === 'OK') c.ok++;
      else if (s === 'LOW') c.low++;
      else if (s === 'OUT') c.out++;
      else if (s === 'EXPIRING' || s === 'EXPIRED') c.expiring++;
    });
    return c;
  }, [items]);

  const upsert = (item) => {
    setItems(prev => {
      const idx = item.id != null ? prev.findIndex(i => i.id === item.id) : -1;
      if (idx >= 0) return prev.map((p, i) => i === idx ? item : p);
      return [...prev, { ...item, id: 'inv_' + Date.now() }];
    });
    setDrawerItem(undefined);
  };

  const remove = (id) => {
    if (!window.confirm('Διαγραφή είδους από το απόθεμα;')) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Plan gate
  if (!isExclusive) {
    return (
      <main className="page-main">
        <PageHeader kicker="Απόθεμα" title="Διαχείριση κάβας" sub="Διαθέσιμο μόνο στο Exclusive πλάνο."/>
        <div className="an-gate ticks">
          <div className="an-gate-icon"><Icon name="package" size={32}/></div>
          <div className="an-gate-title">Exclusive Feature</div>
          <div className="an-gate-sub">Καταγραφή ειδών, ποσοτήτων, ημερομηνιών λήξης και low-stock alerts. Διαθέσιμο μόνο στο Exclusive πλάνο.</div>
          <button className="btn btn-primary" onClick={onPlanClick}>
            <Icon name="bolt" size={13}/>Αναβάθμιση πλάνου
          </button>
        </div>
      </main>
    );
  }

  const centerPill = (
    <ShopSelectPill
      value={currentShopId}
      onChange={e => setCurrentShopId(e.target.value)}
      shops={shops}
    />
  );

  return (
    <main className="page-main">
      <PageHeader
        topbarLabel="Απόθεμα"
        center={centerPill}
      />

      {/* Toolbar */}
      <div className="inv-toolbar">
        <div className="inv-search">
          <Icon name="search" size={13}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση είδους ή SKU…"/>
        </div>
        <select className="dash-shop-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Όλα τα status</option>
          <option value="OK">OK</option>
          <option value="LOW">Low stock</option>
          <option value="OUT">Out of stock</option>
          <option value="EXPIRING">Expiring</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <div className="grow"/>
        <button className="btn btn-primary btn-sm" onClick={() => setDrawerItem(null)}>
          <Icon name="plus" size={12}/>Νέο είδος
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="inv-empty ticks">
          <div className="inv-empty-icon"><Icon name="package" size={28}/></div>
          <div className="inv-empty-title">Δεν έχετε καταγράψει είδη ακόμα</div>
          <div className="inv-empty-sub">
            Ξεκινήστε προσθέτοντας το πρώτο είδος αποθέματος. Status, alerts και reports υπολογίζονται αυτόματα.
          </div>
          <button className="btn btn-primary" onClick={() => setDrawerItem(null)}>
            <Icon name="plus" size={13}/>Προσθήκη πρώτου είδους
          </button>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: 18, opacity: 0.6 }}>
            // backend persistence: επερχόμενο sprint
          </p>
        </div>
      )}

      {/* Table */}
      {items.length > 0 && filtered.length > 0 && (
        <div className="inv-table-wrap ticks">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Είδος</th>
                <th>Κατηγορία</th>
                <th className="num">Ποσότητα</th>
                <th className="num">Κόστος</th>
                <th>Λήξη</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(it => {
                const status = computeStatus(it);
                const meta = STATUS_META[status];
                return (
                  <tr key={it.id}>
                    <td>
                      <div className="inv-name">{it.name}</div>
                      {it.sku && <div className="inv-sku">SKU: {it.sku}</div>}
                    </td>
                    <td className="muted">{it.category || '—'}</td>
                    <td className="num mono" style={{ color: status === 'OUT' ? 'var(--error)' : status === 'LOW' ? 'var(--warning)' : 'var(--text)' }}>
                      {fmtNum(it.quantity)} <span className="inv-unit">{it.unit}</span>
                    </td>
                    <td className="num mono">{fmtPrice(it.cost)} €</td>
                    <td className="mono small" style={{ color: (status === 'EXPIRING' || status === 'EXPIRED') ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {it.expiry || '—'}
                    </td>
                    <td><span className={`badge ${meta.cls}`} style={{ fontSize: 10 }}>{meta.label}</span></td>
                    <td className="acts">
                      <button className="btn btn-ghost btn-sm" onClick={() => setDrawerItem(it)}>
                        <Icon name="edit" size={11}/>
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(it.id)}>
                        <Icon name="trash" size={11}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && filtered.length === 0 && (
        <div className="me-empty">
          <span className="icon">∅</span>
          <span>Δεν βρέθηκαν είδη για τα επιλεγμένα φίλτρα</span>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); }}>Καθαρισμός</button>
        </div>
      )}

      {drawerItem !== undefined && (
        <ItemDrawer
          item={drawerItem}
          onClose={() => setDrawerItem(undefined)}
          onSave={upsert}
        />
      )}
    </main>
  );
}
