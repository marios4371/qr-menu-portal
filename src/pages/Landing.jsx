import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Landing.module.css";

const SERVICES = [
  { icon: "◈", title: "Ψηφιακό Μενού QR", desc: "Οι πελάτες σκανάρουν, βλέπουν το μενού και παραγγέλνουν — χωρίς app, χωρίς εγγραφή." },
  { icon: "◎", title: "Real-time Παραγγελίες", desc: "Bar, Kitchen και Service λαμβάνουν αμέσως αυτό που τους αφορά. Μηδέν καθυστέρηση." },
  { icon: "◆", title: "Staff Dashboard", desc: "Σερβιτόροι, αναλήψεις τραπεζιών, πληρωμές — web dashboard χωρίς εγκατάσταση." },
  { icon: "⬡", title: "Σύστημα Κρατήσεων", desc: "Διαχείριση κρατήσεων απευθείας από το portal σας. Διαθέσιμο στο Premium πλάνο." },
  { icon: "◉", title: "Analytics & Αναφορές", desc: "Στατιστικά παραγγελιών, κορυφαία προϊόντα, έσοδα ανά μήνα. Exclusive πλάνο." },
  { icon: "▣", title: "Διαχείριση Κάβας", desc: "Οργανωτής αποθέματος και μαζικών παραγγελιών προς προμηθευτές. Exclusive πλάνο." },
];

const PLANS = [
  {
    name: "Standard",
    price: "12,00",
    desc: "Ιδανικό για μικρές επιχειρήσεις που θέλουν γρήγορη ψηφιακή παρουσία.",
    features: ["1 κατάστημα", "Universal digital menu", "Επεξεργασία μενού (CRUD)", "URL μενού: /menu/{slug}", "Email support"],
    cta: "Ξεκινήστε",
    highlight: false,
  },
  {
    name: "Premium",
    price: "16,70",
    desc: "Για επιχειρήσεις που θέλουν brand identity και πλήρη λειτουργικότητα παραγγελιών.",
    features: ["Όλα του Standard", "Gallery templates", "Προσαρμογή χρωμάτων & γραμματοσειρών", "Φωτογραφίες προϊόντων", "Παραγγελιοληψία (toggle)", "Πίνακες παραγγελιών", "Σύστημα κρατήσεων"],
    cta: "Επιλέξτε Premium",
    highlight: true,
  },
  {
    name: "Exclusive",
    price: "25,00",
    desc: "Πλήρης επαγγελματική διαχείριση για εστιατόρια με έντονη δραστηριότητα.",
    features: ["Όλα του Premium", "Business analytics", "Σύστημα κάβας & αποθέματος", "Οργανωτής μαζικών παραγγελιών", "Export CSV για προμηθευτές", "Dedicated support"],
    cta: "Επιλέξτε Exclusive",
    highlight: false,
  },
];

