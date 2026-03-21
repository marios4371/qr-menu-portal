import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { upgradePlan } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import styles from "./Dashboard.module.css";
import layout from "./Layout.module.css";

const LAMBDA_URL = "https://jqh5mcshzzlag7z26d76elkf6u0vtgzw.lambda-url.eu-central-1.on.aws";

export default function Dashboard() {
  const { owner, shops, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedShopIdx, setSelectedShopIdx] = useState(0);
  const shop     = shops?.[selectedShopIdx] ?? shops?.[0];
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planLoading, setPlanLoading]     = useState(false);
  const [planError, setPlanError]         = useState("");
  const [planSuccess, setPlanSuccess]     = useState("");

  const handleLogout = () => { logout(); navigate("/login"); };

  const menuUrl = shop?.shopSlug
    ? `${LAMBDA_URL}/menu/${shop.shopSlug}`
    : null;

  const totalCategories = shop?.menu?.length ?? 0;
  const totalProducts   = shop?.menu?.reduce((a, c) => a + (c.items?.length ?? 0), 0) ?? 0;

  return (
    <div className={layout.layout}>

      {/* ── SIDEBAR ── */}
      <aside className={layout.sidebar}>
        <div className={layout.sidebarLogo}>QRMenu</div>

        <nav className={layout.nav}>
          <a className={`${layout.navItem} ${layout.navActive}`}>Αρχική</a>
          <Link to="/menu-editor" className={layout.navItem}>Επεξεργασία Μενού</Link>
        </nav>

        <div className={layout.sidebarFooter}>
          <div className={layout.ownerInfo}>
            <div className={layout.ownerAvatar}>
              {owner?.firstName?.[0]}{owner?.lastName?.[0]}
            </div>
            <div className={layout.ownerInfoText}>
              <div className={layout.ownerName}>{owner?.firstName} {owner?.lastName}</div>
              <div className={layout.ownerEmail}>{owner?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width:"100%", marginTop:12 }}>
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={layout.main}>

        {/* Header */}
        <header className={layout.header}>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div>
              <h1 className={layout.heading}>Καλώς ήρθατε, {owner?.firstName}.</h1>
              <p className={layout.headingSub}>Επισκόπηση του καταστήματός σας.</p>
            </div>
            {shops && shops.length > 0 && (
              <div className={styles.shopDropdownWrap}>
                <span className={styles.shopDropdownLabel}>Επιλογή Καταστήματος</span>
                <select
                  className={styles.shopDropdownSelect}
                  value={selectedShopIdx}
                  onChange={e => setSelectedShopIdx(Number(e.target.value))}
                >
                  {shops.map((s, i) => (
                    <option key={s.shop_id} value={i}>
                      {s.shopName || s.settings?.shopName || s.shop_id}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <span className={styles.planBadge}>{owner?.plan || "STANDARD"} Πακέτο</span>
        </header>

        {shop ? (
          <>
            {/* ── TOP ROW ── */}
            <div className={styles.topRow}>

              {/* Shop card */}
              <div className={styles.shopCard}>
                <div className={styles.shopCardTop}>
                  <div>
                    <div className={styles.shopLabel}>Κατάστημα</div>
                    <h2 className={styles.shopName}>{shop.shopName || shop.settings?.shopName}</h2>
                    <span className={styles.shopType}>{shop.businessType}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles.statusActive}`}>● Live</span>
                </div>

                <div className={styles.urlBlock}>
                  <div className={styles.urlLabel}>URL Μενού</div>
                  <div className={styles.urlRow}>
                    <code className={styles.urlCode}>{menuUrl}</code>
                    <div className={styles.urlActions}>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(menuUrl)}>
                        Αντιγραφή
                      </button>
                      {menuUrl && (
                        <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                          Άνοιγμα ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats column */}
              <div className={styles.statsCol}>
                {[
                  { label: "Κατηγορίες",  value: totalCategories },
                  { label: "Προϊόντα",    value: totalProducts },
                  { label: "Παραγγελίες", value: "—" },
                ].map(s => (
                  <div key={s.label} className={styles.statCard}>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── MENU PREVIEW ── */}
            <div className={styles.menuSection}>
              <div className={styles.menuSectionHeader}>
                <div>
                  <div className={styles.sectionLabel}>Μενού</div>
                  <h3 className={styles.sectionTitle}>
                    {totalCategories
                      ? `${totalCategories} κατηγορίες · ${totalProducts} προϊόντα`
                      : "Δεν υπάρχουν κατηγορίες ακόμα"}
                  </h3>
                </div>
                <Link to="/menu-editor" className="btn btn-primary btn-sm">
                  Επεξεργασία →
                </Link>
              </div>

              {totalCategories > 0 ? (
                <div className={styles.menuGrid}>
                  {shop.menu.map((cat) => (
                    <div key={cat.id || cat.name} className={styles.catCard}>
                      <div className={styles.catHeader}>
                        <span className={styles.catName}>{cat.name || cat.title}</span>
                        <span className={styles.catCount}>{cat.items?.length ?? 0}</span>
                      </div>
                      <ul className={styles.productList}>
                        {(cat.items || []).slice(0, 5).map((item) => (
                          <li key={item.id || item.name} className={styles.productItem}>
                            <span className={styles.productName}>{item.name}</span>
                            <span className={styles.productPrice}>
                              {item.price != null && item.price !== ""
                                ? `${Number(item.price).toFixed(2)} €`
                                : "—"}
                            </span>
                          </li>
                        ))}
                        {(cat.items?.length ?? 0) > 5 && (
                          <li className={styles.productMore}>
                            +{cat.items.length - 5} ακόμα
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyMenu}>
                  <p>Δεν έχετε προσθέσει κατηγορίες ακόμα.</p>
                  <Link to="/menu-editor" className="btn btn-primary" style={{ marginTop:16 }}>
                    Ξεκινήστε την επεξεργασία
                  </Link>
                </div>
              )}
            </div>
            {/* ── PLAN SECTION ── */}
            <div className={styles.planSection}>
              <div className={styles.planSectionHeader}>
                <div>
                  <div className={styles.sectionLabel}>Πλάνο Συνδρομής</div>
                  <h3 className={styles.sectionTitle}>
                    {owner?.plan || "STANDARD"} Πακέτο
                  </h3>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowPlanModal(true); setPlanError(""); setPlanSuccess(""); }}>
                  Αλλαγή πλάνου →
                </button>
              </div>
            </div>

            {/* ── PLAN MODAL ── */}
            {showPlanModal && (
              <div className={styles.modalOverlay} onClick={() => setShowPlanModal(false)}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>Αλλαγή πλάνου συνδρομής</span>
                    <button className={styles.modalClose} onClick={() => setShowPlanModal(false)}>✕</button>
                  </div>
                  <div className={styles.modalBody}>
                    <p className={styles.modalSub}>Τρέχον πλάνο: <strong>{owner?.plan}</strong></p>
                    <div className={styles.planChoiceGrid}>
                      {[
                        { value: "STANDARD",  name: "Standard",  price: "12,00 €/μήνα" },
                        { value: "PREMIUM",   name: "Premium",   price: "16,70 €/μήνα" },
                        { value: "EXCLUSIVE", name: "Exclusive", price: "25,00 €/μήνα" },
                      ].map(p => (
                        <button
                          key={p.value}
                          className={`${styles.planChoiceCard} ${owner?.plan === p.value ? styles.planChoiceCurrent : ""}`}
                          onClick={() => handlePlanChange(p.value)}
                          disabled={planLoading || owner?.plan === p.value}
                        >
                          <div className={styles.planChoiceName}>{p.name}</div>
                          <div className={styles.planChoicePrice}>{p.price}</div>
                          {owner?.plan === p.value && <div className={styles.planChoiceBadge}>Τρέχον</div>}
                        </button>
                      ))}
                    </div>
                    {planError   && <div className="msg-error"   style={{ marginTop:14 }}>{planError}</div>}
                    {planSuccess && <div className="msg-success" style={{ marginTop:14 }}>{planSuccess}</div>}
                    <p className={styles.planChoiceNote}>
                      Για Custom πλάνο επικοινωνήστε μαζί μας.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Δεν βρέθηκε κατάστημα.</p>
          </div>
        )}
      </main>
    </div>
  );
}