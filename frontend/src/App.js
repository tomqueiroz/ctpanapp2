import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseDashboard from './pages/CourseDashboard';
import CourseCatalog from './pages/CourseCatalog';
import ChapterView from './pages/ChapterView';
import ApostilaModulo1 from './pages/ApostilaModulo1';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';
import MagazineLibrary from './pages/MagazineLibrary';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminMagazines from './pages/admin/AdminMagazines';
import AdminUsers from './pages/admin/AdminUsers';
import SobreAnapp from './pages/public/SobreAnapp';
import SobreCTP from './pages/public/SobreCTP';
import Contato from './pages/public/Contato';
import CursosECertificacoes from './pages/public/CursosECertificacoes';
import ConhecaCTP from './pages/public/ConhecaCTP';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppRouter() {
  const location = useLocation();
  
  // Check for session_id in hash during render (NOT in useEffect)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      {/* Páginas públicas */}
      <Route path="/sobre-anapp" element={<SobreAnapp />} />
      <Route path="/sobre-ctp" element={<SobreCTP />} />
      <Route path="/cursos" element={<CursosECertificacoes />} />
      <Route path="/conheca-ctp" element={<ConhecaCTP />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/login" element={<Login />} />
      {/* Páginas protegidas */}
      <Route path="/dashboard" element={<CourseDashboard />} />
      <Route path="/dashboard/chapter/:chapterId" element={<ChapterView />} />
      <Route path="/dashboard/apostila/modulo-1" element={<ApostilaModulo1 />} />
      <Route path="/courses" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />
      <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
      <Route path="/courses/:courseId/learn/:lessonId" element={<ProtectedRoute><LessonViewer /></ProtectedRoute>} />
      <Route path="/magazines" element={<ProtectedRoute><MagazineLibrary /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute requireAdmin><AdminCourses /></ProtectedRoute>} />
      <Route path="/admin/magazines" element={<ProtectedRoute requireAdmin><AdminMagazines /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;