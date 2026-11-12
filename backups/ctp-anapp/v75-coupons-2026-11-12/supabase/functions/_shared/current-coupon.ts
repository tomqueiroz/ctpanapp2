import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function currentCoupon(admin: SupabaseClient): Promise<string | null> {
  const now = new Date().toISOString();
  const { data, error } = await admin.from("payment_coupons")
    .select("code,is_active,starts_at,ends_at")
    .order("created_at", { ascending: false }).order("id", { ascending: false })
    .limit(1).maybeSingle();
  if (error) throw new Error("Não foi possível consultar o cupom vigente");
  // Never silently substitute an older campaign when the latest one expires.
  return typeof data?.code === "string" && data.is_active &&
      data.starts_at <= now && data.ends_at > now ? data.code : null;
}
