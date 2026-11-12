import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import {
  CANONICAL_PUBLIC_ORIGIN,
  isAllowedSiteOrigin,
  responseSiteOrigin,
} from "../_shared/site-origin.ts";
import {
  escapeEmailHtml,
  renderCtpEmail,
} from "../_shared/email-template.ts";
import { sendTrackedStudentEmail } from "../_shared/student-email.ts";

type JsonRecord = Record<string, unknown>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 30 * 60 * 1000;
const BRAZILIAN_STATES = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);
const ALLOWED_GENDERS = new Set([
  "masculino",
  "feminino",
  "prefiro_nao_informar",
]);

interface CompleteRegistrationData {
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  rg: string;
  cpf: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  gender: string;
}

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": responseSiteOrigin(origin),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function json(req: Request, body: JsonRecord, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req.headers.get("origin")),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function redirect(path: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": `${CANONICAL_PUBLIC_ORIGIN}${path}`,
      "Cache-Control": "no-store",
    },
  });
}

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function digitsOnly(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function isValidCpf(cpf: string): boolean {
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

function parseCompleteRegistration(
  body: JsonRecord,
): { data: CompleteRegistrationData | null; missing: string[] } {
  const fullName = normalizeText(body.full_name, 160);
  const nameParts = fullName.split(" ").filter(Boolean);
  const phone = digitsOnly(body.phone);
  const rg = normalizeText(body.rg, 30);
  const cpf = digitsOnly(body.cpf);
  const street = normalizeText(body.street, 180);
  const number = normalizeText(body.number, 30);
  const complement = normalizeText(body.complement, 100) || null;
  const neighborhood = normalizeText(body.neighborhood, 100);
  const city = normalizeText(body.city, 100);
  const state = normalizeText(body.state, 2).toUpperCase();
  const zipCode = digitsOnly(body.zip_code);
  const gender = normalizeText(body.gender, 30).toLowerCase();
  const missing: string[] = [];

  if (nameParts.length < 2 || fullName.length < 5) missing.push("full_name");
  if (phone.length !== 11) missing.push("phone");
  if (rg.replace(/[^A-Za-z0-9]/g, "").length < 3) missing.push("rg");
  if (!isValidCpf(cpf)) missing.push("cpf");
  if (!street) missing.push("street");
  if (!number) missing.push("number");
  if (!neighborhood) missing.push("neighborhood");
  if (!city) missing.push("city");
  if (!BRAZILIAN_STATES.has(state)) missing.push("state");
  if (zipCode.length !== 8) missing.push("zip_code");
  if (!ALLOWED_GENDERS.has(gender)) missing.push("gender");

  if (missing.length) return { data: null, missing };
  return {
    data: {
      fullName,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" "),
      phone,
      rg,
      cpf,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      gender,
    },
    missing: [],
  };
}

function strongPassword(value: unknown): value is string {
  return typeof value === "string" &&
    value.length >= 10 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function secureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function findUserByEmail(
  admin: SupabaseClient<any, "public", "public", any, any>,
  email: string,
) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1_000,
    });
    if (error) throw error;
    const user = data.users.find(
      (candidate) => candidate.email?.trim().toLowerCase() === email,
    );
    if (user) return user;
    if (data.users.length < 1_000) break;
  }
  return null;
}

