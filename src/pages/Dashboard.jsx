// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { MENU_BASE_URL, claimShop, scheduleReminder, cancelReminder } from '../services/api';
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

// ── Date helpers ──────────────────────────────────────────────────────────────
const pad2 = (n) => String(n).padStart(2, '0');
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// ── TodoList — Εκκρεμείς + Ολοκληρωμένες tables, με προαιρετικό email reminder ──
function TodoList({ shopId }) {
  const storageKey = `qrmenu_todos_${shopId}`;
  // Load synchronously so the first render already has the saved todos — avoids a
  // mount-time race where the persist effect could overwrite them with an empty array.
  const [todos, setTodos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [text,     setText]     = useState('');
  const [remindOn, setRemindOn] = useState(false);
  const [rDate,    setRDate]    = useState('');
  const [rTime,    setRTime]    = useState('');
  const [hint,     setHint]     = useState('');

  // Persist on every change. (TodoList is keyed by shopId in the parent, so switching
  // shops remounts this component and re-runs the initializer above for the new key.)
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(todos)); } catch {}
  }, [todos, storageKey]);

  const resetForm = () => { setText(''); setRemindOn(false); setRDate(''); setRTime(''); };

  const addTodo = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;

    let remindAt = null;
    if (remindOn) {
      if (!rDate || !rTime) { setHint('Όρισε ημερομηνία και ώρα για την υπενθύμιση.'); return; }
      const dt = new Date(`${rDate}T${rTime}`);
      if (isNaN(dt))        { setHint('Μη έγκυρη ημερομηνία/ώρα.'); return; }
      if (dt.getTime() <= Date.now()) { setHint('Η ώρα υπενθύμισης πρέπει να είναι στο μέλλον.'); return; }
      remindAt = dt.toISOString();
    }

    const todo = {
      id: Date.now(),
      text: t,
      done: false,
      createdAt: new Date().toISOString(),
      remindAt,
      reminderId: null,
    };

    // Best-effort: καταχώρηση του email reminder στο backend
    if (remindAt) {
      try {
        const res = await scheduleReminder({ remindAt, note: t, shopId });
        todo.reminderId = res?.reminderId || res?.id || null;
        setHint('Η υπενθύμιση ορίστηκε — θα σταλεί email στην ώρα που επέλεξες.');
      } catch {
        setHint('Η εργασία αποθηκεύτηκε. (Η αποστολή email θα ενεργοποιηθεί μόλις συνδεθεί ο server reminders.)');
      }
    } else {
      setHint('');
    }

    setTodos(prev => [todo, ...prev]);
    resetForm();
  };

  const toggleTodo = (id) => {
    // Όταν μια εργασία ολοκληρώνεται, ακύρωσε το email reminder της (αν υπάρχει)
    const target = todos.find(td => td.id === id);
    if (target && !target.done && target.reminderId) {
      cancelReminder(target.reminderId).catch(() => {});
    }
    setTodos(prev => prev.map(td =>
      td.id === id
        ? {
            ...td,
            done:        !td.done,
            completedAt: !td.done ? new Date().toISOString() : null,
            reminderId:  !td.done ? null : td.reminderId,
          }
        : td
    ));
  };

  const removeTodo = (td) => {
    if (td.reminderId) cancelReminder(td.reminderId).catch(() => {});
    setTodos(prev => prev.filter(x => x.id !== td.id));
  };

  const pending   = todos.filter(td => !td.done);
  const completed = todos.filter(td => td.done);

  const minDate = new Date().toISOString().slice(0, 10);

  const renderRow = (td, done) => (
    <div key={td.id} className={`${s.tRow} ${done ? s.tRowDone : ''}`}>
      <button
        type="button"
        className={`${s.todoCheck} ${done ? s.todoCheckOn : ''}`}
        onClick={() => toggleTodo(td.id)}
        aria-label={done ? 'Αναίρεση' : 'Ολοκλήρωση'}
      >
        {done && <Icon name="check" size={12}/>}
      </button>
      <div className={s.tNote}>
        <span className={s.tNoteText}>{td.text}</span>
        {!done && td.remindAt && (
          <span className={s.tReminder} title="Έχει οριστεί email υπενθύμισης">
            <Icon name="bell" size={11}/>{fmtDate(td.remindAt)} · {fmtTime(td.remindAt)}
          </span>
        )}
      </div>
      <span className={s.tMeta}>
        {fmtDate(done ? (td.completedAt || td.createdAt) : td.createdAt)}
        <span className={s.tMetaTime}>{fmtTime(done ? (td.completedAt || td.createdAt) : td.createdAt)}</span>
      </span>
      <button
        type="button"
        className={s.todoDel}
        onClick={() => removeTodo(td)}
        aria-label="Διαγραφή"
      >
        <Icon name="trash" size={14}/>
      </button>
    </div>
  );

  const renderTable = (rows, done, emptyText, metaLabel) => (
    rows.length === 0 ? (
      <div className={s.todoEmpty}>{emptyText}</div>
    ) : (
      <div className={s.tTable}>
        <div className={s.tHeadRow}>
          <span/>
          <span>Σημείωση</span>
          <span>{metaLabel}</span>
          <span/>
        </div>
        {rows.map(td => renderRow(td, done))}
      </div>
    )
  );

  return (
    <section className={s.todoCard}>
      <div className={s.todoHead}>
        <div>
          <h2 className={s.todoTitle}>Λίστα Εκκρεμοτήτων</h2>
          <p className={s.todoSub}>Τι έχεις να κάνεις για το κατάστημά σου</p>
        </div>
      </div>

      {/* Add form (+ optional reminder) */}
      <form className={s.todoForm} onSubmit={addTodo}>
        <div className={s.todoAdd}>
          <input
            className={s.todoInput}
            type="text"
            placeholder="Προσθήκη νέας εργασίας…"
            value={text}
            onChange={e => { setText(e.target.value); setHint(''); }}
          />
          <button
            type="button"
            className={`${s.remToggle} ${remindOn ? s.remToggleOn : ''}`}
            onClick={() => { setRemindOn(v => !v); setHint(''); }}
            aria-pressed={remindOn}
          >
            <Icon name="bell" size={13}/>Υπενθύμιση
          </button>
          <button type="submit" className={s.todoAddBtn} disabled={!text.trim()}>
            <Icon name="plus" size={14}/>Προσθήκη
          </button>
        </div>

        {remindOn && (
          <div className={s.remFields}>
            <span className={s.remLabel}>Αποστολή email υπενθύμισης στις:</span>
            <input className={s.remInput} type="date" value={rDate} min={minDate} onChange={e => setRDate(e.target.value)}/>
            <input className={s.remInput} type="time" value={rTime} onChange={e => setRTime(e.target.value)}/>
          </div>
        )}
        {hint && <div className={s.todoHint}>{hint}</div>}
      </form>

      {/* Εκκρεμείς */}
      <div className={s.tBlock}>
        <div className={s.tBlockHead}>
          <span className={s.tBlockTitle}>Εκκρεμείς</span>
          <span className={s.tBlockCount}>{pending.length}</span>
        </div>
        {renderTable(pending, false, 'Δεν υπάρχουν εκκρεμότητες. Πρόσθεσε την πρώτη σου εργασία παραπάνω!', 'Καταχωρήθηκε')}
      </div>

      {/* Ολοκληρωμένες */}
      <div className={s.tBlock}>
        <div className={s.tBlockHead}>
          <span className={s.tBlockTitle}>Ολοκληρωμένες</span>
          <span className={s.tBlockCount}>{completed.length}</span>
        </div>
        {renderTable(completed, true, 'Καμία ολοκληρωμένη εργασία ακόμη.', 'Ολοκληρώθηκε')}
      </div>
    </section>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { owner, shops, currentShopId, setCurrentShopId } = useAuth();
  const [claimOpen, setClaimOpen] = useState(false);

  const shop = shops.find(sh => sh.shop_id === currentShopId) || shops[0];
  if (!shop) return null;

  const isLegacy = !shop?.shop_id?.startsWith('SHOP#');
  const LEGACY_MENU_BASE = 'https://1f6nesbrjk.execute-api.eu-central-1.amazonaws.com/default/';
  const menuUrl  = isLegacy
    ? `${LEGACY_MENU_BASE}?shop=${shop.shop_id}`
    : `${MENU_BASE_URL}/menu/${shop.shopSlug}`;
  const menuUrlShort = isLegacy
    ? `1f6nesbrjk…/default/?shop=${shop.shop_id}`
    : `${MENU_BASE_URL.replace('https://','').split('.')[0]}…/menu/${shop.shopSlug}`;
  const copyUrl = () => navigator.clipboard?.writeText(menuUrl);

  return (
    <main className={s.pageMain}>
      <PageHeader
        title={`${greeting()}, ${owner?.firstName || ''}`}
      />

      <div className={s.dashBody}>
        {/* ── Info cards row ── */}
        <div className={s.cardsRow}>
          {/* Πληροφορίες */}
          <section className={s.infoCard}>
            <div className={s.infoCardLabel}>Πληροφορίες</div>
            <div className={s.infoFields}>
              <div className={s.infoRow}>
                <span className={s.infoKey}>Τρέχον Κατάστημα :</span>
                {shops.length > 1 ? (
                  <select
                    className={s.infoSelect}
                    value={currentShopId}
                    onChange={e => setCurrentShopId(e.target.value)}
                  >
                    {shops.map(sh => (
                      <option key={sh.shop_id} value={sh.shop_id}>
                        {sh.shopName}{!sh.shop_id?.startsWith('SHOP#') ? ' (Legacy)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={s.infoVal}>{shop.shopName}{isLegacy && ' (Legacy)'}</span>
                )}
              </div>
              <div className={s.infoRow}>
                <span className={s.infoKey}>Μενού URL :</span>
                <button className={s.urlLink} onClick={() => window.open(menuUrl, '_blank')} title={menuUrl}>
                  {menuUrlShort}
                </button>
                <button className={s.urlIcon} onClick={copyUrl} title="Αντιγραφή" aria-label="Αντιγραφή">
                  <Icon name="copy" size={13}/>
                </button>
              </div>
            </div>
            <button className={s.pillBtn} onClick={() => setClaimOpen(true)}>
              Σύνδεση Καταστήματος
            </button>
          </section>

          {/* Παραγγελίες */}
          <section className={s.infoCard}>
            <div className={s.infoCardLabel}>Παραγγελίες</div>
            <div className={s.infoFields}>
              <div className={s.infoRow}>
                <span className={s.infoKey}>Συνολικές Παραγγελίες :</span>
                <span className={s.infoVal}>—</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoKey}>Παραγγελίες Σήμερα :</span>
                <span className={s.infoVal}>—</span>
              </div>
            </div>
          </section>

          {/* Οικονομικά */}
          <section className={s.infoCard}>
            <div className={s.infoCardLabel}>Οικονομικά</div>
            <div className={s.infoFields}>
              <div className={s.infoRow}>
                <span className={s.infoKey}>Έσοδα (Σύνολο Μήνας):</span>
                <span className={s.infoVal}>—</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoKey}>Έξοδα (Σύνολο Μήνας):</span>
                <span className={s.infoVal}>—</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoKey}>Έσοδα (Σύνολο Μέρα):</span>
                <span className={s.infoVal}>—</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoKey}>Έξοδα (Σύνολο Μέρα):</span>
                <span className={s.infoVal}>—</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── To-do list (replaces the Figma table) ── */}
        <TodoList key={shop.shop_id} shopId={shop.shop_id}/>
      </div>

      {claimOpen && <ClaimShopModal onClose={() => setClaimOpen(false)}/>}
    </main>
  );
}
