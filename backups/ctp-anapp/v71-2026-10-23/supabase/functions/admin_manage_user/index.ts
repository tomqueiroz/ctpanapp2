import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { responseSiteOrigin } from '../_shared/site-origin.ts';
import { CANONICAL_PUBLIC_ORIGIN } from '../_shared/site-origin.ts';
import {
  escapeEmailHtml,
  renderCtpEmail,
} from '../_shared/email-template.ts';
import { sendTrackedStudentEmail } from '../_shared/student-email.ts';
const allowedRoles = new Set(['student', 'admin', 'master_admin']);
const alumniOrigins = new Set(['alumni', 'certified_professional', 'alumni_certified']);
const pageSize = 1000;
const maxPages = 50;

type JsonRecord = Record<string, unknown>;

interface PasswordEmailReceipt {
  sent: boolean;
  eventId: string | null;
  providerId: string | null;
  providerStatus: string | null;
  lastError: string | null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function booleanValue(value: unknown): boolean {
  return value === true;
}

function numberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function strongPassword(value: unknown): value is string {
  return typeof value === 'string' &&
    value.length >= 12 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function fetchResendStatus(providerId: string): Promise<string | null> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey || !providerId) return null;

  const response = await fetch(
    `https://api.resend.com/emails/${encodeURIComponent(providerId)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    },
  );
  if (!response.ok) return null;
  const result = await response.json().catch(() => ({})) as JsonRecord;
  return text(result.last_event) || null;
}

async function sendPasswordSetupEmail(
  admin: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  fullName: string,
  mode: 'first_access' | 'password_reset',
): Promise<PasswordEmailReceipt> {
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${CANONICAL_PUBLIC_ORIGIN}/reset-password`,
    },
  });
  if (error || !data.properties?.action_link) {
    throw new Error(error?.message || 'Não foi possível gerar o link seguro de senha.');
  }

  const actionLink = data.properties.action_link;
  const eventHash = (await sha256(actionLink)).slice(0, 32);
  const safeName = escapeEmailHtml(fullName || 'aluno(a)', 160);
  const firstAccess = mode === 'first_access';
  const html = renderCtpEmail({
    preheader: firstAccess
      ? 'Crie sua senha e ative seu acesso ao CTP ANAPP.'
      : 'Use o link seguro para criar uma nova senha no CTP ANAPP.',
    eyebrow: firstAccess ? 'Seu acesso foi preparado' : 'Segurança da conta',
    title: firstAccess ? 'Bem-vindo ao CTP ANAPP' : 'Crie uma nova senha',
    bodyHtml: `
      <p style="margin:0 0 16px">Olá, <strong>${safeName}</strong>.</p>
      ${
      firstAccess
        ? '<p style="margin:0 0 16px">Seu acesso à plataforma do Curso Técnico de Piscinas foi criado pela administração.</p><p style="margin:0 0 16px">No Capítulo Zero, você conhecerá a metodologia, os objetivos da formação e o caminho até a certificação profissional.</p><p style="margin:0">Use o botão abaixo para criar sua senha e ativar sua conta.</p>'
        : '<p style="margin:0 0 16px">A administração do CTP ANAPP iniciou uma troca segura de senha para a sua conta.</p><p style="margin:0">Use o botão abaixo para escolher uma nova senha. O link é individual e possui validade limitada.</p>'
    }`,
    ctaLabel: firstAccess ? 'Criar minha senha e ativar acesso' : 'Criar nova senha',
    ctaUrl: actionLink,
    supportText: firstAccess
      ? 'Este link é individual e possui validade limitada. Se você não esperava receber este acesso, ignore a mensagem.'
      : 'Se você não reconhece esta solicitação, ignore este e-mail e sua senha atual continuará válida.',
  });

  const eventKey = `password_recovery:${eventHash}`;
  const sent = await sendTrackedStudentEmail(admin, {
    userId,
    eventKey,
    eventType: firstAccess ? 'password_setup' : 'password_recovery',
    subject: firstAccess
      ? 'Bem-vindo ao CTP ANAPP — crie sua senha'
      : 'Crie uma nova senha — CTP ANAPP',
    html,
  });

  const { data: event } = await admin
    .from('student_email_events')
    .select('id,status,provider_id,last_error')
    .eq('user_id', userId)
    .eq('event_key', eventKey)
    .maybeSingle();
  const providerId = text(event?.provider_id) || null;

  let providerStatus = providerId ? await fetchResendStatus(providerId) : null;
  if (providerId && providerStatus && ['queued', 'sent'].includes(providerStatus)) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    providerStatus = await fetchResendStatus(providerId) || providerStatus;
  }

  return {
    sent,
    eventId: text(event?.id) || null,
    providerId,
    providerStatus,
    lastError: text(event?.last_error) || null,
  };
}

async function fetchAllRows(
  factory: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>,
): Promise<JsonRecord[]> {
  const rows: JsonRecord[] = [];
  for (let page = 0; page < maxPages; page += 1) {
    const from = page * pageSize;
    const result = await factory(from, from + pageSize - 1);
    if (result.error) {
      throw new Error(result.error.message || 'Falha ao consultar dados de usuários.');
    }
    const pageRows = Array.isArray(result.data)
      ? result.data.filter(
        (item): item is JsonRecord =>
          Boolean(item) && typeof item === 'object' && !Array.isArray(item),
      )
      : [];
    rows.push(...pageRows);
    if (pageRows.length < pageSize) break;
  }
  return rows;
}

