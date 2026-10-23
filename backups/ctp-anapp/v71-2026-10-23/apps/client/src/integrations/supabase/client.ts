import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://egihufoowzfykieozusr.supabase.co";
const PASSWORD_RECOVERY_STORAGE_KEY = "ctp-anapp:password-recovery-started-at";
const PASSWORD_RECOVERY_WINDOW_MS = 15 * 60 * 1000;

function isPasswordRecoveryRedirect(): boolean {
  if (typeof window === "undefined") return false;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return (
    hashParams.get("type") === "recovery" ||
    searchParams.get("type") === "recovery"
  );
}

export function markPasswordRecoveryAttempt(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    PASSWORD_RECOVERY_STORAGE_KEY,
    Date.now().toString(),
  );
}

export function hasRecentPasswordRecoveryAttempt(): boolean {
  if (typeof window === "undefined") return false;

  const startedAt = Number(
    window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY),
  );
  if (!Number.isFinite(startedAt)) return false;

  const elapsed = Date.now() - startedAt;
  return elapsed >= 0 && elapsed <= PASSWORD_RECOVERY_WINDOW_MS;
}

export function clearPasswordRecoveryAttempt(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
}

if (isPasswordRecoveryRedirect()) {
  markPasswordRecoveryAttempt();
}

// Supabase publishable/anon keys are intentionally public browser credentials.
// Authorization remains enforced by Auth, RLS policies, and Edge Functions.
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaWh1Zm9vd3pmeWtpZW96dXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDE1NjAsImV4cCI6MjA4OTg3NzU2MH0.pPgg3oy24yjTzO5HxFC77DOrB1clyMuKT2w8mDdZaOI";
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export type ApostilaContent = {
  html_content?: string;
  html?: string;
  sections?: Array<{
    title?: string;
    image?: string;
    content?: string;
    subsections?: Array<{ subtitle?: string; text?: string }>;
    conversions?: Array<{ type?: string; formula?: string; example?: string }>;
    formulas?: Array<{ type?: string; formula?: string; example?: string }>;
    safety_tips?: string[];
    products?: Array<{ name?: string; function?: string }>;
    errors?: string[];
    exercises?: Array<{ question?: string; answer?: string }>;
  }>;
};

export type Chapter = {
  id: number;
  chapter_number: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  duration?: string | null;
  video_url?: string | null;
  podcast_url?: string | null;
  slides_url?: string | null;
  apostila_pdf_url?: string | null;
  apostila_content?: ApostilaContent | string | null;
  infografico_url?: string | null;
};

export type UserProgress = {
  id?: string;
  user_id?: string;
  chapter_id: number;
  completion_percentage: number;
  video_completed?: boolean;
  podcast_completed?: boolean;
  slides_completed?: boolean;
  apostila_completed?: boolean;
  quiz_completed?: boolean;
  materials_completed?: boolean;
};

export type Certificate = {
  id?: string;
  user_id?: string;
  certificate_number: string;
  full_name: string;
  cpf: string;
  completion_date: string;
  verification_code?: string | null;
  final_score?: number | null;
  total_hours?: number | null;
  is_valid?: boolean;
  created_at?: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};
