// Επικοινωνία με το Node.js Lambda (menu-backend)
// URL από το 02_Cloud_Architecture_And_DevOps

const LAMBDA_URL = "https://jqh5mcshzzlag7z26d76elkf6u0vtgzw.lambda-url.eu-central-1.on.aws";

// Βάση URL για τα δημόσια μενού (GET /menu/:slug)
export const MENU_BASE_URL = "https://jqh5mcshzzlag7z26d76elkf6u0vtgzw.lambda-url.eu-central-1.on.aws";

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

export const saveAppearance = ({ shopId, theme }) =>
  request("/save-appearance", {
    method: "POST",
    body: JSON.stringify({ shopId, theme }),
  });

// ─── Plan Management ──────────────────────────────────────────────────────────

export const upgradePlan = (newPlan) =>
  request("/upgrade-plan", {
    method: "POST",
    body: JSON.stringify({ newPlan }),
  });

// ─── Legacy Shop Claim ────────────────────────────────────────────────────────

export const claimShop = ({ shopId, password }) =>
  request("/claim-shop", {
    method: "POST",
    body: JSON.stringify({ shopId, password }),
  });

// ─── Orders Analytics ─────────────────────────────────────────────────────────
// Builds a query-string from the filter object and calls GET /orders/analytics.
// Filters: { shopId, from, to, status, paymentStatus, tableNumber, source, minAmount }

export const getOrdersAnalytics = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") params.append(k, v);
  });
  return request(`/orders/analytics?${params.toString()}`);
};
// ─── Legacy Shop Claim ────────────────────────────────────────────────────────

export const claimShop = ({ shopId, password }) =>
  request("/claim-shop", {
    method: "POST",
    body: JSON.stringify({ shopId, password }),
  });

// ─── Orders Analytics ─────────────────────────────────────────────────────────
// Builds a query-string from the filter object and calls GET /orders/analytics.
// Filters: { shopId, from, to, status, paymentStatus, tableNumber, source, minAmount }

export const getOrdersAnalytics = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") params.append(k, v);
  });
  return request(`/orders/analytics?${params.toString()}`);
};
