import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  isAllowedSiteOrigin,
  responseSiteOrigin,
} from '../_shared/site-origin.ts';
import {
  escapeEmailHtml,
  htmlToPlainText,
  renderCtpEmail,
  transactionalEmailFrom,
} from '../_shared/email-template.ts';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': responseSiteOrigin(origin),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

function clean(value: unknown, maxLength: number): string {
  return String(value ?? '').trim().slice(0, maxLength);
}

function wrapEmail(title: string, body: string): string {
  return renderCtpEmail({
    preheader: `${title} — CTP ANAPP`,
    eyebrow: 'Notificação administrativa',
    title,
    bodyHtml: body,
    supportText: 'Mensagem automática gerada pelo portal administrativo do CTP ANAPP.',
  });
}

function row(label: string, value: unknown): string {
  return `<tr>
    <th style="padding:10px 14px;border:1px solid #e2e8f0;background:#f8fafc;font-size:14px;text-align:left;width:160px">${escapeEmailHtml(label)}</th>
    <td style="padding:10px 14px;border:1px solid #e2e8f0;font-size:14px">${escapeEmailHtml(value || '-')}</td>
  </tr>`;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return { success: false, error: 'EMAIL_PROVIDER_NOT_CONFIGURED' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: transactionalEmailFrom(),
      to: [to],
      subject,
      html,
      text: htmlToPlainText(html),
    }),
  });

  if (!response.ok) {
    console.error('Notification email provider rejected the request', response.status);
    return { success: false, error: 'EMAIL_PROVIDER_REJECTED' };
  }

  const result = await response.json();
  return { success: true, id: result.id as string | undefined };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') return json({ success: false, error: 'METHOD_NOT_ALLOWED' }, 405, origin);
  if (!isAllowedSiteOrigin(origin)) {
    return json({ success: false, error: 'ORIGIN_NOT_ALLOWED' }, 403, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL');
  if (!supabaseUrl || !serviceRoleKey || !adminEmail) {
    return json({ success: false, error: 'SERVER_NOT_CONFIGURED' }, 500, origin);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const payload = await req.json();
    const type = clean(payload?.type, 32);
    const data = payload?.data && typeof payload.data === 'object' ? payload.data : {};
    if (!['newsletter', 'checklist', 'signup', 'payment'].includes(type)) {
      return json({ success: false, error: 'INVALID_NOTIFICATION_TYPE' }, 400, origin);
    }

    const forwardedFor = clean(req.headers.get('x-forwarded-for')?.split(',')[0], 64);
    const clientKey = await sha256(`${type}:${forwardedFor || 'unknown'}`);
    const { data: allowed, error: rateError } = await admin.rpc(
      'consume_notification_rate_limit',
      { p_key: clientKey, p_limit: type === 'newsletter' ? 5 : 10, p_window_seconds: 3600 },
    );
    if (rateError) throw rateError;
    if (!allowed) return json({ success: false, error: 'RATE_LIMITED' }, 429, origin);

    const authorization = req.headers.get('Authorization');
    const token = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    let authenticatedUser: { id: string; email?: string } | null = null;
    let isAdminOrService = token === serviceRoleKey;

    if (token && !isAdminOrService) {
      const { data: authData } = await admin.auth.getUser(token);
      authenticatedUser = authData.user
        ? { id: authData.user.id, email: authData.user.email }
        : null;
      if (authenticatedUser) {
        const { data: role } = await admin
          .from('user_roles')
          .select('role,access_blocked')
          .eq('user_id', authenticatedUser.id)
          .maybeSingle();
        isAdminOrService =
          Boolean(role) &&
          !role?.access_blocked &&
          ['admin', 'master_admin'].includes(role?.role);
      }
    }

    if (type === 'signup' && !authenticatedUser) {
      return json({ success: false, error: 'AUTHENTICATION_REQUIRED' }, 401, origin);
    }
    if (type === 'payment' && !isAdminOrService) {
      return json({ success: false, error: 'ADMIN_REQUIRED' }, 403, origin);
    }

    let subject = '';
    let html = '';

    if (type === 'newsletter') {
      const email = clean(data.email, 254).toLowerCase();
      if (!EMAIL_PATTERN.test(email)) {
        return json({ success: false, error: 'INVALID_EMAIL' }, 400, origin);
      }
      const emailKey = await sha256(`newsletter:${email}`);
      const { data: emailAllowed } = await admin.rpc('consume_notification_rate_limit', {
        p_key: emailKey,
        p_limit: 2,
        p_window_seconds: 86400,
      });
      if (!emailAllowed) return json({ success: false, error: 'ALREADY_REGISTERED' }, 429, origin);

      const { error: subscriberError } = await admin
        .from('newsletter_subscribers')
        .upsert({ email, is_active: true }, { onConflict: 'email' });
      if (subscriberError) throw subscriberError;

      subject = 'Nova inscrição na Newsletter — CTP ANAPP';
      html = wrapEmail(
        'Nova inscrição na Newsletter',
        `<table style="border-collapse:collapse;width:100%">${row('E-mail', email)}${row(
          'Data/Hora',
          new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        )}</table>`,
      );
    } else if (type === 'checklist') {
      subject = 'Novo relatório de checklist — CTP ANAPP';
      html = wrapEmail(
        'Novo relatório de checklist',
        `<table style="border-collapse:collapse;width:100%">
          ${row('Data da visita', clean(data.date, 32))}
          ${row('Cliente', clean(data.clientName, 160))}
          ${row('Endereço', clean(data.clientAddress, 300))}
          ${row('Telefone', clean(data.clientPhone, 40))}
          ${row('E-mail', clean(data.clientEmail, 254))}
          ${row('Categoria', clean(data.category, 80))}
          ${row('Observações', clean(data.notes, 1000))}
        </table>`,
      );
    } else if (type === 'signup') {
      const requestedUserId = clean(data.userId, 64);
      if (requestedUserId && requestedUserId !== authenticatedUser?.id) {
        return json({ success: false, error: 'USER_MISMATCH' }, 403, origin);
      }
      subject = 'Novo cadastro no CTP ANAPP';
      html = wrapEmail(
        'Novo usuário cadastrado',
        `<table style="border-collapse:collapse;width:100%">
          ${row('Nome', clean(data.name, 160))}
          ${row('E-mail', authenticatedUser?.email)}
          ${row('ID', authenticatedUser?.id)}
        </table>`,
      );
    } else {
      subject = 'Atualização de pagamento — CTP ANAPP';
      html = wrapEmail(
        'Atualização de pagamento',
        `<table style="border-collapse:collapse;width:100%">
          ${row('Usuário', clean(data.userName, 160))}
          ${row('E-mail', clean(data.userEmail, 254))}
          ${row('Plano', clean(data.planName, 120))}
          ${row('Valor', clean(data.amount, 32))}
          ${row('Método', clean(data.paymentMethod, 60))}
          ${row('Status', clean(data.status, 40))}
        </table>`,
      );
    }

    const emailResult = await sendEmail(adminEmail, subject, html);
    await admin.from('admin_messages').insert({
      message: JSON.stringify({
        event: 'notification_email',
        type,
        sent: emailResult.success,
        provider_error: emailResult.success ? null : emailResult.error,
        created_at: new Date().toISOString(),
      }),
      created_at: new Date().toISOString(),
    });

    return json(
      {
        success: true,
        type,
        emailSent: emailResult.success,
        emailId: emailResult.success ? emailResult.id : undefined,
        emailError: emailResult.success ? undefined : emailResult.error,
      },
      200,
      origin,
    );
  } catch (error) {
    console.error('Notification function failed', error instanceof Error ? error.message : 'unknown');
    return json({ success: false, error: 'NOTIFICATION_FAILED' }, 500, origin);
  }
});
