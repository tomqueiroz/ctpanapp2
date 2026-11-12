import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_CONFIG_PATH =
  process.platform === "win32"
    ? "C:\\ProgramData\\CTPANAPP\\gateway-config.json"
    : resolve("gateway-config.json");

function loadConfig() {
  const configPath = process.env.CTP_GATEWAY_CONFIG || DEFAULT_CONFIG_PATH;
  const parsed = JSON.parse(readFileSync(configPath, "utf8"));
  const required = [
    "redeClientId",
    "redeClientSecret",
    "redePv",
    "hmacSecret",
    "idempotencyFile",
  ];
  for (const key of required) {
    if (typeof parsed[key] !== "string" || parsed[key].trim() === "") {
      throw new Error(`Missing required configuration: ${key}`);
    }
  }
  if (parsed.hmacSecret.length < 43) {
    throw new Error("hmacSecret must contain at least 256 bits of entropy");
  }
  return {
    host: parsed.host || "127.0.0.1",
    port: Number(parsed.port || 8080),
    environment: parsed.environment === "sandbox" ? "sandbox" : "production",
    redeClientId: parsed.redeClientId.trim(),
    redeClientSecret: parsed.redeClientSecret.trim(),
    redePv: parsed.redePv.replace(/^0+/, ""),
    hmacSecret: parsed.hmacSecret,
    idempotencyFile: parsed.idempotencyFile,
    maxClockSkewMs: Number(parsed.maxClockSkewMs || 300_000),
  };
}

const config = loadConfig();
const rede =
  config.environment === "sandbox"
    ? {
        tokenUrl:
          "https://rl7-sandbox-api.useredecloud.com.br/oauth2/token",
        transactionUrl:
          "https://sandbox-erede.useredecloud.com.br/v2/transactions",
      }
    : {
        tokenUrl: "https://api.userede.com.br/redelabs/oauth2/token",
        transactionUrl: "https://api.userede.com.br/erede/v2/transactions",
      };

let tokenCache = null;
const nonceCache = new Map();
const rateLimits = new Map();
const idempotencyStore = loadIdempotencyStore();

