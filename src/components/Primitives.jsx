// src/components/Primitives.jsx
// Shared UI primitives: Icon, AppBar, Sidebar, PageHeader

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ── Icon ─────────────────────────────────────────────────────────────────────
export function Icon({ name, size = 14, stroke = 1.6 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "qr":      return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h2"/></svg>;
    case "home":    return <svg {...props}><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>;
    case "edit":    return <svg {...props}><path d="M12 20h9M16.5 3.5a2 2 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
    case "palette": return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="7.5" cy="10" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16.5" cy="10" r="1"/><path d="M12 21a3 3 0 0 1 0-6c1.5 0 2 1 3 1 2 0 3-1 3-3"/></svg>;
    case "logout":  return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case "arrow":   return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "back":    return <svg {...props}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case "plus":    return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "x":       return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case "check":   return <svg {...props}><path d="M20 6L9 17l-5-5"/></svg>;
    case "copy":    return <svg {...props}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
    case "ext":     return <svg {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>;
    case "eye":     return <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "eye-off": return <svg {...props}><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2 3M14.1 14.1a3 3 0 1 1-4.2-4.2"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
    case "search":  return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "chev-r":  return <svg {...props}><path d="M9 18l6-6-6-6"/></svg>;
    case "chev-d":  return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case "trash":   return <svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    case "save":    return <svg {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>;
    case "kitchen": return <svg {...props}><path d="M6 2v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2M8 10v12M14 2c-2 0-3 2-3 4s1 4 3 4v12"/></svg>;
    case "bar":     return <svg {...props}><path d="M8 22h8M12 15v7M3 3h18l-7 9H10L3 3z"/></svg>;
    case "shop":    return <svg {...props}><path d="M3 9l1-5h16l1 5M3 9v11h18V9M3 9h18"/></svg>;
    case "bolt":    return <svg {...props}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>;
    case "menu":    return <svg {...props}><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
    case "grid":    return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    case "list":    return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case "stat":    return <svg {...props}><path d="M3 3v18h18M7 14l3-3 4 4 5-6"/></svg>;
    case "lock":    return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case "type":    return <svg {...props}><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>;
    case "color":   return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg>;
    case "spark":   return <svg {...props}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
    default:        return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

// path → page key mapping
const PATH_MAP = {
  '/':                'landing',
  '/login':           'login',
  '/register':        'register',
  '/dashboard':       'dashboard',
  '/menu-editor':     'editor',
  '/menu-appearance': 'appearance',
};
const PAGE_LABELS = {
  landing: 'LANDING', login: 'LOGIN', register: 'REGISTER',
  dashboard: 'DASHBOARD', editor: 'MENU EDITOR', appearance: 'APPEARANCE',
};
const JUMP_PATHS = {
  dashboard: '/dashboard', editor: '/menu-editor', appearance: '/menu-appearance',
};

// ── AppBar — rendered only inside authenticated layout ────────────────────────
export function AppBar() {
  const location = useLocation();
  const { owner } = useAuth();

  const page = PATH_MAP[location.pathname] || 'dashboard';

  return (
    <div className="appbar">
      <span className="brand"><span className="dot"/>QRMenu</span>
      <span className="crumb-sep">/</span>
      <span className="crumb">{PAGE_LABELS[page] || page.toUpperCase()}</span>
      <span className="ver">v1.4</span>
      <div className="spacer"/>
      <span className="meta">
        {owner ? `${owner.firstName.toLowerCase()}@${owner.plan.toLowerCase()}` : 'guest'}
      </span>
      <span className="meta">·</span>
      <span className="meta">eu-central-1</span>
      <span className="meta">·</span>
      <span className="meta" style={{ color: 'var(--success, #4caf50)' }}>● live</span>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({ onPlanClick, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { owner } = useAuth();

  const page = PATH_MAP[location.pathname] || 'dashboard';
  const PLAN_ORDER = ['STANDARD', 'PREMIUM', 'EXCLUSIVE'];

  const items = [
    { key: 'dashboard',  label: 'Αρχική',            icon: 'home' },
    { key: 'editor',     label: 'Επεξεργασία Μενού', icon: 'edit' },
    { key: 'appearance', label: 'Εμφάνιση Μενού',    icon: 'palette', premium: true },
  ];

  return (
    <aside className="sb">
      <div className="sb-head">
        <span className="brand"><span className="dot"/>QRMenu</span>
        <span className="kicker" style={{ fontSize: '0.6rem' }}>ADMIN</span>
      </div>

      <div className="sb-section">
        <div className="kicker" style={{ padding: '0 12px 8px', fontSize: '0.62rem' }}>NAVIGATION</div>
        <nav className="sb-nav">
          {items.map(it => {
            const locked = it.premium && owner?.plan === 'STANDARD';
            return (
              <button
                key={it.key}
                onClick={() => !locked && navigate(JUMP_PATHS[it.key])}
                className={`sb-item ${page === it.key ? 'on' : ''} ${locked ? 'locked' : ''}`}
                disabled={locked}
              >
                <Icon name={it.icon} size={14}/>
                <span>{it.label}</span>
                {locked && <Icon name="lock" size={11}/>}
                {page === it.key && <span className="sb-tick"/>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sb-grow"/>

      <div className="sb-section sb-foot">
        <button className="sb-plan ticks" onClick={onPlanClick}>
          <div className="sb-plan-row">
            <span className="kicker" style={{ fontSize: '0.6rem' }}>CURRENT PLAN</span>
            <span className="kicker" style={{ fontSize: '0.6rem', color: 'var(--text-sub)' }}>↑ UPGRADE</span>
          </div>
          <div className="sb-plan-name">{owner?.plan || 'STANDARD'}</div>
          <div className="sb-plan-bar">
            {PLAN_ORDER.map(p => (
              <span key={p} className={`sb-plan-seg ${PLAN_ORDER.indexOf(owner?.plan) >= PLAN_ORDER.indexOf(p) ? 'on' : ''}`}/>
            ))}
          </div>
        </button>

        <div className="sb-owner">
          <div className="sb-avatar">{owner?.firstName?.[0]}{owner?.lastName?.[0]}</div>
          <div className="sb-owner-text">
            <div className="sb-owner-name">{owner?.firstName} {owner?.lastName}</div>
            <div className="sb-owner-mail">{owner?.email}</div>
          </div>
        </div>

        <button className="btn btn-ghost btn-sm sb-logout" onClick={onLogout}>
          <Icon name="logout" size={13}/>Αποσύνδεση
        </button>
      </div>
    </aside>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ kicker, title, sub, right }) {
  return (
    <header className="ph">
      <div className="ph-left">
        <div className="hr-tick" style={{ justifyContent: 'flex-start', marginBottom: 14 }}>
          <span style={{ flex: 'none' }}>{kicker}</span>
        </div>
        <h1 className="ph-title">{title}</h1>
        {sub && <p className="ph-sub">{sub}</p>}
      </div>
      {right && <div className="ph-right">{right}</div>}
    </header>
  );
}
