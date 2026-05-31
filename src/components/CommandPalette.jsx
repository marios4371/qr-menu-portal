// src/components/CommandPalette.jsx
// Ctrl+K global command palette
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Primitives';

const COMMANDS = [
  { id: 'dashboard',   label: 'Αρχική',             icon: 'home',    path: '/dashboard',       section: 'Πλοήγηση', hint: '↵' },
  { id: 'editor',      label: 'Επεξεργασία Μενού',  icon: 'edit',    path: '/menu-editor',     section: 'Πλοήγηση', hint: '↵' },
  { id: 'appearance',  label: 'Εμφάνιση Μενού',     icon: 'palette', path: '/menu-appearance', section: 'Πλοήγηση', hint: '↵' },
  { id: 'analytics',   label: 'Analytics',          icon: 'stat',    path: '/analytics',       section: 'Πλοήγηση', hint: '↵' },
  { id: 'inventory',   label: 'Απόθεμα',            icon: 'package', path: '/inventory',       section: 'Πλοήγηση', hint: '↵' },
  { id: 'settings',    label: 'Ρυθμίσεις',          icon: 'settings', path: '/settings',       section: 'Πλοήγηση', hint: '↵' },
  { id: 'qr',          label: 'Άνοιγμα QR Menu',    icon: 'ext',     action: 'openMenu',        section: 'Ενέργειες', hint: '↵' },
  { id: 'copy',        label: 'Αντιγραφή Menu URL',  icon: 'copy',    action: 'copyUrl',         section: 'Ενέργειες', hint: '↵' },
];

export default function CommandPalette({ onClose, menuUrl }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim()
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.id.includes(query.toLowerCase()))
    : COMMANDS;

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Reset active index when filtered changes
  useEffect(() => { setActive(0); }, [query]);

  const execute = useCallback((cmd) => {
    if (cmd.path) {
      navigate(cmd.path);
    } else if (cmd.action === 'openMenu' && menuUrl) {
      window.open(menuUrl, '_blank');
    } else if (cmd.action === 'copyUrl' && menuUrl) {
      navigator.clipboard?.writeText(menuUrl);
    }
    onClose();
  }, [navigate, menuUrl, onClose]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) execute(filtered[active]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('.cmd-item.active');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  // Group by section
  const sections = [];
  let lastSection = null;
  filtered.forEach((cmd, i) => {
    if (cmd.section !== lastSection) {
      sections.push({ type: 'label', text: cmd.section });
      lastSection = cmd.section;
    }
    sections.push({ type: 'item', cmd, index: i });
  });

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={e => e.stopPropagation()} onKeyDown={handleKey}>
        <div className="cmd-input-wrap">
          <span className="cmd-icon"><Icon name="search" size={16}/></span>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Πληκτρολόγησε εντολή…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="cmd-esc">ESC</span>
        </div>

        <div className="cmd-list" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="cmd-empty">// Δεν βρέθηκαν αποτελέσματα</div>
          ) : (
            sections.map((s, i) =>
              s.type === 'label' ? (
                <div key={`lbl-${i}`} className="cmd-section-label">{s.text}</div>
              ) : (
                <div
                  key={s.cmd.id}
                  className={`cmd-item ${s.index === active ? 'active' : ''}`}
                  onClick={() => execute(s.cmd)}
                  onMouseEnter={() => setActive(s.index)}
                >
                  <span className="cmd-item-icon"><Icon name={s.cmd.icon} size={15}/></span>
                  <span className="cmd-item-label">{s.cmd.label}</span>
                  <span className="cmd-item-hint">{s.cmd.hint}</span>
                </div>
              )
            )
          )}
        </div>

        <div className="cmd-footer">
          <span className="cmd-hint-item"><span className="cmd-key">↑↓</span> πλοήγηση</span>
          <span className="cmd-hint-item"><span className="cmd-key">↵</span> επιλογή</span>
          <span className="cmd-hint-item"><span className="cmd-key">ESC</span> κλείσιμο</span>
        </div>
      </div>
    </div>
  );
}
