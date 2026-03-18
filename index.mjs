import { getShopData, saveShopData, isSlugAvailable, createShop, getOwnerByEmail, getOwnerById, createOwner, addShopToOwner } from './db.mjs';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import path from 'path';

// --- S3 SETTINGS ---
const REGION      = "eu-central-1";
const BUCKET_NAME = "qr-templates-io";

// --- JWT / PASSWORD SETTINGS ---
// JWT_SECRET ορίζεται ως Lambda Environment Variable στο Terraform.
// Αν δεν υπάρχει (local dev), χρησιμοποιείται fallback — ΔΕΝ πρέπει να φτάσει σε production.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.warn("[WARN] JWT_SECRET is not set. Using insecure fallback.");
const SECRET = JWT_SECRET || "CHANGE_ME_LOCAL_DEV_ONLY";

const scryptAsync = promisify(scrypt);

const s3 = new S3Client({ region: REGION });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

// ─────────────────────────────────────────
//  CRYPTO HELPERS  (zero external deps)
//  Χρησιμοποιούν μόνο Node.js 20 built-in
// ─────────────────────────────────────────

/**
 * Κάνει hash το password με scrypt + random salt.
 * Format αποθήκευσης: "<salt_hex>:<hash_hex>"
 */
async function hashPassword(password) {
  const salt       = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Επαληθεύει password έναντι αποθηκευμένου hash.
 * Χρησιμοποιεί timingSafeEqual για αποτροπή timing attacks.
 */
async function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  try {
    const derivedKey  = await scryptAsync(password, salt, 64);
    const storedBuffer = Buffer.from(key, "hex");
    // Τα buffers πρέπει να έχουν ίδιο μέγεθος για timingSafeEqual
    if (derivedKey.length !== storedBuffer.length) return false;
    return timingSafeEqual(derivedKey, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Δημιουργεί ένα signed JWT (HS256) χωρίς εξωτερικές βιβλιοθήκες.
 */
function signJWT(payload, expiresInDays = 7) {
  const header  = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp     = Math.floor(Date.now() / 1000) + expiresInDays * 86400;
  const body    = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const sig     = createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

/**
 * Επαληθεύει και αποκωδικοποιεί ένα JWT.
 * Πετά Error αν είναι invalid ή expired.
 */
function verifyJWT(token) {
  if (!token) throw new Error("No token provided");
  const parts = (token.startsWith("Bearer ") ? token.slice(7) : token).split(".");
  if (parts.length !== 3) throw new Error("Malformed token");
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  if (sig !== expected) throw new Error("Invalid signature");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expired");
  return payload;
}

/**
 * Μετατρέπει ένα shop name σε URL-safe slug.
 * Χειρίζεται ελληνικούς χαρακτήρες και diacritics.
 * Παράδειγμα: "Souvlaki tou Νίκου!" → "souvlaki-tou-nikou"
 */
function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")                      // αποσύνθεση diacritics (π.χ. ά → α + combining accent)
    .replace(/[\u0300-\u036f]/g, "")       // αφαίρεση combining marks
    .replace(/[^a-z0-9\s-]/g, "")         // κράτα μόνο alphanumeric, spaces, hyphens
    .trim()
    .replace(/\s+/g, "-")                  // spaces → hyphens
    .replace(/-+/g, "-")                   // collapse consecutive hyphens
    .substring(0, 50);
}

// ─────────────────────────────────────────
//  S3 STREAM HELPERS
// ─────────────────────────────────────────

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

const streamToBase64 = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
  });

// ─────────────────────────────────────────
//  CORS HEADERS
// ─────────────────────────────────────────
// Χρειάζονται στα SaaS API endpoints που καλούνται από browser (web portal).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "content-type":                 "application/json",
};

// ─────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────

