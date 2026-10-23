import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CANONICAL_PUBLIC_ORIGIN } from "./site-origin.ts";
import {
  escapeEmailHtml,
  renderCtpEmail,
} from "./email-template.ts";
import { sendTrackedStudentEmail } from "./student-email.ts";

type CertificateEmailData = {
  certificate_number?: string | null;
  verification_code?: string | null;
  full_name?: string | null;
  completion_date?: string | null;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T12:00:00-03:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("pt-BR").format(date);
}

export async function sendCertificateIssuedEmail(
  adminClient: SupabaseClient<any, "public", "public", any, any>,
  userId: string,
  certificate: CertificateEmailData,
  options: { force?: boolean } = {},
): Promise<boolean> {
  const certificateNumber = String(
    certificate.certificate_number ?? "",
  ).trim();
  if (!certificateNumber) return false;

  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const name =
    certificate.full_name || profile?.full_name || "aluno(a)";
  const verificationCode = String(
    certificate.verification_code ?? "",
  ).trim();
  const completionDate = formatDate(certificate.completion_date);
  const details = [
    `<p style="margin:0 0 8px"><strong>Número:</strong> ${escapeEmailHtml(certificateNumber, 100)}</p>`,
    verificationCode
      ? `<p style="margin:0 0 8px"><strong>Código de verificação:</strong> ${escapeEmailHtml(verificationCode, 100)}</p>`
      : "",
    completionDate
      ? `<p style="margin:0"><strong>Conclusão:</strong> ${escapeEmailHtml(completionDate, 40)}</p>`
      : "",
  ].join("");
  const html = renderCtpEmail({
    preheader: "Seu certificado e sua carteirinha profissional CTP ANAPP estão disponíveis no portal.",
    eyebrow: "Conquista profissional",
    title: "Seu certificado e sua carteirinha estão disponíveis",
    bodyHtml: `
      <p style="margin:0 0 16px">Parabéns, <strong>${escapeEmailHtml(name, 160)}</strong>.</p>
      <p style="margin:0 0 16px">Você concluiu a jornada do Curso Técnico de Piscinas. Seu certificado profissional e sua carteirinha CTP ANAPP foram emitidos.</p>
      <div style="margin:22px 0;padding:18px;background:#F8FAFC;border:1px solid #DCE5EE;border-radius:8px;color:#172033">
        ${details}
      </div>
      <p style="margin:0">Acesse o portal para baixar um único PDF: o certificado está na primeira página e a carteirinha, com frente, verso e QR Code individual, está na segunda.</p>`,
    ctaLabel: "Acessar certificado e carteirinha",
    ctaUrl: `${CANONICAL_PUBLIC_ORIGIN}/certificate`,
    supportText: "A autenticidade do certificado pode ser consultada na página pública de verificação do CTP ANAPP.",
  });
  const baseEventKey = `certificate-issued:${certificateNumber}`;
  const eventKey = options.force
    ? `${baseEventKey}:manual:${crypto.randomUUID()}`
    : baseEventKey;

  return sendTrackedStudentEmail(adminClient, {
    userId,
    eventKey,
    eventType: "certificate_issued",
    subject: "Seu certificado e sua carteirinha estão disponíveis — CTP ANAPP",
    html,
  });
}
