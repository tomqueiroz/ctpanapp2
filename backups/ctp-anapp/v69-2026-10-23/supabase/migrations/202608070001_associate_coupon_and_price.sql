-- CTP ANAPP — preço comercial e elegibilidade do cupom em 07/08/2026.

BEGIN;

ALTER TABLE public.course_plans
  DROP CONSTRAINT IF EXISTS ctp_commercial_plan_prices;
ALTER TABLE public.payment_coupons
  DROP CONSTRAINT IF EXISTS ctp_expolazer2026_price;

UPDATE public.course_plans
SET
  price = 600.00,
  is_active = TRUE,
  updated_at = NOW()
WHERE id = '6e18e621-f7ae-40bd-ad25-3818eaa51ba8';

UPDATE public.course_plans
SET
  price = 299.00,
  is_active = TRUE,
  updated_at = NOW()
WHERE id = '32fde0de-2cc7-4ca3-bc99-cd2062d89804';

UPDATE public.payment_coupons
SET
  final_price = 50.00,
  starts_at = '2026-08-07 00:00:00-03',
  ends_at = '2026-08-15 00:00:00-03',
  applies_to_plan_id = '32fde0de-2cc7-4ca3-bc99-cd2062d89804',
  is_active = TRUE,
  updated_at = NOW()
WHERE code = 'EXPOLAZER2026';

ALTER TABLE public.course_plans
  ADD CONSTRAINT ctp_commercial_plan_prices
  CHECK (
    (id = '6e18e621-f7ae-40bd-ad25-3818eaa51ba8' AND price = 600.00)
    OR (id = '32fde0de-2cc7-4ca3-bc99-cd2062d89804' AND price = 299.00)
    OR id NOT IN (
      '6e18e621-f7ae-40bd-ad25-3818eaa51ba8',
      '32fde0de-2cc7-4ca3-bc99-cd2062d89804'
    )
  ) NOT VALID;
ALTER TABLE public.course_plans
  VALIDATE CONSTRAINT ctp_commercial_plan_prices;

ALTER TABLE public.payment_coupons
  ADD CONSTRAINT ctp_expolazer2026_price
  CHECK (
    code <> 'EXPOLAZER2026'
    OR (
      final_price = 50.00
      AND applies_to_plan_id = '32fde0de-2cc7-4ca3-bc99-cd2062d89804'
      AND ends_at = '2026-08-15 00:00:00-03'::TIMESTAMPTZ
    )
  ) NOT VALID;
ALTER TABLE public.payment_coupons
  VALIDATE CONSTRAINT ctp_expolazer2026_price;

COMMIT;
