const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT || 8787);
const DATA_FILE = path.join(__dirname, "data", "store.json");
const APP_ROOT = path.resolve(__dirname, "..");
const SESSION_LIMIT = 100;
const USER_ROLES = ["master", "finance", "pilot"];
const MANAGER_ROLES = new Set(["master", "finance"]);

ensureStore();

const server = http.createServer(async (request, response) => {
  setCors(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  const store = readStore();

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      return sendJson(response, 200, {
        ok: true,
        mode: "pilotpay-private-company-foundation",
        bootstrapRequired: store.users.length === 0,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/bootstrap/master") {
      if (store.users.length > 0) {
        return sendJson(response, 409, { error: "Master account already exists" });
      }

      const body = await readBody(request);
      const displayName = String(body.name || "").trim();
      const email = normalizeEmail(body.email);
      const password = String(body.password || "");

      const validation = validateCredentials({ displayName, email, password });
      if (validation) {
        return sendJson(response, 400, { error: validation });
      }

      const masterUser = {
        id: crypto.randomUUID(),
        name: displayName,
        email,
        passwordHash: hashPassword(password),
        role: "master",
        pilotId: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.users.push(masterUser);
      addAudit(store, masterUser.id, "user", masterUser.id, "master_bootstrapped", {
        email: masterUser.email,
      });
      writeStore(store);

      return sendJson(response, 201, {
        message: "Master account created",
        user: sanitizeUser(masterUser),
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readBody(request);
      const email = normalizeEmail(body.email);
      const password = String(body.password || "");
      const user = store.users.find((item) => item.email === email && item.isActive !== false);

      if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
        return sendJson(response, 401, { error: "Invalid email or password" });
      }

      const token = crypto.randomBytes(24).toString("hex");
      const session = {
        token,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };

      store.sessions = [session, ...store.sessions].slice(0, SESSION_LIMIT);
      writeStore(store);

      return sendJson(response, 200, {
        token,
        user: sanitizeUser(user),
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/forgot-password") {
      const body = await readBody(request);
      const email = normalizeEmail(body.email);
      const user = store.users.find((item) => item.email === email && item.isActive !== false);
      const reset = {
        id: crypto.randomUUID(),
        email,
        issuedAt: new Date().toISOString(),
        status: user ? "prepared" : "accepted",
      };
      store.passwordResets.unshift(reset);
      writeStore(store);
      return sendJson(response, 200, {
        message: user ? "Reset link prepared" : "If the account exists, a reset link will be sent",
      });
    }

    const session = authenticate(request, store);
    if (!session) {
      return sendJson(response, 401, { error: "Unauthorized" });
    }

    const user = store.users.find((item) => item.id === session.userId && item.isActive !== false);
    if (!user) {
      return sendJson(response, 401, { error: "Unauthorized" });
    }

    if (request.method === "GET" && url.pathname === "/api/session") {
      return sendJson(response, 200, {
        user: sanitizeUser(user),
        permissions: {
          canManageUsers: user.role === "master",
          canManageOperations: MANAGER_ROLES.has(user.role),
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/api/dashboard/summary") {
      requireRole(user, ["master", "finance", "pilot"]);
      return sendJson(response, 200, buildSummary(store, user));
    }

    if (request.method === "GET" && url.pathname === "/api/audit-logs") {
      requireRole(user, ["master", "finance"]);
      return sendJson(response, 200, store.auditLogs.slice(0, 50));
    }

    if (request.method === "GET" && url.pathname === "/api/users") {
      requireRole(user, ["master"]);
      return sendJson(response, 200, store.users.map(sanitizeUser));
    }

    if (request.method === "POST" && url.pathname === "/api/users") {
      requireRole(user, ["master"]);
      const body = await readBody(request);
      const role = String(body.role || "").trim().toLowerCase();
      const displayName = String(body.name || "").trim();
      const email = normalizeEmail(body.email);
      const password = String(body.password || "");
      const pilotId = body.pilotId ? String(body.pilotId) : null;

      if (!USER_ROLES.includes(role) || role === "master") {
        return sendJson(response, 400, { error: "Role must be finance or pilot" });
      }

      const validation = validateCredentials({ displayName, email, password });
      if (validation) {
        return sendJson(response, 400, { error: validation });
      }

      if (store.users.some((item) => item.email === email)) {
        return sendJson(response, 409, { error: "This email is already in use" });
      }

      if (role === "pilot" && !pilotId) {
        return sendJson(response, 400, { error: "Pilot accounts must be linked to a pilot profile" });
      }

      if (pilotId && !store.pilots.some((item) => item.id === pilotId)) {
        return sendJson(response, 404, { error: "Pilot not found" });
      }

      const account = {
        id: crypto.randomUUID(),
        name: displayName,
        email,
        passwordHash: hashPassword(password),
        role,
        pilotId: role === "pilot" ? pilotId : null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.users.push(account);
      addAudit(store, user.id, "user", account.id, "user_created", {
        email: account.email,
        role: account.role,
      });
      writeStore(store);
      return sendJson(response, 201, sanitizeUser(account));
    }

    if (request.method === "GET" && url.pathname === "/api/pilots") {
      requireRole(user, ["master", "finance", "pilot"]);
      const pilots = user.role === "pilot"
        ? store.pilots.filter((item) => item.id === user.pilotId)
        : store.pilots;
      return sendJson(response, 200, pilots);
    }

    if (request.method === "POST" && url.pathname === "/api/pilots") {
      requireRole(user, ["master", "finance"]);
      const body = await readBody(request);
      const name = String(body.name || "").trim();
      const email = normalizeEmail(body.email);
      const base = String(body.base || "").trim();
      const preferredCurrency = String(body.preferredCurrency || "EUR").trim().toUpperCase();

      if (!name || !email || !base) {
        return sendJson(response, 400, { error: "Name, email, and base are required" });
      }

      if (store.pilots.some((item) => item.email === email)) {
        return sendJson(response, 409, { error: "Pilot email already exists" });
      }

      const pilot = {
        id: crypto.randomUUID(),
        name,
        email,
        base,
        preferredCurrency,
        createdAt: new Date().toISOString(),
      };

      store.pilots.push(pilot);
      addAudit(store, user.id, "pilot", pilot.id, "pilot_created", { email: pilot.email });
      writeStore(store);
      return sendJson(response, 201, pilot);
    }

    if (request.method === "GET" && url.pathname === "/api/per-diems") {
      requireRole(user, ["master", "finance", "pilot"]);
      const entries = user.role === "pilot"
        ? store.perDiems.filter((item) => item.pilotId === user.pilotId)
        : store.perDiems;
      return sendJson(response, 200, entries);
    }

    if (request.method === "POST" && url.pathname === "/api/per-diems") {
      requireRole(user, ["master", "finance"]);
      const body = await readBody(request);
      const duplicate = store.perDiems.find((item) => item.pilotId === body.pilotId && item.date === body.date);
      if (duplicate) {
        return sendJson(response, 409, { error: "Duplicate per diem entry for that pilot and date" });
      }
      const entry = {
        id: crypto.randomUUID(),
        pilotId: String(body.pilotId || ""),
        date: String(body.date || ""),
        amount: Number(body.amount || 0),
        currency: String(body.currency || "").trim().toUpperCase(),
        notes: body.notes || "",
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      };
      if (!entry.pilotId || !entry.date || !entry.amount || !entry.currency) {
        return sendJson(response, 400, { error: "Pilot, date, amount, and currency are required" });
      }
      store.perDiems.push(entry);
      addAudit(store, user.id, "per_diem", entry.id, "per_diem_created", {
        pilotId: entry.pilotId,
        date: entry.date,
      });
      writeStore(store);
      return sendJson(response, 201, entry);
    }

    if (request.method === "GET" && url.pathname === "/api/payments") {
      requireRole(user, ["master", "finance", "pilot"]);
      const payments = user.role === "pilot"
        ? store.payments.filter((item) => item.pilotId === user.pilotId)
        : store.payments;
      return sendJson(response, 200, payments);
    }

    if (request.method === "POST" && url.pathname === "/api/payments") {
      requireRole(user, ["master", "finance"]);
      const body = await readBody(request);
      const payment = {
        id: crypto.randomUUID(),
        pilotId: String(body.pilotId || ""),
        date: String(body.date || ""),
        amount: Number(body.amount || 0),
        currency: String(body.currency || "").trim().toUpperCase(),
        notes: body.notes || "",
        recordedBy: user.id,
        createdAt: new Date().toISOString(),
      };
      if (!payment.pilotId || !payment.date || !payment.amount || !payment.currency) {
        return sendJson(response, 400, { error: "Pilot, date, amount, and currency are required" });
      }
      store.payments.push(payment);
      addAudit(store, user.id, "payment", payment.id, "payment_created", {
        pilotId: payment.pilotId,
        date: payment.date,
      });
      writeStore(store);
      return sendJson(response, 201, payment);
    }

    if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
      return serveStaticAsset(url.pathname, response);
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    if (error instanceof HttpError) {
      return sendJson(response, error.status, { error: error.message });
    }
    sendJson(response, 500, { error: "Internal server error", detail: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`PilotPay backend listening on http://localhost:${PORT}`);
});

function buildSummary(store, user) {
  const pilots = user.role === "pilot"
    ? store.pilots.filter((item) => item.id === user.pilotId)
    : store.pilots;
  const allowedPilotIds = new Set(pilots.map((item) => item.id));
  const perDiems = store.perDiems.filter((item) => allowedPilotIds.has(item.pilotId));
  const payments = store.payments.filter((item) => allowedPilotIds.has(item.pilotId));

  return {
    pilots: pilots.length,
    perDiemEntries: perDiems.length,
    payments: payments.length,
    users: user.role === "master" ? store.users.map(sanitizeUser) : undefined,
  };
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    pilotId: user.pilotId || null,
    isActive: user.isActive !== false,
  };
}

function authenticate(request, store) {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  return store.sessions.find((item) => item.token === token) || null;
}

function ensureStore() {
  const directory = path.dirname(DATA_FILE);
  fs.mkdirSync(directory, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        {
          users: [],
          pilots: [],
          perDiems: [],
          payments: [],
          sessions: [],
          passwordResets: [],
          auditLogs: [],
        },
        null,
        2
      )
    );
    return;
  }

  const store = readStore();
  const isLegacyDemo = store.users.length > 0 && store.users.every((user) => !user.passwordHash);
  if (isLegacyDemo) {
    store.users = [];
    store.sessions = [];
    store.passwordResets = [];
    store.auditLogs = [];
    writeStore(store);
  }
}

function readStore() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function addAudit(store, actorUserId, entityType, entityId, action, detail) {
  store.auditLogs.unshift({
    id: crypto.randomUUID(),
    actorUserId,
    entityType,
    entityId,
    action,
    detail,
    createdAt: new Date().toISOString(),
  });
  store.auditLogs = store.auditLogs.slice(0, 500);
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function serveStaticAsset(pathname, response) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const assetPath = path.normalize(path.join(APP_ROOT, safePath));
  if (!assetPath.startsWith(APP_ROOT)) {
    return sendJson(response, 403, { error: "Forbidden" });
  }

  if (!fs.existsSync(assetPath) || fs.statSync(assetPath).isDirectory()) {
    const fallbackPath = path.join(APP_ROOT, "index.html");
    return sendFile(response, fallbackPath, "text/html; charset=utf-8");
  }

  return sendFile(response, assetPath, contentTypeFor(assetPath));
}

function sendFile(response, filePath, contentType) {
  response.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(response);
}

function contentTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".js") return "application/javascript; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function validateCredentials({ displayName, email, password }) {
  if (!displayName) return "Name is required";
  if (!email || !email.includes("@")) return "A valid email is required";
  if (password.length < 10) return "Password must have at least 10 characters";
  return "";
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, savedHash] = String(storedHash || "").split(":");
  if (!salt || !savedHash) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(savedHash, "hex"));
}

function requireRole(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    throw new HttpError(403, "Forbidden");
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
