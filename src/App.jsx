// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Sidebar, Icon } from './components/Primitives';
import CommandPalette from './components/CommandPalette';
import { TweaksPanel, TweakSection, TweakToggle, TweakRadio } from './components/TweaksPanel';
import { PLANS } from './constants';
import { upgradePlan } from './services/api';
import { MENU_BASE_URL } from './services/api';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import MenuEditor     from './pages/MenuEditor';
import MenuAppearance from './pages/MenuAppearance';
import Analytics      from './pages/Analytics';

const TWEAK_DEFAULTS = {
  showGrid:  true,
  showTicks: true,
  density:   'normal',
};

// ── Guards ────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { owner, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}/>
    </div>
  );
  return owner ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { owner, loading } = useAuth();
  if (loading) return null;
  return owner ? <Navigate to="/dashboard" replace /> : children;
}

// ── Plan upgrade modal ────────────────────────────────────────────────────────
function PlanModal({ onClose }) {
  const { owner, setOwner } = useAuth();
  const [selected, setSelected] = useState(owner?.plan || 'PREMIUM');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const order = ['STANDARD', 'PREMIUM', 'EXCLUSIVE'];
  const cIdx  = order.indexOf(owner?.plan);

  const confirm = async () => {
    if (selected === owner?.plan) return;
    setBusy(true); setErr('');
    try {
      await upgradePlan(selected);
      setOwner(o => ({ ...o, plan: selected }));
      onClose();
    } catch (e) {
      setErr(e.message || 'Σφάλμα αναβάθμισης');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ticks" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">// Επιλογή πλάνου</span>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="plan-choice-grid">
            {PLANS.map((p) => {
              const idx = order.indexOf(p.value);
              const isCurrent  = p.value === owner?.plan;
              const isDowngrade = idx < cIdx;
              return (
                <button
                  key={p.value}
                  className={`plan-choice ${selected === p.value ? 'current' : ''}`}
                  onClick={() => !isDowngrade && setSelected(p.value)}
                  disabled={isDowngrade}
                >
                  {isCurrent && <span className="plan-choice-badge">CURRENT</span>}
                  <div className="plan-choice-name">{p.name}</div>
                  <div className="plan-choice-price">{p.price} {p.period}</div>
                  <div className="plan-choice-desc">{p.features[0]}</div>
                </button>
              );
            })}
          </div>
          {err && <div className="msg-error" style={{ marginTop: 12 }}>{err}</div>}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 14, letterSpacing: '0.04em', lineHeight: 1.6 }}>
            // Δεν είναι δυνατή η υποβάθμιση. Επικοινωνήστε με support.
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Ακύρωση</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={confirm}
            disabled={selected === owner?.plan || busy}
          >
            {busy ? <><span className="spinner"/>Επεξεργασία…</> : selected === owner?.plan ? 'Τρέχον πλάνο' : 'Αναβάθμιση'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Authenticated layout ──────────────────────────────────────────────────────
// Sidebar is static; only .page-main scrolls.
// No AppBar — removed as per design spec.
function AuthLayout() {
  const { logout, shops, currentShopId } = useAuth();
  const navigate = useNavigate();
  const [planModalOpen, setPlanModalOpen]   = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  // Mark body so CSS can lock the scroll at shell level
  useEffect(() => {
    document.body.dataset.layout = 'app';
    return () => { delete document.body.dataset.layout; };
  }, []);

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(v => !v);
      }
      if (e.key === 'Escape') setCmdPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  // Build menu URL for command palette
  const shop = shops.find(s => s.shop_id === currentShopId) || shops[0];
  const menuUrl = shop ? `${MENU_BASE_URL}/menu/${shop.shopSlug}` : null;

  return (
    <>
      <div className="layout">
        <Sidebar
          onPlanClick={() => setPlanModalOpen(true)}
          onLogout={handleLogout}
          onCmdOpen={() => setCmdPaletteOpen(true)}
        />
        <Outlet context={{ onPlanClick: () => setPlanModalOpen(true) }}/>
      </div>

      {planModalOpen  && <PlanModal onClose={() => setPlanModalOpen(false)}/>}
      {cmdPaletteOpen && <CommandPalette menuUrl={menuUrl} onClose={() => setCmdPaletteOpen(false)}/>}
    </>
  );
}

// ── App content ───────────────────────────────────────────────────────────────
function AppContent() {
  const [tweaks, setTweak] = useState(TWEAK_DEFAULTS);

  // Load tweaks from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('qrmenu_tweaks') || '{}');
      setTweak(t => ({ ...t, ...saved }));
    } catch {}
  }, []);

  const updateTweak = (key, val) => {
    setTweak(t => {
      const next = { ...t, [key]: val };
      try { localStorage.setItem('qrmenu_tweaks', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    document.body.dataset.grid  = tweaks.showGrid  ? 'on' : 'off';
    document.body.dataset.ticks = tweaks.showTicks ? 'on' : 'off';
    const dMap = { compact: 0.85, normal: 1, relaxed: 1.15 };
    document.documentElement.style.setProperty('--density', dMap[tweaks.density] || 1);
  }, [tweaks]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/login" element={<PublicRoute><Login/></PublicRoute>}/>
        <Route path="/register" element={<PublicRoute><Register/></PublicRoute>}/>

        <Route element={<ProtectedRoute><AuthLayout/></ProtectedRoute>}>
          <Route path="/dashboard"       element={<Dashboard/>}/>
          <Route path="/menu-editor"     element={<MenuEditor/>}/>
          <Route path="/menu-appearance" element={<MenuAppearance/>}/>
          <Route path="/analytics"       element={<Analytics/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>

      <TweaksPanel title="UI Tweaks">
        <TweakSection label="Display">
          <TweakToggle label="Background grid"  value={tweaks.showGrid}   onChange={v => updateTweak('showGrid', v)}/>
          <TweakToggle label="Corner ticks"     value={tweaks.showTicks}  onChange={v => updateTweak('showTicks', v)}/>
        </TweakSection>
        <TweakSection label="Density">
          <TweakRadio
            value={tweaks.density}
            onChange={v => updateTweak('density', v)}
            options={[
              { value: 'compact',  label: 'Compact'  },
              { value: 'normal',   label: 'Normal'   },
              { value: 'relaxed',  label: 'Relaxed'  },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.PROD ? '/admin' : '/'}>
      <AuthProvider>
        <AppContent/>
      </AuthProvider>
    </BrowserRouter>
  );
}
