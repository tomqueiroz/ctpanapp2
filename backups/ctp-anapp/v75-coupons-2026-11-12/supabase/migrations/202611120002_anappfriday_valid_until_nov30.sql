-- Requested by owner: valid through 30/11/2026 23:59 Brasília.
-- Admin coupon form keeps starts_at / ends_at manually editable.
BEGIN;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.payment_coupons WHERE code = 'ANAPPFRIDAY') <> 1 THEN
    RAISE EXCEPTION 'ANAPPFRIDAY must exist exactly once';
  END IF;
END;
$$;
UPDATE public.payment_coupons
SET is_active = true, ends_at = '2026-12-01T02:59:59.999Z'::timestamptz,
    updated_at = now()
WHERE code = 'ANAPPFRIDAY';
UPDATE public.payment_coupons
SET is_active = false, updated_at = now()
WHERE code = 'EXPOLAZER2026';
COMMIT;
