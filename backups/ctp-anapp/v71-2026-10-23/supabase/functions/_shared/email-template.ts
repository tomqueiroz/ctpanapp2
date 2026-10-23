import { CANONICAL_PUBLIC_ORIGIN } from "./site-origin.ts";

export const CTP_EMAIL_COLORS = {
  primary: "#0072BC",
  primaryDark: "#005A9E",
  accent: "#FF6B00",
  background: "#F4F7FA",
  surface: "#FFFFFF",
  text: "#172033",
  muted: "#475569",
  border: "#DCE5EE",
} as const;

export function escapeEmailHtml(value: unknown, maxLength = 2_000): string {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function transactionalEmailFrom(): string {
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL")?.trim();
  if (fromEmail) {
    return fromEmail.includes("<")
      ? fromEmail
      : `CTP ANAPP <${fromEmail}>`;
  }
  const domain = Deno.env.get("RESEND_DOMAIN")?.trim();
  return domain
    ? `CTP ANAPP <send@${domain}>`
    : "CTP ANAPP <onboarding@resend.dev>";
}

export function emailButton(label: string, href: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 8px">
      <tr>
        <td bgcolor="${CTP_EMAIL_COLORS.primary}" style="border-radius:8px">
          <a href="${escapeEmailHtml(href, 2_000)}"
             style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;border-radius:8px">
            ${escapeEmailHtml(label, 120)}
          </a>
        </td>
      </tr>
    </table>`;
}

export function renderCtpEmail(input: {
  preheader: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  supportText?: string;
}): string {
  const cta =
    input.ctaLabel && input.ctaUrl
      ? emailButton(input.ctaLabel, input.ctaUrl)
      : "";
  const support =
    input.supportText ??
    "Se você não reconhece esta mensagem, entre em contato com a administração do CTP ANAPP.";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeEmailHtml(input.title, 160)}</title>
  </head>
  <body style="margin:0;padding:0;background:${CTP_EMAIL_COLORS.background};color:${CTP_EMAIL_COLORS.text}">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">
      ${escapeEmailHtml(input.preheader, 200)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${CTP_EMAIL_COLORS.background}">
      <tr>
        <td align="center" style="padding:28px 12px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px">
            <tr>
              <td style="background:${CTP_EMAIL_COLORS.primary};padding:25px 30px;border-radius:12px 12px 0 0">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:800;letter-spacing:.2px;color:#ffffff">CTP ANAPP</div>
                <div style="margin-top:5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#DDF2FF">Curso Técnico de Piscinas</div>
              </td>
            </tr>
            <tr>
              <td style="height:5px;background:${CTP_EMAIL_COLORS.accent};font-size:0;line-height:0">&nbsp;</td>
            </tr>
            <tr>
              <td style="background:${CTP_EMAIL_COLORS.surface};padding:34px 30px;border-left:1px solid ${CTP_EMAIL_COLORS.border};border-right:1px solid ${CTP_EMAIL_COLORS.border}">
                ${
    input.eyebrow
      ? `<div style="margin-bottom:10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${CTP_EMAIL_COLORS.primary}">${escapeEmailHtml(input.eyebrow, 120)}</div>`
      : ""
  }
                <h1 style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:27px;line-height:1.25;color:${CTP_EMAIL_COLORS.text}">${escapeEmailHtml(input.title, 160)}</h1>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:${CTP_EMAIL_COLORS.muted}">
                  ${input.bodyHtml}
                </div>
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="background:#F8FAFC;padding:20px 30px;border:1px solid ${CTP_EMAIL_COLORS.border};border-radius:0 0 12px 12px">
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#64748B">${escapeEmailHtml(support, 500)}</p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#64748B">
                  <a href="${CANONICAL_PUBLIC_ORIGIN}" style="color:${CTP_EMAIL_COLORS.primary};font-weight:700;text-decoration:none">cursoanapp.org.br</a>
                  &nbsp;·&nbsp; CTP ANAPP © 2026
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
