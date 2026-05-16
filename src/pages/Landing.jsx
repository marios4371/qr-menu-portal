import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import s from './Landing.module.css';

const ArrowDown = () => (
  <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
    <path d="M10 3v14M4 13.5l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M16 10H4M10 16l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowUp = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 17V3M4 9l6-6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FEATURES = [
  {
    icon: (
      <svg width="55" height="55" viewBox="0 0 55 55" fill="none">
        <rect x="7" y="30" width="9" height="18" rx="1.5" fill="#3A7326"/>
        <rect x="23" y="20" width="9" height="28" rx="1.5" fill="#3A7326"/>
        <rect x="39" y="8" width="9" height="40" rx="1.5" fill="#3A7326"/>
        <path d="M5 42L18 28L30 34L50 12" stroke="#3A7326" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Advanced Data Analytics',
    desc: 'Predictive analytics to gain actionable insights and forecast future trends.',
  },
  {
    icon: (
      <svg width="55" height="55" viewBox="0 0 55 55" fill="none">
        <circle cx="27.5" cy="27.5" r="9" stroke="#3A7326" strokeWidth="2.5"/>
        <circle cx="10" cy="10" r="5.5" stroke="#3A7326" strokeWidth="2"/>
        <circle cx="45" cy="10" r="5.5" stroke="#3A7326" strokeWidth="2"/>
        <circle cx="10" cy="45" r="5.5" stroke="#3A7326" strokeWidth="2"/>
        <circle cx="45" cy="45" r="5.5" stroke="#3A7326" strokeWidth="2"/>
        <line x1="14.9" y1="14.9" x2="20.1" y2="20.1" stroke="#3A7326" strokeWidth="2" strokeLinecap="round"/>
        <line x1="40.1" y1="14.9" x2="34.9" y2="20.1" stroke="#3A7326" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14.9" y1="40.1" x2="20.1" y2="34.9" stroke="#3A7326" strokeWidth="2" strokeLinecap="round"/>
        <line x1="40.1" y1="40.1" x2="34.9" y2="34.9" stroke="#3A7326" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Operations with Automation',
    desc: 'Enhance your operational efficiency with our AI-driven automated workflows.',
  },
  {
    icon: (
      <svg width="55" height="55" viewBox="0 0 55 55" fill="none">
        <rect x="8" y="8" width="32" height="38" rx="3" stroke="#3A7326" strokeWidth="2.5"/>
        <line x1="16" y1="20" x2="32" y2="20" stroke="#3A7326" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="28" x2="32" y2="28" stroke="#3A7326" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="36" x2="24" y2="36" stroke="#3A7326" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 34l8 8M36 42l8-8" stroke="#3A7326" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Unlock Insights with NLP',
    desc: 'Language processing to extract meaningful unstructured data.',
  },
  {
    icon: (
      <svg width="55" height="55" viewBox="0 0 55 55" fill="none">
        <path d="M27.5 6l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12z" stroke="#3A7326" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M43 37l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5 2.5-7z" fill="#3A7326"/>
        <circle cx="12" cy="42" r="3.5" fill="#3A7326"/>
      </svg>
    ),
    title: 'Custom AI for Your Needs',
    desc: 'Collaborate with our team of AI experts to build and deploy bespoke models.',
  },
];

const PRICING_PLANS = [
  { name: 'Standard',  price: '12€/μήνα',    featured: false, plan: 'STANDARD' },
  { name: 'Premium',   price: '16.70€/μήνα', featured: true,  plan: 'PREMIUM'  },
  { name: 'Exclusive', price: '25€/μήνα',    featured: false, plan: 'EXCLUSIVE' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [active, setActive]           = useState('hero');
  const [aboutSlide, setAboutSlide]   = useState(0);    // 0 = panel1, 1 = panel2
  const [aboutAnimated, setAboutAnimated] = useState(true); // false = instant reset
  const [email, setEmail]             = useState('');

  useEffect(() => {
    const sections = ['hero', 'about', 'pricing', 'contact'];
    const onScroll = () => {
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 80 && r.bottom > 80) { setActive(id); break; }
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reset to panel 1 instantly (no animation) when leaving the about section
  useEffect(() => {
    if (active !== 'about') {
      setAboutAnimated(false);
      setAboutSlide(0);
      const t = setTimeout(() => setAboutAnimated(true), 80);
      return () => clearTimeout(t);
    }
  }, [active]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // Toggle between panels (right arrow cycles: 0 → 1 → 0 → …)
  const toggleAboutPanel = () => {
    setAboutAnimated(true);
    setAboutSlide(prev => (prev === 0 ? 1 : 0));
  };

  return (
    <div className={s.page}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className={s.nav}>
        <span className={s.logo}>Resto Solutions</span>
        <div className={s.navLinks}>
          <button
            className={`${s.navLink} ${active === 'about' ? s.navLinkActive : ''}`}
            onClick={() => { setAboutSlide(0); scrollTo('about'); }}
          >Πληροφορίες</button>
          <button
            className={`${s.navLink} ${active === 'pricing' ? s.navLinkActive : ''}`}
            onClick={() => scrollTo('pricing')}
          >Τιμές</button>
          <button
            className={`${s.navLink} ${active === 'contact' ? s.navLinkActive : ''}`}
            onClick={() => scrollTo('contact')}
          >Επικοινωνία</button>
        </div>
        <div className={s.navActions}>
          <button className={s.btnLogin}    onClick={() => navigate('/login')}>Σύνδεση</button>
          <button className={s.btnRegister} onClick={() => navigate('/register')}>Εγγραφή →</button>
        </div>
      </nav>

      {/* ── HERO (landingStart) ──────────────────────────────── */}
      <section id="hero" className={s.hero}>
        <div className={s.heroLeft}>
          <p className={s.heroEyebrow}>DIGITAL MENUS FOR GREEK HOSPITALITY</p>
          <h1 className={s.heroHeadline}>
            Το ψηφιακό μενού<br/>
            που μεγαλώνει μαζί<br/>
            με την επιχείρησή σας.
          </h1>
          <p className={s.heroSub}>QR codes · Real-time ενημερώσεις · Analytics · Από 12€/μήνα</p>
          <div className={s.heroCta}>
            <button className={s.btnPrimary} onClick={() => navigate('/register')}>Ξεκινήστε τώρα →</button>
            <button className={s.btnOutline} onClick={() => scrollTo('about')}>Δείτε demo</button>
          </div>
        </div>
        <div className={s.heroRight} />
        <button className={s.downBtn} onClick={() => scrollTo('about')}>
          <span className={s.downLabel}>Down</span>
          <ArrowDown />
        </button>
      </section>

      {/* ── ABOUT (landingAboutUs_1 + _2) — horizontal slider ── */}
      <section id="about" className={s.aboutSection}>
        {/* Slider track — translates -100vw when aboutSlide = 1 */}
        <div
          className={s.aboutTrack}
          style={{
            transform: aboutSlide === 1 ? 'translateX(-100vw)' : 'translateX(0)',
            transition: aboutAnimated ? 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >

          {/* ── Panel 1 (landingAboutUs_1) ── */}
          <div className={s.aboutPanel}>
            <div className={s.aboutPanelInner}>
              <div className={s.about1Layout}>
                <div className={s.about1Body}>
                  <span className={s.eyebrowGreen}>ΠΛΗΡΟΦΟΡΙΕΣ</span>
                  <h2 className={s.sectionHeadline}>
                    Βελτιστοποιώντας την<br/>
                    καθημερινότητα της εστίασης
                  </h2>
                  <p className={s.bodyText}>
                    we are driven by the vision of transforming businesses with artificial intelligence.
                    Founded in 2024, we have consistently pushed the boundaries of AI to offer smart,
                    scalable, and intuitive solutions that drive growth and efficiency.
                  </p>
                  <p className={s.bodyText}>
                    Our team of expert data scientists, engineers, and strategists combines cutting-edge
                    technology with deep industry knowledge to deliver custom AI solutions that cater to
                    unique business challenges.
                  </p>
                  <div className={s.statsRow}>
                    <div className={s.stat}>
                      <span className={s.statNum}>5+</span>
                      <span className={s.statLabel}>Χρόνια στον χώρο της εστίασης</span>
                    </div>
                    <div className={s.stat}>
                      <span className={s.statNum}>20+</span>
                      <span className={s.statLabel}>Πελάτες εμπιστεύονται τις υπηρεσίες μας</span>
                    </div>
                    <div className={s.stat}>
                      <span className={s.statNum}>100+</span>
                      <span className={s.statLabel}>Συστήματα έχουν υλοποιηθεί από εμάς</span>
                    </div>
                  </div>
                </div>
                {/* Right arrow → cycle to next/prev panel */}
                <button className={s.arrowCircle} onClick={toggleAboutPanel} title="Επόμενο">
                  <ArrowRight />
                </button>
              </div>
            </div>
            <div className={s.panelFooter}>
              <button className={s.downBtnInline} onClick={() => scrollTo('pricing')}>
                <span className={s.downLabel}>Down</span>
                <ArrowDown />
              </button>
            </div>
          </div>

          {/* ── Panel 2 (landingAboutUs_2) ── */}
          <div className={s.aboutPanel}>
            <div className={s.aboutPanelInner}>
              <div className={s.sectionContainer}>
                <div className={s.about2Head}>
                  <span className={s.eyebrowGreenCenter}>SOLUTIONS</span>
                  <h2 className={s.about2Headline}>
                    Revolutionize Your Business<br/>
                    with Our AI-Powered Features
                  </h2>
                </div>
                <div className={s.featuresGrid}>
                  {FEATURES.map((f, i) => (
                    <div key={i} className={s.featureCard}>
                      <div className={s.featureIcon}>{f.icon}</div>
                      <h3 className={s.featureTitle}>{f.title}</h3>
                      <p className={s.featureDesc}>{f.desc}</p>
                    </div>
                  ))}
                </div>
                {/* Left arrow on panel 2 → go back to panel 1 */}
                <button className={s.arrowCircleAbs} onClick={toggleAboutPanel} title="Προηγούμενο">
                  <ArrowLeft />
                </button>
              </div>
            </div>
            <div className={s.panelFooter}>
              <button className={s.downBtnInline} onClick={() => scrollTo('pricing')}>
                <span className={s.downLabel}>Down</span>
                <ArrowDown />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── PRICING (landingPricing) ─────────────────────────── */}
      <section id="pricing" className={s.section}>
        <div className={s.sectionInner}>
          <div className={s.sectionContainer}>
            <h2 className={s.pricingTitle}>Επιλέξτε το πλάνο σας</h2>
            <div className={s.pricingGrid}>
              {PRICING_PLANS.map((p) => (
                <button
                  key={p.plan}
                  className={`${s.pricingCard} ${p.featured ? s.pricingCardFeatured : ''}`}
                  onClick={() => navigate(`/register?plan=${p.plan}`)}
                >
                  <h3 className={s.pricingName}>{p.name}</h3>
                  <p className={`${s.pricingPrice} ${p.featured ? s.pricingPriceGreen : ''}`}>{p.price}</p>
                  {p.featured && <span className={s.popularTag}>★ ΔΗΜΟΦΙΛΕΣ</span>}
                  <span className={s.pricingCta}>Επιλογή →</span>
                </button>
              ))}
            </div>
            <button className={s.btnGreen} onClick={() => navigate('/register')}>
              Εγγραφή δωρεάν →
            </button>
          </div>
        </div>
        <div className={s.panelFooter}>
          <button className={s.downBtnInline} onClick={() => scrollTo('contact')}>
            <span className={s.downLabel}>Down</span>
            <ArrowDown />
          </button>
        </div>
      </section>

      {/* ── CONTACT (landingContact) ─────────────────────────── */}
      <section id="contact" className={s.contact}>
        <div className={s.contactBody}>
          <div className={s.contactLeft}>
            <h2 className={s.contactHeadline}>
              Επικοινωνήστε για οποιοδήποτε ζήτημά σας άμεσα μαζί μας.
            </h2>
            <p className={s.contactSub}>
              Χρειάζεστε μια ποιο custom λυση;<br/>
              Επικοινωνήστε μαζί μας →
            </p>
          </div>
          <div className={s.contactRight}>
            <div className={s.contactForm}>
              <input
                className={s.emailInput}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Πληκτρολογήστε το email σας"
              />
              <button className={s.btnSend}>Αποστολή</button>
            </div>
          </div>
        </div>
        <button className={s.backToTop} onClick={() => scrollTo('hero')}>
          <span className={s.backToTopLabel}>Back to the top</span>
          <ArrowUp />
        </button>
        <footer className={s.footer}>
          <span className={s.footerCopy}>©2023 RESTO SOLUTIONS · All rights reserved.</span>
          <div className={s.footerLinks}>
            <a className={s.footerLink} href="#">Term of use</a>
            <a className={s.footerLink} href="#">Privacy policy</a>
            <a className={s.footerLink} href="#">Security</a>
          </div>
        </footer>
      </section>

    </div>
  );
}
