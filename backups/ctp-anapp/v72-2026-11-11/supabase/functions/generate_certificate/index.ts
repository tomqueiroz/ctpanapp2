import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { responseSiteOrigin } from '../_shared/site-origin.ts';
import { sendCertificateIssuedEmail } from '../_shared/certificate-email.ts';
import { normalizeCpf } from '../_shared/cpf.ts';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return response(req, {}, 200);
  if (req.method !== 'POST') return response(req, { error: 'Método não permitido.' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const authHeader = req.headers.get('Authorization');
    if (!supabaseUrl || !serviceRoleKey || !anonKey || !authHeader) {
      return response(req, { error: 'Não autenticado.' }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData.user;
    if (userError || !user) return response(req, { error: 'Sessão inválida.' }, 401);
    const requestBody = await req.json().catch(() => ({})) as {
      resend_email?: boolean;
    };
    const forceEmail = requestBody.resend_email === true;

    const { data: existing } = await admin
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_valid', true)
      .maybeSingle();
    if (existing) {
      const emailSent = await sendCertificateIssuedEmail(
        admin,
        user.id,
        existing,
        { force: forceEmail },
      );
      return response(req, {
        success: true,
        certificate: existing,
        email_sent: emailSent,
      });
    }

    const { data: eligibility, error: eligibilityError } = await caller.rpc(
      'lms_certificate_eligibility',
      { p_user_id: user.id },
    );
    if (eligibilityError) {
      return response(req, { error: 'Não foi possível validar a elegibilidade.' }, 400);
    }
    if (!eligibility?.eligible) {
      return response(req, { ...eligibility, error: eligibility?.reason }, 400);
    }

    const [{ data: profile }, { data: extended }] = await Promise.all([
      admin.from('profiles').select('full_name, email').eq('id', user.id).maybeSingle(),
      admin.from('user_extended_profile').select('first_name, last_name, cpf').eq('user_id', user.id).maybeSingle(),
    ]);

    const fullName = (
      profile?.full_name ||
      [extended?.first_name, extended?.last_name].filter(Boolean).join(' ') ||
      user.user_metadata?.full_name ||
      ''
    ).trim();
    const cpf = normalizeCpf(extended?.cpf || user.user_metadata?.cpf);

    if (!fullName || !cpf) {
      return response(
        req,
        {
          error:
            'Complete seu nome e um CPF válido no perfil antes de emitir o certificado.',
        },
        400,
      );
    }

    const now = new Date();
    const certNumber = `CTP-${now.getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const verificationCode = crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase();

    const { data: certificate, error: certificateError } = await admin
      .from('certificates')
      .insert({
        user_id: user.id,
        certificate_number: certNumber,
        full_name: fullName.toUpperCase(),
        cpf,
        course_name: 'Curso Técnico de Piscinas - CTP ANAPP',
        completion_date: now.toISOString().slice(0, 10),
        total_hours: 160,
        final_score: eligibility.final_exam_score,
        final_exam_score: eligibility.final_exam_score,
        verification_code: verificationCode,
        is_valid: true,
      })
      .select()
      .single();

    if (certificateError) {
      if (certificateError.code === '23505') {
        const { data: concurrentCertificate } = await admin
          .from('certificates')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_valid', true)
          .maybeSingle();
        if (concurrentCertificate) {
          const emailSent = await sendCertificateIssuedEmail(
            admin,
            user.id,
            concurrentCertificate,
            { force: forceEmail },
          );
          return response(req, {
            success: true,
            certificate: concurrentCertificate,
            email_sent: emailSent,
          });
        }
      }
      return response(req, { error: 'Erro ao emitir certificado.' }, 500);
    }

    const emailSent = await sendCertificateIssuedEmail(
      admin,
      user.id,
      certificate,
      { force: forceEmail },
    );
    return response(req, {
      success: true,
      certificate,
      email_sent: emailSent,
    });
  } catch (error) {
    return response(
      req,
      { error: error instanceof Error ? error.message : 'Erro interno.' },
      500,
    );
  }
});
