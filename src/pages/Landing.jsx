import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Landing.module.css";

const SERVICES = [
  { title: "Ψηφιακό Μενού QR", desc: "Σάρωση QR — το μενού εμφανίζεται αμέσως στο κινητό. Χωρίς app, χωρίς εγγραφή πελάτη." },
  { title: "Real-time Παραγγελίες", desc: "Κάθε παραγγελία φτάνει στον σωστό σταθμό — Bar ή Kitchen — σε δευτερόλεπτα." },
  { title: "Staff Dashboard", desc: "Web-based dashboard για σερβιτόρους, αναλήψεις τραπεζιών και πληρωμές." },
  { title: "Σύστημα Κρατήσεων", desc: "Διαχείριση κρατήσεων απευθείας από το portal. Διαθέσιμο στο Premium πλάνο." },
  { title: "Analytics & Αναφορές", desc: "Στατιστικά παραγγελιών, κορυφαία προϊόντα, έσοδα ανά μήνα. Exclusive πλάνο." },
  { title: "Διαχείριση Κάβας", desc: "Αποθεματολόγιο και μαζικές παραγγελίες προς προμηθευτές με export αρχείου." },
];

const PLANS = [
  {
    name: "Standard", price: "12,00", period: "€ / μήνα",
    features: ["1 κατάστημα", "Universal digital menu", "Επεξεργασία μενού", "URL: /menu/{slug}", "Email support"],
    cta: "Ξεκινήστε", highlight: false,
  },
  {
    name: "Premium", price: "16,70", period: "€ / μήνα",
    features: ["Όλα του Standard", "Gallery templates", "Προσαρμογή εμφάνισης", "Φωτογραφίες προϊόντων", "Παραγγελιοληψία (toggle)", "Πίνακες παραγγελιών", "Κρατήσεις"],
    cta: "Επιλέξτε Premium", highlight: true,
  },
  {
    name: "Exclusive", price: "25,00", period: "€ / μήνα",
    features: ["Όλα του Premium", "Business analytics", "Κάβα & απόθεμα", "Μαζικές παραγγελίες", "Export CSV", "Dedicated support"],
    cta: "Επιλέξτε Exclusive", highlight: false,
  },
];

export default function Landing() {
  const [scrolled, setScrolled]           = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  // Nav becomes solid after scrolling past hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section is in viewport → underline active nav link
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" } // trigger when section is in middle 5% of viewport
    );
    ["about", "services", "plans"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Offset for fixed nav height (~60px)
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className={styles.page}>

      {/* ── NAV ── */}
      <nav className={`${styles.nav} ${scrolled ? styles.navBorder : ""}`}>
        <div className={`container ${styles.navInner}`}>

          <button className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            QRMenu
          </button>

          <div className={styles.navLinks}>
            {[
              { id: "about",    label: "Σχετικά με εμάς" },
              { id: "services", label: "Υπηρεσίες" },
              { id: "plans",    label: "Πακέτα" },
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`${styles.navLink} ${activeSection === id ? styles.navLinkActive : ""}`}
                onClick={() => scrollTo(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.navActions}>
            <Link to="/login"    className="btn btn-ghost btn-sm">Σύνδεση</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Ξεκινήστε Δωρεάν</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Ψηφιακή παραγγελιοληψία για επιχειρήσεις εστίασης</p>
          <h1 className={styles.headline}>
            Το μενού σας,<br />
            <span className={styles.headlineLight}>παντού και πάντα.</span>
          </h1>
          <p className={styles.sub}>
            Από το QR code στο τραπέζι μέχρι την κουζίνα και το bar —
            χωρίς εγκατάσταση, χωρίς συντήρηση, χωρίς κόστος ανά παραγγελία.
          </p>
          <div className={styles.heroCta}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Δημιουργία λογαριασμού
            </Link>
            <Link to="/login" className={styles.heroLink}>Σύνδεση →</Link>
          </div>
        </div>
        <div className={styles.verticals} aria-hidden>
          {[...Array(5)].map((_, i) => <span key={i} className={styles.vLine} />)}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className={styles.section}>
        <div className="container">
          <p className={styles.eyebrow}>Σχετικά με εμάς</p>
          <h2 className={styles.sectionTitle}>Φτιαγμένο για την εστίαση.</h2>
          <p className={styles.sectionIntro}>
            Το QRMenu είναι μια B2B2C πλατφόρμα που γεφυρώνει την εμπειρία του πελάτη
            με την επιχειρησιακή λειτουργία. Serverless αρχιτεκτονική, μηδέν idle κόστος,
            real-time routing από το τραπέζι στον σωστό σταθμό παρασκευής.
          </p>
          <div className={styles.aboutCards}>
            {[
              ["Serverless αρχιτεκτονική", "100% AWS. Αυτόματη κλιμάκωση, μηδέν συντήρηση, χωρίς σταθερό κόστος υποδομής."],
              ["Multi-tenant SaaS", "Κάθε επιχείρηση έχει το δικό της URL, μενού και ρυθμίσεις. Πλήρης απομόνωση δεδομένων."],
              ["Real-time routing", "Κάθε προϊόν γνωρίζει πού πηγαίνει. Άμεση ειδοποίηση στον σωστό σταθμό — Bar ή Kitchen."],
            ].map(([title, desc], i) => (
              <div key={i} className={styles.infoCard}>
                <span className={styles.infoNum}>0{i+1}</span>
                <div className={styles.infoTitle}>{title}</div>
                <div className={styles.infoDesc}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className={styles.section}>
        <div className="container">
          <p className={styles.eyebrow}>Υπηρεσίες</p>
          <h2 className={styles.sectionTitle}>Ό,τι χρειάζεται η επιχείρησή σας.</h2>
          <div className={styles.infoCards}>
            {SERVICES.map((s, i) => (
              <div key={i} className={styles.infoCard}>
                <span className={styles.infoNum}>0{i+1}</span>
                <div className={styles.infoTitle}>{s.title}</div>
                <div className={styles.infoDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" className={styles.section}>
        <div className="container">
          <p className={styles.eyebrow}>Πακέτα</p>
          <h2 className={styles.sectionTitle}>Απλή τιμολόγηση.</h2>
          <p className={styles.sectionIntro}>
            Κανένα ποσοστό ανά παραγγελία. Σταθερή μηνιαία συνδρομή.
          </p>
          <div className={styles.plansGrid}>
            {PLANS.map((p) => (
              <div key={p.name} className={`${styles.planCard} ${p.highlight ? styles.planCardDark : ""}`}>
                {p.highlight && <div className={styles.planTag}>Δημοφιλές</div>}
                <div className={styles.planHeader}>
                  <span className={styles.planName}>{p.name}</span>
                  <div className={styles.planPrice}>
                    <span className={styles.planAmount}>{p.price}</span>
                    <span className={styles.planPeriod}>{p.period}</span>
                  </div>
                </div>
                <ul className={styles.planFeatures}>
                  {p.features.map((f) => (
                    <li key={f} className={styles.planFeature}>
                      <span className={styles.planCheck}>—</span>{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`btn btn-full ${p.highlight ? "btn-primary" : "btn-ghost"}`} style={{ marginTop: "auto" }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className={styles.customNote}>
            Χρειάζεστε custom λύση;{" "}
            <span className={styles.customLink}>Επικοινωνήστε μαζί μας</span>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className="container">
          <button className={styles.footerLogo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>QRMenu</button>
          <span className={styles.footerCopy}>© 2026</span>
        </div>
      </footer>
    </div>
  );
}