// Επικοινωνία με το Node.js Lambda (menu-backend)
// URL από το 02_Cloud_Architecture_And_DevOps

const LAMBDA_URL = "https://jqh5mcshzzlag7z26d76elkf6u0vtgzw.lambda-url.eu-central-1.on.aws";

async function request(path, options = {}) {
  const token = localStorage.getItem("qrmenu_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${LAMBDA_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Κάτι πήγε στραβά");
  return data;
}

// ─── SaaS Auth ────────────────────────────────────────────────────────────────

export const register = ({ firstName, lastName, email, password, businessType, shopName, plan }) =>
  request("/register", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password, businessType, shopName, plan }),
  });

export const ownerLogin = ({ email, password }) =>
  request("/owner-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getOwnerDashboard = () =>
  request("/owner-dashboard");

export const checkSlug = (slug) =>
  request(`/check-slug?slug=${encodeURIComponent(slug)}`);

// ─── Menu Management ──────────────────────────────────────────────────────────

export const getFullData = ({ shopId, password }) =>
  request("/get-full-data", {
    method: "POST",
    body: JSON.stringify({ shopId, password }),
  });

// JWT-authenticated save — χρησιμοποιείται από το web portal
// Το Authorization header προστίθεται αυτόματα από τη request() helper
export const saveMenu = ({ shopId, data }) =>
  request("/save-menu", {
    method: "POST",
    body: JSON.stringify({ shopId, data }),
  });

// ─── Plan Management ──────────────────────────────────────────────────────────

export const upgradePlan = (newPlan) =>
  request("/upgrade-plan", {
    method: "POST",
    body: JSON.stringify({ newPlan }),
  });