// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Primitives';
import { useAuth } from '../hooks/useAuth';
import { ownerLogin } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) { setErr('Συμπληρώστε όλα τα πεδία'); return; }
    setBusy(true);
    try {
      const { token, owner, shops } = await ownerLogin({ email, password });
      login(token, owner, shops || []);
      navigate('/dashboard');
    } catch (error) {
      setErr(error.message || 'Λάθος email ή κωδικός');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      {/* Brand — fixed top-left */}
      <button className="auth-brand" onClick={() => navigate('/')}>
        <span className="dot"/>QRMenu
      </button>

      <div className="auth-card">
        <h1 className="auth-title">Καλώς ήρθατε πίσω</h1>
        <p className="auth-sub">Συνδεθείτε στο λογαριασμό σας</p>

        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:14}}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                   placeholder="you@business.com" autoComplete="email"/>
          </div>
          <div className="form-group">
            <label htmlFor="pw">Password</label>
            <div className="password-wrap">
              <input id="pw" type={showPw ? 'text' : 'password'} value={password}
                     onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                     autoComplete="current-password"/>
              <button type="button" className="password-eye" onClick={() => setShowPw(s => !s)}>
                <Icon name={showPw ? 'eye-off' : 'eye'} size={14}/>
              </button>
            </div>
            <button type="button" className="auth-forgot">Ξεχάσατε τον κωδικό;</button>
          </div>

          {err && <div className="msg-error">{err}</div>}

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={busy}
                  style={{marginTop: 4}}>
            {busy ? <><span className="spinner"/>Σύνδεση…</> : 'Σύνδεση'}
          </button>
        </form>

        <hr className="auth-divider"/>
        <div className="auth-foot">
          Νέος χρήστης; <button onClick={() => navigate('/register')}>Εγγραφή →</button>
        </div>
      </div>
    </div>
  );
}
