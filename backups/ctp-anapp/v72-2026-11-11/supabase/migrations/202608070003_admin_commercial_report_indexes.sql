-- Índices para gestão administrativa de cupons e relatórios de alunos.

CREATE INDEX IF NOT EXISTS payments_coupon_reporting_idx
  ON public.payments (coupon_id, status, created_at DESC)
  WHERE coupon_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_user_reporting_idx
  ON public.payments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_progress_reporting_idx
  ON public.user_progress (user_id, last_accessed_at DESC);

CREATE INDEX IF NOT EXISTS student_enrollments_status_reporting_idx
  ON public.student_enrollments (status, created_at DESC);
