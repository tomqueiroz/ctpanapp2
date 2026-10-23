const projectRef = "egihufoowzfykieozusr";
const canonicalOrigin = "https://cursoanapp.org.br";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

if (!accessToken) {
  throw new Error("SUPABASE_ACCESS_TOKEN não configurado.");
}

const colors = {
  primary: "#0072BC",
  accent: "#FF6B00",
  background: "#F4F7FA",
  surface: "#FFFFFF",
  text: "#172033",
  muted: "#475569",
  border: "#DCE5EE",
};

function template({ preheader, eyebrow, title, body, ctaLabel, ctaUrl, support }) {
  const cta = ctaLabel && ctaUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 8px">
        <tr><td bgcolor="${colors.primary}" style="border-radius:8px">
          <a href="${ctaUrl}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;border-radius:8px">${ctaLabel}</a>
        </td></tr>
      </table>`
    : "";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:${colors.background};color:${colors.text}">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${colors.background}">
      <tr><td align="center" style="padding:28px 12px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px">
          <tr><td style="background:${colors.primary};padding:25px 30px;border-radius:12px 12px 0 0">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:800;letter-spacing:.2px;color:#ffffff">CTP ANAPP</div>
            <div style="margin-top:5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#DDF2FF">Curso Técnico de Piscinas</div>
          </td></tr>
          <tr><td style="height:5px;background:${colors.accent};font-size:0;line-height:0">&nbsp;</td></tr>
          <tr><td style="background:${colors.surface};padding:34px 30px;border-left:1px solid ${colors.border};border-right:1px solid ${colors.border}">
            <div style="margin-bottom:10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${colors.primary}">${eyebrow}</div>
            <h1 style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:27px;line-height:1.25;color:${colors.text}">${title}</h1>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:${colors.muted}">${body}</div>
            ${cta}
          </td></tr>
          <tr><td style="background:#F8FAFC;padding:20px 30px;border:1px solid ${colors.border};border-radius:0 0 12px 12px">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#64748B">${support}</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#64748B">
              <a href="${canonicalOrigin}" style="color:${colors.primary};font-weight:700;text-decoration:none">cursoanapp.org.br</a>
              &nbsp;·&nbsp; CTP ANAPP © 2026
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

const securitySupport =
  "Se você não realizou esta ação, redefina sua senha e entre em contato imediatamente com a administração do CTP ANAPP.";

const payload = {
  site_url: canonicalOrigin,
  uri_allow_list: [
    canonicalOrigin,
    `${canonicalOrigin}/**`,
    "https://www.cursoanapp.org.br",
    "https://www.cursoanapp.org.br/**",
    "https://ctp-anapp-3.skywork.website",
    "https://ctp-anapp-3.skywork.website/**",
  ].join(","),

  mailer_subjects_confirmation: "Bem-vindo ao CTP ANAPP — confirme seu cadastro",
  mailer_templates_confirmation_content: template({
    preheader: "Confirme seu cadastro e inicie o Capítulo Zero do CTP ANAPP.",
    eyebrow: "Sua jornada começa aqui",
    title: "Bem-vindo ao CTP ANAPP",
    body: `<p style="margin:0 0 16px">Seu cadastro no <strong>Curso Técnico de Piscinas</strong> foi iniciado com sucesso.</p>
      <p style="margin:0 0 16px">No Capítulo Zero, você conhecerá a metodologia de ensino, os objetivos da formação e o caminho até a certificação profissional.</p>
      <p style="margin:0">Esta jornada foi criada para elevar sua atuação: de um tratador comum a um <strong>Especialista em Piscinas reconhecido no mercado</strong>, com conhecimento técnico, visão empreendedora e a chancela da ANAPP.</p>`,
    ctaLabel: "Confirmar cadastro e iniciar o Capítulo Zero",
    ctaUrl: "{{ .ConfirmationURL }}",
    support: "Este link confirma seu e-mail e protege o acesso à sua conta. Se você não iniciou este cadastro, ignore a mensagem.",
  }),

  mailer_subjects_invite: "Você foi convidado para o CTP ANAPP",
  mailer_templates_invite_content: template({
    preheader: "Ative sua conta e comece sua jornada no Curso Técnico de Piscinas.",
    eyebrow: "Convite de acesso",
    title: "Sua vaga no CTP ANAPP foi criada",
    body: `<p style="margin:0 0 16px">A administração do CTP ANAPP criou seu acesso ao <strong>Curso Técnico de Piscinas</strong>.</p>
      <p style="margin:0 0 16px">Ao ativar a conta, você poderá definir sua senha e acessar o portal com o e-mail cadastrado.</p>
      <p style="margin:0">Comece pelo Capítulo Zero para conhecer a metodologia, os objetivos da formação e a jornada até sua certificação profissional.</p>`,
    ctaLabel: "Ativar minha conta",
    ctaUrl: "{{ .ConfirmationURL }}",
    support: "Este convite é pessoal e foi enviado ao e-mail cadastrado pela administração do CTP ANAPP.",
  }),

  mailer_subjects_recovery: "Redefinição de senha — CTP ANAPP",
  mailer_templates_recovery_content: template({
    preheader: "Use o link seguro para criar uma nova senha no CTP ANAPP.",
    eyebrow: "Segurança da conta",
    title: "Crie uma nova senha",
    body: `<p style="margin:0 0 16px">Recebemos uma solicitação para redefinir a senha da sua conta no CTP ANAPP.</p>
      <p style="margin:0">Use o botão abaixo para escolher uma nova senha forte. O link é individual e expira por segurança.</p>`,
    ctaLabel: "Redefinir minha senha",
    ctaUrl: "{{ .ConfirmationURL }}",
    support: "Se você não solicitou a redefinição, ignore este e-mail. Sua senha atual continuará válida.",
  }),

  mailer_subjects_magic_link: "Seu acesso seguro ao CTP ANAPP",
  mailer_templates_magic_link_content: template({
    preheader: "Acesse o portal do CTP ANAPP com este link individual.",
    eyebrow: "Acesso seguro",
    title: "Seu link de acesso está pronto",
    body: `<p style="margin:0 0 16px">Use o botão abaixo para entrar com segurança no portal do CTP ANAPP.</p>
      <p style="margin:0">Este link é individual, possui validade curta e só pode ser utilizado uma vez.</p>`,
    ctaLabel: "Entrar no CTP ANAPP",
    ctaUrl: "{{ .ConfirmationURL }}",
    support: "Se você não solicitou este acesso, ignore a mensagem.",
  }),

  mailer_subjects_email_change: "Confirme seu novo e-mail — CTP ANAPP",
  mailer_templates_email_change_content: template({
    preheader: "Confirme o novo endereço de e-mail da sua conta CTP ANAPP.",
    eyebrow: "Atualização cadastral",
    title: "Confirme a alteração de e-mail",
    body: `<p style="margin:0 0 16px">Foi solicitada a alteração do e-mail da sua conta para <strong>{{ .NewEmail }}</strong>.</p>
      <p style="margin:0">Confirme o novo endereço pelo botão abaixo para concluir a atualização.</p>`,
    ctaLabel: "Confirmar novo e-mail",
    ctaUrl: "{{ .ConfirmationURL }}",
    support: "Se você não solicitou esta alteração, não confirme o link e avise a administração do CTP ANAPP.",
  }),

  mailer_subjects_reauthentication: "{{ .Token }} é seu código de verificação — CTP ANAPP",
  mailer_templates_reauthentication_content: template({
    preheader: "Use o código temporário para confirmar sua identidade.",
    eyebrow: "Verificação de segurança",
    title: "Confirme sua identidade",
    body: `<p style="margin:0 0 16px">Use o código abaixo para concluir a operação protegida no CTP ANAPP:</p>
      <div style="margin:22px 0;padding:18px;background:#F8FAFC;border:1px solid ${colors.border};border-radius:8px;text-align:center;font-size:30px;font-weight:800;letter-spacing:.18em;color:${colors.primary}">{{ .Token }}</div>
      <p style="margin:0">O código é individual e expira em poucos minutos.</p>`,
    support: securitySupport,
  }),

  mailer_notifications_password_changed_enabled: true,
  mailer_subjects_password_changed_notification: "Sua senha foi alterada — CTP ANAPP",
  mailer_templates_password_changed_notification_content: template({
    preheader: "A senha da sua conta CTP ANAPP foi alterada.",
    eyebrow: "Alerta de segurança",
    title: "Senha alterada com sucesso",
    body: `<p style="margin:0">A senha da sua conta no CTP ANAPP foi alterada recentemente.</p>`,
    support: securitySupport,
  }),

  mailer_notifications_email_changed_enabled: true,
  mailer_subjects_email_changed_notification: "Seu e-mail foi alterado — CTP ANAPP",
  mailer_templates_email_changed_notification_content: template({
    preheader: "O endereço de e-mail da sua conta CTP ANAPP foi atualizado.",
    eyebrow: "Alerta de segurança",
    title: "E-mail da conta alterado",
    body: `<p style="margin:0">O endereço da sua conta foi alterado de <strong>{{ .OldEmail }}</strong> para <strong>{{ .Email }}</strong>.</p>`,
    support: securitySupport,
  }),

  mailer_notifications_phone_changed_enabled: true,
  mailer_subjects_phone_changed_notification: "Seu telefone foi alterado — CTP ANAPP",
  mailer_templates_phone_changed_notification_content: template({
    preheader: "O telefone da sua conta CTP ANAPP foi atualizado.",
    eyebrow: "Alerta de segurança",
    title: "Telefone da conta alterado",
    body: `<p style="margin:0">O telefone da sua conta foi alterado de <strong>{{ .OldPhone }}</strong> para <strong>{{ .Phone }}</strong>.</p>`,
    support: securitySupport,
  }),

  mailer_notifications_mfa_factor_enrolled_enabled: true,
  mailer_subjects_mfa_factor_enrolled_notification: "Novo método de verificação adicionado — CTP ANAPP",
  mailer_templates_mfa_factor_enrolled_notification_content: template({
    preheader: "Um novo método de verificação foi adicionado à sua conta.",
    eyebrow: "Alerta de segurança",
    title: "Novo método de verificação",
    body: `<p style="margin:0">O método de verificação <strong>{{ .FactorType }}</strong> foi adicionado à sua conta CTP ANAPP.</p>`,
    support: securitySupport,
  }),

  mailer_notifications_mfa_factor_unenrolled_enabled: true,
  mailer_subjects_mfa_factor_unenrolled_notification: "Método de verificação removido — CTP ANAPP",
  mailer_templates_mfa_factor_unenrolled_notification_content: template({
    preheader: "Um método de verificação foi removido da sua conta.",
    eyebrow: "Alerta de segurança",
    title: "Método de verificação removido",
    body: `<p style="margin:0">O método de verificação <strong>{{ .FactorType }}</strong> foi removido da sua conta CTP ANAPP.</p>`,
    support: securitySupport,
  }),

  mailer_notifications_identity_linked_enabled: true,
  mailer_subjects_identity_linked_notification: "Novo método de acesso vinculado — CTP ANAPP",
  mailer_templates_identity_linked_notification_content: template({
    preheader: "Um novo método de acesso foi vinculado à sua conta.",
    eyebrow: "Alerta de segurança",
    title: "Método de acesso vinculado",
    body: `<p style="margin:0">O provedor <strong>{{ .Provider }}</strong> foi vinculado como método de acesso da conta <strong>{{ .Email }}</strong>.</p>`,
    support: securitySupport,
  }),

  mailer_notifications_identity_unlinked_enabled: true,
  mailer_subjects_identity_unlinked_notification: "Método de acesso removido — CTP ANAPP",
  mailer_templates_identity_unlinked_notification_content: template({
    preheader: "Um método de acesso foi removido da sua conta.",
    eyebrow: "Alerta de segurança",
    title: "Método de acesso removido",
    body: `<p style="margin:0">O provedor <strong>{{ .Provider }}</strong> foi removido como método de acesso da conta <strong>{{ .Email }}</strong>.</p>`,
    support: securitySupport,
  }),
};

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
const response = await fetch(endpoint, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const message = await response.text();
  throw new Error(`Falha ao atualizar Auth (${response.status}): ${message.slice(0, 300)}`);
}

const updated = await response.json();
const requiredSubjects = [
  "mailer_subjects_confirmation",
  "mailer_subjects_invite",
  "mailer_subjects_recovery",
  "mailer_subjects_email_change",
  "mailer_subjects_magic_link",
  "mailer_subjects_reauthentication",
  "mailer_subjects_password_changed_notification",
  "mailer_subjects_email_changed_notification",
  "mailer_subjects_phone_changed_notification",
  "mailer_subjects_mfa_factor_enrolled_notification",
  "mailer_subjects_mfa_factor_unenrolled_notification",
  "mailer_subjects_identity_linked_notification",
  "mailer_subjects_identity_unlinked_notification",
];
const valid =
  updated.site_url === canonicalOrigin &&
  String(updated.uri_allow_list ?? "").includes(canonicalOrigin) &&
  requiredSubjects.every((field) => {
    const value = String(updated[field] ?? "");
    return value.includes("CTP ANAPP") && !/\b(confirm|reset|signup|password)\b/i.test(value);
  });

if (!valid) {
  throw new Error("A atualização foi aceita, mas a leitura de confirmação não corresponde ao padrão esperado.");
}

process.stdout.write(JSON.stringify({
  ok: true,
  projectRef,
  siteUrl: updated.site_url,
  redirectAllowList: String(updated.uri_allow_list).split(","),
  standardizedTemplateCount: requiredSubjects.length,
  language: "pt-BR",
}, null, 2));
