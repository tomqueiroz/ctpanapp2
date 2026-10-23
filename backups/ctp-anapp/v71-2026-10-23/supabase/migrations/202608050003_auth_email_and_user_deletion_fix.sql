-- CTP ANAPP — corrige confirmação de e-mail e exclusão administrativa.

BEGIN;

-- O fluxo atual exige confirmação real do e-mail antes do primeiro acesso.
DROP TRIGGER IF EXISTS auto_confirm_on_signup ON auth.users;

-- O Supabase Auth executa cascatas com um search_path restrito. A referência
-- sem schema fazia a exclusão de qualquer usuário falhar com SQLSTATE 42P01.
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

COMMIT;
