-- CTP ANAPP — preços comerciais e cupom promocional EXPOLAZER2026.
--
-- Regras:
-- - Plano não associado: R$ 600,00.
-- - Plano associado ANAPP: R$ 299,00, sujeito à associação validada.
-- - Cupom EXPOLAZER2026: preço final de R$ 50,00 somente no plano associado.
-- - Vigência inclusiva de 07/08/2026 a 14/08/2026 no horário de Brasília.
-- - O navegador nunca calcula nem define o valor cobrado.

DO $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.course_plans
  SET price = 600.00
  WHERE id = '6e18e621-f7ae-40bd-ad25-3818eaa51ba8';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  IF affected_rows <> 1 THEN
    RAISE EXCEPTION 'Plano completo CTP ANAPP não encontrado';
  END IF;

  UPDATE public.course_plans
  SET price = 299.00
  WHERE id = '32fde0de-2cc7-4ca3-bc99-cd2062d89804';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  IF affected_rows <> 1 THEN
    RAISE EXCEPTION 'Plano associado CTP ANAPP não encontrado';
  END IF;
END;
$$;

INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('erede_public_checkout_mode', 'plan_price', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at;

CREATE TABLE IF NOT EXISTS public.payment_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  description TEXT,
  final_price NUMERIC(10, 2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  applies_to_plan_id UUID REFERENCES public.course_plans(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payment_coupons_code_normalized
    CHECK (code = UPPER(BTRIM(code)) AND code <> ''),
  CONSTRAINT payment_coupons_final_price_positive
    CHECK (final_price > 0),
  CONSTRAINT payment_coupons_period_valid
    CHECK (ends_at > starts_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_coupons_code_unique
  ON public.payment_coupons (code);

ALTER TABLE public.payment_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_coupons_service_role
  ON public.payment_coupons;

CREATE POLICY payment_coupons_service_role
  ON public.payment_coupons
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

REVOKE ALL PRIVILEGES ON TABLE public.payment_coupons FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.payment_coupons FROM authenticated;
GRANT ALL PRIVILEGES ON TABLE public.payment_coupons TO service_role;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS coupon_id UUID
    REFERENCES public.payment_coupons(id),
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS original_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2)
    NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS payments_coupon_id_idx
  ON public.payments (coupon_id)
  WHERE coupon_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_coupon_code_idx
  ON public.payments (coupon_code)
  WHERE coupon_code IS NOT NULL;

DELETE FROM public.payment_coupons
WHERE code = 'EXPOLAZER'
  AND EXISTS (
    SELECT 1
    FROM public.payment_coupons
    WHERE code = 'EXPOLAZER2026'
  );

UPDATE public.payment_coupons
SET
  code = 'EXPOLAZER2026',
  description = 'Campanha EXPOLAZER 2026 — inscrição CTP ANAPP por R$ 50,00',
  updated_at = NOW()
WHERE code = 'EXPOLAZER';

INSERT INTO public.payment_coupons (
  code,
  description,
  final_price,
  starts_at,
  ends_at,
  applies_to_plan_id,
  is_active,
  updated_at
)
VALUES (
  'EXPOLAZER2026',
  'Campanha EXPOLAZER 2026 — inscrição CTP ANAPP por R$ 50,00',
  50.00,
  '2026-08-07 00:00:00-03',
  '2026-08-15 00:00:00-03',
  '32fde0de-2cc7-4ca3-bc99-cd2062d89804',
  TRUE,
  NOW()
)
ON CONFLICT (code) DO UPDATE
SET
  description = EXCLUDED.description,
  final_price = EXCLUDED.final_price,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  applies_to_plan_id = EXCLUDED.applies_to_plan_id,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
