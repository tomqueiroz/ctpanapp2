import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, Clock, Award } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CourseDetail({ user = null }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, modulesRes, lessonsRes, enrollmentsRes] = await Promise.all([
          axios.get(`${API}/courses/${courseId}`, { withCredentials: true }),
          axios.get(`${API}/courses/${courseId}/modules`, { withCredentials: true }),
          axios.get(`${API}/courses/${courseId}/lessons`, { withCredentials: true }),
          axios.get(`${API}/courses/enrollments`, { withCredentials: true })
        ]);

        setCourse(courseRes.data);
        setModules(modulesRes.data);
        setLessons(lessonsRes.data);
        const userEnrollment = enrollmentsRes.data.find(e => e.course_id === courseId);
        setEnrollment(userEnrollment || null);
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      const response = await axios.post(`${API}/courses/${courseId}/enroll`, {}, { withCredentials: true });
      setEnrollment(response.data);
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#0072BC] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando curso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Curso não encontrado</h2>
            <button onClick={() => navigate('/courses')} className="text-[#0072BC] hover:underline">Voltar para cursos</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/courses')} className="flex items-center text-gray-600 hover:text-[#0072BC] mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Voltar para cursos
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-80 bg-gradient-to-br from-[#0072BC] to-[#004a7c] relative">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle size={80} className="text-white opacity-80" />
                </div>
              </div>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                <p className="text-gray-600 mb-6">{course.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2" />
                    {course.duration || 'Duração não especificada'}
                  </div>
                  <div className="flex items-center">
                    <FileText size={18} className="mr-2" />
                    {lessons.length} aulas
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Conteúdo do Curso</h2>
              {modules.length === 0 ? (
                <p className="text-gray-600">Nenhum módulo disponível ainda.</p>
              ) : (
                <div className="space-y-4">
                  {modules.map(module => {
                    const moduleLessons = lessons.filter(l => l.module_id === module.module_id);
                    return (
                      <div key={module.module_id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 font-medium text-gray-900">
                          {module.title}
                        </div>
                        <div className="divide-y divide-gray-200">
                          {moduleLessons.map(lesson => (
                            <Link
                              key={lesson.lesson_id}
                              to={enrollment ? `/courses/${courseId}/learn/${lesson.lesson_id}` : '#'}
                              className={`flex items-center justify-between p-4 ${
                                enrollment ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="flex items-center">
                                {lesson.content_type === 'video' ? (
                                  <PlayCircle size={18} className="text-[#0072BC] mr-3" />
                                ) : (
                                  <FileText size={18} className="text-[#0072BC] mr-3" />
                                )}
                                <span className="text-gray-700">{lesson.title}</span>
                              </div>
                              {lesson.duration && (
                                <span className="text-sm text-gray-500">{lesson.duration} min</span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
              {enrollment ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progresso</span>
                      <span className="text-sm font-bold text-[#0072BC]">{Math.round(enrollment.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#0072BC] h-2 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                    </div>
                  </div>
                  {enrollment.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center text-green-700">
                        <CheckCircle2 size={20} className="mr-2" />
                        <span className="font-medium">Curso Concluído!</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const firstLesson = lessons[0];
                      if (firstLesson) navigate(`/courses/${courseId}/learn/${firstLesson.lesson_id}`);
                    }}
                    className="w-full bg-[#0072BC] text-white py-3 rounded-lg font-semibold hover:bg-[#005a9e] transition-all active:scale-95 mb-4"
                    data-testid="continue-course-button"
                  >
                    {enrollment.progress > 0 ? 'Continuar Curso' : 'Começar Curso'}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Inscreva-se neste curso</h3>
                  <p className="text-gray-600 mb-6">Obtenha acesso completo a todas as aulas e recursos</p>
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-[#FF6B00] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all active:scale-95 mb-4"
                    data-testid="enroll-course-button"
                  >
                    Inscrever-se Agora
                  </button>
                </>
              )}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">Este curso inclui:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="text-[#0072BC] mr-2 mt-1 shrink-0" />
                    <span className="text-sm text-gray-600">Acesso vitalício</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="text-[#0072BC] mr-2 mt-1 shrink-0" />
                    <span className="text-sm text-gray-600">Certificado de conclusão</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="text-[#0072BC] mr-2 mt-1 shrink-0" />
                    <span className="text-sm text-gray-600">Suporte do instrutor</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="text-[#0072BC] mr-2 mt-1 shrink-0" />
                    <span className="text-sm text-gray-600">Material complementar</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer user={user} />
    </div>
  );
}

export default CourseDetail;