async function fetchAllAuthUsers(
  admin: ReturnType<typeof createClient>,
): Promise<JsonRecord[]> {
  const rows: JsonRecord[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });
    if (error) throw new Error(error.message);
    rows.push(
      ...data.users.map((user) => ({
        id: user.id,
        email: user.email ?? '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        email_confirmed_at: user.email_confirmed_at ?? null,
        user_metadata: user.user_metadata ?? {},
      })),
    );
    if (data.users.length < pageSize) break;
  }
  return rows;
}

async function listUsers(admin: ReturnType<typeof createClient>) {
  const [
    authUsers,
    roles,
    profiles,
    extendedProfiles,
    certificates,
    payments,
    enrollments,
    progressRows,
    examScores,
    chapters,
    exams,
    historicalApprovals,
  ] = await Promise.all([
    fetchAllAuthUsers(admin),
    fetchAllRows((from, to) =>
      admin
        .from('user_roles')
        .select(
          'user_id,role,is_anapp_member,access_blocked,full_name,notes,user_origin,origin_date',
        )
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('profiles')
        .select(
          'id,email,full_name,is_alumni,alumni_type,registration_cohort,has_paid',
        )
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('user_extended_profile')
        .select(
          'user_id,first_name,last_name,phone,rg,cpf,street,number,complement,neighborhood,city,state,zip_code,gender,profile_completed',
        )
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('certificates')
        .select(
          'id,user_id,certificate_number,completion_date,is_valid,created_at',
        )
        .order('created_at', { ascending: false })
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('payments')
        .select(
          'id,user_id,status,amount,payment_method,installments,card_last4,coupon_code,created_at,paid_at',
        )
        .order('created_at', { ascending: false })
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('student_enrollments')
        .select('user_id,status,activated_at,created_at,updated_at')
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('user_progress')
        .select(
          'user_id,chapter_id,completion_percentage,last_accessed_at,completed_at',
        )
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('user_exam_scores')
        .select(
          'user_id,exam_id,best_score,attempts_count,last_attempt_at,updated_at',
        )
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('chapters')
        .select('id,chapter_number,title')
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('exams')
        .select('id,chapter_id,passing_score')
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from('lms_historical_assessment_approvals')
        .select(
          'user_id,assessment_type,assessment_id,chapter_id,score,approved_at',
        )
        .eq('assessment_type', 'exam')
        .range(from, to)
    ),
  ]);

  const roleByUser = new Map(roles.map((row) => [text(row.user_id), row]));
  const profileByUser = new Map(profiles.map((row) => [text(row.id), row]));
  const extendedByUser = new Map(
    extendedProfiles.map((row) => [text(row.user_id), row]),
  );
  const enrollmentByUser = new Map(
    enrollments.map((row) => [text(row.user_id), row]),
  );
  const certificateByUser = new Map<string, JsonRecord>();
  for (const certificate of certificates) {
    const userId = text(certificate.user_id);
    if (userId && !certificateByUser.has(userId)) {
      certificateByUser.set(userId, certificate);
    }
  }
  const latestPaymentByUser = new Map<string, JsonRecord>();
  const approvedPaymentByUser = new Map<string, JsonRecord>();
  for (const payment of payments) {
    const userId = text(payment.user_id);
    if (!userId) continue;
    if (!latestPaymentByUser.has(userId)) latestPaymentByUser.set(userId, payment);
    if (
      payment.status === 'approved' &&
      !approvedPaymentByUser.has(userId)
    ) {
      approvedPaymentByUser.set(userId, payment);
    }
  }

  const chapterById = new Map<number, JsonRecord>();
  for (const chapter of chapters) {
    const chapterId = numberValue(chapter.id);
    if (chapterId !== null) chapterById.set(chapterId, chapter);
  }
  const totalChaptersCount = chapters.length;

  const requiredExamById = new Map<string, {
    chapterNumber: number;
    passingScore: number;
  }>();
  for (const exam of exams) {
    const examId = text(exam.id);
    const chapterId = numberValue(exam.chapter_id);
    const chapter = chapterId === null ? undefined : chapterById.get(chapterId);
    const chapterNumber = numberValue(chapter?.chapter_number);
    if (
      !examId ||
      chapterNumber === null ||
      [0, 13, 14].includes(chapterNumber)
    ) {
      continue;
    }
    requiredExamById.set(examId, {
      chapterNumber,
      passingScore: numberValue(exam.passing_score) ?? 70,
    });
  }
  const totalRequiredExams = requiredExamById.size;

  type ChapterProgress = {
    chapterNumber: number;
    chapterTitle: string;
    percentage: number;
    lastActivity: string | null;
  };
  type LearningProgress = {
    chapters: Map<number, ChapterProgress>;
    attemptedExamChapters: Set<number>;
    passedExamChapters: Set<number>;
    lastActivity: string | null;
  };

  const learningByUser = new Map<string, LearningProgress>();
  const learningFor = (userId: string): LearningProgress => {
    const current = learningByUser.get(userId);
    if (current) return current;
    const created: LearningProgress = {
      chapters: new Map<number, ChapterProgress>(),
      attemptedExamChapters: new Set<number>(),
      passedExamChapters: new Set<number>(),
      lastActivity: null,
    };
    learningByUser.set(userId, created);
    return created;
  };
  const latestTimestamp = (
    current: string | null,
    candidate: string | null,
  ): string | null => {
    if (!candidate) return current;
    if (!current) return candidate;
    const currentTime = Date.parse(current);
    const candidateTime = Date.parse(candidate);
    if (!Number.isFinite(candidateTime)) return current;
    if (!Number.isFinite(currentTime) || candidateTime > currentTime) {
      return candidate;
    }
    return current;
  };

  for (const progress of progressRows) {
    const userId = text(progress.user_id);
    const chapterId = numberValue(progress.chapter_id);
    const chapter = chapterId === null ? undefined : chapterById.get(chapterId);
    const chapterNumber = numberValue(chapter?.chapter_number);
    if (!userId || chapterNumber === null) continue;

    const learning = learningFor(userId);
    const percentage = Math.max(
      0,
      Math.min(100, numberValue(progress.completion_percentage) ?? 0),
    );
    const activity =
      text(progress.last_accessed_at) ||
      text(progress.completed_at) ||
      null;
    const previous = learning.chapters.get(chapterNumber);
    learning.chapters.set(chapterNumber, {
      chapterNumber,
      chapterTitle: text(chapter?.title),
      percentage: Math.max(previous?.percentage ?? 0, percentage),
      lastActivity: latestTimestamp(previous?.lastActivity ?? null, activity),
    });
    learning.lastActivity = latestTimestamp(learning.lastActivity, activity);
  }

  for (const score of examScores) {
    const userId = text(score.user_id);
    const exam = requiredExamById.get(text(score.exam_id));
    if (!userId || !exam) continue;

    const learning = learningFor(userId);
    const attempts = numberValue(score.attempts_count) ?? 0;
    const bestScore = numberValue(score.best_score) ?? 0;
    if (attempts > 0) learning.attemptedExamChapters.add(exam.chapterNumber);
    if (bestScore >= exam.passingScore) {
      learning.passedExamChapters.add(exam.chapterNumber);
    }
    const activity =
      text(score.last_attempt_at) ||
      text(score.updated_at) ||
      null;
    learning.lastActivity = latestTimestamp(learning.lastActivity, activity);
  }

  for (const approval of historicalApprovals) {
    const userId = text(approval.user_id);
    const exam = requiredExamById.get(text(approval.assessment_id));
    if (!userId || !exam) continue;

    const learning = learningFor(userId);
    learning.passedExamChapters.add(exam.chapterNumber);
    learning.lastActivity = latestTimestamp(
      learning.lastActivity,
      text(approval.approved_at) || null,
    );
  }

  const newStudentCutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const users = authUsers.map((authUser) => {
    const userId = text(authUser.id);
    const role = roleByUser.get(userId);
    const profile = profileByUser.get(userId);
    const extended = extendedByUser.get(userId);
    const enrollment = enrollmentByUser.get(userId);
    const certificate = certificateByUser.get(userId);
    const latestPayment = latestPaymentByUser.get(userId);
    const approvedPayment = approvedPaymentByUser.get(userId);
    const metadata =
      authUser.user_metadata &&
        typeof authUser.user_metadata === 'object' &&
        !Array.isArray(authUser.user_metadata)
        ? authUser.user_metadata as JsonRecord
        : {};
    const extendedFullName = [
      text(extended?.first_name),
      text(extended?.last_name),
    ].filter(Boolean).join(' ');
    const fullName =
      text(role?.full_name) ||
      text(profile?.full_name) ||
      text(metadata.full_name) ||
      extendedFullName ||
      null;
    const userRole = text(role?.role) || 'student';
    const isAlumni =
      booleanValue(profile?.is_alumni) ||
      alumniOrigins.has(text(role?.user_origin));
    const createdAt = text(authUser.created_at);
    const createdAtMs = Date.parse(createdAt);
    const isNewStudent =
      userRole === 'student' &&
      !isAlumni &&
      Number.isFinite(createdAtMs) &&
      createdAtMs >= newStudentCutoff;
    const hasApprovedPayment = Boolean(approvedPayment?.id);
    const hasPaid = booleanValue(profile?.has_paid) || hasApprovedPayment;
    const accessGrantedWithoutPayment =
      approvedPayment?.amount === 0 ||
      ['admin_free_access', 'alumni_free_access', 'legacy_free_access'].includes(
        text(approvedPayment?.payment_method),
      );
    const enrollmentStatus = text(enrollment?.status) || 'not_enrolled';
    const accessBlocked = booleanValue(role?.access_blocked);
    const isActiveStudent =
      userRole === 'student' &&
      !accessBlocked &&
      (
        hasPaid ||
        accessGrantedWithoutPayment ||
        ['active', 'email_pending'].includes(enrollmentStatus)
      );

    let studentClassification =
      userRole === 'student' ? 'inactive_student' : 'administrative';
    if (isAlumni) studentClassification = 'alumni';
    else if (isNewStudent) studentClassification = 'new_student';
    else if (isActiveStudent) studentClassification = 'active_student';

    const learning = learningByUser.get(userId);
    const chapterProgress = learning
      ? [...learning.chapters.values()]
      : [];
    const currentChapter = chapterProgress
      .filter(
        (chapter) =>
          chapter.percentage > 0 ||
          Boolean(chapter.lastActivity),
      )
      .sort((left, right) => {
        const leftTime = left.lastActivity
          ? Date.parse(left.lastActivity)
          : Number.NEGATIVE_INFINITY;
        const rightTime = right.lastActivity
          ? Date.parse(right.lastActivity)
          : Number.NEGATIVE_INFINITY;
        if (leftTime !== rightTime) return rightTime - leftTime;
        return right.chapterNumber - left.chapterNumber;
      })[0] ?? null;
    const completedChaptersCount = chapterProgress.filter(
      (chapter) => chapter.percentage >= 100,
    ).length;
    const attemptedExamChapters = learning
      ? [...learning.attemptedExamChapters].sort((left, right) => left - right)
      : [];
    const passedExamChapters = learning
      ? [...learning.passedExamChapters].sort((left, right) => left - right)
      : [];
    const validCertificate = Boolean(
      certificate?.id && certificate?.is_valid !== false,
    );
    let learningStatus = 'not_started';
    if (validCertificate) learningStatus = 'certified';
    else if (
      totalRequiredExams > 0 &&
      passedExamChapters.length === totalRequiredExams
    ) {
      learningStatus = 'completed';
    } else if (
      currentChapter ||
      attemptedExamChapters.length > 0
    ) {
      learningStatus = 'in_progress';
    }

    return {
      id: userId,
      email: text(authUser.email),
      created_at: createdAt,
      last_sign_in_at: authUser.last_sign_in_at ?? null,
      email_confirmed_at: authUser.email_confirmed_at ?? null,
      role: userRole,
      has_paid: hasPaid,
      is_anapp_member: booleanValue(role?.is_anapp_member),
      access_blocked: accessBlocked,
      full_name: fullName,
      notes: role?.notes ?? null,
      payment_amount: approvedPayment?.amount ?? latestPayment?.amount ?? null,
      payment_method:
        approvedPayment?.payment_method ??
        latestPayment?.payment_method ??
        null,
      payment_installments:
        approvedPayment?.installments ??
        latestPayment?.installments ??
        null,
      card_last4:
        approvedPayment?.card_last4 ??
        latestPayment?.card_last4 ??
        null,
      coupon_code:
        approvedPayment?.coupon_code ??
        latestPayment?.coupon_code ??
        null,
      payment_date:
        approvedPayment?.paid_at ??
        approvedPayment?.created_at ??
        latestPayment?.created_at ??
        null,
      certificate_id: certificate?.id ?? null,
      certificate_number: certificate?.certificate_number ?? null,
      certificate_date:
        certificate?.completion_date ?? certificate?.created_at ?? null,
      certificate_is_valid: certificate?.is_valid ?? null,
      user_origin: role?.user_origin ?? null,
      is_alumni: isAlumni,
      user_tag: isAlumni ? 'ex-aluno' : null,
      alumni_type: profile?.alumni_type ?? null,
      registration_cohort: profile?.registration_cohort ?? null,
      access_granted_without_payment: accessGrantedWithoutPayment,
      email_locked: isAlumni,
      phone: extended?.phone ?? null,
      rg: extended?.rg ?? null,
      cpf: extended?.cpf ?? null,
      street: extended?.street ?? null,
      address_number: extended?.number ?? null,
      complement: extended?.complement ?? null,
      neighborhood: extended?.neighborhood ?? null,
      city: extended?.city ?? null,
      state: extended?.state ?? null,
      zip_code: extended?.zip_code ?? null,
      gender: extended?.gender ?? null,
      registration_complete: booleanValue(extended?.profile_completed),
      enrollment_status: enrollmentStatus,
      activated_at: enrollment?.activated_at ?? null,
      student_classification: studentClassification,
      is_new_student: isNewStudent,
      is_active_student: isActiveStudent,
      learning_status: isActiveStudent ? learningStatus : null,
      current_chapter_number:
        isActiveStudent ? currentChapter?.chapterNumber ?? 0 : null,
      current_chapter_title:
        isActiveStudent
          ? currentChapter?.chapterTitle || 'Capítulo Zero'
          : null,
      current_chapter_progress:
        isActiveStudent ? currentChapter?.percentage ?? 0 : null,
      completed_chapters_count:
        isActiveStudent ? completedChaptersCount : null,
      total_chapters_count:
        isActiveStudent ? totalChaptersCount : null,
      attempted_exams_count:
        isActiveStudent ? attemptedExamChapters.length : null,
      passed_exams_count:
        isActiveStudent ? passedExamChapters.length : null,
      total_required_exams:
        isActiveStudent ? totalRequiredExams : null,
      attempted_exam_chapters:
        isActiveStudent ? attemptedExamChapters : [],
      passed_exam_chapters:
        isActiveStudent ? passedExamChapters : [],
      last_learning_activity_at:
        isActiveStudent ? learning?.lastActivity ?? null : null,
    };
  });

  users.sort((left, right) =>
    Date.parse(String(right.created_at)) - Date.parse(String(left.created_at))
  );

  return {
    success: true,
    users,
    generated_at: new Date().toISOString(),
    new_student_window_days: 60,
  };
}

