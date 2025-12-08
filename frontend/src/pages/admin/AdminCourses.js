import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminCourses({ user = null }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/courses`, formData, { withCredentials: true });
      setShowForm(false);
      setFormData({ title: '', description: '', instructor: '', duration: '', status: 'draft' });
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;
    
    try {
      await axios.delete(`${API}/courses/${courseId}`, { withCredentials: true });
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerenciar Cursos</h1>
            <p className="text-lg text-gray-600">Criar e editar cursos da plataforma</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-6 py-3 bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all shadow-sm active:scale-95"
            data-testid="create-course-button"
          >
            <Plus size={20} />
            <span>Novo Curso</span>
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Criar Novo Curso</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">T\u00edtulo</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descri\u00e7\u00e3o</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instrutor</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dura\u00e7\u00e3o</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="ex: 8 horas"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all active:scale-95"
                >
                  Criar Curso
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-[#0072BC] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.course_id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow" data-testid={`admin-course-${course.course_id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Instrutor: {course.instructor}</span>
                      {course.duration && <span>•</span>}
                      {course.duration && <span>{course.duration}</span>}
                      <span>•</span>
                      <span className={`px-2 py-1 rounded ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-[#0072BC] transition-colors">
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.course_id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer user={user} />
    </div>
  );
}

export default AdminCourses;
