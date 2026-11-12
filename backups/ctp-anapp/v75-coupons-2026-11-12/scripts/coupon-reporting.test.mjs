import test from "node:test";
import assert from "node:assert/strict";
import { effectiveCoupon, summarizeCoupons } from "../supabase/functions/_shared/coupon-reporting.ts";

const coupons = [{ id: "old", code: "EXPOLAZER2026" }, { id: "new", code: "ANAPPFRIDAY" }];
test("ID and code-only history aggregate once into the same coupon", () => {
  const payments = [
    { id: "a", coupon_id: "old", coupon_code: "EXPOLAZER2026", status: "approved", amount: 50 },
    { id: "b", coupon_code: "EXPOLAZER2026", status: "rejected", amount: 50 },
    { id: "c", coupon_id: "old", status: "pending", amount: 50 },
  ];
  const result = summarizeCoupons(coupons, [...payments, payments[0]]);
  assert.deepEqual(result.get("old"), {
    attempts: 3, approved: 1, pending: 1, rejected: 1, cancelled: 0, refunded: 0, revenue: 50,
  });
});
test("attribution moves counts without modifying payment evidence", () => {
  const payment = Object.freeze({
    id: "a", coupon_id: "old", coupon_code: "EXPOLAZER2026", status: "approved", amount: 50,
    attributed_coupon_id: "new", attributed_coupon_code: "ANAPPFRIDAY",
  });
  assert.deepEqual(effectiveCoupon(payment), { id: "new", code: "ANAPPFRIDAY" });
  const result = summarizeCoupons(coupons, [payment]);
  assert.equal(result.has("old"), false);
  assert.equal(result.get("new").approved, 1);
  assert.equal(result.get("new").revenue, 50);
  assert.equal(payment.coupon_code, "EXPOLAZER2026");
});
test("no-coupon, refunds, and declined payments do not inflate approved revenue", () => {
  const result = summarizeCoupons(coupons, [
    { id: "a", status: "approved", amount: 600 },
    { id: "b", coupon_code: "ANAPPFRIDAY", status: "refunded", amount: 50 },
  ]);
  assert.equal(result.get("new").attempts, 1);
  assert.equal(result.get("new").revenue, 0);
});
