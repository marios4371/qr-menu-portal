import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Dashboard.module.css";

const LAMBDA_URL = "https://jqh5mcshzzlag7z26d76elkf6u0vtgzw.lambda-url.eu-central-1.on.aws";

export default function Dashboard() {
  const { owner, shops, logout } = useAuth();
  const navigate = useNavigate();

  const shop = shops?.[0];

  const handleLogout = () => { logout(); navigate("/login"); };

  const menuUrl = shop?.shopSlug
    ? `${LAMBDA_URL}/menu/${shop.shopSlug}`
    : null;

  const totalProducts = shop?.menu?.reduce((a, c) => a + (c.items?.length ?? 0), 0) ?? 0;

  return (
    <div className={styles.layout}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>QRMenu</div>

        <nav className={styles.nav}>
          <a className={`${styles.navItem} ${styles.navActive}`}>Αρχική</a>
          <Link to="/menu-editor" className={styles.navItem}>Επεξεργασία Μενού</Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.ownerInfo}>
            <div className={styles.ownerAvatar}>
              {owner?.firstName?.[0]}{owner?.lastName?.[0]}
            </div>
            <div className={styles.ownerMeta}>
              <div className={styles.ownerName}>{owner?.firstName} {owner?.lastName}</div>
              <div className={styles.ownerEmail}>{owner?.email}</div>
            </div>
          </div>
          <button className={`btn btn-ghost btn-sm ${styles.logoutBtn}`} onClick={handleLogout}>
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.heading}>Αρχική</h1>
            <p className={styles.headingSub}>Επισκόπηση του καταστήματός σας.</p>
          </div>
          <span className={styles.planBadge}>{owner?.plan || "STANDARD"}</span>
        </div>

        {shop ? (
          <>
            {/* ── Shop info ── */}
            <div className={styles.shopInfo}>
              <div className={styles.shopInfoRow}>
                <span className={styles.shopInfoLabel}>Κατάστημα</span>
                <span className={styles.shopInfoValue}>{shop.shopName || shop.settings?.shopName}</span>
              </div>
              <div className={styles.shopInfoRow}>
                <span className={styles.shopInfoLabel}>Τύπος</span>
                <span className={styles.shopInfoValue}>{shop.businessType}</span>
              </div>
              <div className={styles.shopInfoRow}>
                <span className={styles.shopInfoLabel}>URL Μενού</span>
                <div className={styles.urlCell}>
                  <code className={styles.urlCode}>{menuUrl}</code>
                  <button
                    className={styles.copyBtn}
                    onClick={() => menuUrl && navigator.clipboard.writeText(menuUrl)}
                    title="Αντιγραφή"
                  >
                    Αντιγραφή
                  </button>
                  {menuUrl && (
                    <a href={menuUrl} target="_blank" rel="noopener noreferrer" className={styles.openBtn}>
                      Άνοιγμα ↗
                    </a>
                  )}
                </div>
              </div>
              <div className={styles.shopInfoRow}>
                <span className={styles.shopInfoLabel}>Κατηγορίες</span>
                <span className={styles.shopInfoValue}>{shop.menu?.length ?? 0}</span>
              </div>
              <div className={styles.shopInfoRow}>
                <span className={styles.shopInfoLabel}>Προϊόντα</span>
                <span className={styles.shopInfoValue}>{totalProducts}</span>
              </div>
            </div>

            {/* ── Menu overview ── */}
            {shop.menu && shop.menu.length > 0 ? (
              <div className={styles.menuOverview}>
                <div className={styles.menuOverviewHeader}>
                  <span className={styles.menuOverviewTitle}>Μενού</span>
                  <Link to="/menu-editor" className="btn btn-ghost btn-sm">Επεξεργασία</Link>
                </div>

                {shop.menu.map((cat) => (
                  <div key={cat.id || cat.name} className={styles.catBlock}>
                    <div className={styles.catBlockHeader}>
                      <span className={styles.catBlockName}>{cat.name || cat.title}</span>
                      <span className={styles.catBlockCount}>{cat.items?.length ?? 0} προϊόντα</span>
                    </div>
                    {cat.items && cat.items.length > 0 && (
                      <div className={styles.catBlockItems}>
                        {cat.items.map((item) => (
                          <div key={item.id || item.name} className={styles.itemRow}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemStation}>{item.station}</span>
                            <span className={styles.itemPrice}>
                              {item.price != null && item.price !== ""
                                ? `${Number(item.price).toFixed(2)} €`
                                : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyMenu}>
                <p>Το μενού σας είναι κενό.</p>
                <Link to="/menu-editor" className="btn btn-primary" style={{ marginTop: 16 }}>
                  Προσθήκη κατηγοριών
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyMenu}>
            <p>Δεν βρέθηκε κατάστημα.</p>
          </div>
        )}
      </main>
    </div>
  );
}