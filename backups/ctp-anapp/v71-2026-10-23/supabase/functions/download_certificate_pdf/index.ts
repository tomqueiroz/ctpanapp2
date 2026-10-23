import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { responseSiteOrigin } from '../_shared/site-origin.ts';

function response(req: Request, body: unknown, status = 200) {
  const origin = req.headers.get('origin');
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': responseSiteOrigin(origin),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type',
      'Content-Type': 'application/json',
      Vary: 'Origin',
    },
  });
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11
    ? `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
    : value;
}

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00-03:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return response(req, {});
  if (req.method !== 'POST') return response(req, { error: 'Método não permitido.' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = req.headers.get('Authorization');
    if (!supabaseUrl || !serviceRoleKey || !authHeader) {
      return response(req, { error: 'Não autenticado.' }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: userError } = await admin.auth.getUser(
      authHeader.replace(/^Bearer\s+/i, ''),
    );
    if (userError || !userData.user) return response(req, { error: 'Sessão inválida.' }, 401);

    const { data: foundCertificate, error } = await admin
      .from('certificates')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('is_valid', true)
      .maybeSingle();
    if (error || !foundCertificate) {
      return response(req, { error: 'Certificado válido não encontrado.' }, 404);
    }

    let certificate = foundCertificate;
    if (!String(certificate.verification_code || '').trim()) {
      const verificationCode = crypto.randomUUID()
        .split('-')
        .join('')
        .slice(0, 16)
        .toUpperCase();
      const { data: updatedCertificate, error: updateError } = await admin
        .from('certificates')
        .update({ verification_code: verificationCode })
        .eq('id', certificate.id)
        .select('*')
        .single();
      if (updateError || !updatedCertificate) {
        return response(
          req,
          { error: 'Não foi possível preparar o código da carteirinha.' },
          500,
        );
      }
      certificate = updatedCertificate;
    }

    return response(req, {
      success: true,
      certificate: {
        ...certificate,
        formatted_name: String(certificate.full_name || '').toUpperCase(),
        formatted_cpf: formatCpf(certificate.cpf || ''),
        formatted_date: formatDate(certificate.completion_date || ''),
        formatted_location_date:
          `São Paulo, ${formatDate(certificate.completion_date || '')}.`,
      },
    });
  } catch (error) {
    return response(
      req,
      { error: error instanceof Error ? error.message : 'Erro interno.' },
      500,
    );
  }
});
