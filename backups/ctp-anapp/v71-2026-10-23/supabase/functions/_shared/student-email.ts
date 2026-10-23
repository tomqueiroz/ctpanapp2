import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  htmlToPlainText,
  transactionalEmailFrom,
} from "./email-template.ts";

type JsonRecord = Record<string, unknown>;

export async function sendTrackedStudentEmail(
  adminClient: SupabaseClient<any, "public", "public", any, any>,
  input: {
    userId: string;
    eventKey: string;
    eventType: string;
    subject: string;
    html: string;
  },
): Promise<boolean> {
  const { data: claim } = await adminClient.rpc("lms_claim_email_event", {
    p_user_id: input.userId,
    p_event_key: input.eventKey,
    p_event_type: input.eventType,
  });
  if (!claim) return false;

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");

    const { data: authData, error: authError } =
      await adminClient.auth.admin.getUserById(input.userId);
    if (authError || !authData.user.email) {
      throw new Error("USER_EMAIL_NOT_FOUND");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: transactionalEmailFrom(),
        to: [authData.user.email],
        subject: input.subject,
        html: input.html,
        text: htmlToPlainText(input.html),
      }),
    });
    if (!response.ok) {
      throw new Error(`EMAIL_PROVIDER_REJECTED_${response.status}`);
    }

    const result = await response.json().catch(() => ({})) as JsonRecord;
    await adminClient
      .from("student_email_events")
      .update({
        status: "sent",
        provider_id: typeof result.id === "string" ? result.id : null,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", claim);
    return true;
  } catch (error) {
    await adminClient
      .from("student_email_events")
      .update({
        status: "failed",
        last_error: error instanceof Error
          ? error.message.slice(0, 200)
          : "UNKNOWN",
        updated_at: new Date().toISOString(),
      })
      .eq("id", claim);
    return false;
  }
}
