type Row = Record<string, unknown>;

export const couponText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";
export const couponCode = (value: unknown): string =>
  couponText(value).toUpperCase().replace(/\s+/g, "");

// Attribution changes reporting only. Original payment coupon and amounts stay intact.
export function effectiveCoupon(payment: Row): { id: string; code: string } {
  return {
    id: couponText(payment.attributed_coupon_id) || couponText(payment.coupon_id),
    code: couponCode(payment.attributed_coupon_code) || couponCode(payment.coupon_code),
  };
}

export function summarizeCoupons(coupons: Row[], payments: Row[]) {
  const byId = new Map(coupons.map((coupon) => [couponText(coupon.id), coupon]));
  const byCode = new Map(coupons.map((coupon) => [couponCode(coupon.code), coupon]));
  const seen = new Set<string>();
  const summaries = new Map<string, {
    attempts: number; approved: number; pending: number; rejected: number;
    cancelled: number; refunded: number; revenue: number;
  }>();
  for (const payment of payments) {
    const paymentId = couponText(payment.id);
    if (paymentId && seen.has(paymentId)) continue;
    if (paymentId) seen.add(paymentId);
    const effective = effectiveCoupon(payment);
    const coupon = byId.get(effective.id) || byCode.get(effective.code);
    if (!coupon) continue;
    const key = couponText(coupon.id);
    const current = summaries.get(key) ?? {
      attempts: 0, approved: 0, pending: 0, rejected: 0,
      cancelled: 0, refunded: 0, revenue: 0,
    };
    current.attempts += 1;
    const status = couponText(payment.status);
    if (["approved", "pending", "rejected", "cancelled", "refunded"].includes(status)) {
      current[status as "approved" | "pending" | "rejected" | "cancelled" | "refunded"] += 1;
    }
    if (status === "approved") current.revenue += Number(payment.amount) || 0;
    summaries.set(key, current);
  }
  return summaries;
}
