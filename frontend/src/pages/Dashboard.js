import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Award, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard({ user = null }) {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollmentsRes, coursesRes] = await Promise.all([
          axios.get(`${API}/courses/enrollments`, { withCredentials: true }),
          axios.get(`${API}/courses`, { withCredentials: true })
        ]);
        setEnrollments(enrollmentsRes.data);
        setCourses(coursesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const enrolledCourses = courses.filter(course => 
    enrollments.some(e => e.course_id === course.course_id)
  );

  const totalProgress = enrollments.length > 0 
    ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="dashboard-greeting">Olá, {user?.name || 'Aluno'}!</h1>
          <p className="text-lg text-gray-600">Bem-vindo de volta à sua jornada de aprendizado</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="text-[#0072BC]" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{enrolledCourses.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Cursos Ativos</h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{Math.round(totalProgress)}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Progresso Médio</h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="text-[#FF6B00]" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Certificados</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Seus Cursos</h2>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#0072BC] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Carregando cursos...</p>
              </div>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum curso inscrito ainda</h3>
              <p className="text-gray-600 mb-6">Explore nosso catálogo e comece sua jornada de aprendizado</p>
              <Link 
                to="/courses" 
                className="inline-block bg-[#0072BC] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#005a9e] transition-all active:scale-95"
                data-testid="explore-courses-link"
              >
                Explorar Cursos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map(course => {
                const enrollment = enrollments.find(e => e.course_id === course.course_id);
                return (
                  <Link
                    key={course.course_id}
                    to={`/courses/${course.course_id}`}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                    data-testid={`dashboard-course-card-${course.course_id}`}
                  >
                    <div className="h-48 bg-gradient-to-br from-[#0072BC] to-[#004a7c] relative">
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">Progresso</span>
                        <span className="text-sm font-bold text-[#0072BC]">{Math.round(enrollment?.progress || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0072BC] h-2 rounded-full" style={{ width: `${enrollment?.progress || 0}%` }}></div>
                      </div>
                      {enrollment?.status === 'completed' && (
                        <div className="flex items-center text-green-600 mt-3">
                          <CheckCircle2 size={18} className="mr-2" />
                          <span className="text-sm font-medium">Concluído</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer user={user} />
    </div>
  );
}

export default Dashboard;