function loadIdempotencyStore() {
  try {
    if (!existsSync(config.idempotencyFile)) return {};
    const parsed = JSON.parse(readFileSync(config.idempotencyFile, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    throw new Error("Unable to read the idempotency store");
  }
}

function persistIdempotencyStore() {
  mkdirSync(dirname(config.idempotencyFile), { recursive: true });
  const temporaryPath = `${config.idempotencyFile}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(idempotencyStore), {
    encoding: "utf8",
    mode: 0o600,
  });
  renameSync(temporaryPath, config.idempotencyFile);
}

function pruneCaches() {
  const now = Date.now();
  const twoDaysAgo = now - 48 * 60 * 60 * 1_000;
  for (const [nonce, expiresAt] of nonceCache.entries()) {
    if (expiresAt <= now) nonceCache.delete(nonce);
  }
  for (const [key, value] of Object.entries(idempotencyStore)) {
    if (!value || Number(value.createdAt || 0) < twoDaysAgo) {
      delete idempotencyStore[key];
    }
  }
  for (const [key, value] of rateLimits.entries()) {
    if (value.resetAt <= now) rateLimits.delete(key);
  }
}

setInterval(pruneCaches, 10 * 60 * 1_000).unref();

function logEvent(event, fields = {}) {
  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(
      ([key]) => !/(card|cvv|security|secret|token|authorization)/i.test(key),
    ),
  );
  process.stdout.write(
    `${JSON.stringify({
      time: new Date().toISOString(),
      event,
      ...safeFields,
    })}\n`,
  );
}

function sendJson(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(payload);
}

function readBody(request, maximumBytes = 12_000) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maximumBytes) {
        rejectBody(new GatewayError("PAYLOAD_TOO_LARGE", 413));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolveBody(Buffer.concat(chunks)));
    request.on("error", rejectBody);
  });
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function constantTimeEqual(expected, actual) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

function verifyHmac(request, rawBody) {
  const timestamp = request.headers["x-ctp-timestamp"];
  const nonce = request.headers["x-ctp-nonce"];
  const signature = request.headers["x-ctp-signature"];
  if (
    typeof timestamp !== "string" ||
    typeof nonce !== "string" ||
    typeof signature !== "string"
  ) {
    throw new GatewayError("AUTH_HEADERS_REQUIRED", 401);
  }
  const timestampMs = Number(timestamp);
  if (
    !Number.isFinite(timestampMs) ||
    Math.abs(Date.now() - timestampMs) > config.maxClockSkewMs
  ) {
    throw new GatewayError("AUTH_TIMESTAMP_INVALID", 401);
  }
  if (
    !/^[0-9a-f-]{36}$/i.test(nonce) ||
    nonceCache.has(nonce)
  ) {
    throw new GatewayError("AUTH_NONCE_INVALID", 401);
  }
  const path = new URL(request.url, "http://gateway.local").pathname;
  const signedValue = [
    timestamp,
    nonce,
    request.method,
    path,
    sha256(rawBody),
  ].join("\n");
  const expected = createHmac("sha256", config.hmacSecret)
    .update(signedValue)
    .digest("base64url");
  if (!constantTimeEqual(expected, signature)) {
    throw new GatewayError("AUTH_SIGNATURE_INVALID", 401);
  }
  nonceCache.set(nonce, Date.now() + config.maxClockSkewMs);
}

function enforceRateLimit(request, category, limit) {
  const forwarded = request.headers["x-forwarded-for"];
  const remoteAddress =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : request.socket.remoteAddress || "unknown";
  const key = `${category}:${remoteAddress}`;
  const now = Date.now();
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }
  current.count += 1;
  if (current.count > limit) {
    throw new GatewayError("RATE_LIMITED", 429);
  }
}

function digits(value) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function passesLuhn(value) {
  let sum = 0;
  let doubleDigit = false;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function normalizedHolderName(value) {
  return typeof value === "string"
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z ]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .slice(0, 30)
    : "";
}

function validateTransaction(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new GatewayError("INVALID_TRANSACTION", 400);
  }
  const cardNumber = digits(input.cardNumber);
  const securityCode = digits(input.securityCode);
  const cardholderName = normalizedHolderName(input.cardholderName);
  const reference =
    typeof input.reference === "string" ? input.reference.trim() : "";
  const amount = Number(input.amount);
  const installments = Number(input.installments || 1);
  const expirationMonth = Number(input.expirationMonth);
  const expirationYear = Number(input.expirationYear);

  if (
    input.capture !== true ||
    input.kind !== "credit" ||
    !/^[A-Za-z0-9]{1,16}$/.test(reference) ||
    !Number.isInteger(amount) ||
    amount < 1 ||
    amount > 9_999_999_999 ||
    !Number.isInteger(installments) ||
    installments < 1 ||
    installments > 6 ||
    cardNumber.length < 13 ||
    cardNumber.length > 19 ||
    !passesLuhn(cardNumber) ||
    !/^\d{3,4}$/.test(securityCode) ||
    cardholderName.length < 3 ||
    !Number.isInteger(expirationMonth) ||
    expirationMonth < 1 ||
    expirationMonth > 12 ||
    !Number.isInteger(expirationYear) ||
    (String(expirationYear).length !== 2 &&
      String(expirationYear).length !== 4)
  ) {
    throw new GatewayError("INVALID_TRANSACTION", 400);
  }

  return {
    capture: true,
    kind: "credit",
    reference,
    amount,
    installments,
    cardholderName,
    cardNumber,
    expirationMonth,
    expirationYear,
    securityCode,
  };
}

function sanitizeRedeResponse(value) {
  if (Array.isArray(value)) return value.map(sanitizeRedeResponse);
  if (!value || typeof value !== "object") {
    return typeof value === "string" ? value.slice(0, 1_000) : value;
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          !/(card|security|cvv|token|credential|secret)/i.test(key),
      )
      .map(([key, item]) => [key, sanitizeRedeResponse(item)]),
  );
}

async function fetchWithTimeout(url, init, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }
  const credentials = Buffer.from(
    `${config.redeClientId}:${config.redeClientSecret}`,
    "utf8",
  ).toString("base64");
  const response = await fetchWithTimeout(rede.tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.access_token !== "string") {
    throw new GatewayError("REDE_OAUTH_FAILED", 502);
  }
  const expiresIn = Number(payload.expires_in || 1_440);
  tokenCache = {
    token: payload.access_token,
    expiresAt: now + Math.max(60, expiresIn) * 1_000,
  };
  return tokenCache.token;
}

async function requestRedeTransaction(transaction) {
  const accessToken = await getAccessToken();
  const response = await fetchWithTimeout(rede.transactionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=utf-8",
      "x-pv": config.redePv,
    },
    body: JSON.stringify(transaction),
  });
  const payload = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    data: sanitizeRedeResponse(payload),
  };
}

class GatewayError extends Error {
  constructor(code, status = 500) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

const server = createServer(async (request, response) => {
  const requestId = randomUUID();
  try {
    const url = new URL(request.url, "http://gateway.local");
    if (request.method === "GET" && url.pathname === "/health") {
      enforceRateLimit(request, "health", 120);
      sendJson(response, 200, {
        ok: true,
        service: "ctp-anapp-erede-gateway",
        environment: config.environment,
        requestId,
      });
      return;
    }

    if (
      request.method !== "POST" ||
      !["/v1/rede/oauth/status", "/v1/rede/transactions"].includes(
        url.pathname,
      )
    ) {
      throw new GatewayError("NOT_FOUND", 404);
    }
    enforceRateLimit(
      request,
      url.pathname.endsWith("transactions") ? "transaction" : "oauth",
      url.pathname.endsWith("transactions") ? 20 : 60,
    );
    const rawBody = await readBody(request);
    verifyHmac(request, rawBody);

    if (url.pathname === "/v1/rede/oauth/status") {
      const token = await getAccessToken();
      sendJson(response, 200, {
        ok: Boolean(token),
        environment: config.environment,
        requestId,
      });
      return;
    }

    const idempotencyKey = request.headers["idempotency-key"];
    if (
      typeof idempotencyKey !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(idempotencyKey)
    ) {
      throw new GatewayError("IDEMPOTENCY_KEY_REQUIRED", 400);
    }
    const transaction = validateTransaction(
      JSON.parse(rawBody.toString("utf8")),
    );
    const requestHash = sha256(rawBody);
    const existing = idempotencyStore[idempotencyKey];
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new GatewayError("IDEMPOTENCY_CONFLICT", 409);
      }
      if (existing.status === "completed" && existing.response) {
        sendJson(response, 200, {
          ...existing.response,
          idempotentReplay: true,
          requestId,
        });
        return;
      }
      throw new GatewayError("TRANSACTION_STATE_UNCERTAIN", 409);
    }

    idempotencyStore[idempotencyKey] = {
      status: "processing",
      requestHash,
      reference: transaction.reference,
      amount: transaction.amount,
      createdAt: Date.now(),
    };
    persistIdempotencyStore();

    const redeResult = await requestRedeTransaction(transaction);
    idempotencyStore[idempotencyKey] = {
      ...idempotencyStore[idempotencyKey],
      status: "completed",
      completedAt: Date.now(),
      response: redeResult,
    };
    persistIdempotencyStore();
    logEvent("rede_transaction_completed", {
      requestId,
      reference: transaction.reference,
      amount: transaction.amount,
      httpStatus: redeResult.status,
      approved: redeResult.ok,
    });
    sendJson(response, 200, { ...redeResult, requestId });
  } catch (error) {
    const gatewayError =
      error instanceof GatewayError
        ? error
        : new GatewayError("GATEWAY_INTERNAL_ERROR", 500);
    logEvent("gateway_request_failed", {
      requestId,
      code: gatewayError.code,
      httpStatus: gatewayError.status,
    });
    sendJson(response, gatewayError.status, {
      ok: false,
      error: { code: gatewayError.code },
      requestId,
    });
  }
});

server.requestTimeout = 20_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;

server.listen(config.port, config.host, () => {
  logEvent("gateway_started", {
    host: config.host,
    port: config.port,
    environment: config.environment,
  });
});

function shutdown(signal) {
  logEvent("gateway_stopping", { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
