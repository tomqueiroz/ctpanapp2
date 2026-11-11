BEGIN;

CREATE OR REPLACE FUNCTION public.lms_grade_report(
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_id uuid := auth.uid();
  v_target_id uuid := COALESCE(p_user_id, auth.uid());
  v_is_service_role boolean := COALESCE(auth.role() = 'service_role', false);
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_cpf text;
  v_chapters jsonb;
  v_total_chapters integer := 0;
  v_completed_chapters integer := 0;
  v_average_score numeric := 0;
BEGIN
  IF v_target_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF NOT v_is_service_role
     AND (
       v_caller_id IS NULL
       OR (
         v_target_id <> v_caller_id
         AND NOT public.lms_is_admin_or_master(v_caller_id)
       )
     )
  THEN
    RAISE EXCEPTION 'Acesso não autorizado ao boletim.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_target_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado.';
  END IF;

  SELECT
    COALESCE(
      NULLIF(btrim(p.full_name), ''),
      NULLIF(btrim(ur.full_name), ''),
      NULLIF(btrim(concat_ws(' ', ep.first_name, ep.last_name)), ''),
      NULLIF(btrim(au.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(btrim(au.email), ''),
      'Aluno'
    ),
    COALESCE(
      NULLIF(btrim(ep.cpf), ''),
      NULLIF(btrim(au.raw_user_meta_data ->> 'cpf'), ''),
      ''
    )
  INTO v_full_name, v_cpf
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  LEFT JOIN public.user_extended_profile ep ON ep.user_id = au.id
  WHERE au.id = v_target_id
  LIMIT 1;

  v_first_name := split_part(regexp_replace(v_full_name, '\s+', ' ', 'g'), ' ', 1);
  v_last_name := btrim(
    substring(
      regexp_replace(v_full_name, '\s+', ' ', 'g')
      FROM char_length(v_first_name) + 1
    )
  );

  WITH required_exams AS (
    SELECT
      e.id,
      e.chapter_id,
      COALESCE(e.passing_score, 60) AS passing_score,
      c.chapter_number,
      c.title AS chapter_title
    FROM public.exams e
    JOIN public.chapters c ON c.id = e.chapter_id
    WHERE c.chapter_number NOT IN (0, 13, 14)
  ),
  report_rows AS (
    SELECT
      re.chapter_number,
      re.chapter_title,
      COALESCE(s.best_score, 0)::numeric AS best_score,
      COALESCE(s.attempts_count, 0)::integer AS attempts,
      re.passing_score
    FROM required_exams re
    LEFT JOIN public.user_exam_scores s
      ON s.exam_id = re.id
     AND s.user_id = v_target_id
  )
  SELECT
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'chapter_number', chapter_number,
          'chapter_title', chapter_title,
          'best_score', round(best_score, 2),
          'attempts', attempts
        )
        ORDER BY chapter_number
      ),
      '[]'::jsonb
    ),
    count(*)::integer,
    count(*) FILTER (WHERE best_score >= passing_score)::integer,
    COALESCE(round(avg(best_score), 2), 0)
  INTO
    v_chapters,
    v_total_chapters,
    v_completed_chapters,
    v_average_score
  FROM report_rows;

  RETURN jsonb_build_object(
    'user', jsonb_build_object(
      'first_name', COALESCE(NULLIF(v_first_name, ''), 'Aluno'),
      'last_name', COALESCE(v_last_name, ''),
      'cpf', COALESCE(v_cpf, '')
    ),
    'chapters', v_chapters,
    'average_score', v_average_score,
    'total_chapters', v_total_chapters,
    'completed_chapters', v_completed_chapters,
    'is_certified',
      v_total_chapters > 0
      AND v_completed_chapters = v_total_chapters,
    'generated_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.lms_grade_report(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lms_grade_report(uuid)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.lms_grade_report(uuid) IS
  'Retorna o boletim consolidado das 12 provas obrigatórias. O aluno acessa somente o próprio boletim; admins podem consultar usuários específicos.';

COMMIT;
