import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StreakIndicator() {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_points')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setStreak(data.current_streak);
      }
    } catch (error) {
      console.error('Erro ao carregar streak:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || streak === 0) return null;

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full cursor-pointer hover:scale-105 transition-transform"
      onClick={() => {
        toast({
          title: `🔥 ${streak} dias de sequência!`,
          description: 'Continue estudando para manter sua sequência ativa.',
        });
      }}
    >
      <Flame className="w-4 h-4 animate-pulse" />
      <span className="text-sm font-bold">{streak}</span>
    </div>
  );
}
