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
      <button className="auth-back" onClick={() => navigate('/')}><Icon name="back" size={12}/>Πίσω</button>
      <div className="auth-card ticks">
        <div className="auth-logo"><span className="dot"/>QRMenu</div>
        <h1 className="auth-title">Καλώς ήρθατε πίσω.</h1>
        <p className="auth-sub">Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε.</p>

        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:14}}>
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                   placeholder="you@business.com" autoComplete="email"/>
          </div>
          <div className="form-group">
            <label htmlFor="pw">ΚΩΔΙΚΟΣ</label>
            <div className="password-wrap">
              <input id="pw" type={showPw ? 'text' : 'password'} value={password}
                     onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                     autoComplete="current-password"/>
              <button type="button" className="password-eye" onClick={() => setShowPw(s => !s)}>
                <Icon name={showPw ? 'eye-off' : 'eye'} size={14}/>
              </button>
            </div>
          </div>

          {err && <div className="msg-error">{err}</div>}

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={busy}>
            {busy ? <><span className="spinner"/>Σύνδεση…</> : <>Σύνδεση<Icon name="arrow" size={12}/></>}
          </button>
        </form>

        <div className="auth-foot">
          Δεν έχετε λογαριασμό; <button onClick={() => navigate('/register')}>Εγγραφή →</button>
        </div>
      </div>
    </div>
  );
}
