import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  isAllowedSiteOrigin,
  responseSiteOrigin,
} from '../_shared/site-origin.ts';
import { sendCertificateIssuedEmail } from '../_shared/certificate-email.ts';

function headers(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': responseSiteOrigin(origin),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(origin) });
  if (req.method !== 'POST') return json({ success: false, error: 'METHOD_NOT_ALLOWED' }, 405, origin);
  if (!isAllowedSiteOrigin(origin)) {
    return json({ success: false, error: 'ORIGIN_NOT_ALLOWED' }, 403, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = req.headers.get('Authorization');
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
    return json({ success: false, error: 'AUTHENTICATION_REQUIRED' }, 401, origin);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = authorization.replace(/^Bearer\s+/i, '');
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) {
    return json({ success: false, error: 'AUTHENTICATION_REQUIRED' }, 401, origin);
  }

  const { data: role } = await admin
    .from('user_roles')
    .select('role,access_blocked')
    .eq('user_id', authData.user.id)
    .maybeSingle();
  if (
    !role ||
    role.access_blocked ||
    !['admin', 'master_admin'].includes(role.role)
  ) {
    return json({ success: false, error: 'ADMIN_REQUIRED' }, 403, origin);
  }

  try {
    const body = await req.json();
    const targetUserId = String(body?.targetUserId ?? body?.userId ?? '').trim();
    const certificateNumber = body?.certificateNumber
      ? String(body.certificateNumber).trim().slice(0, 80)
      : null;
    const certificateFullName = body?.certificateFullName
      ? String(body.certificateFullName).trim().slice(0, 200)
      : null;
    const certificateCpf = body?.certificateCpf
      ? String(body.certificateCpf).replace(/\D/g, '').slice(0, 11)
      : null;
    if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) {
      return json({ success: false, error: 'INVALID_USER_ID' }, 400, origin);
    }

    const { data, error } = await userClient.rpc('admin_issue_certificate', {
      target_user_id: targetUserId,
      cert_number: certificateNumber,
      cert_full_name: certificateFullName,
      cert_cpf: certificateCpf,
    });
    if (error) {
      console.error('Certificate RPC failed', error.code);
      return json({ success: false, error: 'CERTIFICATE_ISSUE_FAILED' }, 400, origin);
    }

    const certificate =
      data && typeof data === 'object' && !Array.isArray(data)
        ? data as Record<string, unknown>
        : {};
    const emailSent = await sendCertificateIssuedEmail(
      admin,
      targetUserId,
      {
        certificate_number:
          typeof certificate.certificate_number === 'string'
            ? certificate.certificate_number
            : null,
        verification_code:
          typeof certificate.verification_code === 'string'
            ? certificate.verification_code
            : null,
        full_name:
          typeof certificate.full_name === 'string'
            ? certificate.full_name
            : null,
        completion_date:
          typeof certificate.completion_date === 'string'
            ? certificate.completion_date
            : null,
      },
    );

    return json({
      success: true,
      certificate: data,
      email_sent: emailSent,
    }, 200, origin);
  } catch {
    return json({ success: false, error: 'INVALID_REQUEST' }, 400, origin);
  }
});
