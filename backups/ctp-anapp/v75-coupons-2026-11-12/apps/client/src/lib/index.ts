export const ROUTE_PATHS = {
  HOME: '/',
  COURSES: '/courses',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  CHECKLIST: '/dashboard/checklist',
  CALCULATOR: '/dashboard/calculator',
  POP: '/dashboard/pop',
  CHAPTER: '/dashboard/chapter/:chapterId',
  EXAM: '/dashboard/exam/:examId',
  EXAM_RESULT: '/dashboard/exam/:examId/result',
  QUIZ: '/dashboard/quiz/:quizId',
  QUIZ_RESULT: '/dashboard/quiz/:quizId/result/:attemptId',
  GRADES: '/dashboard/grades',
  CHECKOUT: '/checkout',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_AUTHORIZE: '/admin/authorize',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_REPORTS: '/admin/reports',
  ABOUT: '/about',
  PROFILE: '/profile',
  CERTIFICATE: '/certificate',
  PROGRESS: '/progress',
  BADGES: '/badges',
  RANKING: '/ranking',
  FAVORITES: '/favorites',
  COMPLETE_REGISTRATION: '/complete-registration',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_USE: '/terms-of-use',
} as const;

export interface Course {
  id: string;
  title: string;
  level: 'Básico' | 'Avançado' | 'Master' | 'Especialização';
  description: string;
  duration: string;
  price: {
    oneTime: number;
  };
  modules: Module[];
  features: string[];
  image: string;
  certificationType: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  duration: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf' | 'quiz';
  completed?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledCourses: string[];
  createdAt: string;
}

export interface Progress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  currentLesson: string;
  percentage: number;
  lastAccessed: string;
  certificateIssued: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
  beforeIncome?: string;
  afterIncome?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const getCheckoutPath = (courseId: string): string => {
  return ROUTE_PATHS.CHECKOUT;
};

export const getExamPath = (examId: string): string => {
  return ROUTE_PATHS.EXAM.replace(':examId', examId);
};

export const getExamResultPath = (examId: string): string => {
  return ROUTE_PATHS.EXAM_RESULT.replace(':examId', examId);
};

// Exam System Types
export interface Exam {
  id: string;
  chapter_id: number | null;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes?: number;
  is_final_certification: boolean;
  instructions: string;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question: string;
  options: string[];
  option_indices?: number[];
  correct_answer?: number;
  explanation?: string;
  order_index: number;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  total_questions: number;
  correct_answers?: number;
  is_passed: boolean;
  answers: Record<string, number>;
  created_at: string;
}

export interface UserExamScore {
  id: string;
  user_id: string;
  exam_id: string;
  chapter_id: number;
  best_score: number;
  attempts_count: number;
  last_attempt_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamWithQuestions extends Exam {
  questions: ExamQuestion[];
}

export interface GradeReport {
  user: {
    first_name: string;
    last_name: string;
    cpf: string;
  };
  chapters: {
    chapter_number: number;
    chapter_title: string;
    best_score: number;
    attempts: number;
    passing_score?: number;
    is_approved?: boolean;
    historically_approved?: boolean;
    approval_rule?: 'current_70' | 'historical_60' | 'pending';
  }[];
  average_score: number;
  total_chapters: number;
  completed_chapters: number;
  current_policy_passed_chapters?: number;
  is_certified: boolean;
  passing_score: number;
  historical_approvals_preserved?: boolean;
  final_exam?: {
    exam_id: string;
    title: string;
    best_score: number;
    attempts_count: number;
    passing_score: number;
    is_approved: boolean;
  };
  generated_at: string;
}
