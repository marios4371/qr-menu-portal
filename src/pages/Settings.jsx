// src/pages/Settings.jsx
// Ρυθμίσεις: Λογαριασμός, Πλάνο & Χρέωση, Καταστήματα, Ασφάλεια.

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { PLANS, PLAN_FEATURES } from '../constants';
import { MENU_BASE_URL } from '../services/api';

const TABS = [
  { key: 'account',  label: 'Λογαριασμός' },
  { key: 'plan',     label: 'Πλάνο & Χρέωση' },
  { key: 'shops',    label: 'Καταστήματα' },
  { key: 'security', label: 'Ασφάλεια' },
];

// ── Account ───────────────────────────────────────────────────────────────────
function AccountTab({ owner }) {
  return (
    <div className="set-stack">
      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">ΣΤΟΙΧΕΙΑ ΛΟΓΑΡΙΑΣΜΟΥ</span>
            <span className="dash-panel-title">Προσωπικά στοιχεία</span>
          </div>
        </div>
        <div className="set-grid-2">
          <div className="set-row">
            <span className="set-row-lab">Όνομα</span>
            <span className="set-row-val">{owner?.firstName} {owner?.lastName}</span>
          </div>
          <div className="set-row">
            <span className="set-row-lab">Email</span>
            <span className="set-row-val mono">{owner?.email}</span>
          </div>
          <div className="set-row">
            <span className="set-row-lab">Τύπος επιχείρησης</span>
            <span className="set-row-val">{owner?.businessType || '—'}</span>
          </div>
          <div className="set-row">
            <span className="set-row-lab">Owner ID</span>
            <span className="set-row-val mono small">{owner?.ownerId?.slice(0, 24) || '—'}…</span>
          </div>
        </div>
        <div className="set-actions">
          <button className="btn btn-ghost btn-sm" disabled>
            <Icon name="edit" size={11}/>Επεξεργασία
          </button>
          <span className="set-hint">// επεξεργασία διαθέσιμη σύντομα</span>
        </div>
      </div>

      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">ΓΛΩΣΣΑ &amp; ΠΕΡΙΟΧΗ</span>
            <span className="dash-panel-title">Προτιμήσεις διεπαφής</span>
          </div>
        </div>
        <div className="set-grid-2">
          <div className="set-row">
            <span className="set-row-lab">Γλώσσα portal</span>
            <span className="set-row-val">Ελληνικά</span>
          </div>
          <div className="set-row">
            <span className="set-row-lab">Νόμισμα</span>
            <span className="set-row-val">EUR (€)</span>
          </div>
          <div className="set-row">
            <span className="set-row-lab">Ζώνη ώρας</span>
            <span className="set-row-val">Europe/Athens</span>
          </div>
          <div className="set-row">
            <span className="set-row-lab">Μορφή ημ/νίας</span>
            <span className="set-row-val mono small">YYYY-MM-DD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Plan ──────────────────────────────────────────────────────────────────────
function PlanTab({ owner, onPlanClick }) {
  const currentPlan = PLANS.find(p => p.value === owner?.plan) || PLANS[0];
  const isExclusive = owner?.plan === 'EXCLUSIVE';

  // Mock invoice history — backend not wired yet
  const mockInvoices = [
    { date: '2026-04-15', plan: currentPlan.name, amount: currentPlan.price + ' €' },
    { date: '2026-03-15', plan: currentPlan.name, amount: currentPlan.price + ' €' },
    { date: '2026-02-15', plan: 'Standard',       amount: '12,00 €' },
    { date: '2026-01-15', plan: 'Standard',       amount: '12,00 €' },
  ];

  return (
    <div className="set-stack">
      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">ΤΡΕΧΟΝ ΠΛΑΝΟ</span>
            <span className="dash-panel-title">{currentPlan.name} · {currentPlan.price} {currentPlan.period}</span>
          </div>
          {!isExclusive && (
            <button className="btn btn-primary btn-sm" onClick={onPlanClick}>
              <Icon name="bolt" size={12}/>Αναβάθμιση
            </button>
          )}
        </div>

        <div className="set-grid-3">
          <div className="set-stat">
            <div className="set-stat-lab">PLAN</div>
            <div className="set-stat-val accent">{currentPlan.name}</div>
            <div className="set-stat-sub">{currentPlan.price} {currentPlan.period}</div>
          </div>
          <div className="set-stat">
            <div className="set-stat-lab">ΕΠΟΜΕΝΗ ΧΡΕΩΣΗ</div>
            <div className="set-stat-val mono">15/2026</div>
            <div className="set-stat-sub mono">{currentPlan.price} €</div>
          </div>
          <div className="set-stat">
            <div className="set-stat-lab">METHOD</div>
            <div className="set-stat-val">—</div>
            <div className="set-stat-sub">// δεν έχει οριστεί</div>
          </div>
        </div>
      </div>

      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">ΛΕΙΤΟΥΡΓΙΕΣ ΠΛΑΝΟΥ</span>
            <span className="dash-panel-title">Τι περιλαμβάνεται στο {currentPlan.name}</span>
          </div>
          {!isExclusive && (
            <button className="btn btn-primary btn-sm" onClick={onPlanClick}>
              <Icon name="bolt" size={12}/>Αναβάθμιση πλάνου
            </button>
          )}
        </div>
        <div className="set-feat-grid">
          {(PLAN_FEATURES[owner?.plan] || []).map((f) => (
            <div key={f.key} className="set-feat-card">
              <div className="set-feat-head">
                <span className="set-feat-name">{f.label}</span>
                <span className="set-feat-check">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              </div>
              <span className="set-feat-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">ΙΣΤΟΡΙΚΟ ΧΡΕΩΣΕΩΝ</span>
            <span className="dash-panel-title">Τιμολόγια</span>
          </div>
          <span className="set-hint">// mock data — backend integration: επόμενο sprint</span>
        </div>
        <table className="set-table">
          <thead>
            <tr><th>Ημ/νία</th><th>Πλάνο</th><th className="num">Ποσό</th><th></th></tr>
          </thead>
          <tbody>
            {mockInvoices.map((inv, i) => (
              <tr key={i}>
                <td className="mono small">{inv.date}</td>
                <td>{inv.plan} (μηνιαία)</td>
                <td className="num mono">{inv.amount}</td>
                <td className="acts"><button className="btn btn-ghost btn-sm" disabled>↓ PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Shops ─────────────────────────────────────────────────────────────────────
function ShopsTab({ shops, owner }) {
  const planLimits = { STANDARD: 1, PREMIUM: 3, EXCLUSIVE: 999 };
  const limit = planLimits[owner?.plan] || 1;
  const canAdd = shops.length < limit;

  return (
    <div className="set-stack">
      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">ΕΝΕΡΓΑ ΚΑΤΑΣΤΗΜΑΤΑ</span>
            <span className="dash-panel-title">{shops.length} / {limit === 999 ? '∞' : limit} καταστήματα</span>
          </div>
          <button className="btn btn-primary btn-sm" disabled={!canAdd}>
            <Icon name="plus" size={12}/>Νέο κατάστημα
          </button>
        </div>

        <div className="set-shop-grid">
          {shops.map(s => (
            <div key={s.shop_id} className="set-shop">
              <div className="set-shop-top">
                <Icon name="shop" size={14}/>
                <span className="set-shop-name">{s.shopName}</span>
                {s.isLegacy && <span className="badge badge-gray" style={{ fontSize: 9 }}>LEGACY</span>}
              </div>
              <div className="set-shop-url mono">
                {MENU_BASE_URL.replace('https://', '').split('.')[0]}…/menu/{s.shopSlug}
              </div>
              <div className="set-shop-meta">
                <span>{s.businessType}</span>
                <span className="dot-sep">·</span>
                <span>{s.menu?.length || 0} κατηγορίες</span>
              </div>
              <div className="set-shop-acts">
                <button className="btn btn-ghost btn-sm">
                  <Icon name="ext" size={11}/>Open
                </button>
                <button className="btn btn-ghost btn-sm" disabled>
                  <Icon name="edit" size={11}/>Ρυθμίσεις
                </button>
              </div>
            </div>
          ))}

          {shops.length === 0 && (
            <div className="me-empty" style={{ gridColumn: '1 / -1' }}>
              <span className="icon">∅</span>
              <span>Δεν έχετε ενεργά καταστήματα</span>
            </div>
          )}
        </div>

        {!canAdd && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: 14 }}>
            // Έχετε φτάσει το όριο του πλάνου σας. Αναβαθμίστε για περισσότερα καταστήματα.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Security ──────────────────────────────────────────────────────────────────
function SecurityTab({ owner }) {
  return (
    <div className="set-stack">
      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">ΚΩΔΙΚΟΣ</span>
            <span className="dash-panel-title">Αλλαγή κωδικού πρόσβασης</span>
          </div>
        </div>
        <div className="set-grid-2">
          <div className="set-row">
            <span className="set-row-lab">Τελευταία αλλαγή</span>
            <span className="set-row-val">—</span>
          </div>
        </div>
        <div className="set-actions">
          <button className="btn btn-ghost btn-sm" disabled>
            <Icon name="lock" size={11}/>Αλλαγή κωδικού
          </button>
        </div>
      </div>

      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">ΕΝΕΡΓΗ ΣΥΝΕΔΡΙΑ</span>
            <span className="dash-panel-title">Διαχείριση sessions</span>
          </div>
        </div>
        <div className="set-session">
          <div>
            <div className="set-session-name">Τρέχουσα συνεδρία</div>
            <div className="set-session-meta mono">JWT · 8h inactivity timeout</div>
          </div>
          <span className="badge badge-green" style={{ fontSize: 10 }}>ACTIVE</span>
        </div>
      </div>

      <div className="dash-panel ticks">
        <div className="dash-panel-head">
          <div className="dash-panel-head-l">
            <span className="dash-panel-kicker">2FA</span>
            <span className="dash-panel-title">Two-factor authentication</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Δεύτερος παράγοντας πιστοποίησης για επιπλέον ασφάλεια. Διαθέσιμο σύντομα.
        </p>
        <div className="set-actions">
          <button className="btn btn-ghost btn-sm" disabled>
            <Icon name="bolt" size={11}/>Ενεργοποίηση
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
export default function Settings() {
  const { onPlanClick } = useOutletContext();
  const { owner, shops } = useAuth();
  const [tab, setTab] = useState('account');

  return (
    <main className="page-main">
      <PageHeader
        kicker="Ρυθμίσεις"
        title="Λογαριασμός & Διαχείριση"
        sub="Στοιχεία λογαριασμού, πλάνο, καταστήματα και ασφάλεια."
      />

      <div className="set-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`set-tab ${tab === t.key ? 'on' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="set-content">
        {tab === 'account'  && <AccountTab owner={owner}/>}
        {tab === 'plan'     && <PlanTab owner={owner} onPlanClick={onPlanClick}/>}
        {tab === 'shops'    && <ShopsTab shops={shops} owner={owner}/>}
        {tab === 'security' && <SecurityTab owner={owner}/>}
      </div>
    </main>
  );
}