async function sendConfirmationEmail(
  admin: SupabaseClient<any, "public", "public", any, any>,
  supabaseUrl: string,
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  },
): Promise<boolean> {
  const token = secureToken();
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS).toISOString();

  await admin
    .from("student_email_verifications")
    .update({ used_at: now.toISOString() })
    .eq("user_id", user.id)
    .is("used_at", null);

  const { data: verification, error: verificationError } = await admin
    .from("student_email_verifications")
    .insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select("id")
    .single();
  if (verificationError || !verification) throw verificationError;

  const confirmationUrl =
    `${supabaseUrl}/functions/v1/student_registration?token=${
      encodeURIComponent(token)
    }`;
  const fullName = escapeEmailHtml(
    user.user_metadata?.full_name || "aluno",
    160,
  );
  const html = renderCtpEmail({
    preheader:
      "Confirme seu cadastro e inicie o Capítulo Zero do CTP ANAPP.",
    eyebrow: "Sua jornada começa aqui",
    title: "Bem-vindo ao CTP ANAPP",
    bodyHtml:
      `<p style="margin:0 0 16px">Olá, <strong>${fullName}</strong>.</p>
      <p style="margin:0 0 16px">Seu cadastro no <strong>Curso Técnico de Piscinas</strong> foi criado com sucesso.</p>
      <p style="margin:0 0 16px">No Capítulo Zero, você conhecerá a metodologia, os objetivos da formação e o caminho até a certificação profissional.</p>
      <p style="margin:0">Confirme seu e-mail para iniciar sua jornada como <strong>Especialista em Piscinas reconhecido no mercado</strong>, com conhecimento técnico, visão empreendedora e a chancela da ANAPP.</p>`,
    ctaLabel: "Confirmar cadastro e iniciar o Capítulo Zero",
    ctaUrl: confirmationUrl,
    supportText:
      "Este link é individual, confirma seu e-mail e expira em 30 minutos. Se você não iniciou este cadastro, ignore a mensagem.",
  });

  const emailInput = {
    userId: user.id,
    eventKey: `email_confirmation:${verification.id}`,
    eventType: "email_confirmation",
    subject: "Bem-vindo ao CTP ANAPP — confirme seu cadastro",
    html,
  };
  if (await sendTrackedStudentEmail(admin, emailInput)) return true;
  return sendTrackedStudentEmail(admin, emailInput);
}

