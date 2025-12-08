import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Plus } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminMagazines({ user = null }) {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    try {
      const response = await axios.get(`${API}/magazines`, { withCredentials: true });
      setMagazines(response.data);
    } catch (error) {
      console.error('Error fetching magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerenciar Revistas</h1>
            <p className="text-lg text-gray-600">Adicionar e organizar revistas digitais</p>
          </div>
          <button
            className="flex items-center space-x-2 px-6 py-3 bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all shadow-sm active:scale-95"
            data-testid="create-magazine-button"
          >
            <Plus size={20} />
            <span>Nova Revista</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {magazines.map(magazine => (
            <div key={magazine.magazine_id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 overflow-hidden">
                <img src={magazine.cover_url} alt={magazine.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{magazine.title}</h3>
              <p className="text-sm text-gray-600">{new Date(magazine.published_date).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer user={user} />
    </div>
  );
}

export default AdminMagazines;
