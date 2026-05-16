// src/pages/Login.jsx — Figma frame 02
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ownerLogin } from '../services/api';
import s from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) { setErr('Συμπληρώστε όλα τα πεδία'); return; }
    setBusy(true);
    try {
      const { token, owner, shops } = await ownerLogin({ email, password });
      login(token, owner, shops || []);
    } catch (error) {
      setErr(error.message || 'Λάθος email ή κωδικός');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.page}>
      <button className={s.back} onClick={() => navigate('/')}>← Πίσω</button>

      <form className={s.card} onSubmit={submit} noValidate>
        <p className={s.brand}>Resto Solutions</p>

        <div className={s.titleBlock}>
          <h1 className={s.title}>Καλώς ήρθατε</h1>
          <p className={s.sub}>Συνδεθείτε στον λογαριασμό σας</p>
        </div>

        <div className={s.form}>
          <div className={s.field}>
            <label className={s.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={s.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              autoComplete="email"
            />
          </div>

          <div className={s.field}>
            <label className={s.label} htmlFor="password">Κωδικός πρόσβασης</label>
            <input
              id="password"
              className={s.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {err && <div className={s.error}>{err}</div>}

          <button type="submit" className={s.btnPrimary} disabled={busy}>
            {busy ? <><span className={s.spinner}/>Σύνδεση…</> : 'Σύνδεση'}
          </button>
        </div>

        <hr className={s.divider}/>

        <div className={s.foot}>
          <button type="button" className={s.footLink} onClick={() => navigate('/register')}>
            Δεν έχετε λογαριασμό;
          </button>
          <button type="button" className={s.btnSecondary} onClick={() => navigate('/register')}>
            Εγγραφή →
          </button>
        </div>

        <button type="button" className={s.forgot}>Ξεχάσατε τον κωδικό σας;</button>
      </form>
    </div>
  );
}
