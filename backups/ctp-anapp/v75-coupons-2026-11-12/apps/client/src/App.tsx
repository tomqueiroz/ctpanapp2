import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import { ScrollToTop as ScrollToTopButton } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Home from "@/pages/Home";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { RequireChapterAccess, RequireFullCourseAccess } from "@/components/CourseAccessRoute";

// Keep Home synchronous for prerendering; load private/secondary tools on demand.
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ChapterView = lazy(() => import("@/pages/ChapterView"));
const PoolCalculator = lazy(() => import("@/pages/PoolCalculator"));
const Checklist = lazy(() => import("@/pages/Checklist"));
const POP = lazy(() => import("@/pages/POP"));
const About = lazy(() => import("@/pages/About"));
const Courses = lazy(() => import("@/pages/Courses"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Profile = lazy(() => import("@/pages/Profile"));
const CompleteRegistration = lazy(() => import("@/pages/CompleteRegistration"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const Certificate = lazy(() => import("@/pages/Certificate"));
const VerifyCertificate = lazy(() => import("@/pages/VerifyCertificate"));
const ProgressDashboard = lazy(() => import("@/pages/ProgressDashboard"));
const Badges = lazy(() => import("@/pages/Badges"));
const Ranking = lazy(() => import("@/pages/Ranking"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Exam = lazy(() => import("@/components/Exam").then(m => ({ default: m.Exam })));
const ExamResult = lazy(() => import("@/components/ExamResult").then(m => ({ default: m.ExamResult })));
const Quiz = lazy(() => import("@/components/Quiz").then(m => ({ default: m.Quiz })));
const QuizResult = lazy(() => import("@/components/QuizResult").then(m => ({ default: m.QuizResult })));
const Grades = lazy(() => import("@/components/Grades").then(m => ({ default: m.Grades })));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminAnalytics = lazy(() => import("@/pages/AdminAnalytics"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const AdminAuthorize = lazy(() => import("@/pages/AdminAuthorize"));
const AdminCoupons = lazy(() => import("@/pages/AdminCoupons"));
const AdminReports = lazy(() => import("@/pages/AdminReports"));

const queryClient = new QueryClient();

function ScrollToTop(): null {
  useScrollToTop();
  return null;
}

function LegacyHashRedirect(): null {
  useEffect(() => {
    if (!window.location.hash.startsWith("#/")) return;
    const legacyPath = window.location.hash.slice(1);
    window.history.replaceState(null, "", legacyPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);
  return null;
}

function Protected({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function Administrative({ children }: { children: ReactNode }) {
  return <AdminRoute>{children}</AdminRoute>;
}

function PageBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  // A failed route must not poison the next route's rendering.
  return <RouteErrorBoundary key={pathname}>{children}</RouteErrorBoundary>;
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner richColors position="top-right" />
        <BrowserRouter>
          <LegacyHashRedirect />
          <ScrollToTopButton />
          <ScrollToTop />
          <Layout>
            <PageBoundary>
            <Suspense fallback={<div className="py-12 text-center text-muted-foreground" role="status">Carregando página...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/verify-certificate" element={<VerifyCertificate />} />
              <Route path="/complete-registration" element={<Protected><CompleteRegistration /></Protected>} />
              <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/certificate" element={<Protected><RequireFullCourseAccess><Certificate /></RequireFullCourseAccess></Protected>} />
              <Route path="/progress" element={<Protected><RequireFullCourseAccess><ProgressDashboard /></RequireFullCourseAccess></Protected>} />
              <Route path="/badges" element={<Protected><RequireFullCourseAccess><Badges /></RequireFullCourseAccess></Protected>} />
              <Route path="/ranking" element={<Protected><RequireFullCourseAccess><Ranking /></RequireFullCourseAccess></Protected>} />
              <Route path="/favorites" element={<Protected><RequireFullCourseAccess><Favorites /></RequireFullCourseAccess></Protected>} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/dashboard/checklist" element={<Protected><RequireFullCourseAccess><Checklist /></RequireFullCourseAccess></Protected>} />
              <Route path="/dashboard/calculator" element={<Protected><RequireFullCourseAccess><PoolCalculator /></RequireFullCourseAccess></Protected>} />
              <Route path="/dashboard/pop" element={<Protected><RequireFullCourseAccess><POP /></RequireFullCourseAccess></Protected>} />
              <Route path="/dashboard/chapter/:chapterId" element={<Protected><RequireChapterAccess><ChapterView /></RequireChapterAccess></Protected>} />
              <Route path="/dashboard/exam/:examId" element={<Protected><RequireFullCourseAccess><Exam /></RequireFullCourseAccess></Protected>} />
              <Route path="/dashboard/exam/:examId/result" element={<Protected><RequireFullCourseAccess><ExamResult /></RequireFullCourseAccess></Protected>} />
              <Route path="/dashboard/quiz/:quizId" element={<Protected><RequireFullCourseAccess><Quiz /></RequireFullCourseAccess></Protected>} />
              <Route path="/dashboard/quiz/:quizId/result/:attemptId" element={<Protected><RequireFullCourseAccess><QuizResult /></RequireFullCourseAccess></Protected>} />
              <Route path="/dashboard/grades" element={<Protected><RequireFullCourseAccess><Grades /></RequireFullCourseAccess></Protected>} />
              <Route path="/admin" element={<Administrative><Admin /></Administrative>} />
              <Route path="/admin/users" element={<Administrative><AdminUsers /></Administrative>} />
              <Route path="/admin/analytics" element={<Administrative><AdminAnalytics /></Administrative>} />
              <Route path="/admin/settings" element={<Administrative><AdminSettings /></Administrative>} />
              <Route path="/admin/authorize" element={<Administrative><AdminAuthorize /></Administrative>} />
              <Route path="/admin/coupons" element={<Administrative><AdminCoupons /></Administrative>} />
              <Route path="/admin/reports" element={<Administrative><AdminReports /></Administrative>} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
            </PageBoundary>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