async function sendRecoveryEmail(
  admin: SupabaseClient<any, "public", "public", any, any>,
  user: { id: string; email?: string },
): Promise<boolean> {
  if (!user.email) return false;
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: user.email,
    options: {
      redirectTo: `${CANONICAL_PUBLIC_ORIGIN}/reset-password`,
    },
  });
  if (error || !data.properties?.action_link) throw error;

  const actionLink = data.properties.action_link;
  const eventHash = (await sha256(actionLink)).slice(0, 32);
  const html = renderCtpEmail({
    preheader: "Use o link seguro para criar uma nova senha no CTP ANAPP.",
    eyebrow: "Segurança da conta",
    title: "Crie uma nova senha",
    bodyHtml:
      `<p style="margin:0 0 16px">Recebemos uma solicitação para redefinir a senha da sua conta no CTP ANAPP.</p>
      <p style="margin:0">Use o botão abaixo para escolher uma nova senha forte. O link é individual e possui validade limitada.</p>`,
    ctaLabel: "Redefinir minha senha",
    ctaUrl: actionLink,
    supportText:
      "Se você não solicitou a redefinição, ignore este e-mail. Sua senha atual continuará válida.",
  });

  const emailInput = {
    userId: user.id,
    eventKey: `password_recovery:${eventHash}`,
    eventType: "password_recovery",
    subject: "Redefinição de senha — CTP ANAPP",
    html,
  };
  if (await sendTrackedStudentEmail(admin, emailInput)) return true;
  return sendTrackedStudentEmail(admin, emailInput);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(req, { success: false, error: "SERVER_NOT_CONFIGURED" }, 500);
  }
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    if (req.method === "GET") {
      const token = new URL(req.url).searchParams.get("token") ?? "";
      if (token.length < 40) return redirect("/login?confirmation=invalid");
      const tokenHash = await sha256(token);
      const { data: verification } = await admin
        .from("student_email_verifications")
        .select("id,user_id,expires_at,used_at")
        .eq("token_hash", tokenHash)
        .maybeSingle();
      if (
        !verification ||
        verification.used_at ||
        new Date(verification.expires_at).getTime() <= Date.now()
      ) {
        return redirect("/login?confirmation=invalid");
      }

      const { error: confirmError } = await admin.auth.admin.updateUserById(
        verification.user_id,
        { email_confirm: true },
      );
      if (confirmError) throw confirmError;

      await admin
        .from("student_email_verifications")
        .update({ used_at: new Date().toISOString() })
        .eq("id", verification.id)
        .is("used_at", null);
      return redirect("/login?confirmed=1");
    }

    if (req.method !== "POST") {
      return json(req, { success: false, error: "METHOD_NOT_ALLOWED" }, 405);
    }
    const origin = req.headers.get("origin");
    if (!isAllowedSiteOrigin(origin)) {
      return json(req, { success: false, error: "ORIGIN_NOT_ALLOWED" }, 403);
    }
    const body = await req.json().catch(() => null) as JsonRecord | null;
    const action = typeof body?.action === "string" ? body.action : "register";
    const email = normalizeEmail(body?.email);
    if (!EMAIL_PATTERN.test(email)) {
      return json(req, { success: false, error: "INVALID_EMAIL" }, 400);
    }
    if (
      action !== "register" &&
      action !== "resend" &&
      action !== "recover"
    ) {
      return json(req, { success: false, error: "UNKNOWN_ACTION" }, 400);
    }

    const parsedRegistration = action === "register" && body
      ? parseCompleteRegistration(body)
      : { data: null, missing: [] };
    if (action === "register" && !strongPassword(body?.password)) {
      return json(
        req,
        { success: false, error: "INVALID_PASSWORD" },
        400,
      );
    }
    if (action === "register" && !parsedRegistration.data) {
      return json(
        req,
        {
          success: false,
          error: "INCOMPLETE_REGISTRATION",
          missing_fields: parsedRegistration.missing,
        },
        400,
      );
    }

    const rateKey = await sha256(`student-registration:${email}`);
    const { data: allowed } = await admin.rpc("consume_notification_rate_limit", {
      p_key: rateKey,
      p_limit: 4,
      p_window_seconds: 3600,
    });
    if (!allowed) {
      return json(req, { success: false, error: "RATE_LIMITED" }, 429);
    }

    const existingUser = await findUserByEmail(admin, email);

    if (action === "recover") {
      if (existingUser) {
        const sent = await sendRecoveryEmail(admin, existingUser);
        if (!sent) {
          return json(
            req,
            { success: false, error: "EMAIL_DELIVERY_FAILED" },
            503,
          );
        }
      }
      return json(req, {
        success: true,
        message:
          "Se existir uma conta associada ao endereço informado, o e-mail de recuperação foi enviado.",
      });
    }

    let targetUser = existingUser;
    let createdNewUser = false;
    if (action === "register") {
      const registration = parsedRegistration.data as CompleteRegistrationData;
      if (!targetUser) {
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password: body?.password as string,
          email_confirm: false,
          user_metadata: {
            full_name: registration.fullName,
            registration_complete: true,
          },
        });
        if (error || !data.user) throw error;
        targetUser = data.user;
        createdNewUser = true;
      } else if (!targetUser.email_confirmed_at) {
        const { data, error } = await admin.auth.admin.updateUserById(
          targetUser.id,
          {
            password: body?.password as string,
            user_metadata: {
              ...targetUser.user_metadata,
              full_name: registration.fullName,
              registration_complete: true,
            },
          },
        );
        if (error || !data.user) throw error;
        targetUser = data.user;
      }

      if (targetUser && !targetUser.email_confirmed_at) {
        const { error: profileError } = await admin
          .from("user_extended_profile")
          .upsert({
            user_id: targetUser.id,
            first_name: registration.firstName,
            last_name: registration.lastName,
            cpf: registration.cpf,
            birth_date: null,
            phone: registration.phone,
            rg: registration.rg,
            street: registration.street,
            number: registration.number,
            complement: registration.complement,
            neighborhood: registration.neighborhood,
            city: registration.city,
            state: registration.state,
            zip_code: registration.zipCode,
            gender: registration.gender,
            profile_completed: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        if (profileError) {
          if (createdNewUser) {
            await admin.auth.admin.deleteUser(targetUser.id);
          }
          return json(
            req,
            {
              success: false,
              error: profileError.code === "23505"
                ? "CPF_ALREADY_REGISTERED"
                : "PROFILE_PERSISTENCE_FAILED",
            },
            409,
          );
        }

        await Promise.all([
          admin
            .from("profiles")
            .update({
              full_name: registration.fullName,
              updated_at: new Date().toISOString(),
            })
            .eq("id", targetUser.id),
          admin
            .from("user_roles")
            .update({ full_name: registration.fullName })
            .eq("user_id", targetUser.id),
        ]);
      }
    }

    if (!targetUser || targetUser.email_confirmed_at) {
      return json(req, {
        success: true,
        message:
          "Se o cadastro puder ser confirmado, o e-mail foi enviado.",
      });
    }

    const sent = await sendConfirmationEmail(
      admin,
      supabaseUrl,
      targetUser,
    );
    if (!sent) {
      return json(
        req,
        { success: false, error: "EMAIL_DELIVERY_FAILED" },
        503,
      );
    }

    return json(req, {
      success: true,
      message: "E-mail de confirmação enviado.",
    });
  } catch (error) {
    console.error("student_registration_error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return json(req, {
      success: false,
      error: "REGISTRATION_TEMPORARILY_UNAVAILABLE",
    }, 500);
  }
});
