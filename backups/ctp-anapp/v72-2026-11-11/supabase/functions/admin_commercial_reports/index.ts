import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import {
  isAllowedSiteOrigin,
  responseSiteOrigin,
} from "../_shared/site-origin.ts";

type JsonRecord = Record<string, unknown>;
type QueryFactory = (
  from: number,
  to: number,
) => PromiseLike<{ data: unknown[] | null; error: { message?: string } | null }>;

const PAGE_SIZE = 1000;
const MAX_PAGES = 20;
const STUDENT_ROLES = new Set(["student"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function responseHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": responseSiteOrigin(origin),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, X-Client-Info, apikey, Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function json(
  req: Request,
  body: JsonRecord,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(req.headers.get("Origin")),
  });
}

function text(value: unknown, maxLength = 250): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeCouponCode(value: unknown): string {
  return text(value, 40).toUpperCase().replace(/\s+/g, "");
}

function numberValue(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function digitsOnly(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function validCpf(value: unknown): boolean {
  const cpf = digitsOnly(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

function isoDate(value: unknown): string | null {
  const raw = text(value, 80);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function uuid(value: unknown): string | null {
  const raw = text(value, 50);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(raw)
    ? raw
    : null;
}

async function fetchAll(factory: QueryFactory): Promise<JsonRecord[]> {
  const rows: JsonRecord[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const result = await factory(from, from + PAGE_SIZE - 1);
    if (result.error) {
      throw new Error(result.error.message || "Falha ao consultar dados");
    }
    const pageRows = Array.isArray(result.data)
      ? result.data.filter(
        (item): item is JsonRecord =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
      : [];
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) break;
  }
  return rows;
}

async function fetchAllAuthUsers(
  admin: SupabaseClient,
): Promise<JsonRecord[]> {
  const rows: JsonRecord[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });
    if (error) throw new Error(error.message);
    rows.push(
      ...data.users.map((user) => ({
        id: user.id,
        email: user.email ?? "",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        email_confirmed_at: user.email_confirmed_at ?? null,
        user_metadata: user.user_metadata ?? {},
      })),
    );
    if (data.users.length < PAGE_SIZE) break;
  }
  return rows;
}

async function requireAdmin(
  req: Request,
): Promise<
  | {
    admin: SupabaseClient;
    callerId: string;
    callerRole: string;
  }
  | Response
> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = req.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
    return json(req, { success: false, error: "AUTHENTICATION_REQUIRED" }, 401);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: callerData, error: callerError } =
    await callerClient.auth.getUser();
  if (callerError || !callerData.user) {
    return json(req, { success: false, error: "AUTHENTICATION_REQUIRED" }, 401);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: roleData, error: roleError } = await admin
    .from("user_roles")
    .select("role,access_blocked")
    .eq("user_id", callerData.user.id)
    .maybeSingle();
  if (
    roleError ||
    !roleData ||
    roleData.access_blocked === true ||
    !["admin", "master_admin"].includes(String(roleData.role))
  ) {
    return json(req, { success: false, error: "ADMIN_REQUIRED" }, 403);
  }

  return {
    admin,
    callerId: callerData.user.id,
    callerRole: String(roleData.role),
  };
}

async function audit(
  admin: SupabaseClient,
  callerId: string,
  action: string,
  details: JsonRecord,
): Promise<void> {
  await admin.from("lms_admin_audit_log").insert({
    actor_user_id: callerId,
    action,
    details,
  });
}

async function listCoupons(admin: SupabaseClient): Promise<JsonRecord> {
  const [coupons, payments, plans] = await Promise.all([
    fetchAll((from, to) =>
      admin
        .from("payment_coupons")
        .select(
          "id,code,description,final_price,starts_at,ends_at,applies_to_plan_id,is_active,created_at,updated_at",
        )
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    fetchAll((from, to) =>
      admin
        .from("payments")
        .select(
          "id,coupon_id,coupon_code,status,amount,discount_amount,created_at,paid_at",
        )
        .not("coupon_code", "is", null)
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
    fetchAll((from, to) =>
      admin
        .from("course_plans")
        .select("id,name,price,is_active")
        .order("price", { ascending: false })
        .range(from, to)
    ),
  ]);

  const summaries = new Map<string, {
    attempts: number;
    approved: number;
    pending: number;
    rejected: number;
    cancelled: number;
    refunded: number;
    revenue: number;
  }>();
  for (const payment of payments) {
    const couponId = text(payment.coupon_id, 50);
    const couponCode = normalizeCouponCode(payment.coupon_code);
    const key = couponId || couponCode;
    if (!key) continue;
    const current = summaries.get(key) ?? {
      attempts: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0,
      refunded: 0,
      revenue: 0,
    };
    current.attempts += 1;
    const status = text(payment.status, 30);
    if (status in current && status !== "attempts" && status !== "revenue") {
      current[status as "approved" | "pending" | "rejected" | "cancelled" | "refunded"] +=
        1;
    }
    if (status === "approved") {
      current.revenue += numberValue(payment.amount) ?? 0;
    }
    summaries.set(key, current);
    if (couponCode) summaries.set(couponCode, current);
  }

  return {
    success: true,
    coupons: coupons.map((coupon) => ({
      ...coupon,
      usage: summaries.get(text(coupon.id, 50)) ??
        summaries.get(normalizeCouponCode(coupon.code)) ?? {
        attempts: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        cancelled: 0,
        refunded: 0,
        revenue: 0,
      },
    })),
    plans,
  };
}

async function upsertCoupon(
  admin: SupabaseClient,
  callerId: string,
  payload: JsonRecord,
): Promise<JsonRecord> {
  const couponId = uuid(payload.id);
  const code = normalizeCouponCode(payload.code);
  const description = text(payload.description, 500) || null;
  const finalPrice = numberValue(payload.final_price);
  const startsAt = isoDate(payload.starts_at);
  const endsAt = isoDate(payload.ends_at);
  const planId = payload.applies_to_plan_id
    ? uuid(payload.applies_to_plan_id)
    : null;
  const isActive = booleanValue(payload.is_active, true);

  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
    throw new Error(
      "O código deve ter entre 3 e 40 caracteres: letras, números, hífen ou sublinhado",
    );
  }
  if (finalPrice === null || finalPrice <= 0) {
    throw new Error("Informe um valor final maior que zero");
  }
  if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) {
    throw new Error("A data final deve ser posterior à data inicial");
  }

  const { data: plans, error: plansError } = await admin
    .from("course_plans")
    .select("id,price,is_active")
    .eq("is_active", true);
  if (plansError || !plans?.length) {
    throw new Error("Não foi possível validar os planos comerciais");
  }
  const eligiblePlans = planId
    ? plans.filter((plan) => plan.id === planId)
    : plans;
  if (!eligiblePlans.length) throw new Error("Plano selecionado indisponível");
  const lowestPrice = Math.min(
    ...eligiblePlans.map((plan) => Number(plan.price)),
  );
  if (finalPrice > lowestPrice) {
    throw new Error("O valor do cupom não pode superar o preço do plano");
  }

  const row = {
    code,
    description,
    final_price: finalPrice,
    starts_at: startsAt,
    ends_at: endsAt,
    applies_to_plan_id: planId,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };
  const query = couponId
    ? admin
      .from("payment_coupons")
      .update(row)
      .eq("id", couponId)
      .select("*")
      .single()
    : admin
      .from("payment_coupons")
      .insert({ ...row, created_at: new Date().toISOString() })
      .select("*")
      .single();
  const { data, error } = await query;
  if (error || !data) {
    throw new Error(error?.message || "Não foi possível salvar o cupom");
  }

  await audit(
    admin,
    callerId,
    couponId
      ? "admin_commercial_reports:update_coupon"
      : "admin_commercial_reports:create_coupon",
    {
      coupon_id: data.id,
      code,
      final_price: finalPrice,
      starts_at: startsAt,
      ends_at: endsAt,
      applies_to_plan_id: planId,
      is_active: isActive,
    },
  );
  return { success: true, coupon: data };
}

async function deleteCoupon(
  admin: SupabaseClient,
  callerId: string,
  payload: JsonRecord,
): Promise<JsonRecord> {
  const couponId = uuid(payload.id);
  if (!couponId) throw new Error("Cupom inválido");
  const { count, error: countError } = await admin
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", couponId);
  if (countError) throw new Error("Não foi possível verificar o uso do cupom");

  if ((count ?? 0) > 0) {
    const { error } = await admin
      .from("payment_coupons")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", couponId);
    if (error) throw new Error(error.message);
    await audit(admin, callerId, "admin_commercial_reports:archive_coupon", {
      coupon_id: couponId,
      usage_count: count,
    });
    return {
      success: true,
      archived: true,
      message:
        "Cupom desativado e preservado porque possui histórico de pagamentos",
    };
  }

  const { error } = await admin
    .from("payment_coupons")
    .delete()
    .eq("id", couponId);
  if (error) throw new Error(error.message);
  await audit(admin, callerId, "admin_commercial_reports:delete_coupon", {
    coupon_id: couponId,
  });
  return { success: true, deleted: true };
}

async function couponUsage(
  admin: SupabaseClient,
  payload: JsonRecord,
): Promise<JsonRecord> {
  const couponId = uuid(payload.id);
  const couponCode = normalizeCouponCode(payload.code);
  if (!couponId && !couponCode) throw new Error("Cupom inválido");

  const payments = await fetchAll((from, to) => {
    let query = admin
      .from("payments")
      .select(
        "id,user_id,status,amount,original_amount,discount_amount,payment_method,installments,coupon_id,coupon_code,plan_id,created_at,paid_at,failure_code,gateway_transaction_id",
      )
      .order("created_at", { ascending: false });
    query = couponId
      ? query.eq("coupon_id", couponId)
      : query.eq("coupon_code", couponCode);
    return query.range(from, to);
  });
  const userIds = [...new Set(payments.map((item) => text(item.user_id, 50)))].filter(
    Boolean,
  );
  const planIds = [...new Set(payments.map((item) => text(item.plan_id, 50)))].filter(
    Boolean,
  );
  const [{ data: profiles }, { data: plans }] = await Promise.all([
    userIds.length
      ? admin.from("profiles").select("id,email,full_name").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    planIds.length
      ? admin.from("course_plans").select("id,name").in("id", planIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const profileById = new Map(
    (profiles ?? []).map((item) => [item.id, item]),
  );
  const planById = new Map((plans ?? []).map((item) => [item.id, item.name]));

  return {
    success: true,
    usage: payments.map((payment) => {
      const profile = profileById.get(payment.user_id);
      return {
        ...payment,
        email: profile?.email ?? "",
        full_name: profile?.full_name ?? "",
        plan_name: planById.get(payment.plan_id) ?? "",
        payment_completed: payment.status === "approved",
      };
    }),
  };
}

function dateMatches(
  value: unknown,
  from: string,
  to: string,
): boolean {
  const timestamp = Date.parse(text(value, 80));
  if (!Number.isFinite(timestamp)) return !from && !to;
  if (from && timestamp < Date.parse(`${from}T00:00:00-03:00`)) return false;
  if (to && timestamp >= Date.parse(`${to}T23:59:59.999-03:00`)) return false;
  return true;
}

async function studentReport(
  admin: SupabaseClient,
  payload: JsonRecord,
): Promise<JsonRecord> {
  const filters = payload.filters && typeof payload.filters === "object"
    ? payload.filters as JsonRecord
    : {};
  const [
    authUsers,
    roles,
    profiles,
    certificates,
    payments,
    progressRows,
    enrollments,
    extendedProfiles,
    chapterCountResult,
  ] =
    await Promise.all([
      fetchAllAuthUsers(admin),
      fetchAll((from, to) =>
        admin
          .from("user_roles")
          .select(
            "user_id,role,is_anapp_member,access_blocked,full_name,user_origin,origin_date,alumni_whitelist_id",
          )
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      fetchAll((from, to) =>
        admin
          .from("profiles")
          .select(
            "id,email,full_name,is_alumni,alumni_type,registration_cohort,has_paid",
          )
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      fetchAll((from, to) =>
        admin
          .from("certificates")
          .select(
            "id,user_id,certificate_number,completion_date,is_valid,created_at",
          )
          .order("completion_date", { ascending: false })
          .range(from, to)
      ),
      fetchAll((from, to) =>
        admin
          .from("payments")
          .select(
            "id,user_id,status,amount,payment_method,installments,coupon_code,created_at,paid_at",
          )
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      fetchAll((from, to) =>
        admin
          .from("user_progress")
          .select(
            "user_id,chapter_id,completion_percentage,last_accessed_at,completed_at",
          )
          .range(from, to)
      ),
      fetchAll((from, to) =>
        admin
          .from("student_enrollments")
          .select(
            "user_id,status,email_confirmed_at,activated_at,created_at,updated_at",
          )
          .range(from, to)
      ),
      fetchAll((from, to) =>
        admin
          .from("user_extended_profile")
          .select(
            "user_id,first_name,last_name,phone,rg,cpf,street,number,complement,neighborhood,city,state,zip_code,gender,profile_completed,created_at,updated_at",
          )
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
      admin
        .from("chapters")
        .select("id", { count: "exact", head: true }),
    ]);
  if (chapterCountResult.error) {
    throw new Error("Não foi possível calcular o progresso dos alunos");
  }
  const totalChapters = Math.max(1, chapterCountResult.count ?? 15);

  const roleByUser = new Map(
    roles.map((item) => [text(item.user_id, 50), item]),
  );
  const profileByUser = new Map(
    profiles.map((item) => [text(item.id, 50), item]),
  );
  const certificateByUser = new Map<string, JsonRecord>();
  for (const certificate of certificates) {
    const userId = text(certificate.user_id, 50);
    if (userId && !certificateByUser.has(userId)) {
      certificateByUser.set(userId, certificate);
    }
  }

  const latestPayment = new Map<string, JsonRecord>();
  const approvedPayment = new Map<string, JsonRecord>();
  for (const payment of payments) {
    const userId = text(payment.user_id, 50);
    if (!userId) continue;
    if (!latestPayment.has(userId)) latestPayment.set(userId, payment);
    if (payment.status === "approved" && !approvedPayment.has(userId)) {
      approvedPayment.set(userId, payment);
    }
  }

  const progressByUser = new Map<
    string,
    { chapters: Map<string, number>; lastActivity: string | null }
  >();
  for (const item of progressRows) {
    const userId = text(item.user_id, 50);
    if (!userId) continue;
    const current = progressByUser.get(userId) ?? {
      chapters: new Map<string, number>(),
      lastActivity: null,
    };
    const chapterId = text(item.chapter_id, 30);
    const percentage = Math.max(
      0,
      Math.min(100, numberValue(item.completion_percentage) ?? 0),
    );
    current.chapters.set(
      chapterId,
      Math.max(current.chapters.get(chapterId) ?? 0, percentage),
    );
    const activity = text(
      item.last_accessed_at || item.completed_at,
      80,
    );
    if (
      activity &&
      (!current.lastActivity ||
        Date.parse(activity) > Date.parse(current.lastActivity))
    ) {
      current.lastActivity = activity;
    }
    progressByUser.set(userId, current);
  }
  const enrollmentByUser = new Map(
    enrollments.map((item) => [text(item.user_id, 50), item]),
  );
  const extendedProfileByUser = new Map(
    extendedProfiles.map((item) => [text(item.user_id, 50), item]),
  );
  const now = Date.now();
  const stoppedThreshold = now - 30 * 24 * 60 * 60 * 1000;

  const rows = authUsers
    .filter((authUser) => {
      const userId = text(authUser.id, 50);
      const role = roleByUser.get(userId);
      return STUDENT_ROLES.has(text(role?.role, 30) || "student");
    })
    .map((authUser) => {
      const userId = text(authUser.id, 50);
      const role = roleByUser.get(userId);
      const profileRow = profileByUser.get(userId);
      const certificate = certificateByUser.get(userId);
      const progress = progressByUser.get(userId);
      const progressPercentage = progress
        ? Math.round(
          [...progress.chapters.values()].reduce(
            (sum, value) => sum + value,
            0,
          ) / totalChapters,
        )
        : 0;
      const enrollment = enrollmentByUser.get(userId);
      const extendedProfile = extendedProfileByUser.get(userId);
      const attempt = latestPayment.get(userId);
      const approved = approvedPayment.get(userId);
      const certified = Boolean(
        certificate?.id && certificate?.is_valid !== false,
      );
      const completed = certified || progressPercentage >= 100;
      const isAlumni = booleanValue(profileRow?.is_alumni) ||
        [
          "alumni",
          "certified_professional",
          "alumni_certified",
        ].includes(text(role?.user_origin, 40));
      const hasAccess = booleanValue(profileRow?.has_paid) || isAlumni;
      const lastActivity = progress?.lastActivity ??
        text(authUser.last_sign_in_at, 80) ?? null;
      const enrollmentStatus = text(enrollment?.status, 40);
      let learningStatus = "pending";
      if (certified) learningStatus = "certified";
      else if (completed) learningStatus = "completed";
      else if (
        progressPercentage > 0 &&
        lastActivity &&
        Date.parse(lastActivity) < stoppedThreshold
      ) learningStatus = "stopped";
      else if (hasAccess && progressPercentage > 0) learningStatus = "in_progress";

      const extendedFullName = [
        text(extendedProfile?.first_name, 80),
        text(extendedProfile?.last_name, 120),
      ].filter(Boolean).join(" ");
      const metadata = authUser.user_metadata &&
          typeof authUser.user_metadata === "object"
        ? authUser.user_metadata as JsonRecord
        : {};
      const resolvedFullName = text(role?.full_name, 160) ||
        text(profileRow?.full_name, 160) ||
        text(metadata.full_name, 160) ||
        extendedFullName;
      const missingRequiredFields: string[] = [];
      if (resolvedFullName.split(/\s+/).filter(Boolean).length < 2) {
        missingRequiredFields.push("Nome completo");
      }
      if (!EMAIL_PATTERN.test(text(authUser.email, 254))) {
        missingRequiredFields.push("E-mail");
      }
      if (digitsOnly(extendedProfile?.phone).length !== 11) {
        missingRequiredFields.push("Telefone celular");
      }
      if (
        text(extendedProfile?.rg, 30).replace(/[^A-Za-z0-9]/g, "").length < 3
      ) {
        missingRequiredFields.push("RG");
      }
      if (!validCpf(extendedProfile?.cpf)) {
        missingRequiredFields.push("CPF");
      }
      if (!text(extendedProfile?.street, 180)) {
        missingRequiredFields.push("Logradouro");
      }
      if (!text(extendedProfile?.number, 30)) {
        missingRequiredFields.push("Número");
      }
      if (!text(extendedProfile?.neighborhood, 100)) {
        missingRequiredFields.push("Bairro");
      }
      if (!text(extendedProfile?.city, 100)) {
        missingRequiredFields.push("Cidade");
      }
      if (!/^[A-Z]{2}$/.test(text(extendedProfile?.state, 2))) {
        missingRequiredFields.push("UF");
      }
      if (digitsOnly(extendedProfile?.zip_code).length !== 8) {
        missingRequiredFields.push("CEP");
      }
      if (
        !["masculino", "feminino", "prefiro_nao_informar"].includes(
          text(extendedProfile?.gender, 30),
        )
      ) {
        missingRequiredFields.push("Gênero");
      }
      const registrationComplete = booleanValue(
        extendedProfile?.profile_completed,
      ) && missingRequiredFields.length === 0;

      return {
        id: userId,
        email: authUser.email,
        full_name: resolvedFullName,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        is_alumni: isAlumni,
        alumni_type: profileRow?.alumni_type ?? null,
        student_type: isAlumni ? "alumni" : "current",
        is_anapp_member: booleanValue(role?.is_anapp_member),
        access_blocked: booleanValue(role?.access_blocked),
        has_access: hasAccess,
        enrollment_status: enrollmentStatus || "not_enrolled",
        activated_at: enrollment?.activated_at ?? null,
        payment_status: text(attempt?.status, 30) || "none",
        payment_method: text(
          approved?.payment_method || attempt?.payment_method,
          60,
        ) || "none",
        payment_amount: approved?.amount ?? attempt?.amount ?? null,
        payment_date: approved?.paid_at ?? attempt?.created_at ?? null,
        coupon_code: approved?.coupon_code ?? attempt?.coupon_code ?? null,
        installments: approved?.installments ?? attempt?.installments ?? null,
        progress_percentage: progressPercentage,
        last_activity_at: lastActivity,
        learning_status: learningStatus,
        course_completed: completed,
        certified,
        certificate_number: certificate?.certificate_number ?? null,
        certificate_date: certificate?.completion_date ?? null,
        phone: extendedProfile?.phone ?? null,
        rg: extendedProfile?.rg ?? null,
        cpf: extendedProfile?.cpf ?? null,
        street: extendedProfile?.street ?? null,
        address_number: extendedProfile?.number ?? null,
        complement: extendedProfile?.complement ?? null,
        neighborhood: extendedProfile?.neighborhood ?? null,
        city: extendedProfile?.city ?? null,
        state: extendedProfile?.state ?? null,
        zip_code: extendedProfile?.zip_code ?? null,
        gender: extendedProfile?.gender ?? null,
        registration_complete: registrationComplete,
        missing_required_fields: missingRequiredFields,
      };
    });

  const search = text(filters.search, 120).toLowerCase();
  const searchDigits = digitsOnly(search);
  const dateFrom = text(filters.date_from, 10);
  const dateTo = text(filters.date_to, 10);
  const paymentMethod = text(filters.payment_method, 60);
  const paymentStatus = text(filters.payment_status, 30);
  const studentType = text(filters.student_type, 30);
  const learningStatus = text(filters.learning_status, 30);
  const certificationStatus = text(filters.certification_status, 30);
  const registrationStatus = text(filters.registration_status, 30);
  const filtered = rows.filter((row) => {
    if (
      search &&
      !String(row.email ?? "").toLowerCase().includes(search) &&
      !String(row.full_name ?? "").toLowerCase().includes(search) &&
      !(searchDigits && digitsOnly(row.cpf).includes(searchDigits)) &&
      !(searchDigits && digitsOnly(row.phone).includes(searchDigits)) &&
      !String(row.rg ?? "").toLowerCase().includes(search)
    ) return false;
    if (!dateMatches(row.created_at, dateFrom, dateTo)) return false;
    if (paymentMethod && paymentMethod !== "all" &&
      row.payment_method !== paymentMethod) return false;
    if (paymentStatus && paymentStatus !== "all" &&
      row.payment_status !== paymentStatus) return false;
    if (studentType && studentType !== "all" &&
      row.student_type !== studentType) return false;
    if (learningStatus && learningStatus !== "all" &&
      row.learning_status !== learningStatus) return false;
    if (
      certificationStatus === "certified" && !row.certified ||
      certificationStatus === "not_certified" && row.certified
    ) return false;
    if (
      registrationStatus === "complete" && !row.registration_complete ||
      registrationStatus === "incomplete" && row.registration_complete
    ) return false;
    return true;
  });
  const paymentMethods = [
    ...new Set(rows.map((row) => String(row.payment_method)).filter(Boolean)),
  ].sort();

  return {
    success: true,
    rows: filtered,
    total: filtered.length,
    available_payment_methods: paymentMethods,
    definitions: {
      stopped:
        "Aluno que iniciou o curso, não concluiu e está sem atividade há mais de 30 dias",
      pending:
        "Aluno sem progresso iniciado, sem acesso completo ou com matrícula ainda pendente",
      complete_registration:
        "Cadastro com nome completo, e-mail, celular, RG, CPF, endereço residencial, CEP e gênero validados",
    },
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: isAllowedSiteOrigin(origin) ? 204 : 403,
      headers: responseHeaders(origin),
    });
  }
  if (req.method !== "POST") {
    return json(req, { success: false, error: "METHOD_NOT_ALLOWED" }, 405);
  }
  if (!isAllowedSiteOrigin(origin)) {
    return json(req, { success: false, error: "ORIGIN_NOT_ALLOWED" }, 403);
  }

  const access = await requireAdmin(req);
  if (access instanceof Response) return access;
  try {
    const payload = await req.json().catch(() => null) as JsonRecord | null;
    const action = text(payload?.action, 50);
    if (!payload || !action) {
      return json(req, { success: false, error: "INVALID_REQUEST" }, 400);
    }

    let result: JsonRecord;
    if (action === "list_coupons") {
      result = await listCoupons(access.admin);
    } else if (action === "upsert_coupon") {
      result = await upsertCoupon(
        access.admin,
        access.callerId,
        payload.coupon && typeof payload.coupon === "object"
          ? payload.coupon as JsonRecord
          : {},
      );
    } else if (action === "delete_coupon") {
      result = await deleteCoupon(
        access.admin,
        access.callerId,
        payload.coupon && typeof payload.coupon === "object"
          ? payload.coupon as JsonRecord
          : {},
      );
    } else if (action === "coupon_usage") {
      result = await couponUsage(
        access.admin,
        payload.coupon && typeof payload.coupon === "object"
          ? payload.coupon as JsonRecord
          : {},
      );
    } else if (action === "student_report") {
      result = await studentReport(access.admin, payload);
    } else {
      return json(req, { success: false, error: "UNKNOWN_ACTION" }, 400);
    }
    return json(req, result);
  } catch (error) {
    console.error(
      "admin_commercial_reports_failed",
      error instanceof Error ? error.message : "unknown",
    );
    return json(
      req,
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação administrativa",
      },
      400,
    );
  }
});
