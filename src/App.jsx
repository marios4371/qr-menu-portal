// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppBar, Sidebar, Icon } from './components/Primitives';
import { TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakColor, useTweaks } from './components/TweaksPanel';
import { PLANS } from './constants';
import { upgradePlan } from './services/api';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import MenuEditor     from './pages/MenuEditor';
import MenuAppearance from './pages/MenuAppearance';

const TWEAK_DEFAULTS = {
  showGrid:   true,
  showTicks:  true,
  showAppBar: true,
  density:    'normal',
  accent:     '#1A1610',
};

// Guards
function ProtectedRoute({ children }) {
  const { owner, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 32, height: 32 }}/>
    </div>
  );
  return owner ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { owner, loading } = useAuth();
  if (loading) return null;
  return owner ? <Navigate to="/dashboard" replace /> : children;
}

// Plan upgrade modal
function PlanModal({ onClose }) {
  const { owner, setOwner } = useAuth();
  const [selected, setSelected] = useState(owner?.plan || 'PREMIUM');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const order = ['STANDARD', 'PREMIUM', 'EXCLUSIVE'];
  const cIdx = order.indexOf(owner?.plan);

  const confirm = async () => {
    if (selected === owner?.plan) return;
    setBusy(true);
    setErr('');
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
          <span className="modal-title">Επιλογή πλάνου</span>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="plan-choice-grid">
            {PLANS.map((p) => {
              const idx = order.indexOf(p.value);
              const isCurrent = p.value === owner?.plan;
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
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 14, letterSpacing: '0.04em' }}>
            // Δεν ειναι δυνατη η υποβαθμιση πλανου απο εδω. Επικοινωνηστε με support.
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Ακυρωση</button>
          <button
            className="btn btn-primary"
            onClick={confirm}
            disabled={selected === owner?.plan || busy}
          >
            {busy ? <><span className="spinner"/>Επεξεργασια…</> : selected === owner?.plan ? 'Τρεχον πλανο' : 'Αναβαθμιση'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Authenticated layout: appbar + sidebar + outlet
// AppBar lives here so it only renders on authenticated pages
function AuthLayout({ showAppBar }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {showAppBar && <AppBar/>}
      <div className="layout">
        <Sidebar onPlanClick={() => setPlanModalOpen(true)} onLogout={handleLogout}/>
        <Outlet context={{ onPlanClick: () => setPlanModalOpen(true) }}/>
      </div>
      {planModalOpen && <PlanModal onClose={() => setPlanModalOpen(false)}/>}
    </>
  );
}

// App content (inside AuthProvider)
function AppContent() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.body.dataset.grid  = tweaks.showGrid  ? 'on' : 'off';
    document.body.dataset.ticks = tweaks.showTicks ? 'on' : 'off';
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    document.documentElement.style.setProperty('--text',   tweaks.accent);
    const dMap = { compact: 0.85, normal: 1, relaxed: 1.15 };
    document.documentElement.style.setProperty('--density', dMap[tweaks.density] || 1);
  }, [tweaks]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>}/>

        <Route path="/login" element={
          <PublicRoute><Login/></PublicRoute>
        }/>
        <Route path="/register" element={
          <PublicRoute><Register/></PublicRoute>
        }/>

        <Route element={
          <ProtectedRoute>
            <AuthLayout showAppBar={tweaks.showAppBar}/>
          </ProtectedRoute>
        }>
          <Route path="/dashboard"       element={<Dashboard/>}/>
          <Route path="/menu-editor"     element={<MenuEditor/>}/>
          <Route path="/menu-appearance" element={<MenuAppearance/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>

      <TweaksPanel title="UI Tweaks">
        <TweakSection label="Display">
          <TweakToggle label="Background grid"  value={tweaks.showGrid}   onChange={v => setTweak('showGrid', v)}/>
          <TweakToggle label="Corner ticks"     value={tweaks.showTicks}  onChange={v => setTweak('showTicks', v)}/>
          <TweakToggle label="Top status bar"   value={tweaks.showAppBar} onChange={v => setTweak('showAppBar', v)}/>
        </TweakSection>
        <TweakSection label="Density">
          <TweakRadio
            value={tweaks.density}
            onChange={v => setTweak('density', v)}
            options={[
              { value: 'compact',  label: 'Compact'  },
              { value: 'normal',   label: 'Normal'   },
              { value: 'relaxed',  label: 'Relaxed'  },
            ]}
          />
        </TweakSection>
        <TweakSection label="Accent color">
          <TweakColor value={tweaks.accent} onChange={v => setTweak('accent', v)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// Root
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.PROD ? '/admin' : '/'}>
      <AuthProvider>
        <AppContent/>
      </AuthProvider>
    </BrowserRouter>
  );
}
