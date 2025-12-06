import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LessonViewer({ user = null }) {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lessons/${lessonId}`, { withCredentials: true });
        setLesson(response.data);
      } catch (error) {
        console.error('Error fetching lesson:', error);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#0072BC] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando aula...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{lesson.title}</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          {lesson.content_type === 'video' && lesson.content_url && (
            <div className="aspect-video">
              <iframe src={lesson.content_url} className="w-full h-full rounded-lg" allowFullScreen />
            </div>
          )}
          {lesson.content_text && <div className="mt-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content_text }} />}
        </div>
        <button onClick={() => navigate(`/courses/${courseId}`)} className="mt-6 text-[#0072BC] hover:underline">Voltar ao curso</button>
      </div>
      <Footer user={user} />
    </div>
  );
}

export default LessonViewer;