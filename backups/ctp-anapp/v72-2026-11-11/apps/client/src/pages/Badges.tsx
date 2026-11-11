import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Lock, 
  Loader2, 
  ArrowLeft,
  Trophy,
  Target,
  Flame,
  Star,
  CheckCircle
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import type { Badge, UserBadge } from '@/integrations/supabase/client';

interface BadgeWithProgress extends Badge {
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  progressMax?: number;
}

export default function Badges() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    earned: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(ROUTE_PATHS.LOGIN);
        return;
      }

      // Buscar todos os badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .order('points');

      // Buscar badges conquistados pelo usuário
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user.id);

      const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
      const earnedBadgesMap = new Map(userBadges?.map(ub => [ub.badge_id, ub.earned_at]) || []);

      // Buscar progresso do usuário
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const { data: quizData } = await supabase
        .from('user_quiz_attempts')
        .select('passed')
        .eq('user_id', user.id);

      const { data: examData } = await supabase
        .from('exam_attempts')
        .select('is_passed, score')
        .eq('user_id', user.id);

      const { data: pointsData } = await supabase
        .from('user_points')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      // Calcular progresso para cada badge
      const completedChapters = progressData?.filter(p => p.completion_percentage === 100).length || 0;
      const quizzesPassed = quizData?.filter(q => q.passed).length || 0;
      const examsPassed = examData?.filter(e => e.is_passed).length || 0;
      const perfectScores = examData?.filter(e => Number(e.score) === 100).length || 0;
      const currentStreak = pointsData?.current_streak || 0;

      const badgesWithProgress: BadgeWithProgress[] = (allBadges || []).map(badge => {
        const earned = earnedBadgeIds.has(badge.id);
        let progress = 0;
        const progressMax = badge.requirement_value;

        // Calcular progresso baseado no tipo
        switch (badge.requirement_type) {
          case 'chapters_completed':
            progress = completedChapters;
            break;
          case 'quizzes_passed':
            progress = quizzesPassed;
            break;
          case 'exams_passed':
            progress = examsPassed;
            break;
          case 'perfect_score':
            progress = perfectScores;
            break;
          case 'streak_days':
            progress = currentStreak;
            break;
          case 'full_chapter_access':
            progress = progressData?.filter(p => 
              p.video_completed && 
              p.apostila_completed && 
              p.podcast_completed && 
              p.quiz_completed && 
              p.materials_completed
            ).length || 0;
            break;
        }

        return {
          ...badge,
          earned,
          earnedAt: earnedBadgesMap.get(badge.id),
          progress: Math.min(progress, progressMax),
          progressMax,
        };
      });

      setBadges(badgesWithProgress);

      const earnedCount = badgesWithProgress.filter(b => b.earned).length;
      const totalPoints = badgesWithProgress
        .filter(b => b.earned)
        .reduce((sum, b) => sum + b.points, 0);

      setStats({
        total: badgesWithProgress.length,
        earned: earnedCount,
        totalPoints,
      });
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progress': return <Target className="w-5 h-5" />;
      case 'streak': return <Flame className="w-5 h-5" />;
      case 'exam': return <Trophy className="w-5 h-5" />;
      case 'quiz': return <CheckCircle className="w-5 h-5" />;
      case 'special': return <Star className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'progress': return 'text-blue-600 bg-blue-100';
      case 'streak': return 'text-orange-600 bg-orange-100';
      case 'exam': return 'text-purple-600 bg-purple-100';
      case 'quiz': return 'text-green-600 bg-green-100';
      case 'special': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0072BC] mx-auto mb-4" />
          <p className="text-gray-600">Carregando conquistas...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (stats.earned / stats.total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Conquistas
              </h1>
              <p className="text-gray-600">
                Desbloqueie badges e ganhe pontos
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Award className="w-12 h-12 text-[#FF6B00] mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">
                  {stats.earned}/{stats.total}
                </p>
                <p className="text-sm text-gray-600">Badges Conquistados</p>
                <Progress value={progressPercentage} className="mt-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalPoints}
                </p>
                <p className="text-sm text-gray-600">Pontos de Badges</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">
                  {progressPercentage.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">Progresso Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className={`relative overflow-hidden transition-all ${
                badge.earned
                  ? 'border-2 border-yellow-400 shadow-lg'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              <CardContent className="p-6">
                {/* Badge Icon */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      badge.earned
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    {badge.earned ? badge.icon : <Lock className="w-8 h-8 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{badge.name}</h3>
                      {badge.earned && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getCategoryColor(badge.category)}`}>
                      {getCategoryIcon(badge.category)}
                      <span className="capitalize">{badge.category}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">
                  {badge.description}
                </p>

                {/* Progress */}
                {!badge.earned && badge.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progresso</span>
                      <span>{badge.progress}/{badge.progressMax}</span>
                    </div>
                    <Progress 
                      value={(badge.progress / badge.progressMax!) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Earned Date */}
                {badge.earned && badge.earnedAt && (
                  <p className="text-xs text-gray-500 mt-4">
                    Conquistado em {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}

                {/* Points */}
                <div className="absolute top-4 right-4">
                  <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                    +{badge.points}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
