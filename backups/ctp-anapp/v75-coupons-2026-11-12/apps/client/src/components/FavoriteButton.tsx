import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  chapterId: number;
}

export function FavoriteButton({ chapterId }: FavoriteButtonProps) {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    checkFavorite();
  }, [chapterId]);

  const checkFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId)
        .single();

      if (data) {
        setIsFavorite(true);
        setFavoriteId(data.id);
      }
    } catch (error) {
      // Não é favorito
    }
  };

  const toggleFavorite = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFavorite && favoriteId) {
        // Remover favorito
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('id', favoriteId);

        if (error) throw error;

        setIsFavorite(false);
        setFavoriteId(null);
        toast({
          title: 'Removido dos favoritos',
          description: 'Capítulo removido da sua lista de favoritos.',
        });
      } else {
        // Adicionar favorito
        const { data, error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            chapter_id: chapterId,
          })
          .select('id')
          .single();

        if (error) throw error;

        setIsFavorite(true);
        setFavoriteId(data.id);
        toast({
          title: 'Adicionado aos favoritos!',
          description: 'Capítulo salvo na sua lista de favoritos.',
        });
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os favoritos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      className={`${
        isFavorite
          ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100'
          : 'hover:bg-gray-50'
      }`}
    >
      <Star
        className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
      />
      {isFavorite ? 'Favoritado' : 'Favoritar'}
    </Button>
  );
}
