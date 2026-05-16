// src/pages/Register.jsx — Figma frames 03 (Πλάνο) + 04 (Στοιχεία)
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register, checkSlug } from '../services/api';
import { BUSINESS_TYPES } from '../constants';
import s from './Register.module.css';

// Plans configuration (frame 03 features)
const PLANS = [
  {
    value: 'STANDARD',
    name: 'Standard',
    amount: '12€',
    features: ['1 ψηφιακό μενού', 'QR Code generation', 'Real-time updates', 'Basic analytics'],
    cta: 'Επιλογή Standard',
    featured: false,
  },
  {
    value: 'PREMIUM',
    name: 'Premium',
    amount: '16.70€',
    features: ['1 ψηφιακό μενού', 'QR Code generation', 'Εμφάνιση μενού (themes)', 'Πολύγλωσσο', 'Advanced analytics'],
    cta: 'Επιλογή Premium →',
    featured: true,
  },
  {
    value: 'EXCLUSIVE',
    name: 'Exclusive',
    amount: '25€',
    features: ['1 ψηφιακό μενού', 'QR Code generation', 'Εμφάνιση μενού', 'PDA System (Soon)', 'Priority support'],
    cta: 'Επιλογή Exclusive',
    featured: false,
  },
];

const STEPS = ['Πλάνο', 'Στοιχεία', 'Κατάστημα', 'Επιβεβαίωση'];

