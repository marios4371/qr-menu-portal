import { Link } from "react-router-dom";
import styles from "./Landing.module.css";

const SERVICES = [
  {
    icon: "◈",
    title: "Ψηφιακό Μενού QR",
    desc: "Οι πελάτες σκανάρουν, βλέπουν το μενού και παραγγέλνουν — χωρίς app, χωρίς εγγραφή.",
  },
  {
    icon: "◎",
    title: "Real-time Παραγγελίες",
    desc: "Bar, Kitchen και Service λαμβάνουν αμέσως αυτό που τους αφορά. Μηδέν καθυστέρηση.",
  },
  {
    icon: "◆",
    title: "Staff Dashboard",
    desc: "Σερβιτόροι, αναλήψεις τραπεζιών, πληρωμές — web dashboard χωρίς εγκατάσταση.",
  },
  {
    icon: "⬡",
    title: "Σύστημα Κρατήσεων",
    desc: "Διαχείριση κρατήσεων απευθείας από το portal σας. Διαθέσιμο στο Premium πλάνο.",
  },
  {
    icon: "◉",
    title: "Analytics & Αναφορές",
    desc: "Στατιστικά παραγγελιών, κορυφαία προϊόντα, έσοδα ανά μήνα. Exclusive πλάνο.",
  },
  {
    icon: "▣",
    title: "Διαχείριση Κάβας",
    desc: "Οργανωτής αποθέματος και μαζικών παραγγελιών προς προμηθευτές. Exclusive πλάνο.",
  },
];

const PLANS = [
  {
    name: "Standard",
    price: "12,00",
    desc: "Ιδανικό για μικρές επιχειρήσεις που θέλουν γρήγορη ψηφιακή παρουσία.",
    features: ["Δημιουργία λογαριασμού", "1 κατάστημα", "Universal digital menu", "Επεξεργασία μενού (CRUD)", "URL μενού: /menu/{slug}"],
    cta: "Ξεκινήστε",
    highlight: false,
  },
  {
    name: "Premium",
    price: "16,70",
    desc: "Για επιχειρήσεις που θέλουν brand identity και πλήρη λειτουργικότητα παραγγελιών.",
    features: ["Όλα του Standard", "Gallery templates", "Προσαρμογή χρωμάτων & γραμματοσειρών", "Φωτογραφίες προϊόντων", "Παραγγελιοληψία (toggle)", "Πίνακες παραγγελιών ανά μήνα", "Σύστημα κρατήσεων"],
    cta: "Επιλέξτε Premium",
    highlight: true,
  },
  {
    name: "Exclusive",
    price: "25,00",
    desc: "Πλήρης επαγγελματική διαχείριση για εστιατόρια με έντονη δραστηριότητα.",
    features: ["Όλα του Premium", "Εξειδικευμένες αναφορές επιχείρησης", "Σύστημα κάβας & αποθέματος", "Οργανωτής μαζικών παραγγελιών", "Export CSV για προμηθευτές", "Dedicated support"],
    cta: "Επιλέξτε Exclusive",
    highlight: false,
  },
];

export default function Landing() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.page}>
      {/* Grain texture */}
      <div className={styles.noise} />

      {/* ── NAV — floating, no border bar ── */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <span className={styles.logo}>QRMenu</span>

          <div className={styles.navCenter}>
            <button className={styles.navLink} onClick={() => scrollTo("about")}>
              Σχετικά με εμάς
            </button>
            <button className={styles.navLink} onClick={() => scrollTo("services")}>
              Υπηρεσίες
            </button>
            <button className={styles.navLink} onClick={() => scrollTo("plans")}>
              Πακέτα
            </button>
          </div>

          <div className={styles.navActions}>
            <Link to="/login" className="btn btn-ghost btn-sm">Σύνδεση</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Ξεκινήστε Δωρεάν</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
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
        </div>

        {/* Decorative vertical grid */}
        <div className={styles.grid} aria-hidden="true">
          {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className={styles.about}>
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
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className={styles.services}>
        <div className="container">
          <div className={styles.sectionLabel}>Υπηρεσίες</div>
          <h2 className={styles.sectionTitle}>Ό,τι χρειάζεται η επιχείρησή σας</h2>
          <div className={styles.servicesGrid}>
            {SERVICES.map((s) => (
              <div key={s.title} className={styles.serviceCard}>
                <div className={styles.serviceIcon}>{s.icon}</div>
                <h3 className={styles.serviceTitle}>{s.title}</h3>
                <p className={styles.serviceDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" className={styles.plans}>
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
                      <span className={styles.planCheck}>✓</span>
                      {f}
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

      {/* ── CTA BOTTOM ── */}
      <section className={styles.ctaBottom}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className={styles.ctaTitle}>Έτοιμοι να ξεκινήσετε;</h2>
          <Link to="/register" className="btn btn-primary btn-lg">
            Δημιουργία λογαριασμού — Δωρεάν
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className="container">
          <span className={styles.logo} style={{ fontSize: "1rem" }}>QRMenu</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>© 2026</span>
        </div>
      </footer>
    </div>
  );
}