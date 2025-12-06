import Footer from '../components/Footer';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, User, CheckCircle2, PlayCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CourseDetail({ user }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, modulesRes, enrollmentsRes] = await Promise.all([
          axios.get(`${API}/courses/${courseId}`, { withCredentials: true }),
          axios.get(`${API}/courses/${courseId}/modules`, { withCredentials: true }),
          axios.get(`${API}/enrollments/my`, { withCredentials: true })
        ]);

        setCourse(courseRes.data);
        setModules(modulesRes.data);
        const userEnrollment = enrollmentsRes.data.find(e => e.course_id === courseId);
        setEnrollment(userEnrollment);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await axios.post(`${API}/enrollments`, { course_id: courseId }, { withCredentials: true });
      window.location.reload();
    } catch (error) {
      console.error('Error enrolling:', error);
      setEnrolling(false);
    }
  };

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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Curso n\u00e3o encontrado</h2>
          <Link to="/courses" className="text-[#0072BC] hover:underline">Voltar para cursos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0072BC] to-[#004a7c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-white/90 mb-6">{course.description}</p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <User size={18} />
                  <span>{course.instructor}</span>
                </div>
                {course.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock size={18} />
                    <span>{course.duration}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <BookOpen size={18} />
                  <span>{modules.length} m\u00f3dulos</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full md:w-80">
              {enrollment ? (
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Seu Progresso</span>
                      <span className="font-semibold">{Math.round(enrollment.progress)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-[#FFD100] h-2 rounded-full transition-all" 
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (modules.length > 0) {
                        navigate(`/courses/${courseId}/learn/${modules[0].module_id}`);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#FF7B00] text-white font-semibold rounded-lg hover:bg-[#e66f00] transition-all shadow-lg active:scale-95"
                    data-testid="continue-learning-button"
                  >
                    <PlayCircle size={20} />
                    <span>Continuar Aprendizado</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full px-6 py-3 bg-[#FF7B00] text-white font-semibold rounded-lg hover:bg-[#e66f00] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  data-testid="enroll-button"
                >
                  {enrolling ? 'Matriculando...' : 'Matricular-se Agora'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Conte\u00fado do Curso</h2>
        <div className="space-y-4">
          {modules.map((module, index) => (
            <div key={module.module_id} className="bg-white border border-gray-200 rounded-xl p-6" data-testid={`module-card-${module.module_id}`}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#0072BC]/10 rounded-full flex items-center justify-center font-bold text-[#0072BC]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{module.title}</h3>
                </div>
                {enrollment && (
                  <CheckCircle2 className="text-green-500" size={24} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

      <Footer user={user} />
export default CourseDetail;
