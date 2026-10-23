-- CTP ANAPP — garantia dos preços comerciais do checkout.
--
-- Estado autoritativo:
-- - Plano completo: R$ 600,00.
-- - Plano associado ANAPP: R$ 299,00.
-- - Cupom EXPOLAZER2026: total de R$ 50,00 somente para associados,
--   com validade de 07 a 14/08/2026 no horário de Brasília.
-- - O valor cobrado sempre vem do plano/cupom validado no servidor.

BEGIN;

INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('erede_public_checkout_mode', 'plan_price', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at;

UPDATE public.course_plans
SET price = 600.00,
    is_active = TRUE
WHERE id = '6e18e621-f7ae-40bd-ad25-3818eaa51ba8';

UPDATE public.course_plans
SET price = 299.00,
    is_active = TRUE
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

UPDATE public.payment_coupons
SET is_active = FALSE,
    updated_at = NOW()
WHERE code <> 'EXPOLAZER2026'
  AND code LIKE 'EXPOLAZER%';

COMMIT;
