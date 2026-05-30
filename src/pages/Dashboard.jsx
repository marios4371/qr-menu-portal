// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { MENU_BASE_URL, claimShop } from '../services/api';
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

// ── TodoList — owner's "what to do" list (replaces the Figma table) ────────────
function TodoList({ shopId }) {
  const storageKey = `qrmenu_todos_${shopId}`;
  const [todos, setTodos] = useState([]);
  const [text,  setText]  = useState('');

  // Load this shop's todos whenever the active shop changes
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setTodos(Array.isArray(saved) ? saved : []);
    } catch {
      setTodos([]);
    }
  }, [storageKey]);

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(todos)); } catch {}
  }, [todos, storageKey]);

  const addTodo = (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    setTodos(prev => [...prev, { id: Date.now(), text: t, done: false }]);
    setText('');
  };
  const toggleTodo = (id) => setTodos(prev => prev.map(td => td.id === id ? { ...td, done: !td.done } : td));
  const removeTodo = (id) => setTodos(prev => prev.filter(td => td.id !== id));

  const doneCount = todos.filter(td => td.done).length;

  return (
    <section className={s.todoCard}>
      <div className={s.todoHead}>
        <div>
          <h2 className={s.todoTitle}>Λίστα Εκκρεμοτήτων</h2>
          <p className={s.todoSub}>Τι έχεις να κάνεις για το κατάστημά σου</p>
        </div>
        {todos.length > 0 && (
          <span className={s.todoCount}>{doneCount}/{todos.length} ολοκληρώθηκαν</span>
        )}
      </div>

      <form className={s.todoAdd} onSubmit={addTodo}>
        <input
          className={s.todoInput}
          type="text"
          placeholder="Προσθήκη νέας εργασίας…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className={s.todoAddBtn} disabled={!text.trim()}>
          <Icon name="plus" size={14}/>Προσθήκη
        </button>
      </form>

      <div className={s.todoList}>
        {todos.length === 0 ? (
          <div className={s.todoEmpty}>
            Δεν υπάρχουν εκκρεμότητες. Πρόσθεσε την πρώτη σου εργασία παραπάνω!
          </div>
        ) : (
          todos.map(td => (
            <div key={td.id} className={`${s.todoRow} ${td.done ? s.todoRowDone : ''}`}>
              <button
                type="button"
                className={`${s.todoCheck} ${td.done ? s.todoCheckOn : ''}`}
                onClick={() => toggleTodo(td.id)}
                aria-label={td.done ? 'Αναίρεση' : 'Ολοκλήρωση'}
              >
                {td.done && <Icon name="check" size={12}/>}
              </button>
              <span className={s.todoText}>{td.text}</span>
              <button
                type="button"
                className={s.todoDel}
                onClick={() => removeTodo(td.id)}
                aria-label="Διαγραφή"
              >
                <Icon name="trash" size={14}/>
              </button>
            </div>
          ))
        )}
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
        topbarLabel="Dashboard"
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
        <TodoList shopId={shop.shop_id}/>
      </div>

      {claimOpen && <ClaimShopModal onClose={() => setClaimOpen(false)}/>}
    </main>
  );
}
