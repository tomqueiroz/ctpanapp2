import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Loader2, ArrowLeft, BookOpen, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/lib';

interface Favorite {
  id: string;
  chapter_id: number;
  created_at: string;
  chapters: {
    chapter_number: number;
    title: string;
    subtitle: string | null;
    duration: string | null;
  };
}

export default function Favorites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(ROUTE_PATHS.LOGIN);
        return;
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          chapter_id,
          created_at,
          chapters (
            chapter_number,
            title,
            subtitle,
            duration
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Processar dados para garantir tipo correto
      const processedData = (data || []).map((item: any) => ({
        ...item,
        chapters: Array.isArray(item.chapters) ? item.chapters[0] : item.chapters
      }));
      
      setFavorites(processedData);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus favoritos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: 'Removido!',
        description: 'Capítulo removido dos favoritos.',
      });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o favorito.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0072BC] mx-auto mb-4" />
          <p className="text-gray-600">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTE_PATHS.PROFILE)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Perfil
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Meus Favoritos
              </h1>
              <p className="text-gray-600">
                Capítulos que você marcou como favoritos
              </p>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum favorito ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Marque capítulos como favoritos para acesso rápido
              </p>
              <Button
                onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
                className="bg-[#0072BC] hover:bg-[#005a9e]"
              >
Ir para Painel Geral
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0072BC] rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        Capítulo {favorite.chapters.chapter_number}
                      </h3>
                      <p className="text-sm text-gray-900 font-medium mb-1">
                        {favorite.chapters.title}
                      </p>
                      {favorite.chapters.subtitle && (
                        <p className="text-sm text-gray-600 mb-2">
                          {favorite.chapters.subtitle}
                        </p>
                      )}
                      {favorite.chapters.duration && (
                        <p className="text-xs text-gray-500">
                          Duração: {favorite.chapters.duration}
                        </p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/dashboard/chapter/${favorite.chapters.chapter_number}`)}
                          className="bg-[#0072BC] hover:bg-[#005a9e]"
                        >
                          Acessar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFavorite(favorite.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
