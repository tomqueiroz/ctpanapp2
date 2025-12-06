import Footer from '../../components/Footer';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Award, Library } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/admin/stats`, { withCredentials: true });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-lg text-gray-600">Gerencie cursos, usu\u00e1rios e conte\u00fado da plataforma</p>
        </div>

        {/* Stats */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#0072BC]/10 rounded-lg flex items-center justify-center">
                  <Users className="text-[#0072BC]" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total_users}</div>
              <div className="text-sm text-gray-600">Usu\u00e1rios</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#FF7B00]/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-[#FF7B00]" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total_courses}</div>
              <div className="text-sm text-gray-600">Cursos</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="text-green-600" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total_enrollments}</div>
              <div className="text-sm text-gray-600">Matr\u00edculas</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Library className="text-purple-600" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total_magazines}</div>
              <div className="text-sm text-gray-600">Revistas</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">A\u00e7\u00f5es R\u00e1pidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/admin/courses"
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1"
              data-testid="manage-courses-link"
            >
              <div className="w-14 h-14 bg-[#0072BC]/10 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="text-[#0072BC]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Cursos</h3>
              <p className="text-gray-600">Criar, editar e organizar cursos e m\u00f3dulos</p>
            </Link>

            <Link
              to="/admin/magazines"
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1"
              data-testid="manage-magazines-link"
            >
              <div className="w-14 h-14 bg-[#FF7B00]/10 rounded-lg flex items-center justify-center mb-6">
                <Library className="text-[#FF7B00]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Revistas</h3>
              <p className="text-gray-600">Adicionar e organizar revistas digitais</p>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1"
              data-testid="manage-users-link"
            >
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Usu\u00e1rios</h3>
              <p className="text-gray-600">Administrar usu\u00e1rios e permiss\u00f5es</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
