import Footer from '../components/Footer';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, Download, Eye } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MagazineLibrary({ user = null }) {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchMagazines();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Revistas Digitais ANAPP</h1>
          <p className="text-lg text-gray-600">Acesse conte\u00fado t\u00e9cnico exclusivo e novidades do setor</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-[#0072BC] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Carregando revistas...</p>
            </div>
          </div>
        ) : magazines.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma revista dispon\u00edvel</h3>
            <p className="text-gray-600">Aguarde por novas publica\u00e7\u00f5es</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {magazines.map(magazine => (
              <div key={magazine.magazine_id} className="group" data-testid={`magazine-card-${magazine.magazine_id}`}>
                <div className="relative aspect-[3/4] mb-4 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
                  <img 
                    src={magazine.cover_url} 
                    alt={magazine.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{magazine.title}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {new Date(magazine.published_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all active:scale-95">
                    <Eye size={16} />
                    <span>Ler</span>
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 text-sm bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    <Download size={16} />
                  </button>
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

export default MagazineLibrary;
