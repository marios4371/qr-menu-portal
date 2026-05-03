// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Primitives';
import { useAuth } from '../hooks/useAuth';
import { register, checkSlug } from '../services/api';
import { PLANS, BUSINESS_TYPES } from '../constants';

const slugify = (s) => s.toLowerCase()
  .replace(/[άα]/g,'a').replace(/[έε]/g,'e')
  .replace(/[ήηιίϊΐ]/g,'i')
  .replace(/[όο]/g,'o').replace(/[ύυϋΰ]/g,'y')
  .replace(/[ώω]/g,'o').replace(/β/g,'b').replace(/γ/g,'g')
  .replace(/δ/g,'d').replace(/ζ/g,'z').replace(/θ/g,'th')
  .replace(/κ/g,'k').replace(/λ/g,'l').replace(/μ/g,'m')
  .replace(/ν/g,'n').replace(/ξ/g,'x').replace(/π/g,'p')
  .replace(/ρ/g,'r').replace(/[σς]/g,'s').replace(/τ/g,'t')
  .replace(/φ/g,'f').replace(/χ/g,'ch').replace(/ψ/g,'ps')
  .replace(/[^a-z0-9-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

function SlugBadge({ status }) {
  if (status === 'idle')     return null;
  if (status === 'checking') return <span className="slug-checking">…</span>;
  if (status === 'ok')       return <span className="slug-ok">✓ διαθέσιμο</span>;
  if (status === 'taken')    return <span className="slug-bad">✗ μη διαθέσιμο</span>;
  return <span className="slug-bad">✗ σφάλμα</span>;
}

function pwStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 3);
}
const strengthLabel = ['', 'WEAK', 'FAIR', 'STRONG'];