async function router(method, rawPath, bodyStr, queryString, headers) {
  let reqPath = rawPath || "/";

  const prefixes = ["/default", "/test", "/prod"];
  for (const prefix of prefixes) {
    if (reqPath.startsWith(prefix)) {
      if (reqPath === prefix) reqPath = "/";
      else if (reqPath.startsWith(prefix + "/")) reqPath = reqPath.substring(prefix.length);
    }
  }

  reqPath = reqPath.split("?")[0];
  if (reqPath === "/" || reqPath === "") reqPath = "/template.html";

  console.log(`[ROUTER] Method: ${method}, Path: ${reqPath}`);

  // OPTIONS preflight (απαραίτητο για CORS)
  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  // ─── API ENDPOINTS ───────────────────────────────────────────────────────────
  try {

    // ─── GET ENDPOINTS ──────────────────────────────────────────────────────────

    if (method === "GET") {

      // GET /get-menu  (υπάρχον — αναλλοίωτο)
      if (reqPath.endsWith("/get-menu")) {
        const id   = queryString.shopId || queryString.shop;
        const data = await getShopData(id);
        if (!data) {
          return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Shop not found" }) };
        }
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ menu: data.menu, settings: data.settings, features: data.features, theme: data.theme }),
        };
      }

      // GET /check-slug?slug=X  (νέο — SaaS)
      // Public endpoint. Ελέγχει αν ένα shopSlug είναι διαθέσιμο σε real-time.
      if (reqPath.endsWith("/check-slug")) {
        const slug = queryString.slug?.toLowerCase().trim();
        if (!slug || slug.length < 2) {
          return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Slug too short" }) };
        }
        const safeSlug  = slugify(slug);
        const available = await isSlugAvailable(safeSlug);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ available, slug: safeSlug }),
        };
      }

      // GET /owner-dashboard  (νέο — SaaS, Protected)
      // Απαιτεί JWT στο Authorization header.
      if (reqPath.endsWith("/owner-dashboard")) {
        let payload;
        try {
          payload = verifyJWT(headers.authorization || headers.Authorization || "");
        } catch (jwtErr) {
          return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized: " + jwtErr.message }) };
        }

        const owner = await getOwnerById(payload.ownerId);
        if (!owner) {
          return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Owner not found" }) };
        }

        // Φόρτωσε τα shop data για κάθε shopId που ανήκει στον owner
        const shops = await Promise.all(
          (owner.shopIds || []).map((sid) => getShopData(sid))
        );

        // Μην επιστρέφεις ποτέ το hashedPassword στο response
        const { hashedPassword: _omit, ...safeOwner } = owner;
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ owner: safeOwner, shops: shops.filter(Boolean) }),
        };
      }
    }

    // ─── POST ENDPOINTS ─────────────────────────────────────────────────────────

    if (method === "POST") {
      const body = bodyStr ? JSON.parse(bodyStr) : {};

      // POST /login  (υπάρχον menuadmin — ΑΝΑΒΑΘΜΙΣΗ σε scrypt)
      // ΣΗΜΑΝΤΙΚΟ: Το παλιό login χρησιμοποιούσε plain-text password σύγκριση.
      // Κατά τη μετάβαση στο SaaS, τα παλιά shop records έχουν ακόμα plain password.
      // Η λογική κάνει fallback σε plain-text comparison για backward compatibility.
      if (reqPath.endsWith("/login")) {
        const { shopId, shop_id, password } = body;
        const finalId = shopId || shop_id;
        const data    = await getShopData(finalId);
        if (!data) {
          return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ success: false, error: "Credentials mismatch" }) };
        }
        // Backward compat: αν το password δεν έχει το format "salt:hash", κάνε plain compare
        const isHashed = data.password?.includes(":");
        const valid    = isHashed
          ? await verifyPassword(password, data.password)
          : data.password === password;

        if (valid) {
          return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
        }
        return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ success: false, error: "Credentials mismatch" }) };
      }

      // POST /save-menu
      // Δέχεται δύο τρόπους auth:
      //   Α) JWT (Authorization header) — από το web portal (SaaS)
      //   Β) shopId + password — legacy, για το React Native menuadmin
      if (reqPath.endsWith("/save-menu")) {
        const { shopId, shop_id, password, data } = body;
        const finalId = shopId || shop_id;
        if (!finalId) {
          return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "shopId is required" }) };
        }

        const current = await getShopData(finalId);
        if (!current) {
          return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Shop not found" }) };
        }

        // ── Τρόπος Α: JWT auth (web portal) ──────────────────────────────────
        const authHeader = headers.authorization || headers.Authorization || "";
        if (authHeader.startsWith("Bearer ")) {
          let payload;
          try {
            payload = verifyJWT(authHeader);
          } catch (jwtErr) {
            return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid token: " + jwtErr.message }) };
          }
          // Βεβαιώσου ότι το shopId ανήκει στον owner που έκανε login
          if (!payload.shopIds?.includes(finalId)) {
            return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Forbidden: shop does not belong to this owner" }) };
          }
          const toSave = { ...current, ...data, shop_id: finalId, password: current.password };
          delete toSave.shopId;
          await saveShopData(toSave);
          return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
        }

        // ── Τρόπος Β: Legacy password auth (React Native menuadmin) ──────────
        const isHashed = current.password?.includes(":");
        const valid    = isHashed
          ? await verifyPassword(password, current.password)
          : current.password === password;

        if (valid) {
          const toSave = { ...current, ...data, shop_id: finalId, password: current.password };
          delete toSave.shopId;
          await saveShopData(toSave);
          return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
        }
        return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
      }

      // POST /get-full-data  (υπάρχον — αναλλοίωτο)
      if (reqPath.endsWith("/get-full-data")) {
        const { shopId, shop_id, password } = body;
        const finalId = shopId || shop_id;
        const data    = await getShopData(finalId);
        if (!data) {
          return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "Shop not found" }) };
        }
        const isHashed = data.password?.includes(":");
        const valid    = isHashed
          ? await verifyPassword(password, data.password)
          : data.password === password;

        if (valid) {
          return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ menu: data.menu, settings: data.settings }) };
        }
        return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unauthorized" }) };
      }

      // ── POST /register  (νέο — SaaS) ──────────────────────────────────────────
      // Δημιουργεί owner + shop + empty menu σε 3 βήματα.
      // Βήμα 1: Validate input
      // Βήμα 2: Έλεγχος duplicate email + slug
      // Βήμα 3: Γράψε owners → menus → update owner.shopIds
      if (reqPath.endsWith("/register")) {
        const { firstName, lastName, email, password, businessType, shopName } = body;

        // Validation
        const missing = ["firstName", "lastName", "email", "password", "businessType", "shopName"]
          .filter((f) => !body[f]?.trim());
        if (missing.length > 0) {
          return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Missing fields: ${missing.join(", ")}` }) };
        }
        if (password.length < 8) {
          return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Password must be at least 8 characters" }) };
        }

        const cleanEmail = email.toLowerCase().trim();

        // Duplicate email check (μέσω GSI)
        const existingOwner = await getOwnerByEmail(cleanEmail);
        if (existingOwner) {
          return { statusCode: 409, headers: CORS_HEADERS, body: JSON.stringify({ error: "Email already registered" }) };
        }

        // Slug generation + uniqueness check
        const shopSlug = slugify(shopName);
        if (shopSlug.length < 2) {
          return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Shop name too short or contains only special characters" }) };
        }
        const slugFree = await isSlugAvailable(shopSlug);
        if (!slugFree) {
          return { statusCode: 409, headers: CORS_HEADERS, body: JSON.stringify({ error: `Shop URL "${shopSlug}" is already taken. Please choose a different name.` }) };
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate IDs
        const ownerId  = `OWNER#${randomBytes(16).toString("hex")}`;
        // shop_id ακολουθεί το ίδιο format με τα υπάρχοντα shops για συμβατότητα
        const shopId   = `SHOP#${randomBytes(16).toString("hex")}`;
        const now      = new Date().toISOString();

        // Δημιούργησε owner record
        await createOwner({
          ownerId,
          email:          cleanEmail,
          hashedPassword,
          firstName:      firstName.trim(),
          lastName:       lastName.trim(),
          businessType:   businessType.toUpperCase(),
          shopIds:        [shopId],
          plan:           "FREE",
          status:         "ACTIVE",
          createdAt:      now,
        });

        // Δημιούργησε shop record στον menus πίνακα
        // Η δομή ακολουθεί ακριβώς τα υπάρχοντα shop records
        await createShop({
          shop_id:      shopId,
          ownerId,
          shopSlug,
          shopName:     shopName.trim(),
          businessType: businessType.toUpperCase(),
          customDomain: null,       // Phase 2
          password:     hashedPassword,
          createdAt:    now,
          // Αρχικά κενό menu — ο owner θα το συμπληρώσει στο Menu Builder
          menu:         [],
          settings: {
            shopName:   shopName.trim(),
            shopSlug,
          },
          features: {
            customerOrdering: false, // Ενεργοποιείται αργότερα
          },
          theme: {
            primaryColor: "#000000",
          },
        });

        // Δημιούργησε JWT για immediate login μετά το registration
        const token = signJWT({ ownerId, shopIds: [shopId] });

        console.log(`[REGISTER] New owner created: ${ownerId}, shop: ${shopId}, slug: ${shopSlug}`);

        return {
          statusCode: 201,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success:  true,
            ownerId,
            shopId,
            shopSlug,
            menuUrl:  `/menu/${shopSlug}`,
            token,
          }),
        };
      }

      // ── POST /owner-login  (νέο — SaaS) ────────────────────────────────────────
      // ΔΙΑΦΟΡΕΤΙΚΟ από το /login: αυτό δέχεται email + password (όχι shopId + password)
      // και επιστρέφει JWT αντί για plain success boolean.
      if (reqPath.endsWith("/owner-login")) {
        const { email, password } = body;
        if (!email || !password) {
          return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Email and password are required" }) };
        }

        const owner = await getOwnerByEmail(email.toLowerCase().trim());
        if (!owner) {
          // Σκόπιμα ίδιο μήνυμα — δεν αποκαλύπτουμε αν το email υπάρχει
          return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid credentials" }) };
        }

        if (owner.status === "SUSPENDED") {
          return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: "Account suspended" }) };
        }

        const valid = await verifyPassword(password, owner.hashedPassword);
        if (!valid) {
          return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid credentials" }) };
        }

        const token = signJWT({ ownerId: owner.ownerId, shopIds: owner.shopIds });

        console.log(`[OWNER-LOGIN] Successful login: ${owner.ownerId}`);

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            token,
            owner: {
              ownerId:      owner.ownerId,
              firstName:    owner.firstName,
              lastName:     owner.lastName,
              email:        owner.email,
              businessType: owner.businessType,
              shopIds:      owner.shopIds,
              plan:         owner.plan,
            },
          }),
        };
      }
    }

  } catch (error) {
    console.error("Handler Error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }

  // ─── S3 FILE SERVING  (υπάρχον — αναλλοίωτο) ────────────────────────────────

  let shopId = queryString.shop;

  if (!shopId && headers?.referer) {
    try {
      const refererUrl = new URL(headers.referer);
      shopId = new URLSearchParams(refererUrl.search).get("shop");
    } catch { /* ignore */ }
  }

  if (!shopId) {
    return {
      statusCode: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: `
        <!DOCTYPE html>
        <html lang="el">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Μενού μη διαθέσιμο</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                   display: flex; flex-direction: column; align-items: center; justify-content: center;
                   height: 100vh; margin: 0; background-color: #f8f9fa; color: #333; text-align: center; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            p  { color: #666; margin-bottom: 20px; }
            svg { width: 64px; height: 64px; margin-bottom: 20px; color: #dc3545; }
          </style>
        </head>
        <body>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <h1>Το μενού δεν βρέθηκε</h1>
          <p>Παρακαλούμε σκανάρετε ξανά το QR Code του καταστήματος.</p>
        </body>
        </html>`,
    };
  }

  let s3File = reqPath.startsWith("/") ? reqPath.substring(1) : reqPath;
  if (s3File === "%7Bproxy+%7D" || s3File === "{proxy+}") s3File = "template.html";

  const s3Key = `${shopId}/${s3File}`;
  const ext   = path.extname(reqPath).toLowerCase();

  console.log(`[S3] Fetching Key: ${s3Key}`);

  try {
    const command  = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key });
    const response = await s3.send(command);
    const contentType = MIME[ext] || "application/octet-stream";

    if (ext === ".html") {
      let htmlContent  = await streamToString(response.Body);
      const finalShopId = queryString.shop || shopId;
      const shopData    = await getShopData(finalShopId);
      if (shopData) {
        const injectionScript = `<script>window.SHOP_DATA = ${JSON.stringify(shopData)};</script>`;
        htmlContent = htmlContent.replace("</body>", `${injectionScript}</body>`);
        htmlContent = htmlContent.replace('href="style.css"', `href="style.css?shop=${finalShopId}"`);
      }
      return { statusCode: 200, headers: { "content-type": contentType }, body: htmlContent };
    } else if ([".png", ".jpg", ".jpeg", ".ico"].includes(ext)) {
      const base64Data = await streamToBase64(response.Body);
      return { statusCode: 200, headers: { "content-type": contentType }, body: base64Data, isBase64Encoded: true };
    } else {
      const textData = await streamToString(response.Body);
      return { statusCode: 200, headers: { "content-type": contentType }, body: textData };
    }
  } catch (error) {
    console.error("S3 Error:", error);
    if (error.name === "NoSuchKey") {
      return { statusCode: 404, headers: { "content-type": "text/plain" }, body: `File not found: ${s3Key}` };
    }
    return { statusCode: 500, headers: { "content-type": "text/plain" }, body: `S3 Error: ${error.message}` };
  }
}

// ─────────────────────────────────────────
//  LAMBDA HANDLER  (entry point)
// ─────────────────────────────────────────

export const handler = async (event) => {
  const method  = event.requestContext?.http?.method || event.httpMethod || "GET";
  const reqPath = event.rawPath || event.path || "/";
  const qs      = event.queryStringParameters || {};
  const headers = event.headers || {};

  try {
    const bodyStr = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf-8")
      : (event.body || "");

    const result = await router(method, reqPath, bodyStr, qs, headers);

    return {
      statusCode:      result.statusCode,
      headers:         result.headers || {},
      body:            result.body ?? "",
      isBase64Encoded: result.isBase64Encoded || false,
    };
  } catch (err) {
    console.error("UNHANDLED ERROR:", err);
    return {
      statusCode: 500,
      headers:    { "content-type": "application/json" },
      body:       JSON.stringify({ success: false, error: "Internal error" }),
    };
  }
};
