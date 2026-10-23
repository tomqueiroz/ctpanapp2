-- Limita os dois planos comerciais do CTP ANAPP a 6 parcelas sem juros.
-- O cupom EXPOLAZER2026 continua restrito a pagamento em 1 parcela pela
-- validação autoritativa da Edge Function rede_charge.

ALTER TABLE public.course_plans
  DROP CONSTRAINT IF EXISTS ctp_commercial_plan_max_installments;

UPDATE public.course_plans
SET max_installments = 6,
    updated_at = now()
WHERE id IN (
  '6e18e621-f7ae-40bd-ad25-3818eaa51ba8',
  '32fde0de-2cc7-4ca3-bc99-cd2062d89804'
);

ALTER TABLE public.course_plans
  ADD CONSTRAINT ctp_commercial_plan_max_installments
  CHECK (
    id NOT IN (
      '6e18e621-f7ae-40bd-ad25-3818eaa51ba8',
      '32fde0de-2cc7-4ca3-bc99-cd2062d89804'
    )
    OR max_installments = 6
  ) NOT VALID;

ALTER TABLE public.course_plans
  VALIDATE CONSTRAINT ctp_commercial_plan_max_installments;