function ProgressDots({ step }) {
  return (
    <div className="auth-steps">
      <div className={`auth-step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
        <div className="auth-step-circle"/>
        <span className="auth-step-label">Λογαριασμός</span>
      </div>
      <div className={`auth-step-line ${step > 1 ? 'done' : ''}`}/>
      <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>
        <div className="auth-step-circle"/>
        <span className="auth-step-label">Πλάνο</span>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', password:'', confirmPassword:'',
    shopName:'', businessType:'RESTAURANT', plan:'PREMIUM',
  });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [slugStatus, setSlugStatus] = useState('idle');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const slugFromName = slugify(form.shopName);
  const slugOk = slugFromName.length >= 3;
  const strength = pwStrength(form.password);

  useEffect(() => {
    if (!slugOk) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    const t = setTimeout(async () => {
      try {
        const { available } = await checkSlug(slugFromName);
        setSlugStatus(available ? 'ok' : 'taken');
      } catch { setSlugStatus('error'); }
    }, 400);
    return () => clearTimeout(t);
  }, [slugFromName]);

  const next = () => {
    setErr('');
    if (!form.firstName || !form.lastName)         return setErr('Συμπληρώστε όνομα και επώνυμο');
    if (!form.email.includes('@'))                  return setErr('Μη έγκυρο email');
    if (form.password.length < 6)                   return setErr('Κωδικός τουλάχιστον 6 χαρακτήρες');
    if (form.password !== form.confirmPassword)     return setErr('Οι κωδικοί δεν ταιριάζουν');
    if (!form.shopName || form.shopName.length < 2) return setErr('Συμπληρώστε το όνομα του καταστήματος');
    if (!slugOk)                                    return setErr('Μη έγκυρο slug');
    if (slugStatus === 'checking')                  return setErr('Αναμείνετε τον έλεγχο slug…');
    if (slugStatus === 'taken')                     return setErr('Αυτό το slug χρησιμοποιείται ήδη');
    if (slugStatus === 'error')                     return setErr('Αδυναμία ελέγχου slug');
    if (slugStatus !== 'ok')                        return setErr('Αναμείνετε τον έλεγχο slug');
    setStep(2);
  };
  const back = () => { setErr(''); setStep(1); };

  const submit = async (planValue) => {
    setBusy(true);
    setErr('');
    try {
      const { token, owner, shops } = await register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password,
        businessType: form.businessType, shopName: form.shopName,
        plan: planValue || form.plan,
      });
      login(token, owner, shops || []);
      navigate('/dashboard');
    } catch (error) {
      setErr(error.message || 'Σφάλμα εγγραφής');
      setStep(2);
    } finally {
      setBusy(false);
    }
  };

  // Step 2: full-page plan selection
  if (step === 2) {
    return (
      <div className="auth-plan-page">
        <div className="auth-plan-page-top">
          <button className="auth-brand" onClick={() => navigate('/')}>
            <span className="dot"/>QRMenu
          </button>
          <div className="auth-plan-progress">
            <div className="auth-step done">
              <div className="auth-step-circle"/>
              <span className="auth-step-label">Λογαριασμός</span>
            </div>
            <div className="auth-step-line done"/>
            <div className="auth-step active">
              <div className="auth-step-circle"/>
              <span className="auth-step-label">Πλάνο</span>
            </div>
          </div>
        </div>

        <div className="auth-plan-page-head">
          <h1 className="auth-plan-page-title">Επιλέξτε το πλάνο σας</h1>
          <p className="auth-plan-page-sub">30 μέρες δωρεάν δοκιμή. Αλλαγή ή ακύρωση οποτεδήποτε.</p>
        </div>

        <div className="auth-plan-cards-wrap">
          {PLANS.map(p => {
            const isPremium = p.value === 'PREMIUM';
            return (
              <div key={p.value} className={`auth-plan-card-col ${isPremium ? 'premium-col' : ''}`}>
                <div className={`auth-plan-full-card ${isPremium ? 'is-premium' : ''}`}>
                  {isPremium && <span className="auth-plan-recommended">Recommended</span>}
                  <div className="auth-plan-full-name">{p.name}</div>
                  <div className="auth-plan-full-price">
                    <span className="auth-plan-full-amount">{p.price}€</span>
                    <span className="auth-plan-full-period">/ μήνα</span>
                  </div>
                  <ul className="auth-plan-full-feats">
                    {p.features.map((f, i) => (
                      <li key={i} className="auth-plan-full-feat avail">
                        <span>→</span><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={isPremium ? 'btn btn-primary btn-full' : 'btn btn-ghost btn-full'}
                    onClick={() => { set('plan', p.value); submit(p.value); }}
                    disabled={busy}
                  >
                    {busy && form.plan === p.value
                      ? <><span className="spinner"/>Δημιουργία…</>
                      : p.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {err && (
          <div className="msg-error" style={{marginTop:20, maxWidth:560, width:'100%'}}>
            {err}
          </div>
        )}

        <button className="auth-plan-back" onClick={back}>
          <Icon name="back" size={12}/>Πίσω στο προηγούμενο βήμα
        </button>
      </div>
    );
  }

  // Step 1: account + shop inside a card
  return (
    <div className="auth">
      <button className="auth-brand" onClick={() => navigate('/')}>
        <span className="dot"/>QRMenu
      </button>

      <div className="auth-card wide">
        <ProgressDots step={1}/>

        <h1 className="auth-title">Δημιουργία λογαριασμού</h1>
        <p className="auth-sub">Συμπληρώστε τα στοιχεία σας</p>

        <div className="fade-up" style={{display:'flex', flexDirection:'column', gap:12}}>
          <div className="auth-formgrid">
            <div className="form-group">
              <label>Όνομα</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Νίκος"/>
            </div>
            <div className="form-group">
              <label>Επώνυμο</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Παπαδόπουλος"/>
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@business.com"/>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrap">
              <input type={showPw ? 'text' : 'password'} value={form.password}
                     onChange={e => set('password', e.target.value)} placeholder="••••••••"/>
              <button type="button" className="password-eye" onClick={() => setShowPw(s => !s)}>
                <Icon name={showPw ? 'eye-off' : 'eye'} size={14}/>
              </button>
            </div>
            {form.password && (
              <div className="pw-strength">
                <div className={`pw-seg ${strength >= 1 ? 'on' : ''}`}/>
                <div className={`pw-seg ${strength >= 2 ? 'on' : ''}`}/>
                <div className={`pw-seg ${strength >= 3 ? 'on' : ''}`}/>
                <span className={`pw-strength-label ${strength === 3 ? 'strong' : ''}`}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Επαλήθευση</label>
            <input type={showPw ? 'text' : 'password'} value={form.confirmPassword}
                   onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••"/>
          </div>

          <div className="auth-formgrid">
            <div className="form-group">
              <label>Τύπος επιχείρησης</label>
              <select value={form.businessType} onChange={e => set('businessType', e.target.value)}>
                {BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Shop name</label>
              <input value={form.shopName} onChange={e => set('shopName', e.target.value)} placeholder="π.χ. My Cafe"/>
            </div>
          </div>

          <div className="form-group">
            <label>Shop URL</label>
            <div className="slug-preview">
              <span className="slug-label">URL</span>
              <span className="slug-code">qrmenu.app/menu/<strong>{slugFromName || 'my-shop'}</strong></span>
              {form.shopName && <SlugBadge status={slugStatus}/>}
            </div>
          </div>
        </div>

        {err && <div className="msg-error" style={{marginTop:14}}>{err}</div>}

        <div className="auth-actions">
          <div style={{flex:1}}/>
          <button className="btn btn-primary btn-lg" onClick={next}
                  disabled={slugStatus === 'checking'}>
            Συνέχεια →
          </button>
        </div>

        <hr className="auth-divider"/>
        <div className="auth-foot">
          Έχετε ήδη λογαριασμό; <button onClick={() => navigate('/login')}>Σύνδεση →</button>
        </div>
      </div>
    </div>
  );
}
