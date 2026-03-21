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
    name: "Standard",
    price: "12,00",
    period: "€ / μήνα",
    features: ["1 κατάστημα", "Universal digital menu", "Επεξεργασία μενού", "URL: /menu/{slug}", "Email support"],
    cta: "Ξεκινήστε",
    highlight: false,
  },
  {
    name: "Premium",
    price: "16,70",
    period: "€ / μήνα",
    features: ["Όλα του Standard", "Gallery templates", "Προσαρμογή εμφάνισης", "Φωτογραφίες προϊόντων", "Παραγγελιοληψία (toggle)", "Πίνακες παραγγελιών", "Κρατήσεις"],
    cta: "Επιλέξτε Premium",
    highlight: true,
  },
  {
    name: "Exclusive",
    price: "25,00",
    period: "€ / μήνα",
    features: ["Όλα του Premium", "Business analytics", "Κάβα & απόθεμα", "Μαζικές παραγγελίες", "Export CSV", "Dedicated support"],
    cta: "Επιλέξτε Exclusive",
    highlight: false,
  },
];

export default function Landing() {
  const [activeSection, setActiveSection] = useState(null);
  const [scrolled, setScrolled]           = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectSection = (id) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const backToHome = () => {
    setActiveSection(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const isHome = activeSection === null;

  return (
    <div className={styles.page}>

      {/* ── NAV ── */}
      <nav className={`${styles.nav} ${scrolled || !isHome ? styles.navBorder : ""}`}>
        <div className={`container ${styles.navInner}`}>

          <button className={styles.logo} onClick={backToHome}>QRMenu</button>

          <div className={styles.navLinks}>
            {[
              { id: "about",    label: "Σχετικά με εμάς" },
              { id: "services", label: "Υπηρεσίες" },
              { id: "plans",    label: "Πακέτα" },
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`${styles.navLink} ${activeSection === id ? styles.navLinkActive : ""}`}
                onClick={() => selectSection(id)}
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
      {isHome && (
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
              <Link to="/login" className={styles.heroLink}>
                Σύνδεση →
              </Link>
            </div>
          </div>

          {/* Subtle vertical dividers */}
          <div className={styles.verticals} aria-hidden>
            {[...Array(5)].map((_, i) => <span key={i} className={styles.vLine} />)}
          </div>
        </section>
      )}

      {/* ── ABOUT ── */}
      {activeSection === "about" && (
        <section className={`${styles.section} fade-up`}>
          <div className="container">
            <p className={styles.eyebrow}>Σχετικά με εμάς</p>
            <h2 className={styles.sectionTitle}>
              Φτιαγμένο για την εστίαση.
            </h2>
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

            <Link to="/register" className="btn btn-primary btn-lg" style={{ marginTop: 48 }}>
              Δημιουργία λογαριασμού δωρεάν
            </Link>
          </div>
        </section>
      )}

      {/* ── SERVICES ── */}
      {activeSection === "services" && (
        <section className={`${styles.section} fade-up`}>
          <div className="container">
            <p className={styles.eyebrow}>Υπηρεσίες</p>
            <h2 className={styles.sectionTitle}>
              Ό,τι χρειάζεται η επιχείρησή σας.
            </h2>

            <div className={styles.infoCards}>
              {SERVICES.map((s, i) => (
                <div key={i} className={styles.infoCard}>
                  <span className={styles.infoNum}>0{i+1}</span>
                  <div className={styles.infoTitle}>{s.title}</div>
                  <div className={styles.infoDesc}>{s.desc}</div>
                </div>
              ))}
            </div>

            <Link to="/register" className="btn btn-primary btn-lg" style={{ marginTop: 48 }}>
              Ξεκινήστε τώρα
            </Link>
          </div>
        </section>
      )}

      {/* ── PLANS ── */}
      {activeSection === "plans" && (
        <section className={`${styles.section} fade-up`}>
          <div className="container">
            <p className={styles.eyebrow}>Πακέτα</p>
            <h2 className={styles.sectionTitle}>
              Απλή τιμολόγηση.
            </h2>
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

                  <Link
                    to="/register"
                    className={`btn btn-full ${p.highlight ? "btn-primary" : "btn-ghost"}`}
                    style={{ marginTop: "auto" }}
                  >
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
      )}

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className="container">
          <button className={styles.footerLogo} onClick={backToHome}>QRMenu</button>
          <span className={styles.footerCopy}>© 2026</span>
        </div>
      </footer>
    </div>
  );
}