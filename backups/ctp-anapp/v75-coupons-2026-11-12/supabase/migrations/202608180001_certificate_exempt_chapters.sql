BEGIN;

-- Capítulos 0, 13 e 14 são conteúdos formativos sem quiz ou prova.
-- Somente avaliações vinculadas aos demais capítulos participam da
-- elegibilidade e da média usada na emissão automática do certificado.
CREATE OR REPLACE FUNCTION public.lms_certificate_eligibility(
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_total integer;
  v_passed integer;
  v_average numeric;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF p_user_id IS DISTINCT FROM v_caller
     AND NOT public.lms_is_admin_or_master(v_caller) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;

  SELECT count(*)
  INTO v_total
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  WHERE c.chapter_number NOT IN (0, 13, 14);

  SELECT
    count(*) FILTER (WHERE s.best_score >= 60),
    COALESCE(avg(s.best_score), 0)
  INTO v_passed, v_average
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  LEFT JOIN public.user_exam_scores s
    ON s.exam_id = e.id
   AND s.user_id = p_user_id
  WHERE c.chapter_number NOT IN (0, 13, 14);

  RETURN jsonb_build_object(
    'eligible', v_total > 0 AND v_passed = v_total,
    'reason', CASE
      WHEN v_total > 0 AND v_passed = v_total
        THEN 'Todas as provas obrigatórias foram aprovadas com nota mínima de 60%. Os capítulos 0, 13 e 14 são isentos de avaliação.'
      ELSE format(
        'Conclua todas as provas obrigatórias com nota mínima de 60%% (%s/%s). Os capítulos 0, 13 e 14 são isentos de avaliação.',
        v_passed,
        v_total
      )
    END,
    'total_exams', v_total,
    'passed_exams', v_passed,
    'final_exam_score', round(v_average, 2),
    'passing_score', 60,
    'exempt_chapters', jsonb_build_array(0, 13, 14)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.lms_certificate_eligibility(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lms_certificate_eligibility(uuid)
  TO authenticated, service_role;

-- O único quiz legado encontrado em capítulo isento não possui tentativas nem
-- notas. A remoção fica condicionada à inexistência de histórico acadêmico.
DELETE FROM public.quiz_questions qq
USING public.quizzes q, public.chapters c
WHERE qq.quiz_id = q.id
  AND q.chapter_id = c.id
  AND c.chapter_number IN (0, 13, 14)
  AND NOT EXISTS (
    SELECT 1 FROM public.quiz_attempts qa WHERE qa.quiz_id = q.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_quiz_scores uqs WHERE uqs.quiz_id = q.id
  );

DELETE FROM public.quizzes q
USING public.chapters c
WHERE q.chapter_id = c.id
  AND c.chapter_number IN (0, 13, 14)
  AND NOT EXISTS (
    SELECT 1 FROM public.quiz_attempts qa WHERE qa.quiz_id = q.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_quiz_scores uqs WHERE uqs.quiz_id = q.id
  );

-- Corrige o percentual já salvo para que atividades inexistentes não impeçam
-- a conclusão visual desses capítulos.
UPDATE public.user_progress up
SET completion_percentage = CASE
      WHEN c.chapter_number = 0 THEN round(
        (
          COALESCE(up.video_completed, false)::integer
          + COALESCE(up.apostila_completed, false)::integer
          + COALESCE(up.podcast_completed, false)::integer
        ) * 100.0 / 3
      )
      ELSE round(
        (
          COALESCE(up.video_completed, false)::integer
          + COALESCE(up.apostila_completed, false)::integer
          + COALESCE(up.podcast_completed, false)::integer
          + COALESCE(up.materials_completed, false)::integer
          + COALESCE(up.slides_completed, false)::integer
        ) * 100.0 / 5
      )
    END,
    completed_at = CASE
      WHEN (
        CASE
          WHEN c.chapter_number = 0 THEN
            COALESCE(up.video_completed, false)
            AND COALESCE(up.apostila_completed, false)
            AND COALESCE(up.podcast_completed, false)
          ELSE
            COALESCE(up.video_completed, false)
            AND COALESCE(up.apostila_completed, false)
            AND COALESCE(up.podcast_completed, false)
            AND COALESCE(up.materials_completed, false)
            AND COALESCE(up.slides_completed, false)
        END
      ) THEN COALESCE(up.completed_at, now())
      ELSE NULL
    END,
    last_accessed_at = COALESCE(up.last_accessed_at, now())
FROM public.chapters c
WHERE up.chapter_id = c.id
  AND c.chapter_number IN (0, 13, 14);

COMMIT;
