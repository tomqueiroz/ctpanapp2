-- CTP ANAPP — cadastro completo obrigatório para novos alunos.
--
-- A criação pública de conta passa a exigir:
-- nome completo, e-mail, celular, RG, CPF, endereço residencial completo
-- (complemento opcional), CEP e gênero.

BEGIN;

ALTER TABLE public.user_extended_profile
  ADD COLUMN IF NOT EXISTS rg TEXT;

-- A data de nascimento continua disponível para o perfil acadêmico, mas não
-- faz parte do conjunto obrigatório definido para a criação da conta.
ALTER TABLE public.user_extended_profile
  ALTER COLUMN birth_date DROP NOT NULL;

COMMENT ON COLUMN public.user_extended_profile.rg IS
  'RG informado no cadastro completo do aluno. Campo obrigatório para novos cadastros.';

COMMENT ON COLUMN public.user_extended_profile.profile_completed IS
  'Indica que os dados cadastrais obrigatórios do aluno foram validados e gravados.';

DROP POLICY IF EXISTS "Admins podem ver todos os perfis estendidos"
  ON public.user_extended_profile;

CREATE POLICY "Admins podem ver todos os perfis estendidos"
  ON public.user_extended_profile
  FOR SELECT
  TO authenticated
  USING (public.lms_is_admin_or_master(auth.uid()));

CREATE INDEX IF NOT EXISTS user_extended_profile_completion_reporting_idx
  ON public.user_extended_profile (profile_completed, created_at DESC);

COMMIT;
