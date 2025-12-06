import Footer from '../components/Footer';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CourseCatalog({ user }) {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses`, { withCredentials: true });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cat\u00e1logo de Cursos</h1>
          <p className="text-lg text-gray-600">Explore todos os cursos dispon\u00edveis na plataforma CTP</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC] focus:border-transparent"
              data-testid="course-search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-[#0072BC] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Carregando cursos...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-600">Tente ajustar sua busca ou aguarde novos cursos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <div key={course.course_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1" data-testid={`course-catalog-card-${course.course_id}`}>
                <div className="h-48 bg-gradient-to-br from-[#0072BC] to-[#004a7c] relative overflow-hidden">
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Instrutor: {course.instructor}</span>
                    {course.duration && <span>{course.duration}</span>}
                  </div>
                  <Link
                    to={`/courses/${course.course_id}`}
                    className="block w-full text-center px-4 py-2.5 bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all active:scale-95"
                    data-testid={`view-course-button-${course.course_id}`}
                  >
                    Ver Curso
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCatalog;
