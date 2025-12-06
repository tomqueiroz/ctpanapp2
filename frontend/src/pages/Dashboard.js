import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollmentsRes, certificatesRes, coursesRes] = await Promise.all([
          axios.get(`${API}/enrollments/my`, { withCredentials: true }),
          axios.get(`${API}/certificates/my`, { withCredentials: true }),
          axios.get(`${API}/courses`, { withCredentials: true })
        ]);
        
        setEnrollments(enrollmentsRes.data);
        setCertificates(certificatesRes.data);
        setCourses(coursesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#0072BC] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  const enrolledCourses = courses.filter(course => 
    enrollments.some(e => e.course_id === course.course_id)
  );

  const averageProgress = enrollments.length > 0 
    ? enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Olá, {user?.name}!</h1>
          <p className="text-lg text-gray-600">Bem-vindo de volta à sua jornada de aprendizado</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#0072BC]/10 rounded-lg flex items-center justify-center">
                <BookOpen className="text-[#0072BC]" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{enrollments.length}</div>
            <div className="text-sm text-gray-600">Cursos Matriculados</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#FF7B00]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-[#FF7B00]" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(averageProgress)}%</div>
            <div className="text-sm text-gray-600">Progresso Médio</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="text-green-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{certificates.length}</div>
            <div className="text-sm text-gray-600">Certificados</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{enrolledCourses.length}</div>
            <div className="text-sm text-gray-600">Cursos Ativos</div>
          </div>
        </div>

        {/* Current Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Meus Cursos</h2>
            <Link 
              to="/courses" 
              className="text-[#0072BC] hover:text-[#005a9e] font-medium transition-colors"
              data-testid="view-all-courses-link"
            >
              Ver todos →
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum curso matriculado</h3>
              <p className="text-gray-600 mb-6">Começe sua jornada de aprendizado agora!</p>
              <Link
                to="/courses"
                className="inline-block px-6 py-3 bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all shadow-sm active:scale-95"
                data-testid="browse-courses-button"
              >
                Explorar Cursos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => {
                const enrollment = enrollments.find(e => e.course_id === course.course_id);
                return (
                  <div key={course.course_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1" data-testid={`course-card-${course.course_id}`}>
                    <div className="h-48 bg-gradient-to-br from-[#0072BC] to-[#004a7c] relative overflow-hidden">
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      
                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progresso</span>
                          <span className="font-semibold text-gray-900">{Math.round(enrollment?.progress || 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#0072BC] h-2 rounded-full transition-all" 
                            style={{ width: `${enrollment?.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <Link
                        to={`/courses/${course.course_id}`}
                        className="block w-full text-center px-4 py-2.5 bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all active:scale-95"
                        data-testid={`continue-course-button-${course.course_id}`}
                      >
                        Continuar Curso
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Certificados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => {
                const course = courses.find(c => c.course_id === cert.course_id);
                return (
                  <div key={cert.certificate_id} className="bg-white border-2 border-[#FFD100] rounded-xl p-6 hover:shadow-lg transition-shadow" data-testid={`certificate-card-${cert.certificate_id}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-[#FFD100]/20 rounded-lg flex items-center justify-center">
                        <Award className="text-[#FFD100]" size={24} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Certificado</div>
                        <div className="text-sm font-semibold text-gray-900">CTP - ANAPP</div>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{course?.title || 'Curso'}</h3>
                    <p className="text-sm text-gray-600 mb-4">Emitido em {new Date(cert.issued_at).toLocaleDateString('pt-BR')}</p>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      Baixar Certificado
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;