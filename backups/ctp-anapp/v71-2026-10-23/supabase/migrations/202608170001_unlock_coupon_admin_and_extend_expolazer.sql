-- CTP ANAPP — libera a administração dinâmica de cupons.
--
-- A regra comercial do EXPOLAZER2026 estava congelada por uma constraint
-- histórica, impedindo que Admins alterassem valor, plano ou validade pelo
-- painel. A integridade geral permanece protegida pelas constraints de código
-- normalizado, valor positivo e período válido.

BEGIN;

ALTER TABLE public.payment_coupons
  DROP CONSTRAINT IF EXISTS ctp_expolazer2026_price;

UPDATE public.payment_coupons
SET
  ends_at = '2026-08-31 23:59:59.999-03'::TIMESTAMPTZ,
  is_active = TRUE,
  updated_at = NOW()
WHERE code = 'EXPOLAZER2026';

COMMIT;
