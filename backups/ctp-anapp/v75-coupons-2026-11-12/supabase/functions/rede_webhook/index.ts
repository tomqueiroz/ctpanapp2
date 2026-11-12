import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import { CANONICAL_PUBLIC_ORIGIN } from "../_shared/site-origin.ts";
import {
  escapeEmailHtml,
  renderCtpEmail,
} from "../_shared/email-template.ts";
import { sendTrackedStudentEmail } from "../_shared/student-email.ts";

type JsonRecord = Record<string, unknown>;

const ENDPOINTS = {
  sandbox: {
    tokenUrl: "https://rl7-sandbox-api.useredecloud.com.br/oauth2/token",
    apiUrl: "https://sandbox-erede.useredecloud.com.br/v2",
  },
  production: {
    tokenUrl: "https://api.userede.com.br/redelabs/oauth2/token",
    apiUrl: "https://api.userede.com.br/erede/v2",
  },
} as const;

function respond(body: JsonRecord, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function getToken(
  environment: "sandbox" | "production",
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(ENDPOINTS[environment].tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({})) as JsonRecord;
    if (!response.ok || typeof result.access_token !== "string") {
      throw new Error("Rede OAuth failed");
    }
    return result.access_token;
  } finally {
    clearTimeout(timeout);
  }
}

