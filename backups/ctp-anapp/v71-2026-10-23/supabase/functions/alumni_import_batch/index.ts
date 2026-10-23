import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { responseSiteOrigin } from '../_shared/site-origin.ts';

type AlumniInput = {
  email: string;
  full_name?: string;
  cpf?: string;
  phone?: string;
  alumni_type?: 'alumni' | 'certified_professional' | 'alumni_certified';
  cert_number?: string;
  year?: number;
};

function headers(req: Request) {
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
  return new Response(JSON.stringify(body), { status, headers: headers(req) });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: headers(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const authHeader = req.headers.get('Authorization');
    if (!supabaseUrl || !serviceRoleKey || !anonKey || !authHeader) {
      return json(req, { error: 'Não autenticado.' }, 401);
    }

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
    const { data: roleData } = await admin
      .from('user_roles')
      .select('role, access_blocked')
      .eq('user_id', caller.id)
      .single();
    if (
      !roleData ||
      !['admin', 'master_admin'].includes(roleData.role) ||
      roleData.access_blocked === true
    ) {
      return json(req, { error: 'Acesso administrativo obrigatório.' }, 403);
    }

    const body = await req.json().catch(() => null);
    const alumni: AlumniInput[] = Array.isArray(body)
      ? body
      : Array.isArray((body as { alumni?: unknown } | null)?.alumni)
        ? ((body as { alumni: AlumniInput[] }).alumni)
        : [];

    if (alumni.length === 0 || alumni.length > 100) {
      return json(req, { error: 'Envie entre 1 e 100 registros.' }, 400);
    }

    const result = { total: alumni.length, inserted: 0, skipped: 0, errors: 0 };
    for (const item of alumni) {
      const { data, error } = await admin.rpc('admin_import_alumni', {
        p_email: item.email,
        p_full_name: item.full_name ?? null,
        p_cpf: item.cpf ?? null,
        p_phone: item.phone ?? null,
        p_alumni_type: item.alumni_type ?? 'alumni',
        p_cert_number: item.cert_number ?? null,
        p_year: item.year ?? null,
      });

      if (error) {
        result.errors += 1;
      } else if (data?.action === 'inserted') {
        result.inserted += 1;
      } else {
        result.skipped += 1;
      }
    }

    await admin.from('lms_admin_audit_log').insert({
      actor_user_id: caller.id,
      action: 'import_alumni_batch',
      details: result,
    });

    return json(req, { success: result.errors === 0, ...result });
  } catch (error) {
    return json(
      req,
      { error: error instanceof Error ? error.message : 'Erro interno.' },
      500,
    );
  }
});