const slugify = (str) => str.toLowerCase()
  .replace(/[άα]/g,'a').replace(/[έε]/g,'e').replace(/[ήηιίϊΐ]/g,'i')
  .replace(/[όο]/g,'o').replace(/[ύυϋΰ]/g,'y').replace(/[ώω]/g,'o')
  .replace(/β/g,'b').replace(/γ/g,'g').replace(/δ/g,'d').replace(/ζ/g,'z')
  .replace(/θ/g,'th').replace(/κ/g,'k').replace(/λ/g,'l').replace(/μ/g,'m')
  .replace(/ν/g,'n').replace(/ξ/g,'x').replace(/π/g,'p').replace(/ρ/g,'r')
  .replace(/[σς]/g,'s').replace(/τ/g,'t').replace(/φ/g,'f').replace(/χ/g,'ch').replace(/ψ/g,'ps')
  .replace(/[^a-z0-9-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

function Stepper({ step }) {
  const items = [];
  STEPS.forEach((label, i) => {
    const idx = i + 1;
    const cls = idx < step ? s.stepDone : idx === step ? s.stepActive : '';
    items.push(
      <div key={`step-${idx}`} className={`${s.step} ${cls}`}>
        <div className={s.stepCircle}>{idx}</div>
        <span className={s.stepLabel}>{label}</span>
      </div>
    );
    if (idx < STEPS.length) {
      items.push(
        <div key={`line-${idx}`} className={`${s.stepLine} ${idx < step ? s.stepLineDone : ''}`}/>
      );
    }
  });
  return <div className={s.stepper}>{items}</div>;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={s.planFeatureCheck}>
      <path d="M3 7L5.8 9.8L11 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  // Preselect plan from URL (?plan=PREMIUM)
  const initialPlan = (params.get('plan') || '').toUpperCase();
  const validPlan = PLANS.find(p => p.value === initialPlan)?.value || null;

  const [step, setStep] = useState(validPlan ? 2 : 1);
  const [form, setForm] = useState({
    plan: validPlan || 'PREMIUM',
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
    businessType: 'RESTAURANT', shopName: '',
  });
  const [slugStatus, setSlugStatus] = useState('idle');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const slug = slugify(form.shopName);

  // Slug availability check
  useEffect(() => {
    if (slug.length < 3) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    const t = setTimeout(async () => {
      try {
        const { available } = await checkSlug(slug);
        setSlugStatus(available ? 'ok' : 'taken');
      } catch { setSlugStatus('error'); }
    }, 400);
    return () => clearTimeout(t);
  }, [slug]);

  const pickPlan = (planValue) => {
    set('plan', planValue);
    setStep(2);
  };

  const goBack = () => {
    setErr('');
    if (step === 2) setStep(1);
    else navigate('/');
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    setErr('');
    if (!form.firstName || !form.lastName) return setErr('Συμπληρώστε όνομα και επώνυμο');
    if (!form.email.includes('@'))         return setErr('Μη έγκυρο email');
    if (form.password.length < 6)          return setErr('Κωδικός τουλάχιστον 6 χαρακτήρες');
    if (form.password !== form.confirmPassword) return setErr('Οι κωδικοί δεν ταιριάζουν');
    if (!form.shopName || form.shopName.length < 2) return setErr('Συμπληρώστε όνομα καταστήματος');
    if (slugStatus === 'checking') return setErr('Αναμείνετε τον έλεγχο διαθεσιμότητας…');
    if (slugStatus === 'taken')    return setErr('Αυτό το URL χρησιμοποιείται ήδη');
    if (slugStatus !== 'ok')       return setErr('Μη έγκυρο URL καταστήματος');

    setBusy(true);
    try {
      const { token, owner, shops } = await register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password,
        businessType: form.businessType, shopName: form.shopName,
        plan: form.plan,
      });
      login(token, owner, shops || []);
    } catch (error) {
      setErr(error.message || 'Σφάλμα εγγραφής');
    } finally {
      setBusy(false);
    }
  };

  // ── STEP 1: Plan selection (frame 03) ──
  if (step === 1) {
    return (
      <div className={s.page}>
        <button className={s.back} onClick={() => navigate('/')}>← Πίσω</button>
        <Stepper step={1}/>

        <div className={s.planHeader}>
          <h1 className={s.planTitle}>Επιλέξτε το πλάνο σας</h1>
          <p className={s.planSub}>Μπορείτε να αναβαθμίσετε ανά πάσα στιγμή. Δεν απαιτείται κάρτα.</p>
        </div>

        <div className={s.planGrid}>
          {PLANS.map(p => (
            <div key={p.value} className={`${s.planCard} ${p.featured ? s.planCardFeatured : ''}`}>
              {p.featured && <span className={s.planTag}>★ ΔΗΜΟΦΙΛΕΣ</span>}
              <h2 className={s.planName}>{p.name}</h2>
              <div className={s.planPriceWrap}>
                <span className={`${s.planPriceAmount} ${p.featured ? s.planPriceFeatured : ''}`}>{p.amount}</span>
                <span className={s.planPricePeriod}>ανά μήνα</span>
              </div>
              <ul className={s.planFeatures}>
                {p.features.map((f, i) => (
                  <li key={i} className={s.planFeature}>
                    <CheckIcon/>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`${s.planBtn} ${p.featured ? s.planBtnFeatured : ''}`}
                onClick={() => pickPlan(p.value)}
              >{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── STEP 2: Details form (frame 04) ──
  return (
    <div className={s.page}>
      <button className={s.back} onClick={goBack}>← Πίσω</button>
      <Stepper step={2}/>

      <div className={s.formWrap}>
        <form className={s.card} onSubmit={submit} noValidate>
          <p className={s.brand}>Resto Solutions</p>
          <p className={s.cardSub}>Βήμα 2 από 4 — Συμπλήρωση στοιχείων</p>
          <p className={s.cardSub}>Ολοκληρώστε τη δημιουργία του λογαριασμού σας</p>
          <h1 className={s.cardTitle}>Στοιχεία Λογαριασμού</h1>

          <div className={s.form}>
            <div className={s.fieldRow}>
              <div className={s.field}>
                <label className={s.label}>Όνομα</label>
                <input className={s.input} value={form.firstName}
                       onChange={e => set('firstName', e.target.value)}
                       placeholder="Γράψτε το όνομα σας"/>
              </div>
              <div className={s.field}>
                <label className={s.label}>Επώνυμο</label>
                <input className={s.input} value={form.lastName}
                       onChange={e => set('lastName', e.target.value)}
                       placeholder="Γράψτε το επώνυμο σας"/>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.label}>Email</label>
              <input className={s.input} type="email" value={form.email}
                     onChange={e => set('email', e.target.value)}
                     placeholder="example@gmail.com"
                     autoComplete="email"/>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label className={s.label}>Κωδικός</label>
                <input className={s.input} type="password" value={form.password}
                       onChange={e => set('password', e.target.value)}
                       placeholder="••••••••"
                       autoComplete="new-password"/>
              </div>
              <div className={s.field}>
                <label className={s.label}>Επαλήθευση κωδικού</label>
                <input className={s.input} type="password" value={form.confirmPassword}
                       onChange={e => set('confirmPassword', e.target.value)}
                       placeholder="••••••••"
                       autoComplete="new-password"/>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.label}>Τύπος Επιχείρησης</label>
              <select className={s.select} value={form.businessType}
                      onChange={e => set('businessType', e.target.value)}>
                {BUSINESS_TYPES.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className={s.field}>
              <label className={s.label}>Όνομα Καταστήματος</label>
              <input className={s.input} value={form.shopName}
                     onChange={e => set('shopName', e.target.value)}
                     placeholder="π.χ. Posada Restaurant"/>
            </div>

            <div className={s.field}>
              <label className={s.label}>URL Καταστήματος (slug)</label>
              <div className={s.slugWrap}>
                <span className={s.slugPrefix}>menu.gr/</span>
                <input
                  className={s.slugInput}
                  value={slug}
                  onChange={() => {}}
                  readOnly
                  placeholder="my-shop"
                />
                {form.shopName && slugStatus === 'ok'       && <span className={`${s.slugBadge} ${s.slugBadgeOk}`}>✓ Διαθέσιμο</span>}
                {form.shopName && slugStatus === 'taken'    && <span className={`${s.slugBadge} ${s.slugBadgeBad}`}>✗ Μη διαθέσιμο</span>}
                {form.shopName && slugStatus === 'checking' && <span className={`${s.slugBadge} ${s.slugBadgeChecking}`}>…</span>}
              </div>
            </div>

            {err && <div className={s.error}>{err}</div>}

            <button type="submit" className={s.btnPrimary} disabled={busy || slugStatus === 'checking'}>
              {busy ? <><span className={s.spinner}/>Δημιουργία…</> : 'Συνέχεια →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
