import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Zap } from 'lucide-react';

interface PointsData {
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
}

export function PointsDisplay() {
  const [data, setData] = useState<PointsData>({
    total_points: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pointsData } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (pointsData) {
        setData(pointsData);
      }
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const pointsToNextLevel = data.level * 100;
  const currentLevelPoints = data.total_points % 100;
  const progressToNextLevel = (currentLevelPoints / 100) * 100;

  return (
    <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white border-0">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Nível</p>
                <p className="text-3xl font-bold">{data.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Pontos Totais</p>
              <p className="text-2xl font-bold">{data.total_points}</p>
            </div>
          </div>

          {/* Progress to Next Level */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Próximo Nível</span>
              <span className="font-semibold">{currentLevelPoints}/100 XP</span>
            </div>
            <Progress 
              value={progressToNextLevel} 
              className="h-3 bg-white/20"
            />
          </div>

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4" />
                <p className="text-sm opacity-90">Sequência Atual</p>
              </div>
              <p className="text-2xl font-bold">{data.current_streak}</p>
              <p className="text-xs opacity-75">dias</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4" />
                <p className="text-sm opacity-90">Melhor Sequência</p>
              </div>
              <p className="text-2xl font-bold">{data.longest_streak}</p>
              <p className="text-xs opacity-75">dias</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
