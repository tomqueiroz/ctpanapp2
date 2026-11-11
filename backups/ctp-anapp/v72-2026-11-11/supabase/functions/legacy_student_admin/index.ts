import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { responseSiteOrigin } from '../_shared/site-origin.ts';

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': responseSiteOrigin(origin),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
}

function json(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) });
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return json(req, { error: 'Função administrativa não configurada.' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(req, { error: 'Não autenticado.' }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    const caller = callerData.user;
    if (callerError || !caller) return json(req, { error: 'Não autenticado.' }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: roleData, error: roleError } = await admin
      .from('user_roles')
      .select('role, access_blocked')
      .eq('user_id', caller.id)
      .single();

    if (
      roleError ||
      !['admin', 'master_admin'].includes(roleData?.role ?? '') ||
      roleData?.access_blocked === true
    ) {
      return json(req, { error: 'Acesso administrativo obrigatório.' }, 403);
    }

    const payload = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (payload?.action !== 'authorize_email_change') {
      return json(req, { error: 'Ação inválida.' }, 400);
    }

    const targetUserId =
      typeof payload.target_user_id === 'string' ? payload.target_user_id : '';
    const newEmail = normalizeEmail(payload.new_email);
    const reason =
      typeof payload.reason === 'string' && payload.reason.trim()
        ? payload.reason.trim().slice(0, 500)
        : 'Alteração administrativa individual';

    if (!targetUserId || !newEmail) {
      return json(req, { error: 'Usuário e novo e-mail são obrigatórios.' }, 400);
    }

    const { data: authorization, error: authorizationError } = await admin.rpc(
      'lms_create_alumni_email_change_authorization',
      {
        p_target_user_id: targetUserId,
        p_new_email: newEmail,
        p_reason: reason,
        p_approved_by: caller.id,
      },
    );
    if (authorizationError) throw authorizationError;

    const { error: updateError } = await admin.auth.admin.updateUserById(targetUserId, {
      email: newEmail,
      email_confirm: true,
    });
    if (updateError) throw updateError;

    return json(req, {
      success: true,
      authorization_id: authorization?.authorization_id,
    });
  } catch (error) {
    return json(
      req,
      { error: error instanceof Error ? error.message : 'Erro interno.' },
      500,
    );
  }
});