// null = hero, "about" | "services" | "plans"
export default function Landing() {
  const [activeSection, setActiveSection] = useState(null);
  const [scrolled, setScrolled]           = useState(false);

  // Scroll listener — nav becomes sticky bar after 60px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // When a nav section is selected, scroll to top so section fills viewport
  const selectSection = (id) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToHome = () => {
    setActiveSection(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isHome = activeSection === null;

  return (
    <div className={styles.page}>

      {/* ── NAV ── */}
      <nav className={`${styles.nav} ${scrolled || !isHome ? styles.navSolid : ""}`}>
        <div className={`container ${styles.navInner}`}>

          <button className={styles.logo} onClick={backToHome}>QRMenu</button>

          <div className={styles.navCenter}>
            <button
              className={`${styles.navLink} ${activeSection === "about" ? styles.navLinkActive : ""}`}
              onClick={() => selectSection("about")}
            >
              Σχετικά με εμάς
            </button>
            <button
              className={`${styles.navLink} ${activeSection === "services" ? styles.navLinkActive : ""}`}
              onClick={() => selectSection("services")}
            >
              Υπηρεσίες
            </button>
            <button
              className={`${styles.navLink} ${activeSection === "plans" ? styles.navLinkActive : ""}`}
              onClick={() => selectSection("plans")}
            >
              Πακέτα
            </button>
          </div>

          <div className={styles.navActions}>
            <Link to="/login"    className="btn btn-ghost btn-sm">Σύνδεση</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Ξεκινήστε Δωρεάν</Link>
          </div>
        </div>
      </nav>

      {/* ──────────────────────────────────────────────
          HERO — εμφανίζεται μόνο όταν isHome
      ────────────────────────────────────────────── */}
      {isHome && (
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Για επιχειρήσεις εστίασης
            </div>
            <h1 className={styles.headline}>
              Το ψηφιακό μενού<br />
              <em>που δουλεύει για σας</em>
            </h1>
            <p className={styles.sub}>
              QR code, παραγγελίες σε real-time, dashboard για την ομάδα σας.<br />
              Στήστε το μαγαζί σας σε λιγότερο από 5 λεπτά.
            </p>
            <div className={styles.cta}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Δημιουργία λογαριασμού
              </Link>
              <Link to="/login" className={styles.ctaLink}>
                Έχω ήδη λογαριασμό →
              </Link>
            </div>

            {/* Quick navigation hints */}
            <div className={styles.heroHints}>
              <button className={styles.hintChip} onClick={() => selectSection("about")}>Σχετικά με εμάς →</button>
              <button className={styles.hintChip} onClick={() => selectSection("services")}>Υπηρεσίες →</button>
              <button className={styles.hintChip} onClick={() => selectSection("plans")}>Πακέτα →</button>
            </div>
          </div>

          {/* Decorative grid */}
          <div className={styles.grid} aria-hidden="true">
            {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────
          ABOUT — εμφανίζεται μόνο όταν active
      ────────────────────────────────────────────── */}
      {activeSection === "about" && (
        <section className={`${styles.section} fade-up`}>
          <div className="container">
            <div className={styles.sectionLabel}>Σχετικά με εμάς</div>
            <h2 className={styles.sectionTitle}>
              Φτιαγμένο για την εστίαση.<br />Όχι για developers.
            </h2>
            <p className={styles.sectionDesc}>
              Το QRMenu είναι μια serverless B2B2C πλατφόρμα που γεφυρώνει την εμπειρία
              του πελάτη με την επιχειρησιακή αποδοτικότητα. Από το QR code στο τραπέζι
              μέχρι τον σερβιτόρο και την κουζίνα — σε πραγματικό χρόνο.
            </p>

            <div className={styles.aboutGrid}>
              <div className={styles.aboutCard}>
                <div className={styles.aboutNum}>01</div>
                <h3>Serverless αρχιτεκτονική</h3>
                <p>100% AWS serverless. Μηδέν idle κόστος, αυτόματη κλιμάκωση, zero maintenance.</p>
              </div>
              <div className={styles.aboutCard}>
                <div className={styles.aboutNum}>02</div>
                <h3>Multi-tenant SaaS</h3>
                <p>Κάθε επιχείρηση έχει το δικό της URL, μενού και ρυθμίσεις. Πλήρης απομόνωση δεδομένων.</p>
              </div>
              <div className={styles.aboutCard}>
                <div className={styles.aboutNum}>03</div>
                <h3>Real-time routing</h3>
                <p>Κάθε προϊόν γνωρίζει πού πηγαίνει — BAR ή KITCHEN. Άμεση ειδοποίηση στον σωστό σταθμό.</p>
              </div>
            </div>

            <div style={{ marginTop: 48 }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Δημιουργία λογαριασμού δωρεάν
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────
          SERVICES
      ────────────────────────────────────────────── */}
      {activeSection === "services" && (
        <section className={`${styles.section} fade-up`}>
          <div className="container">
            <div className={styles.sectionLabel}>Υπηρεσίες</div>
            <h2 className={styles.sectionTitle}>Ό,τι χρειάζεται η επιχείρησή σας</h2>
            <p className={styles.sectionDesc}>
              Ένα ολοκληρωμένο σύστημα — από το ψηφιακό μενού μέχρι τη διαχείριση αποθέματος.
            </p>

            <div className={styles.servicesGrid}>
              {SERVICES.map((s) => (
                <div key={s.title} className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>{s.icon}</div>
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <p className={styles.serviceDesc}>{s.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48 }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Ξεκινήστε τώρα
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────
          PLANS
      ────────────────────────────────────────────── */}
      {activeSection === "plans" && (
        <section className={`${styles.section} fade-up`}>
          <div className="container">
            <div className={styles.sectionLabel}>Πακέτα</div>
            <h2 className={styles.sectionTitle}>Απλή τιμολόγηση, χωρίς εκπλήξεις</h2>
            <p className={styles.sectionDesc}>
              Κανένα ποσοστό ανά παραγγελία. Μόνο μια σταθερή μηνιαία συνδρομή.
            </p>

            <div className={styles.plansGrid}>
              {PLANS.map((p) => (
                <div key={p.name} className={`${styles.planCard} ${p.highlight ? styles.planHighlight : ""}`}>
                  {p.highlight && <div className={styles.planBadge}>Δημοφιλές</div>}
                  <div className={styles.planName}>{p.name}</div>
                  <div className={styles.planPrice}>
                    <span className={styles.planAmount}>{p.price}</span>
                    <span className={styles.planCurrency}>€/μήνα</span>
                  </div>
                  <p className={styles.planDesc}>{p.desc}</p>
                  <ul className={styles.planFeatures}>
                    {p.features.map((f) => (
                      <li key={f} className={styles.planFeature}>
                        <span className={styles.planCheck}>✓</span>{f}
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

      {/* ── FOOTER — πάντα ορατό ── */}
      <footer className={`${styles.footer} ${!isHome ? styles.footerSection : ""}`}>
        <div className="container">
          <button className={styles.logo} onClick={backToHome} style={{ fontSize: "1rem", background: "none", border: "none", cursor: "pointer" }}>
            QRMenu
          </button>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>© 2026</span>
        </div>
      </footer>
    </div>
  );
}