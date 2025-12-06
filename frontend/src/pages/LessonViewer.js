import React from 'react';
import Navbar from '../components/Navbar';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function LessonViewer({ user }) {
  const { courseId, lessonId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Video/Content Area */}
          <div className="aspect-video bg-black">
            <div className="flex items-center justify-center h-full text-white">
              Player de V\u00eddeo ou Conte\u00fado
            </div>
          </div>

          {/* Lesson Info */}
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">T\u00edtulo da Li\u00e7\u00e3o</h1>
            <p className="text-gray-600 mb-8">Descri\u00e7\u00e3o da li\u00e7\u00e3o e conte\u00fado adicional.</p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-[#0072BC] transition-colors">
                <ArrowLeft size={18} />
                <span>Li\u00e7\u00e3o Anterior</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-2.5 bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all active:scale-95">
                <span>Pr\u00f3xima Li\u00e7\u00e3o</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonViewer;
