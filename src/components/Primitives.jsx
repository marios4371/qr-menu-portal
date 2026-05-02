// src/components/Primitives.jsx
// Shared UI primitives: Icon, Sidebar, PageHeader


import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ── Icon ─────────────────────────────────────────────────────────────────────
export function Icon({ name, size = 14, stroke = 1.6 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "qr":      return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h2"/></svg>;
    case "home":    return <svg {...p}><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>;
    case "edit":    return <svg {...p}><path d="M12 20h9M16.5 3.5a2 2 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
    case "palette": return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="7.5" cy="10" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16.5" cy="10" r="1"/><path d="M12 21a3 3 0 0 1 0-6c1.5 0 2 1 3 1 2 0 3-1 3-3"/></svg>;
    case "logout":  return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case "arrow":   return <svg {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "back":    return <svg {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case "plus":    return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case "x":       return <svg {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case "check":   return <svg {...p}><path d="M20 6L9 17l-5-5"/></svg>;
    case "copy":    return <svg {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
    case "ext":     return <svg {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>;
    case "eye":     return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "eye-off": return <svg {...p}><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2 3M14.1 14.1a3 3 0 1 1-4.2-4.2"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
    case "search":  return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "chev-r":  return <svg {...p}><path d="M9 18l6-6-6-6"/></svg>;
    case "chev-d":  return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>;
    case "trash":   return <svg {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    case "save":    return <svg {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>;
    case "kitchen": return <svg {...p}><path d="M6 2v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2M8 10v12M14 2c-2 0-3 2-3 4s1 4 3 4v12"/></svg>;
    case "bar":     return <svg {...p}><path d="M8 22h8M12 15v7M3 3h18l-7 9H10L3 3z"/></svg>;
    case "shop":    return <svg {...p}><path d="M3 9l1-5h16l1 5M3 9v11h18V9M3 9h18"/></svg>;
    case "bolt":    return <svg {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>;
    case "menu":    return <svg {...p}><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
    case "grid":    return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    case "list":    return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case "stat":    return <svg {...p}><path d="M3 3v18h18M7 14l3-3 4 4 5-6"/></svg>;
    case "lock":    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case "type":    return <svg {...p}><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>;
    case "color":   return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg>;
    case "spark":   return <svg {...p}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
    case "cmd":     return <svg {...p}><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>;
    case "settings":return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case "package": return <svg {...p}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>;
    default:        return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

// Path → page key
const PATH_MAP = {
  '/':                'landing',
  '/login':           'login',
  '/register':        'register',
  '/dashboard':       'dashboard',
  '/menu-editor':     'editor',
  '/menu-appearance': 'appearance',
  '/analytics':       'analytics',
  '/inventory':       'inventory',
  '/settings':        'settings',
};
const JUMP_PATHS = {
  dashboard:  '/dashboard',
  editor:     '/menu-editor',
  appearance: '/menu-appearance',
  analytics:  '/analytics',
  inventory:  '/inventory',
  settings:   '/settings',
};

// ── AppBar — kept for compatibility, hidden via CSS ───────────────────────────
export function AppBar() {
  return null;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({ onPlanClick, onLogout, onCmdOpen }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { owner } = useAuth();

  const page = PATH_MAP[location.pathname] || 'dashboard';
  const isExclusive = owner?.plan === 'EXCLUSIVE';
  const items = [
    { key: 'dashboard',  label: 'Dashboard',         icon: 'home' },
    { key: 'editor',     label: 'Menu Editor',       icon: 'edit' },
    { key: 'appearance', label: 'Εμφάνιση',          icon: 'palette', premium: true },
    { key: 'analytics',  label: 'Analytics',         icon: 'stat',    premium: true },
    { key: 'inventory',  label: 'Απόθεμα',           icon: 'package', exclusive: true },
    { key: 'settings',   label: 'Ρυθμίσεις',         icon: 'settings' },
  ];

  return (
    <aside className="sb">
      {/* Brand */}
      <div className="sb-head">
        <span className="brand"><span className="dot"/>QRMenu</span>
      </div>

{/* Nav */}
      <div className="sb-section">
        <div className="sb-section-label">Navigation</div>
        <nav className="sb-nav">
          {items.map(it => {
            const lockedByPremium   = it.premium   && owner?.plan === 'STANDARD';
            const lockedByExclusive = it.exclusive && !isExclusive;
            const locked = lockedByPremium || lockedByExclusive;
            return (
              <button
                key={it.key}
                onClick={() => !locked && navigate(JUMP_PATHS[it.key])}
                className={`sb-item ${page === it.key ? 'on' : ''} ${locked ? 'locked' : ''}`}
                disabled={locked}
              >
                <Icon name={it.icon} size={13}/>
                <span>{it.label}</span>
                {locked && <Icon name="lock" size={11}/>}
                {page === it.key && <span className="sb-tick"/>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sb-grow"/>

      {/* Footer */}
      <div className="sb-section sb-foot">
        <button className="sb-plan" onClick={onPlanClick}>
          <div className="sb-plan-row">
            <span style={{ fontSize: '10px', color: 'var(--sb-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Πλάνο</span>
            <span style={{ fontSize: '10px', color: 'var(--sb-active-text)' }}>↑ Αναβάθμιση</span>
          </div>
          <div className="sb-plan-name">{owner?.plan || 'STANDARD'}</div>
        </button>

        <div className="sb-owner">
          <div className="sb-avatar">{owner?.firstName?.[0]}{owner?.lastName?.[0]}</div>
          <div className="sb-owner-text">
            <div className="sb-owner-name">{owner?.firstName} {owner?.lastName}</div>
            <div className="sb-owner-mail">{owner?.email}</div>
          </div>
        </div>

        <button className="btn btn-ghost btn-sm sb-logout" onClick={onLogout}>
          <Icon name="logout" size={12}/>Αποσύνδεση
        </button>
      </div>
    </aside>
  );
}

// ── PageHeader ───────────────────────────────────────────────────────────────────────────
export function PageHeader({ kicker, title, sub, right }) {
  return (
    <header className="ph">
      <div className="ph-left">
        {kicker && <span className="ph-kicker">{kicker}</span>}
        <h1 className="ph-title">{title}</h1>
        {sub && <p className="ph-sub">{sub}</p>}
      </div>
      {right && <div className="ph-right">{right}</div>}
    </header>
  );
}