function isApproved(result: JsonRecord): boolean {
  const returnCode =
    typeof result.returnCode === "string" ? result.returnCode : "";
  const status =
    typeof result.status === "string" ? result.status.toLowerCase() : "";
  return (
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
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
  const html = renderCtpEmail({
    preheader: "Pagamento aprovado. Seu acesso completo ao CTP ANAPP já está liberado.",
    eyebrow: "Inscrição confirmada",
    title: "Pagamento aprovado e acesso liberado",
    bodyHtml: `
      <p style="margin:0 0 16px">Olá, <strong>${escapeEmailHtml(profile?.full_name || "aluno(a)", 160)}</strong>.</p>
      <p style="margin:0 0 16px">Sua inscrição no plano <strong>${escapeEmailHtml(planName, 160)}</strong>, no valor de <strong>${escapeEmailHtml(formattedAmount, 40)}</strong>, foi aprovada.</p>
      <p style="margin:0">Todos os capítulos, avaliações, ferramentas e recursos de certificação já estão disponíveis no seu portal.</p>`,
    ctaLabel: "Acessar o CTP ANAPP",
    ctaUrl: `${CANONICAL_PUBLIC_ORIGIN}/login`,
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
  if (req.method !== "POST") {
    return respond({ received: false, error: "Método não permitido" }, 405);
  }

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > 65_536) {
      return respond({ received: false, error: "Payload muito grande" }, 413);
    }

    const body = await req.json().catch(() => null) as JsonRecord | null;
    if (!body) {
      return respond({ received: false, error: "Payload inválido" }, 400);
    }
    const transactionId =
      typeof body.tid === "string"
        ? body.tid
        : typeof body.transactionId === "string"
          ? body.transactionId
          : "";
    const reference =
      typeof body.reference === "string" ? body.reference : "";
    if (!transactionId && !reference) {
      return respond(
        { received: false, error: "Transação ou referência obrigatória" },
        400,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const clientId = Deno.env.get("REDE_CLIENT_ID")?.trim();
    const clientSecret = Deno.env.get("REDE_CLIENT_SECRET")?.trim();
    const pv = Deno.env.get("REDE_PV")?.trim();
    const environment = Deno.env.get("REDE_ENVIRONMENT")?.trim();
    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !clientId ||
      !clientSecret ||
      !pv ||
      (environment !== "sandbox" && environment !== "production")
    ) {
      throw new Error("Payment configuration missing");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    let paymentQuery = adminClient
      .from("payments")
      .select(
        "id,user_id,amount,status,gateway_transaction_id,gateway_reference,gateway_environment,metadata",
      );
    paymentQuery = transactionId
      ? paymentQuery.eq("gateway_transaction_id", transactionId)
      : paymentQuery.eq("gateway_reference", reference);
    const { data: payment, error: paymentError } = await paymentQuery
      .limit(1)
      .maybeSingle();
    if (paymentError) throw paymentError;
    if (!payment) {
      return respond(
        { received: true, reconciled: false, reason: "PAYMENT_NOT_FOUND" },
        202,
      );
    }
    if (payment.gateway_environment !== environment) {
      return respond(
        { received: true, reconciled: false, reason: "ENVIRONMENT_MISMATCH" },
        409,
      );
    }
    if (payment.status === "approved") {
      const isLiveTest =
        payment.metadata &&
        typeof payment.metadata === "object" &&
        (payment.metadata as JsonRecord).live_test === true;
      if (!isLiveTest) {
        const { data: accessGranted, error: accessError } = await adminClient
          .rpc("lms_activate_paid_access", {
            p_user_id: payment.user_id,
            p_payment_id: payment.id,
          });
        if (accessError || accessGranted !== true) {
          throw accessError ?? new Error("Access grant failed");
        }
      }
      const planName =
        payment.metadata &&
        typeof payment.metadata === "object" &&
        typeof (payment.metadata as JsonRecord).plan_name === "string"
          ? (payment.metadata as JsonRecord).plan_name as string
          : "CTP ANAPP";
      const paymentEmailSent = await sendPaymentApprovedEmail(
        adminClient,
        payment.user_id,
        payment.id,
        planName,
        Number(payment.amount),
      );
      return respond({
        received: true,
        reconciled: true,
        status: "approved",
        email_sent: paymentEmailSent,
      });
    }
    if (!transactionId) {
      return respond(
        { received: true, reconciled: false, reason: "TID_REQUIRED" },
        202,
      );
    }

    const token = await getToken(environment, clientId, clientSecret);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let verificationResponse: Response;
    try {
      verificationResponse = await fetch(
        `${ENDPOINTS[environment].apiUrl}/transactions/${encodeURIComponent(transactionId)}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-pv": pv,
          },
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }
    const verified = await verificationResponse
      .json()
      .catch(() => ({})) as JsonRecord;
    if (!verificationResponse.ok) {
      throw new Error("Rede transaction verification failed");
    }

    const verifiedReference =
      typeof verified.reference === "string" ? verified.reference : "";
    if (
      payment.gateway_reference &&
      verifiedReference &&
      payment.gateway_reference !== verifiedReference
    ) {
      return respond(
        { received: true, reconciled: false, reason: "REFERENCE_MISMATCH" },
        409,
      );
    }
    const verifiedAmount =
      typeof verified.amount === "number"
        ? verified.amount
        : Number(verified.amount ?? NaN);
    if (
      Number.isFinite(verifiedAmount) &&
      verifiedAmount !== Math.round(Number(payment.amount) * 100)
    ) {
      return respond(
        { received: true, reconciled: false, reason: "AMOUNT_MISMATCH" },
        409,
      );
    }

    const approved = isApproved(verified);
    const safeGatewayResponse = Object.fromEntries(
      Object.entries(verified).filter(
        ([key]) => !/(card|security|cvv|token|secret)/i.test(key),
      ),
    );
    const { error: updateError } = await adminClient
      .from("payments")
      .update({
        status: approved ? "approved" : "rejected",
        gateway_transaction_id: transactionId,
        transaction_id: transactionId,
        gateway_response: safeGatewayResponse,
        failure_code: approved
          ? null
          : typeof verified.returnCode === "string"
            ? verified.returnCode
            : "REDE_REJECTED",
        paid_at: approved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);
    if (updateError) throw updateError;

    let paymentEmailSent = false;
    if (approved) {
      const isLiveTest =
        payment.metadata &&
        typeof payment.metadata === "object" &&
        (payment.metadata as JsonRecord).live_test === true;
      if (!isLiveTest) {
        const { data: accessGranted, error: accessError } = await adminClient
          .rpc("lms_activate_paid_access", {
            p_user_id: payment.user_id,
            p_payment_id: payment.id,
          });
        if (accessError || accessGranted !== true) throw accessError ?? new Error("Access grant failed");
      }
      const planName =
        payment.metadata &&
        typeof payment.metadata === "object" &&
        typeof (payment.metadata as JsonRecord).plan_name === "string"
          ? (payment.metadata as JsonRecord).plan_name as string
          : "CTP ANAPP";
      paymentEmailSent = await sendPaymentApprovedEmail(
        adminClient,
        payment.user_id,
        payment.id,
        planName,
        Number(payment.amount),
      );
    }

    console.info("rede_webhook_reconciled", {
      paymentId: payment.id,
      approved,
      environment,
    });
    return respond({
      received: true,
      reconciled: true,
      status: approved ? "approved" : "rejected",
      email_sent: paymentEmailSent,
    });
  } catch (error) {
    console.error("rede_webhook_error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return respond(
      { received: false, error: "Falha temporária de conciliação" },
      500,
    );
  }
});
