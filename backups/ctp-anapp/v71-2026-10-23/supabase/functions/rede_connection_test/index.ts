import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  isAllowedSiteOrigin,
  responseSiteOrigin,
} from "../_shared/site-origin.ts";

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

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": responseSiteOrigin(origin),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function respond(req: Request, body: JsonRecord, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req.headers.get("origin")),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: isAllowedSiteOrigin(origin) ? 204 : 403,
      headers: corsHeaders(origin),
    });
  }
  if (req.method !== "POST") {
    return respond(req, { success: false, error: "Método não permitido" }, 405);
  }
  if (!isAllowedSiteOrigin(origin)) {
    return respond(req, { success: false, error: "ORIGIN_NOT_ALLOWED" }, 403);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const environment = Deno.env.get("REDE_ENVIRONMENT")?.trim();
    const clientId = Deno.env.get("REDE_CLIENT_ID")?.trim();
    const clientSecret = Deno.env.get("REDE_CLIENT_SECRET")?.trim();
    const pv = Deno.env.get("REDE_PV")?.trim();
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return respond(
        req,
        { success: false, error: "Configuração interna indisponível" },
        503,
      );
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return respond(req, { success: false, error: "Sessão obrigatória" }, 401);
    }
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();
    if (userError || !user) {
      return respond(req, { success: false, error: "Sessão inválida" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "master_admin"]);
    if (!roles?.length) {
      return respond(req, { success: false, error: "Acesso administrativo obrigatório" }, 403);
    }

    const input = await req.json().catch(() => ({})) as JsonRecord;
    const expectedEnvironment =
      typeof input.expected_environment === "string"
        ? input.expected_environment
        : "";
    const expectedPv =
      typeof input.expected_pv === "string" ? input.expected_pv.trim() : "";

    if (
      environment !== "sandbox" &&
      environment !== "production"
    ) {
      return respond(
        req,
        {
          success: false,
          error: "REDE_ENVIRONMENT não configurado no servidor",
          code: "PAYMENT_CONFIGURATION_INVALID",
        },
        503,
      );
    }
    if (!clientId || !clientSecret || !pv) {
      return respond(
        req,
        {
          success: false,
          error: "Credenciais da Rede ausentes no Supabase Secrets",
          code: "PAYMENT_CONFIGURATION_INVALID",
        },
        503,
      );
    }
    if (expectedEnvironment && expectedEnvironment !== environment) {
      return respond(
        req,
        {
          success: false,
          error: "O ambiente salvo no painel não coincide com o servidor",
          code: "ENVIRONMENT_MISMATCH",
        },
        409,
      );
    }
    if (expectedPv && expectedPv !== pv) {
      return respond(
        req,
        {
          success: false,
          error: "O PV salvo no painel não coincide com o servidor",
          code: "PV_MISMATCH",
        },
        409,
      );
    }

    const endpoint = ENDPOINTS[environment];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let response: Response;
    try {
      response = await fetch(endpoint.tokenUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    const result = await response.json().catch(() => ({})) as JsonRecord;
    if (!response.ok || typeof result.access_token !== "string") {
      return respond(
        req,
        {
          success: false,
          error: "Credencial rejeitada pelo ambiente selecionado da Rede",
          code: "REDE_OAUTH_FAILED",
          environment,
          http_status: response.status,
        },
        502,
      );
    }

    return respond(
      req,
      {
        success: true,
        message: "OAuth validado sem executar transação",
        environment,
        pv_last4: pv.slice(-4),
        token_endpoint: endpoint.tokenUrl,
        transaction_api: endpoint.apiUrl,
        expires_in:
          typeof result.expires_in === "number" ? result.expires_in : null,
      },
    );
  } catch (error) {
    console.error("rede_connection_test_error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return respond(
      req,
      {
        success: false,
        error: "Falha ao testar a conexão com a Rede",
        code: "CONNECTION_TEST_FAILED",
      },
      500,
    );
  }
});