function responseHeaders(req: Request) {
  const origin = req.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': responseSiteOrigin(origin),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
}

function json(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(req),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: responseHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const authHeader = req.headers.get('Authorization');
    if (!supabaseUrl || !serviceRoleKey || !anonKey || !authHeader) {
      return json(req, { error: 'Não autenticado.' }, 401);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    const caller = callerData.user;
    if (callerError || !caller) return json(req, { error: 'Não autenticado.' }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: callerRole, error: roleError } = await admin
      .from('user_roles')
      .select('role, access_blocked')
      .eq('user_id', caller.id)
      .single();
    if (
      roleError ||
      !callerRole ||
      !['admin', 'master_admin'].includes(callerRole.role) ||
      callerRole.access_blocked === true
    ) {
      return json(req, { error: 'Acesso administrativo obrigatório.' }, 403);
    }

    const payload = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) {
      return json(req, { error: 'Corpo da requisição inválido.' }, 400);
    }
    const action = typeof payload.action === 'string' ? payload.action : '';
    if (!action) {
      return json(req, { error: 'Ação administrativa obrigatória.' }, 400);
    }

    const callerIsMaster = callerRole.role === 'master_admin';

    if (action === 'list_users') {
      return json(req, await listUsers(admin));
    }

    if (action === 'create_user') {
      const email =
        typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
      const fullName =
        typeof payload?.full_name === 'string' ? payload.full_name.trim() : '';
      const role = typeof payload?.role === 'string' ? payload.role : 'student';
      const requestedStudentType =
        typeof payload?.student_type === 'string' ? payload.student_type : 'new_student';
      if (!['new_student', 'alumni'].includes(requestedStudentType)) {
        return json(req, { error: 'Classificação de aluno inválida.' }, 400);
      }
      if (role !== 'student' && requestedStudentType !== 'new_student') {
        return json(
          req,
          { error: 'A classificação Ex-aluno só pode ser usada para usuários com perfil Aluno.' },
          400,
        );
      }
      // A classificação é a única fonte de verdade para gratuidade.
      // Nunca aceite free_access do cliente para transformar um Novo aluno em gratuito.
      const isAlumni = role === 'student' && requestedStudentType === 'alumni';
      const freeAccess = isAlumni;
      const isAnappMember = payload?.is_anapp_member === true;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName) {
        return json(req, { error: 'Nome completo e e-mail válido são obrigatórios.' }, 400);
      }
      if (!allowedRoles.has(role)) {
        return json(req, { error: 'Perfil de acesso inválido.' }, 400);
      }
      if (role !== 'student' && !callerIsMaster) {
        return json(
          req,
          { error: 'Somente Master Admin pode cadastrar outro administrador.' },
          403,
        );
      }

      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { full_name: fullName },
        });
      if (createError || !created.user) {
        return json(
          req,
          { error: createError?.message || 'Não foi possível criar o usuário.' },
          400,
        );
      }

      const createdUserId = created.user.id;
      const invitationReceipt = await sendPasswordSetupEmail(
        admin,
        createdUserId,
        email,
        fullName,
        'first_access',
      );
      if (!invitationReceipt.sent) {
        await admin.auth.admin.deleteUser(createdUserId);
        return json(
          req,
          {
            error: invitationReceipt.lastError ||
              'Não foi possível enviar o e-mail de criação de senha.',
          },
          503,
        );
      }
      const { error: profileError } = await admin
        .from('profiles')
        .upsert(
          {
            id: createdUserId,
            email,
            full_name: fullName,
            has_paid: false,
            is_anapp_member: isAnappMember,
            is_alumni: isAlumni,
            alumni_type: isAlumni ? 'alumni' : null,
            registration_cohort: isAlumni ? 'pre_2026' : 'new_2026',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        );
      if (profileError) throw profileError;

      const { error: createdRoleError } = await admin
        .from('user_roles')
        .upsert(
          {
            user_id: createdUserId,
            role,
            full_name: fullName,
            is_anapp_member: isAnappMember,
            user_origin: isAlumni ? 'alumni' : 'new_student',
            origin_date: new Date().toISOString().slice(0, 10),
          },
          { onConflict: 'user_id' },
        );
      if (createdRoleError) throw createdRoleError;

      if (isAlumni) {
        const now = new Date().toISOString();
        await admin
          .from('student_enrollments')
          .upsert(
            {
              user_id: createdUserId,
              status: created.user.email_confirmed_at ? 'active' : 'email_pending',
              email_confirmed_at: created.user.email_confirmed_at,
              payment_id: null,
              activated_at: created.user.email_confirmed_at ? now : null,
              updated_at: now,
            },
            { onConflict: 'user_id' },
          );
      }

      await admin.from('lms_admin_audit_log').insert({
        actor_user_id: caller.id,
        action: 'admin_manage_user:create_user',
        target_user_id: createdUserId,
        details: {
          role,
          student_type: isAlumni ? 'alumni' : 'new_student',
          free_access: freeAccess,
          is_anapp_member: isAnappMember,
          password_setup_sent: invitationReceipt.sent,
          email_event_id: invitationReceipt.eventId,
          email_provider_id: invitationReceipt.providerId,
          email_provider_status: invitationReceipt.providerStatus,
        },
      });

      return json(req, {
        success: true,
        user_id: createdUserId,
        email,
        student_type: isAlumni ? 'alumni' : 'new_student',
        access_granted_without_payment: isAlumni,
        password_setup_sent: invitationReceipt.sent,
        email_event_id: invitationReceipt.eventId,
        email_provider_id: invitationReceipt.providerId,
        email_provider_status: invitationReceipt.providerStatus,
      });
    }

    const targetUserId =
      typeof payload?.target_user_id === 'string' ? payload.target_user_id : '';
    if (!targetUserId) {
      return json(req, { error: 'Ação e usuário são obrigatórios.' }, 400);
    }

    const { data: targetRole } = await admin
      .from('user_roles')
      .select('role, user_origin, access_blocked')
      .eq('user_id', targetUserId)
      .maybeSingle();
    const targetRoleName = targetRole?.role || 'student';
    const targetIsMaster = targetRoleName === 'master_admin';
    const targetIsStudent = targetRoleName === 'student';

    // Master Admin accounts are never managed by a regular Admin. In
    // particular, password reset/setup must not bypass the hierarchy check.
    if (targetIsMaster && !callerIsMaster) {
      return json(req, { error: 'Somente Master Admin pode gerir outro Master Admin.' }, 403);
    }
    if (targetIsMaster && ['delete_user', 'ban_user'].includes(action)) {
      return json(req, { error: 'Contas Master Admin não podem ser excluídas ou bloqueadas.' }, 403);
    }
    if (
      ['delete_user', 'ban_user'].includes(action) &&
      caller.id === targetUserId
    ) {
      return json(req, { error: 'Um administrador não pode excluir ou bloquear a própria conta.' }, 403);
    }
    if (
      ['delete_user', 'ban_user'].includes(action) &&
      !callerIsMaster &&
      !targetIsStudent
    ) {
      return json(
        req,
        { error: 'Admins podem excluir ou bloquear alunos. Contas administrativas exigem Master Admin.' },
        403,
      );
    }

    let result: Record<string, unknown>;

    switch (action) {
      case 'send_password_setup': {
        const { data: targetAuth, error: targetAuthError } =
          await admin.auth.admin.getUserById(targetUserId);
        if (targetAuthError || !targetAuth.user?.email) {
          return json(req, { error: 'Usuário não encontrado ou sem e-mail válido.' }, 404);
        }

        const targetName = text(targetAuth.user.user_metadata?.full_name) ||
          text(
            (
              await admin
                .from('user_roles')
                .select('full_name')
                .eq('user_id', targetUserId)
                .maybeSingle()
            ).data?.full_name,
          ) ||
          'aluno(a)';
        const receipt = await sendPasswordSetupEmail(
          admin,
          targetUserId,
          targetAuth.user.email,
          targetName,
          'password_reset',
        );
        if (!receipt.sent || !receipt.providerId) {
          await admin.from('lms_admin_audit_log').insert({
            actor_user_id: caller.id,
            action: 'admin_manage_user:send_password_setup_failed',
            target_user_id: targetUserId,
            details: {
              email_event_id: receipt.eventId,
              provider_status: receipt.providerStatus,
              last_error: receipt.lastError || 'EMAIL_PROVIDER_NOT_CONFIRMED',
            },
          });
          return json(
            req,
            {
              error: receipt.lastError ||
                'O provedor não confirmou o recebimento do e-mail para envio.',
              email_event_id: receipt.eventId,
              provider_status: receipt.providerStatus,
            },
            503,
          );
        }

        const failedProviderStatuses = new Set([
          'bounced',
          'complained',
          'failed',
          'canceled',
          'suppressed',
        ]);
        if (
          receipt.providerStatus &&
          failedProviderStatuses.has(receipt.providerStatus)
        ) {
          await admin.from('lms_admin_audit_log').insert({
            actor_user_id: caller.id,
            action: 'admin_manage_user:send_password_setup_failed',
            target_user_id: targetUserId,
            details: {
              email_event_id: receipt.eventId,
              email_provider_id: receipt.providerId,
              provider_status: receipt.providerStatus,
            },
          });
          return json(
            req,
            {
              error:
                `O provedor recusou a entrega do e-mail (${receipt.providerStatus}).`,
              email_event_id: receipt.eventId,
              provider_status: receipt.providerStatus,
            },
            502,
          );
        }

        result = {
          success: true,
          password_setup_sent: true,
          email_event_id: receipt.eventId,
          email_provider_id: receipt.providerId,
          email_provider_status: receipt.providerStatus || 'accepted',
        };
        break;
      }

      case 'update_role': {
        const newRole = typeof payload.new_role === 'string' ? payload.new_role : '';
        if (!allowedRoles.has(newRole)) {
          return json(req, { error: 'Perfil de acesso inválido.' }, 400);
        }
        if (!callerIsMaster && (!targetIsStudent || newRole !== 'student')) {
          return json(
            req,
            { error: 'Admins podem editar e bloquear alunos, mas não podem alterar contas administrativas.' },
            403,
          );
        }
        if (newRole === 'master_admin' && !callerIsMaster) {
          return json(req, { error: 'Somente Master Admin pode conceder esse perfil.' }, 403);
        }
        if (targetIsMaster && newRole !== 'master_admin') {
          return json(req, { error: 'O perfil Master Admin não pode ser rebaixado por esta função.' }, 403);
        }
        if (
          targetIsMaster &&
          payload.new_access_blocked === true
        ) {
          return json(req, { error: 'Contas Master Admin não podem ser bloqueadas.' }, 403);
        }

        const updatePayload: Record<string, unknown> = { role: newRole };
        const profileUpdate: Record<string, unknown> = {};
        const extendedUpdate: Record<string, unknown> = {};
        if (typeof payload.new_is_anapp_member === 'boolean') {
          updatePayload.is_anapp_member = payload.new_is_anapp_member;
        }
        if (typeof payload.new_notes === 'string' || payload.new_notes === null) {
          updatePayload.notes = payload.new_notes;
        }
        if (typeof payload.new_access_blocked === 'boolean') {
          updatePayload.access_blocked = payload.new_access_blocked;
        }
        if (typeof payload.new_full_name === 'string' || payload.new_full_name === null) {
          updatePayload.full_name = payload.new_full_name;
          profileUpdate.full_name = payload.new_full_name;
          await admin.auth.admin.updateUserById(targetUserId, {
            user_metadata: { full_name: payload.new_full_name },
          });
        }

        const editableTextFields = [
          ['phone', 'new_phone'],
          ['rg', 'new_rg'],
          ['cpf', 'new_cpf'],
          ['street', 'new_street'],
          ['number', 'new_address_number'],
          ['complement', 'new_complement'],
          ['neighborhood', 'new_neighborhood'],
          ['city', 'new_city'],
          ['state', 'new_state'],
          ['zip_code', 'new_zip_code'],
          ['gender', 'new_gender'],
        ] as const;
        for (const [column, payloadKey] of editableTextFields) {
          if (typeof payload[payloadKey] === 'string' || payload[payloadKey] === null) {
            extendedUpdate[column] = payload[payloadKey] === null
              ? null
              : text(payload[payloadKey]);
          }
        }

        const newStudentType =
          typeof payload.new_student_type === 'string' ? payload.new_student_type : '';
        if (newStudentType && !['new_student', 'alumni'].includes(newStudentType)) {
          return json(req, { error: 'Classificação de aluno inválida.' }, 400);
        }
        if (newStudentType) {
          const switchingToAlumni = newStudentType === 'alumni';
          profileUpdate.is_alumni = switchingToAlumni;
          profileUpdate.alumni_type = switchingToAlumni ? 'alumni' : null;
          profileUpdate.registration_cohort = switchingToAlumni ? 'pre_2026' : 'new_2026';
          updatePayload.user_origin = switchingToAlumni ? 'alumni' : 'new_student';
        }

        const { error } = await admin
          .from('user_roles')
          .upsert(
            { user_id: targetUserId, ...updatePayload },
            { onConflict: 'user_id' },
          );
        if (error) throw error;

        if (typeof payload.new_access_blocked === 'boolean') {
          const { error: authBlockError } =
            await admin.auth.admin.updateUserById(targetUserId, {
              ban_duration: payload.new_access_blocked ? '876600h' : 'none',
            });
          if (authBlockError) {
            await admin
              .from('user_roles')
              .update({
                access_blocked: targetRole?.access_blocked === true,
              })
              .eq('user_id', targetUserId);
            throw authBlockError;
          }
        }

        if (Object.keys(profileUpdate).length > 0) {
          const { error: profileError } = await admin
            .from('profiles')
            .update({ ...profileUpdate, updated_at: new Date().toISOString() })
            .eq('id', targetUserId);
          if (profileError) throw profileError;
        }

        if (Object.keys(extendedUpdate).length > 0) {
          const { data: existingExtended, error: existingExtendedError } = await admin
            .from('user_extended_profile')
            .select('user_id,first_name,last_name,phone,rg,cpf,street,number,complement,neighborhood,city,state,zip_code,gender,profile_completed')
            .eq('user_id', targetUserId)
            .maybeSingle();
          if (existingExtendedError) throw existingExtendedError;
          const mergedExtended = { ...(existingExtended ?? {}), ...extendedUpdate };
          const profileCompleted = Boolean(
            text(mergedExtended.first_name) &&
            text(mergedExtended.last_name) &&
            text(mergedExtended.phone) &&
            text(mergedExtended.rg) &&
            text(mergedExtended.cpf) &&
            text(mergedExtended.street) &&
            text(mergedExtended.number) &&
            text(mergedExtended.neighborhood) &&
            text(mergedExtended.city) &&
            text(mergedExtended.state) &&
            text(mergedExtended.zip_code) &&
            ['masculino', 'feminino', 'prefiro_nao_informar'].includes(
              text(mergedExtended.gender),
            )
          );
          const { error: extendedError } = await admin
            .from('user_extended_profile')
            .upsert(
              { user_id: targetUserId, ...extendedUpdate, profile_completed: profileCompleted },
              { onConflict: 'user_id' },
            );
          if (extendedError) throw extendedError;
        }

        if (newStudentType === 'alumni') {
          const { data: authTarget } = await admin.auth.admin.getUserById(targetUserId);
          const now = new Date().toISOString();
          await admin.from('student_enrollments').upsert(
            {
              user_id: targetUserId,
              status: authTarget?.user?.email_confirmed_at ? 'active' : 'email_pending',
              email_confirmed_at: authTarget?.user?.email_confirmed_at ?? null,
              payment_id: null,
              activated_at: authTarget?.user?.email_confirmed_at ? now : null,
              updated_at: now,
            },
            { onConflict: 'user_id' },
          );
        }
        result = { success: true };
        break;
      }

      case 'confirm_email': {
        const { error } = await admin.auth.admin.updateUserById(targetUserId, {
          email_confirm: true,
        });
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'change_password': {
        const newPassword = payload.new_password;
        if (!strongPassword(newPassword)) {
          return json(
            req,
            {
              error:
                'A senha deve ter pelo menos 12 caracteres, incluindo letra maiúscula, letra minúscula, número e símbolo.',
            },
            400,
          );
        }
        const { error } = await admin.auth.admin.updateUserById(targetUserId, {
          password: newPassword,
        });
        if (error) throw error;
        result = {
          success: true,
          password_changed: true,
          changed_at: new Date().toISOString(),
        };
        break;
      }

      case 'change_email': {
        const newEmail =
          typeof payload.new_email === 'string' ? payload.new_email.trim().toLowerCase() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
          return json(req, { error: 'Novo e-mail inválido.' }, 400);
        }
        const { data: targetAuth, error: targetAuthError } =
          await admin.auth.admin.getUserById(targetUserId);
        if (targetAuthError || !targetAuth.user?.email) {
          return json(req, { error: 'Usuário não encontrado.' }, 404);
        }
        const isTargetAlumni = alumniOrigins.has(targetRole?.user_origin ?? '');
        if (isTargetAlumni) {
          const { error: authorizationError } = await admin.rpc(
            'lms_create_alumni_email_change_authorization',
            {
              p_target_user_id: targetUserId,
              p_new_email: newEmail,
              p_reason: 'Alteração administrativa de dados do usuário',
              p_approved_by: caller.id,
            },
          );
          if (authorizationError) throw authorizationError;
        }
        const { error } = await admin.auth.admin.updateUserById(targetUserId, {
          email: newEmail,
          email_confirm: true,
        });
        if (error) throw error;
        if (!isTargetAlumni) {
          const { error: profileEmailError } = await admin
            .from('profiles')
            .update({ email: newEmail, updated_at: new Date().toISOString() })
            .eq('id', targetUserId);
          if (profileEmailError) throw profileEmailError;
        }
        result = { success: true };
        break;
      }

      case 'delete_user': {
        await admin.from('lms_admin_audit_log').delete().eq('target_user_id', targetUserId);
        await admin.from('audit_log').delete().eq('user_id', targetUserId);
        await admin.from('quiz_attempts').delete().eq('user_id', targetUserId);
        await admin.from('user_quiz_scores').delete().eq('user_id', targetUserId);
        await admin.from('exam_attempts').delete().eq('user_id', targetUserId);
        await admin.from('user_exam_scores').delete().eq('user_id', targetUserId);
        await admin.from('student_email_events').delete().eq('user_id', targetUserId);
        await admin.from('student_enrollments').delete().eq('user_id', targetUserId);
        await admin.from('user_extended_profile').delete().eq('user_id', targetUserId);
        await admin.from('user_roles').delete().eq('user_id', targetUserId);
        await admin.from('payments').delete().eq('user_id', targetUserId);
        await admin.from('certificates').delete().eq('user_id', targetUserId);
        await admin.from('user_progress').delete().eq('user_id', targetUserId);
        await admin.from('profiles').delete().eq('id', targetUserId);
        const { error } = await admin.auth.admin.deleteUser(targetUserId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'get_user': {
        const { data, error } = await admin.auth.admin.getUserById(targetUserId);
        if (error) throw error;
        result = {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            email_confirmed_at: data.user.email_confirmed_at,
            created_at: data.user.created_at,
            last_sign_in_at: data.user.last_sign_in_at,
          },
        };
        break;
      }

      case 'ban_user': {
        const banned = payload.banned === true;
        const { error } = await admin.auth.admin.updateUserById(targetUserId, {
          ban_duration: banned ? '876600h' : 'none',
        });
        if (error) throw error;
        const { error: roleBlockError } = await admin
          .from('user_roles')
          .update({ access_blocked: banned })
          .eq('user_id', targetUserId);
        if (roleBlockError) {
          await admin.auth.admin.updateUserById(targetUserId, {
            ban_duration: targetRole?.access_blocked === true ? '876600h' : 'none',
          });
          throw roleBlockError;
        }
        result = { success: true, access_blocked: banned };
        break;
      }

      default:
        return json(req, { error: 'Ação inválida.' }, 400);
    }

    await admin.from('lms_admin_audit_log').insert({
      actor_user_id: caller.id,
      action: `admin_manage_user:${action}`,
      target_user_id: action === 'delete_user' ? null : targetUserId,
      details: action === 'send_password_setup'
        ? {
          success: true,
          email_event_id: result.email_event_id ?? null,
          email_provider_id: result.email_provider_id ?? null,
          provider_status: result.email_provider_status ?? null,
        }
        : action === 'delete_user'
          ? {
            success: true,
            deleted_user_id: targetUserId,
            deleted_role: targetRoleName,
          }
          : action === 'ban_user'
            ? {
              success: true,
              access_blocked: payload.banned === true,
            }
            : action === 'update_role' &&
                typeof payload.new_access_blocked === 'boolean'
              ? {
                success: true,
                access_blocked: payload.new_access_blocked,
              }
              : { success: true },
    });

    return json(req, result);
  } catch (error) {
    return json(
      req,
      { error: error instanceof Error ? error.message : 'Erro interno.' },
      500,
    );
  }
});
