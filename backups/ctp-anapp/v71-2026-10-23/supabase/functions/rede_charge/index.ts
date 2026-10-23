import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import {
  CANONICAL_PUBLIC_ORIGIN,
  PUBLIC_SITE_ORIGINS,
} from "../_shared/site-origin.ts";
import {
  escapeEmailHtml,
  renderCtpEmail,
} from "../_shared/email-template.ts";
import { sendTrackedStudentEmail } from "../_shared/student-email.ts";

type JsonRecord = Record<string, unknown>;

const PUBLIC_ORIGIN = CANONICAL_PUBLIC_ORIGIN;
const MAX_STANDARD_INSTALLMENTS = 6;
const COMMERCIAL_PLAN_PRICES: Readonly<Record<string, number>> = Object.freeze({
  "6e18e621-f7ae-40bd-ad25-3818eaa51ba8": 600,
  "32fde0de-2cc7-4ca3-bc99-cd2062d89804": 299,
});
const REDE_ENVIRONMENT = Deno.env.get("REDE_ENVIRONMENT")?.trim();
const REDE_PV = Deno.env.get("REDE_PV")?.trim();
const EREDE_GATEWAY_URL = Deno.env
  .get("EREDE_GATEWAY_URL")
  ?.trim()
  .replace(/\/+$/, "");
const EREDE_GATEWAY_HMAC_SECRET = Deno.env
  .get("EREDE_GATEWAY_HMAC_SECRET")
  ?.trim();
const ALLOWED_ORIGINS = new Set(
  [
    ...PUBLIC_SITE_ORIGINS,
    ...(
      Deno.env.get("REDE_ALLOWED_ORIGINS") ??
      "http://localhost:3100"
    )
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ],
);

class PaymentError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin");
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    ...(allowedOrigin ? { "Access-Control-Allow-Origin": allowedOrigin } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(
  req: Request,
  body: JsonRecord,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function requireAllowedOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    throw new PaymentError("ORIGIN_NOT_ALLOWED", "Origem não permitida", 403);
  }
}

function formatCouponDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "a data configurada";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 15_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function bytesToBase64Url(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signGatewayRequest(
  timestamp: string,
  nonce: string,
  method: string,
  path: string,
  body: string,
): Promise<string> {
  if (!EREDE_GATEWAY_HMAC_SECRET) {
    throw new PaymentError(
      "PAYMENT_CONFIGURATION_INVALID",
      "Assinatura do gateway de pagamento não configurada",
      503,
    );
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(EREDE_GATEWAY_HMAC_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedValue = [
    timestamp,
    nonce,
    method,
    path,
    await sha256Hex(body),
  ].join("\n");
  return bytesToBase64Url(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedValue),
    ),
  );
}

async function redeRequest(
  method: string,
  path: string,
  body?: JsonRecord,
  idempotencyKey?: string,
): Promise<{ ok: boolean; status: number; data: JsonRecord }> {
  if (!EREDE_GATEWAY_URL || !EREDE_GATEWAY_HMAC_SECRET) {
    throw new PaymentError(
      "PAYMENT_CONFIGURATION_INVALID",
      "Gateway de pagamento não configurado",
      503,
    );
  }
  const bodyText = body ? JSON.stringify(body) : "{}";
  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();
  const signature = await signGatewayRequest(
    timestamp,
    nonce,
    method,
    path,
    bodyText,
  );
  const response = await fetchWithTimeout(`${EREDE_GATEWAY_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-ctp-timestamp": timestamp,
      "x-ctp-nonce": nonce,
      "x-ctp-signature": signature,
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    },
    body: bodyText,
  });
  const payload = await response.json().catch(() => ({})) as JsonRecord;
  if (!response.ok) {
    throw new PaymentError(
      "EREDE_GATEWAY_FAILED",
      "Gateway de pagamento indisponível",
      response.status === 429 ? 429 : 502,
    );
  }
  const data =
    payload.data && typeof payload.data === "object" &&
      !Array.isArray(payload.data)
      ? payload.data as JsonRecord
      : {};
  return {
    ok: payload.ok === true,
    status: Number(payload.status ?? response.status),
    data,
  };
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(value)
  );
}

function createRedeReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
  return `CTP${timestamp}${random}`.slice(0, 16);
}

function digitsOnly(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function isValidCpf(value: unknown): boolean {
  const cpf = digitsOnly(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const calculateDigit = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calculateDigit(9) === Number(cpf[9]) &&
    calculateDigit(10) === Number(cpf[10]);
}

function hasCompleteRegistration(row: JsonRecord | null): boolean {
  if (!row || row.profile_completed !== true) return false;
  const text = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  return Boolean(
    text(row.first_name) &&
      text(row.last_name) &&
      digitsOnly(row.phone).length === 11 &&
      text(row.rg).replace(/[^A-Za-z0-9]/g, "").length >= 3 &&
      isValidCpf(row.cpf) &&
      text(row.street) &&
      text(row.number) &&
      text(row.neighborhood) &&
      text(row.city) &&
      /^[A-Z]{2}$/.test(text(row.state)) &&
      digitsOnly(row.zip_code).length === 8 &&
      ["masculino", "feminino", "prefiro_nao_informar"].includes(
        text(row.gender),
      ),
  );
}

function normalizeCouponCode(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toUpperCase().replace(/\s+/g, "")
    : "";
}

function normalizeCardHolderName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 30);
}

function passesLuhn(value: string): boolean {
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

function validateExpiry(monthValue: unknown, yearValue: unknown): {
  month: string;
  year: string;
} {
  const month = digitsOnly(monthValue).padStart(2, "0");
  let year = digitsOnly(yearValue);
  if (year.length === 4) year = year.slice(-2);
  if (!/^(0[1-9]|1[0-2])$/.test(month) || !/^\d{2}$/.test(year)) {
    throw new PaymentError(
      "INVALID_CARD_EXPIRY",
      "Validade do cartão inválida",
      400,
    );
  }
  const fullYear = 2000 + Number(year);
  const expiresAt = new Date(Date.UTC(fullYear, Number(month), 1));
  const currentMonth = new Date();
  const monthStart = new Date(
    Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1),
  );
  if (expiresAt <= monthStart) {
    throw new PaymentError(
      "EXPIRED_CARD",
      "O cartão informado está vencido",
      400,
    );
  }
  return { month, year };
}

function sanitizeGatewayResponse(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const sensitiveKeys = /(card|security|cvv|token|credential|secret)/i;
  return Object.fromEntries(
    Object.entries(value as JsonRecord)
      .filter(([key]) => !sensitiveKeys.test(key))
      .map(([key, item]) => [
        key,
        typeof item === "string" ? item.slice(0, 1_000) : item,
      ]),
  );
}

function isApprovedResponse(result: {
  ok: boolean;
  data: JsonRecord;
}): boolean {
  const returnCode =
    typeof result.data.returnCode === "string" ? result.data.returnCode : "";
  const status =
    typeof result.data.status === "string"
      ? result.data.status.toLowerCase()
      : "";
  return result.ok && (
    returnCode === "00" ||
    status === "authorized" ||
    status === "captured"
  );
}

async function sendPaymentApprovedEmail(
  adminClient: SupabaseClient<any, "public", "public", any, any>,
  userId: string,
  paymentId: string,
  planName: string,
  amount: number,
): Promise<boolean> {
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const safeName = escapeEmailHtml(profile?.full_name || "aluno(a)", 160);
  const safePlanName = escapeEmailHtml(planName, 160);
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
  const html = renderCtpEmail({
    preheader: "Pagamento aprovado. Seu acesso completo ao CTP ANAPP já está liberado.",
    eyebrow: "Inscrição confirmada",
    title: "Pagamento aprovado e acesso liberado",
    bodyHtml: `
      <p style="margin:0 0 16px">Olá, <strong>${safeName}</strong>.</p>
      <p style="margin:0 0 16px">Sua inscrição no plano <strong>${safePlanName}</strong>, no valor de <strong>${escapeEmailHtml(formattedAmount, 40)}</strong>, foi aprovada.</p>
      <p style="margin:0">Todos os capítulos, avaliações, ferramentas e recursos de certificação já estão disponíveis no seu portal.</p>`,
    ctaLabel: "Acessar o CTP ANAPP",
    ctaUrl: `${PUBLIC_ORIGIN}/login`,
    supportText: "Este comprovante confirma a liberação do seu acesso. Guarde esta mensagem para referência.",
  });

  return sendTrackedStudentEmail(adminClient, {
    userId,
    eventKey: `payment-approved:${paymentId}`,
    eventType: "payment_approved",
    subject: "Pagamento aprovado e acesso liberado — CTP ANAPP",
    html,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    return new Response(null, {
      status: origin && !ALLOWED_ORIGINS.has(origin) ? 403 : 204,
      headers: corsHeaders(req),
    });
  }

  try {
    requireAllowedOrigin(req);
    if (req.method !== "POST") {
      throw new PaymentError("METHOD_NOT_ALLOWED", "Método não permitido", 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new PaymentError(
        "SUPABASE_CONFIGURATION_INVALID",
        "Configuração interna indisponível",
        503,
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new PaymentError("UNAUTHORIZED", "Sessão obrigatória", 401);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();
    if (userError || !user) {
      throw new PaymentError("UNAUTHORIZED", "Sessão inválida", 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json().catch(() => null) as JsonRecord | null;
    if (!body) {
      throw new PaymentError("INVALID_INPUT", "Corpo inválido", 400);
    }

    const { data: settingsRows, error: settingsError } = await adminClient
      .from("system_settings")
      .select("key,value")
      .in("key", [
        "erede_enabled",
        "erede_environment",
        "erede_pv",
        "erede_public_checkout_mode",
      ]);
    if (settingsError) {
      throw new PaymentError(
        "PAYMENT_CONFIGURATION_UNAVAILABLE",
        "Configuração de pagamento indisponível",
        503,
      );
    }
    const settings = Object.fromEntries(
      (settingsRows ?? []).map((row) => [row.key, row.value]),
    );
    const { data: isAdminResult, error: adminCheckError } =
      await adminClient.rpc("lms_is_admin_or_master", {
        check_user_id: user.id,
      });
    if (adminCheckError) {
      throw new PaymentError(
        "ADMIN_CHECK_FAILED",
        "Não foi possível validar o perfil administrativo",
        503,
      );
    }
    const isAdmin = isAdminResult === true;
    const configured = Boolean(
      EREDE_GATEWAY_URL &&
        EREDE_GATEWAY_HMAC_SECRET &&
        REDE_PV &&
        REDE_ENVIRONMENT,
    );
    const environmentMatches =
      settings.erede_environment === REDE_ENVIRONMENT;
    const pvMatches = !settings.erede_pv || settings.erede_pv === REDE_PV;
    const pricingModeValid =
      settings.erede_public_checkout_mode === "plan_price";

    if (body.action === "configuration") {
      return jsonResponse(req, {
        success: true,
        enabled: settings.erede_enabled === "true" && pricingModeValid,
        configured,
        environment: REDE_ENVIRONMENT ?? "not_configured",
        environment_matches: environmentMatches,
        pv_matches: pvMatches,
        pricing_mode_valid: pricingModeValid,
        supported_methods: ["credit_card"],
      });
    }

    if (body.action === "gateway_status") {
      if (!isAdmin) {
        throw new PaymentError(
          "ADMIN_REQUIRED",
          "Diagnóstico do gateway restrito a administradores",
          403,
        );
      }
      if (!configured || !environmentMatches || !pvMatches) {
        throw new PaymentError(
          "PAYMENT_NOT_READY",
          "Integração Rede indisponível ou divergente",
          503,
        );
      }
      const gatewayStatus = await redeRequest(
        "POST",
        "/v1/rede/oauth/status",
        {},
      );
      return jsonResponse(req, {
        success: gatewayStatus.ok,
        gateway_reachable: true,
        oauth_valid: gatewayStatus.ok,
        environment: REDE_ENVIRONMENT,
      });
    }

    const action = typeof body.action === "string" ? body.action : "";
    const isCouponValidation = action === "validate_coupon";
    if (action !== "charge" && !isCouponValidation) {
      throw new PaymentError("UNKNOWN_ACTION", "Ação desconhecida", 400);
    }
    if (
      !isCouponValidation &&
      (!configured || !environmentMatches || !pvMatches)
    ) {
      throw new PaymentError(
        "PAYMENT_NOT_READY",
        "Integração Rede indisponível ou divergente",
        503,
      );
    }
    if (
      action === "charge" &&
      (settings.erede_enabled !== "true" || !pricingModeValid)
    ) {
      throw new PaymentError(
        "PAYMENT_NOT_READY",
        "Pagamento temporariamente indisponível por configuração",
        503,
      );
    }

    const planId = body.plan_id;
    const idempotencyKey = body.idempotency_key;
    const paymentIdempotencyKey = isUuid(idempotencyKey)
      ? idempotencyKey
      : null;
    const installments = Number(body.installments ?? 1);
    if (!isUuid(planId)) {
      throw new PaymentError("INVALID_PLAN", "Plano inválido", 400);
    }
    if (!isCouponValidation && !paymentIdempotencyKey) {
      throw new PaymentError(
        "INVALID_INPUT",
        "Identificador da tentativa inválido",
        400,
      );
    }
    if (
      !isCouponValidation &&
      (
        body.payment_method !== "credit_card" ||
        !Number.isInteger(installments) ||
        installments < 1 ||
        installments > MAX_STANDARD_INSTALLMENTS
      )
    ) {
      throw new PaymentError(
        "INVALID_INSTALLMENTS",
        "O parcelamento é permitido em até 6 vezes sem juros",
        400,
      );
    }

    let plan: {
      id: string | null;
      name: string;
      price: number;
      max_installments: number;
      requires_anapp_membership: boolean;
    };
    const { data: selectedPlan, error: planError } = await adminClient
      .from("course_plans")
      .select(
        "id,name,price,max_installments,is_active,requires_anapp_membership",
      )
      .eq("id", planId)
      .eq("is_active", true)
      .single();
    if (planError || !selectedPlan) {
      throw new PaymentError("PLAN_NOT_FOUND", "Plano indisponível", 404);
    }
    plan = {
      id: selectedPlan.id,
      name: selectedPlan.name,
      price: Number(selectedPlan.price),
      max_installments: Math.max(
        1,
        Math.min(
          MAX_STANDARD_INSTALLMENTS,
          Number(selectedPlan.max_installments ?? 1),
        ),
      ),
      requires_anapp_membership: Boolean(selectedPlan.requires_anapp_membership),
    };
    const expectedPlanPrice = plan.id
      ? COMMERCIAL_PLAN_PRICES[plan.id]
      : undefined;
    if (
      expectedPlanPrice === undefined ||
      !Number.isFinite(plan.price) ||
      plan.price !== expectedPlanPrice
    ) {
      throw new PaymentError(
        "PLAN_PRICE_MISMATCH",
        "Preço comercial do plano inconsistente; nenhuma cobrança foi iniciada",
        503,
      );
    }

    if (action === "charge") {
      const { data: existing } = await adminClient
        .from("payments")
        .select(
          "id,status,gateway_transaction_id,gateway_authorization,gateway_nsu,amount,original_amount,discount_amount,coupon_code",
        )
        .eq("user_id", user.id)
        .eq("idempotency_key", paymentIdempotencyKey)
        .maybeSingle();
      if (existing) {
        return jsonResponse(req, {
          success: existing.status === "approved",
          payment_id: existing.id,
          status: existing.status,
          transaction_id: existing.gateway_transaction_id,
          authorization: existing.gateway_authorization,
          nsu: existing.gateway_nsu,
          final_amount: Number(existing.amount),
          original_amount: Number(existing.original_amount ?? existing.amount),
          discount_amount: Number(existing.discount_amount ?? 0),
          coupon_code: existing.coupon_code,
          message:
            existing.status === "approved"
              ? "Pagamento já aprovado"
              : "Esta tentativa já foi processada",
          idempotent_replay: true,
        });
      }
    }

    let profile: {
      has_paid: boolean | null;
    } | null = null;
    const [
      { data: profileRow, error: profileError },
      { data: roleRow, error: roleError },
      { data: registrationRow, error: registrationError },
    ] = await Promise.all([
      adminClient
        .from("profiles")
        .select("has_paid")
        .eq("id", user.id)
        .single(),
      adminClient
        .from("user_roles")
        .select("user_origin")
        .eq("user_id", user.id)
        .maybeSingle(),
      adminClient
        .from("user_extended_profile")
        .select(
          "first_name,last_name,phone,rg,cpf,street,number,neighborhood,city,state,zip_code,gender,profile_completed",
        )
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    if (profileError || !profileRow) {
      throw new PaymentError(
        "PROFILE_NOT_FOUND",
        "Perfil do aluno não encontrado",
        404,
      );
    }
    profile = profileRow;
    if (roleError || registrationError) {
      throw new PaymentError(
        "REGISTRATION_VALIDATION_FAILED",
        "Não foi possível validar o cadastro do aluno",
        503,
      );
    }
    const userOrigin = typeof roleRow?.user_origin === "string"
      ? roleRow.user_origin
      : "new_student";
    if (
      !isCouponValidation &&
      userOrigin === "new_student" &&
      !hasCompleteRegistration(registrationRow as JsonRecord | null)
    ) {
      throw new PaymentError(
        "REGISTRATION_INCOMPLETE",
        "Complete seus dados cadastrais antes de iniciar o pagamento",
        409,
      );
    }

    const originalAmount = Number(plan.price);
    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      throw new PaymentError(
        "PLAN_PRICE_INVALID",
        "Preço do plano inválido",
        500,
      );
    }

    const couponCode = normalizeCouponCode(body.coupon_code);
    let coupon: {
      id: string;
      code: string;
      final_price: number;
      ends_at: string;
    } | null = null;

    if (couponCode) {
      if (!/^[A-Z0-9_-]{3,40}$/.test(couponCode)) {
        throw new PaymentError("COUPON_INVALID", "Cupom inválido", 400);
      }
      const { data: couponRow, error: couponError } = await adminClient
        .from("payment_coupons")
        .select(
          "id,code,final_price,starts_at,ends_at,applies_to_plan_id,is_active",
        )
        .eq("code", couponCode)
        .eq("is_active", true)
        .maybeSingle();
      if (couponError) {
        throw new PaymentError(
          "COUPON_VALIDATION_FAILED",
          "Não foi possível validar o cupom",
          503,
        );
      }
      if (!couponRow) {
        throw new PaymentError(
          "COUPON_INVALID",
          "Cupom inválido ou indisponível",
          404,
        );
      }
      const startsAt = Date.parse(couponRow.starts_at);
      const endsAt = Date.parse(couponRow.ends_at);
      const now = Date.now();
      if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt)) {
        throw new PaymentError(
          "COUPON_CONFIGURATION_INVALID",
          "Configuração do cupom inválida",
          500,
        );
      }
      if (now < startsAt) {
        throw new PaymentError(
          "COUPON_NOT_STARTED",
          `Este cupom será válido a partir de ${
            formatCouponDateTime(couponRow.starts_at)
          }`,
          409,
        );
      }
      if (now >= endsAt) {
        throw new PaymentError(
          "COUPON_EXPIRED",
          `Este cupom expirou em ${formatCouponDateTime(couponRow.ends_at)}`,
          409,
        );
      }
      if (
        couponRow.applies_to_plan_id &&
        couponRow.applies_to_plan_id !== plan.id
      ) {
        throw new PaymentError(
          "COUPON_PLAN_NOT_ELIGIBLE",
          "Cupom exclusivo para associados ANAPP",
          409,
        );
      }
      const finalPrice = Number(couponRow.final_price);
      if (
        !Number.isFinite(finalPrice) ||
        finalPrice <= 0 ||
        finalPrice > originalAmount
      ) {
        throw new PaymentError(
          "COUPON_CONFIGURATION_INVALID",
          "Valor promocional inválido",
          500,
        );
      }
      coupon = {
        id: couponRow.id,
        code: couponRow.code,
        final_price: finalPrice,
        ends_at: couponRow.ends_at,
      };
    }

    if (isCouponValidation) {
      if (!coupon) {
        throw new PaymentError(
          "COUPON_REQUIRED",
          "Informe um cupom",
          400,
        );
      }
      return jsonResponse(req, {
        success: true,
        valid: true,
        coupon_code: coupon.code,
        original_amount: originalAmount,
        discount_amount: originalAmount - coupon.final_price,
        final_amount: coupon.final_price,
        valid_until: coupon.ends_at,
        message: coupon.code === "EXPOLAZER2026"
          ? `Cupom válido até ${
            formatCouponDateTime(coupon.ends_at)
          }. Brinde (óculos) disponível para retirada exclusiva no estande, enquanto durarem os estoques.`
          : `Cupom válido até ${formatCouponDateTime(coupon.ends_at)}.`,
      });
    }

    if (profile?.has_paid) {
      throw new PaymentError(
        "ACCESS_ALREADY_ACTIVE",
        "Seu acesso ao curso já está ativo; nenhuma nova cobrança foi iniciada",
        409,
      );
    }
    if (coupon && installments !== 1) {
      throw new PaymentError(
        "COUPON_INSTALLMENTS_NOT_ALLOWED",
        "O valor promocional de R$ 50,00 deve ser pago à vista",
        400,
      );
    }
    if (installments > Math.max(1, Number(plan.max_installments ?? 1))) {
      throw new PaymentError(
        "INVALID_INSTALLMENTS",
        "Parcelamento não permitido para este plano",
        400,
      );
    }

    const card =
      body.card && typeof body.card === "object" && !Array.isArray(body.card)
        ? body.card as JsonRecord
        : null;
    if (!card) {
      throw new PaymentError(
        "INVALID_CARD_DATA",
        "Dados do cartão inválidos",
        400,
      );
    }
    const cardNumber = digitsOnly(card.number);
    const cardHolderName = normalizeCardHolderName(card.holder_name);
    const securityCode = digitsOnly(card.security_code);
    const expiry = validateExpiry(card.expiration_month, card.expiration_year);
    if (
      cardNumber.length < 13 ||
      cardNumber.length > 19 ||
      !passesLuhn(cardNumber) ||
      cardHolderName.length < 3 ||
      !/^\d{3,4}$/.test(securityCode)
    ) {
      throw new PaymentError(
        "INVALID_CARD_DATA",
        "Dados do cartão inválidos",
        400,
      );
    }

    const amount = coupon?.final_price ?? originalAmount;
    const discountAmount = originalAmount - amount;
    const amountInCents = Math.round(amount * 100);
    const reference = createRedeReference();
    const { data: payment, error: insertError } = await adminClient
      .from("payments")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        coupon_id: coupon?.id ?? null,
        coupon_code: coupon?.code ?? null,
        currency: "BRL",
        status: "pending",
        payment_method: "credit_card",
        gateway: "rede",
        installments,
        card_last4: cardNumber.slice(-4),
        idempotency_key: paymentIdempotencyKey,
        gateway_reference: reference,
        gateway_environment: REDE_ENVIRONMENT,
        metadata: {
          plan_name: plan.name,
          source: "ctp_anapp_checkout",
          coupon_code: coupon?.code ?? null,
        },
      })
      .select("id")
      .single();
    if (insertError || !payment) {
      throw new PaymentError(
        "PAYMENT_RECORD_FAILED",
        "Não foi possível iniciar o pagamento",
        409,
      );
    }

    let result: { ok: boolean; status: number; data: JsonRecord };
    try {
      const transactionPayload: JsonRecord = {
        capture: true,
        kind: "credit",
        reference,
        amount: amountInCents,
        cardholderName: cardHolderName,
        cardNumber,
        expirationMonth: expiry.month,
        expirationYear: expiry.year,
        securityCode,
      };
      if (installments > 1) {
        transactionPayload.installments = installments;
      }
      result = await redeRequest(
        "POST",
        "/v1/rede/transactions",
        transactionPayload,
        paymentIdempotencyKey ?? undefined,
      );
    } catch (error) {
      await adminClient
        .from("payments")
        .update({
          failure_code: "REDE_REQUEST_UNCERTAIN",
          notes: "Falha de comunicação; aguardar conciliação antes de repetir.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);
      throw error;
    }

    const gatewayResponse = sanitizeGatewayResponse(result.data);
    const approved = isApprovedResponse(result);
    const transactionId =
      typeof result.data.tid === "string"
        ? result.data.tid
        : typeof result.data.transactionId === "string"
          ? result.data.transactionId
          : null;
    const authorization =
      typeof result.data.authorization === "string"
        ? result.data.authorization
        : typeof result.data.authorizationCode === "string"
          ? result.data.authorizationCode
          : null;
    const nsu = typeof result.data.nsu === "string" ? result.data.nsu : null;
    const returnCode =
      typeof result.data.returnCode === "string"
        ? result.data.returnCode
        : `HTTP_${result.status}`;
    const returnMessage =
      typeof result.data.returnMessage === "string"
        ? result.data.returnMessage
        : typeof result.data.message === "string"
          ? result.data.message
          : approved
            ? "Pagamento aprovado"
            : "Pagamento não aprovado";

    const { error: updateError } = await adminClient
      .from("payments")
      .update({
        status: approved ? "approved" : "rejected",
        gateway_transaction_id: transactionId,
        transaction_id: transactionId,
        gateway_authorization: authorization,
        gateway_nsu: nsu,
        gateway_response: gatewayResponse,
        failure_code: approved ? null : returnCode,
        paid_at: approved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);
    if (updateError) {
      throw new PaymentError(
        "PAYMENT_RECONCILIATION_FAILED",
        "Pagamento recebido, mas a conciliação interna falhou",
        500,
      );
    }

    let paymentEmailSent = false;
    if (approved) {
      const { data: accessGranted, error: accessError } = await adminClient
        .rpc("lms_activate_paid_access", {
          p_user_id: user.id,
          p_payment_id: payment.id,
        });
      if (accessError || accessGranted !== true) {
        throw new PaymentError(
          "ACCESS_GRANT_FAILED",
          "Pagamento aprovado; liberação pendente de conciliação",
          500,
        );
      }
    }
    if (approved) {
      paymentEmailSent = await sendPaymentApprovedEmail(
        adminClient,
        user.id,
        payment.id,
        plan.name,
        amount,
      );
    }

    console.info("rede_charge_result", {
      paymentId: payment.id,
      approved,
      returnCode,
      environment: REDE_ENVIRONMENT,
      couponCode: coupon?.code ?? null,
    });

    return jsonResponse(req, {
      success: approved,
      payment_id: payment.id,
      status: approved ? "approved" : "rejected",
      transaction_id: transactionId,
      authorization,
      nsu,
      final_amount: amount,
      original_amount: originalAmount,
      discount_amount: discountAmount,
      coupon_code: coupon?.code ?? null,
      message: approved
        ? "Pagamento aprovado e acesso liberado"
        : `Pagamento não aprovado: ${returnMessage}`,
      return_code: returnCode,
      email_sent: paymentEmailSent,
    });
  } catch (error) {
    const paymentError =
      error instanceof PaymentError
        ? error
        : new PaymentError(
          "PAYMENT_INTERNAL_ERROR",
          "Não foi possível processar o pagamento",
          500,
        );
    console.error("rede_charge_error", {
      code: paymentError.code,
      message: paymentError.message,
    });
    return jsonResponse(
      req,
      {
        success: false,
        error: {
          code: paymentError.code,
          message: paymentError.message,
        },
      },
      paymentError.status,
    );
  }
});
