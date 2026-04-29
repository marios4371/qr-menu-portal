// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Primitives';
import { useAuth } from '../hooks/useAuth';
import { register } from '../services/api';
import { PLANS, BUSINESS_TYPES } from '../constants';

const slugify = (s) => s.toLowerCase()
  .replace(/[άα]/g,'a').replace(/[έε]/g,'e').replace(/[ήη]/g,'i')
  .replace(/[ίιϊΐ]/g,'i').replace(/[όο]/g,'o').replace(/[ύυϋΰ]/g,'y')
  .replace(/[ώω]/g,'o').replace(/[β]/g,'b').replace(/[γ]/g,'g')
  .replace(/[δ]/g,'d').replace(/[ζ]/g,'z').replace(/[θ]/g,'th')
  .replace(/[κ]/g,'k').replace(/[λ]/g,'l').replace(/[μ]/g,'m')
  .replace(/[ν]/g,'n').replace(/[ξ]/g,'x').replace(/[π]/g,'p')
  .replace(/[ρ]/g,'r').replace(/[σς]/g,'s').replace(/[τ]/g,'t')
  .replace(/[φ]/g,'f').replace(/[χ]/g,'ch').replace(/[ψ]/g,'ps')
  .replace(/[^a-z0-9-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', password:'', confirmPassword:'',
    shopName:'', shopSlug:'', businessType:'RESTAURANT', plan:'PREMIUM',
  });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const slugFromName = slugify(form.shopName);
  const slugOk = slugFromName.length >= 3;

  const next = () => {
    setErr('');
    if (step === 1) {
      if (!form.firstName || !form.lastName) return setErr('Συμπληρώστε όνομα και επώνυμο');
      if (!form.email.includes('@')) return setErr('Μη έγκυρο email');
      if (form.password.length < 6) return setErr('Κωδικός τουλάχιστον 6 χαρακτήρες');
      if (form.password !== form.confirmPassword) return setErr('Οι κωδικοί δεν ταιριάζουν');
    }
    if (step === 2) {
      if (!form.shopName || form.shopName.length < 2) return setErr('Συμπληρώστε το όνομα του καταστήματος');
      if (!slugOk) return setErr('Μη έγκυρο όνομα — διορθώστε');
      set('shopSlug', slugFromName);
    }
    setStep(s => s + 1);
  };
  const back = () => { setErr(''); setStep(s => Math.max(1, s - 1)); };

  const submit = async () => {
    setBusy(true);
    setErr('');
    try {
      const { token, owner, shops } = await register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password,
        businessType: form.businessType, shopName: form.shopName, plan: form.plan,
      });
      login(token, owner, shops || []);
      navigate('/dashboard');
    } catch (error) {
      setErr(error.message || 'Σφάλμα εγγραφής');
    } finally {
      setBusy(false);
    }
  };

  const STEP_LABELS = ['Λογαριασμός', 'Κατάστημα', 'Πλάνο'];

  return (
    <div className="auth">
      <button className="auth-back" onClick={() => navigate('/')}><Icon name="back" size={12}/>Πίσω</button>
      <div className="auth-card wide ticks">
        <div className="auth-logo"><span className="dot"/>QRMenu</div>

        <div className="auth-steps">
          {STEP_LABELS.map((lab, i) => {
            const n = i + 1;
            const cls = step === n ? 'active' : step > n ? 'done' : '';
            return (
              <>
                <div key={n} className={`auth-step ${cls}`}>
                  <div className="auth-step-circle">{step > n ? <Icon name="check" size={11}/> : n}</div>
                </div>
                {n < STEP_LABELS.length && <div key={`line-${n}`} className="auth-step-line"/>}
              </>
            );
          })}
        </div>

        <h1 className="auth-title">
          {step === 1 ? 'Φτιάξτε λογαριασμό.' : step === 2 ? 'Στοιχεία καταστήματος.' : 'Επιλέξτε πλάνο.'}
        </h1>
        <p className="auth-sub">
          {step === 1 && 'Στοιχεία ιδιοκτήτη. Θα τα χρησιμοποιείτε για σύνδεση.'}
          {step === 2 && 'Όνομα και τύπος επιχείρησης — εμφανίζονται στο μενού.'}
          {step === 3 && 'Δωρεάν 30 μέρες. Ακύρωση οποτεδήποτε.'}
        </p>

        {step === 1 && (
          <div className="fade-up" style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="auth-formgrid">
              <div className="form-group"><label>ΟΝΟΜΑ</label><input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Νίκος"/></div>
              <div className="form-group"><label>ΕΠΩΝΥΜΟ</label><input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Παπαδόπουλος"/></div>
            </div>
            <div className="form-group"><label>EMAIL</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@business.com"/></div>
            <div className="auth-formgrid">
              <div className="form-group">
                <label>ΚΩΔΙΚΟΣ</label>
                <div className="password-wrap">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••"/>
                  <button type="button" className="password-eye" onClick={() => setShowPw(s => !s)}><Icon name={showPw ? 'eye-off' : 'eye'} size={14}/></button>
                </div>
              </div>
              <div className="form-group"><label>ΕΠΑΛΗΘΕΥΣΗ</label><input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••"/></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up" style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="form-group"><label>ΟΝΟΜΑ ΚΑΤΑΣΤΗΜΑΤΟΣ</label><input value={form.shopName} onChange={e => set('shopName', e.target.value)} placeholder="π.χ. Souvlaki tou Niku"/></div>
            <div className="slug-preview">
              <span className="slug-label">QR URL</span>
              <span className="slug-code">qrmenu.app/menu/<strong>{slugFromName || 'your-shop'}</strong></span>
              {form.shopName && (slugOk ? <span className="slug-ok">✓ διαθέσιμο</span> : <span className="slug-bad">✗ πολύ μικρό</span>)}
            </div>
            <div className="form-group">
              <label>ΤΥΠΟΣ ΕΠΙΧΕΙΡΗΣΗΣ</label>
              <select value={form.businessType} onChange={e => set('businessType', e.target.value)}>
                {BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up" style={{display:'flex', flexDirection:'column', gap:14}}>
            <div className="auth-plan-grid">
              {PLANS.map(p => (
                <button key={p.value} type="button" className={`auth-plan-card ${form.plan === p.value ? 'selected' : ''}`} onClick={() => set('plan', p.value)}>
                  <div className="auth-plan-name">{p.name}</div>
                  <div className="auth-plan-price">{p.price} {p.period}</div>
                  <ul className="auth-plan-feat-list">
                    {p.features.slice(0, 4).map((f, i) => <li key={i} className="auth-plan-feat"><span>→</span><span>{f}</span></li>)}
                  </ul>
                </button>
              ))}
            </div>
            <div className="auth-summary">
              <div className="auth-sum-row"><span className="auth-sum-key">Ιδιοκτήτης</span><span className="auth-sum-val">{form.firstName} {form.lastName}</span></div>
              <div className="auth-sum-row"><span className="auth-sum-key">Email</span><span className="auth-sum-val">{form.email}</span></div>
              <div className="auth-sum-row"><span className="auth-sum-key">Κατάστημα</span><span className="auth-sum-val">{form.shopName}</span></div>
              <div className="auth-sum-row"><span className="auth-sum-key">URL</span><span className="auth-sum-val">qrmenu.app/menu/{slugFromName}</span></div>
              <div className="auth-sum-row"><span className="auth-sum-key">Πλάνο</span><span className="auth-sum-val">{PLANS.find(p => p.value === form.plan)?.name}</span></div>
            </div>
          </div>
        )}

        {err && <div className="msg-error" style={{marginTop:14}}>{err}</div>}

        <div className="auth-actions">
          {step > 1 && <button className="btn btn-ghost" onClick={back}><Icon name="back" size={12}/>Πίσω</button>}
          <div style={{flex:1}}/>
          {step < 3 && <button className="btn btn-primary btn-lg" onClick={next}>Συνέχεια<Icon name="arrow" size={12}/></button>}
          {step === 3 && (
            <button className="btn btn-primary btn-lg" onClick={submit} disabled={busy}>
              {busy ? <><span className="spinner"/>Δημιουργία…</> : <>Ολοκλήρωση<Icon name="check" size={13}/></>}
            </button>
          )}
        </div>

        <div className="auth-foot">Έχετε ήδη λογαριασμό; <button onClick={() => navigate('/login')}>Σύνδεση →</button></div>
      </div>
    </div>
  );
}
