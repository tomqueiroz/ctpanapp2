import { supabase } from "@/integrations/supabase/client";

export interface LmsAccessContext {
  authenticated: boolean;
  email_confirmed: boolean;
  is_admin: boolean;
  is_alumni: boolean;
  has_paid: boolean;
  access_blocked: boolean;
  can_access_chapter_zero: boolean;
  can_access_paid_content: boolean;
  enrollment_status:
    | "email_pending"
    | "chapter_zero"
    | "payment_pending"
    | "active"
    | "blocked";
}

export async function getLmsAccessContext(): Promise<LmsAccessContext> {
  const { data, error } = await supabase.rpc("lms_access_context");
  if (error || !data || typeof data !== "object") {
    throw error ?? new Error("Não foi possível validar o acesso ao curso.");
  }
  return data as LmsAccessContext;
}

export async function canAccessChapter(chapterNumber: number): Promise<boolean> {
  const { data, error } = await supabase.rpc("lms_can_access_chapter", {
    p_chapter_number: chapterNumber,
  });
  if (error) throw error;
  return data === true;
}
