// src/pages/Landing.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Primitives';
import { SERVICES, PLANS } from '../constants';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      for (const id of ['hero', 'services', 'plans']) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 120 && r.bottom > 120) { setActive(id); break; }
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
  };

  return (
    <div className="lp">
      <nav className={`lp-nav ${scrolled ? 'solid' : ''}`}>
        <div className="container lp-nav-inner">
          <button className="lp-logo" onClick={() => scrollTo('hero')}><span className="dot"/>QRMenu</button>
          <div className="lp-nav-links">
            <button className={`lp-nav-link ${active === 'services' ? 'active' : ''}`} onClick={() => scrollTo('services')}>Πλατφόρμα</button>
            <button className={`lp-nav-link ${active === 'plans' ? 'active' : ''}`} onClick={() => scrollTo('plans')}>Πλάνα</button>
          </div>
          <div className="lp-nav-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Σύνδεση</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Ξεκινήστε <Icon name="arrow" size={12}/></button>
          </div>
        </div>
      </nav>

      <section id="hero" className="lp-hero">
        <div className="container">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-eyebrow">QR/01 — Restaurant Operations</div>
              <h1 className="lp-headline">
                Παραγγελίες <em>χωρίς τριβή.</em><br/>
                Από το QR στο τραπέζι, στην κουζίνα.
              </h1>
              <p className="lp-sub">
                Πλατφόρμα ψηφιακού μενού & παραγγελιών για εστιατόρια, καφέ και bars.
                Φτιάξτε το μενού, βάλτε QR στο τραπέζι, παρακολουθήστε real-time κίνηση.
              </p>
              <div className="lp-cta">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>Δοκιμάστε δωρεάν 30 μέρες</button>
                <button className="lp-cta-link" onClick={() => scrollTo('services')}>Δείτε τι κάνει →</button>
              </div>
            </div>

            <div className="lp-hero-card ticks">
              <div className="lp-hero-card-bar">
                <span className="lp-dot live"/><span className="lp-path">/api/orders/live</span>
                <span className="lp-method">STREAM</span>
              </div>
              <div className="lp-feed">
                {[
                  { time:'14:32:08', route:'BAR',     item:'Espresso × 2',      price:'4,00€' },
                  { time:'14:32:14', route:'KITCHEN',  item:'Σουβλάκι χοιρινό',  price:'3,20€' },
                  { time:'14:32:21', route:'KITCHEN',  item:'Χωριάτικη',          price:'7,50€' },
                  { time:'14:32:29', route:'BAR',      item:'Μύθος 500ml × 3',   price:'10,50€' },
                ].map((r, i) => (
                  <div key={i} className="lp-feed-row">
                    <span className="lp-time">{r.time}</span>
                    <span className={`lp-route ${r.route === 'BAR' ? 'bar' : 'kit'}`}>{r.route}</span>
                    <span className="lp-item">{r.item}</span>
                    <span className="lp-price">{r.price}</span>
                  </div>
                ))}
              </div>
              <div className="lp-feed-stats">
                {[['428','orders / day'],['2.4s','avg latency'],['99.9','% uptime']].map(([n,l]) => (
                  <div key={l} className="lp-feed-stat">
                    <div className="lp-feed-stat-num">{n}</div>
                    <div className="lp-feed-stat-lab">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="lp-section">
        <div className="container">
          <div className="lp-section-head">
            <div><div className="hr-tick"><span style={{flex:'none'}}>02 / Πλατφόρμα</span></div></div>
            <div>
              <h2 className="lp-section-title">Όλα όσα χρειάζεστε για να <em>τρέχει</em> το μαγαζί.</h2>
              <p className="lp-section-intro">Ένα ολοκληρωμένο σύστημα: ψηφιακό μενού, παραγγελιοληψία, παρακολούθηση σταθμών, κρατήσεις, αναφορές.</p>
            </div>
          </div>
          <div className="lp-info-grid">
            {SERVICES.map((s, i) => (
              <div key={i} className="lp-info-card">
                <div className="lp-info-num">{String(i+1).padStart(2,'0')} / {String(SERVICES.length).padStart(2,'0')}</div>
                <div className="lp-info-title">{s.title}</div>
                <div className="lp-info-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="lp-section">
        <div className="container">
          <div className="lp-section-head">
            <div><div className="hr-tick"><span style={{flex:'none'}}>03 / Πλάνα</span></div></div>
            <div>
              <h2 className="lp-section-title">Διαλέξτε το πλάνο που <em>ταιριάζει</em>.</h2>
              <p className="lp-section-intro">Όλα τα πλάνα περιλαμβάνουν δωρεάν δοκιμή 30 ημερών. Αλλαγή ή ακύρωση οποτεδήποτε.</p>
            </div>
          </div>
          <div className="lp-plans-grid">
            {PLANS.map(p => (
              <div key={p.value} className={`lp-plan ${p.highlight ? 'dark' : ''} ticks`}>
                {p.highlight && <span className="lp-plan-tag">RECOMMENDED</span>}
                <div className="lp-plan-name">{p.name}</div>
                <div className="lp-plan-price">
                  <span className="lp-plan-amount">{p.price}</span>
                  <span className="lp-plan-period">{p.period}</span>
                </div>
                <ul className="lp-plan-features">
                  {p.features.map((f, j) => (
                    <li key={j} className="lp-plan-feat"><span className="lp-plan-check">→</span><span>{f}</span></li>
                  ))}
                </ul>
                <button className={`btn ${p.highlight ? 'btn-ghost' : 'btn-primary'} btn-full`}
                        onClick={() => navigate('/register')}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="container lp-foot-inner">
          <span className="lp-foot-meta">© 2026 QRMenu — eu-central-1</span>
          <span className="lp-foot-meta">v1.4.0 · made in Athens</span>
        </div>
      </footer>
    </div>
  );
}
