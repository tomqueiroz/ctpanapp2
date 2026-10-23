-- Public, minimal certificate verification by an unguessable verification code.

BEGIN;

CREATE OR REPLACE FUNCTION public.lms_verify_certificate(
  p_verification_code text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_certificate record;
BEGIN
  IF NULLIF(trim(p_verification_code), '') IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Informe o código de verificação.'
    );
  END IF;

  SELECT
    certificate_number,
    full_name,
    course_name,
    completion_date,
    total_hours,
    verification_code,
    is_valid
  INTO v_certificate
  FROM public.certificates
  WHERE upper(verification_code) = upper(trim(p_verification_code))
  LIMIT 1;

  IF NOT FOUND OR NOT COALESCE(v_certificate.is_valid, false) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Certificado não encontrado ou revogado.'
    );
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'certificate_number', v_certificate.certificate_number,
    'full_name', v_certificate.full_name,
    'course_name', v_certificate.course_name,
    'completion_date', v_certificate.completion_date,
    'total_hours', v_certificate.total_hours,
    'verification_code', v_certificate.verification_code
  );
END;
$$;

REVOKE ALL ON FUNCTION public.lms_verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lms_verify_certificate(text) TO anon, authenticated, service_role;

COMMIT;
