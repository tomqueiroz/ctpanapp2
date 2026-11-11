-- CTP ANAPP — troca de cupom sem alterar o histórico financeiro.
--
-- Esta migration altera somente o status dos cupons e o cupom-padrão
-- pendente de ex-alunos. Nenhuma linha da tabela payments é atualizada.

BEGIN;

DO $$
DECLARE
  v_coupon_count INTEGER;
BEGIN
  SELECT count(*)
  INTO v_coupon_count
  FROM public.payment_coupons
  WHERE code = 'ANAPPFRIDAY';

  IF v_coupon_count <> 1 THEN
    RAISE EXCEPTION
      'Cupom ANAPPFRIDAY deve existir uma única vez antes da ativação (encontrado: %)',
      v_coupon_count;
  END IF;
END;
$$;

-- O cupom antigo permanece no banco para auditoria e para preservar as
-- referências históricas em payments, mas deixa de ser aceito em novas compras.
UPDATE public.payment_coupons
SET is_active = false,
    updated_at = now()
WHERE code = 'EXPOLAZER2026';

UPDATE public.payment_coupons
SET is_active = true,
    updated_at = now()
WHERE code = 'ANAPPFRIDAY';

-- Somente cadastros pendentes sem pagamento aprovado passam a apontar para o
-- cupom solicitado. Pagamentos históricos não são tocados.
UPDATE public.profiles p
SET registration_coupon_code = 'ANAPPFRIDAY',
    updated_at = now()
WHERE p.is_alumni = true
  AND p.registration_coupon_code IS DISTINCT FROM 'ANAPPFRIDAY'
  AND NOT EXISTS (
    SELECT 1
    FROM public.payments pay
    WHERE pay.user_id = p.id
      AND pay.status = 'approved'
  );

COMMIT;
