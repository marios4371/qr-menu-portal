import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { owner, shops, logout } = useAuth();
  const navigate = useNavigate();

  const shop = shops?.[0]; // for now 1 shop

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const LAMBDA_URL = "https://jqh5mcshzzlag7z26d76elkf6u0vtgzw.lambda-url.eu-central-1.on.aws";

  const menuUrl = shop?.shopSlug
  ? `${LAMBDA_URL}/menu/${shop.shopSlug}`
  : null;

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>QR<span>Menu</span></div>

        <nav className={styles.nav}>
          <a className={`${styles.navItem} ${styles.navActive}`}>
            <span>◎</span> Dashboard
          </a>
          <Link to="/menu-editor" className={styles.navItem}>
            <span>◈</span> Επεξεργασία Μενού
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.ownerInfo}>
            <div className={styles.ownerAvatar}>
              {owner?.firstName?.[0]}{owner?.lastName?.[0]}
            </div>
            <div>
              <div className={styles.ownerName}>{owner?.firstName} {owner?.lastName}</div>
              <div className={styles.ownerEmail}>{owner?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width:"100%", marginTop:12 }}>
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>Καλώς ήρθατε, {owner?.firstName}!</h1>
            <p className={styles.headingSub}>Διαχειριστείτε το μενού και τις παραγγελίες σας.</p>
          </div>
          <span className={styles.planBadge}>{owner?.plan || "FREE"}</span>
        </header>

        {/* Shop card */}
        {shop ? (
          <div className={`${styles.shopCard} fade-up`}>
            <div className={styles.shopCardHeader}>
              <div>
                <h2 className={styles.shopName}>{shop.shopName || shop.settings?.shopName}</h2>
                <span className={styles.shopType}>{shop.businessType}</span>
              </div>
              <span className={`${styles.statusBadge} ${styles.statusActive}`}>● Live</span>
            </div>

            <hr className="divider" />

            {/* Menu URL */}
            <div className={styles.urlRow}>
              <span className={styles.urlLabel}>URL Μενού</span>
              <div className={styles.urlBox}>
                <code>{menuUrl}</code>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigator.clipboard.writeText(menuUrl)}
                >
                  Αντιγραφή
                </button>
                {menuUrl && (
                  <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Άνοιγμα ↗
                  </a>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className={styles.stats}>
              {[
                { label: "Κατηγορίες",  value: shop.menu?.length ?? 0 },
                { label: "Προϊόντα",    value: shop.menu?.reduce((a, c) => a + (c.items?.length ?? 0), 0) ?? 0 },
                { label: "Παραγγελίες", value: "—" },
              ].map(s => (
                <div key={s.label} className={styles.statBox}>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card fade-up" style={{ textAlign:"center", padding:"48px 32px" }}>
            <p style={{ color:"var(--text-sub)", marginBottom:20 }}>Δεν βρέθηκε κατάστημα.</p>
          </div>
        )}

        {/* Quick actions */}
        <div className={styles.quickActions}>
          <Link to="/menu-editor" className={styles.actionCard}>
            <div className={styles.actionIcon}>◈</div>
            <div>
              <div className={styles.actionTitle}>Επεξεργασία Μενού</div>
              <div className={styles.actionDesc}>Προσθήκη κατηγοριών και προϊόντων</div>
            </div>
          </Link>

          <div className={styles.actionCard} onClick={() => {
            if (menuUrl) navigator.clipboard.writeText(menuUrl);
          }}>
            <div className={styles.actionIcon}>⬡</div>
            <div>
              <div className={styles.actionTitle}>Αντιγραφή URL Μενού</div>
              <div className={styles.actionDesc}>Μοιραστείτε το link με τους πελάτες</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
