import { Link } from "react-router-dom";
import styles from "./Landing.module.css";

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* Noise texture overlay */}
      <div className={styles.noise} />

      {/* Navigate */}
      <nav className={styles.nav}>
        <div className="container" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span className={styles.logo}>QR<span>Menu</span></span>
          <div className={styles.navLinks}>
            <Link to="/login" className="btn btn-ghost btn-sm">Σύνδεση</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Ξεκινήστε Δωρεάν</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
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

        {/* Decorative grid lines */}
        <div className={styles.grid} aria-hidden="true">
          {[...Array(6)].map((_, i) => <div key={i} className={styles.gridLine} />)}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featureGrid}>
            {[
              { icon: "◈", title: "Ψηφιακό Μενού", desc: "QR code για τους πελάτες. Σάρωση → μενού → παραγγελία, σε δευτερόλεπτα." },
              { icon: "◎", title: "Real-time Παραγγελίες", desc: "Bar, Kitchen και Service βλέπουν ακριβώς αυτό που τους αφορά, ταυτόχρονα." },
              { icon: "◆", title: "Dashboard Ομάδας", desc: "Σερβιτόροι, αναλήψεις παραγγελιών, πληρωμές — όλα σε ένα web dashboard." },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className={styles.ctaBottom}>
        <div className="container" style={{ textAlign:"center" }}>
          <h2 className={styles.ctaTitle}>Έτοιμοι να ξεκινήσετε;</h2>
          <Link to="/register" className="btn btn-primary btn-lg">
            Δημιουργία λογαριασμού — Δωρεάν
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <span className={styles.logo} style={{ fontSize:"1rem" }}>QR<span>Menu</span></span>
          <span style={{ color:"var(--text-muted)", fontSize:"0.8rem" }}>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
