import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Award,
  Loader2, 
  ArrowLeft,
  Crown,
  TrendingUp,
  Users
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';

interface RankingUser {
  user_id: string;
  full_name: string;
  total_points: number;
  level: number;
  current_streak: number;
  rank: number;
  isCurrentUser?: boolean;
}

export default function Ranking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [topUsers, setTopUsers] = useState<RankingUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<RankingUser | null>(null);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadRanking();
  }, [filter]);

  const loadRanking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(ROUTE_PATHS.LOGIN);
        return;
      }
      setCurrentUserId(user.id);

      // Buscar ranking
      const { data: rankingData } = await supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          level,
          current_streak,
          profiles!inner(full_name)
        `)
        .order('total_points', { ascending: false })
        .limit(50);

      if (rankingData) {
        const users: RankingUser[] = rankingData.map((item: any, index) => ({
          user_id: item.user_id,
          full_name: item.profiles?.full_name || 'Usuário',
          total_points: item.total_points,
          level: item.level,
          current_streak: item.current_streak,
          rank: index + 1,
          isCurrentUser: item.user_id === user.id,
        }));

        setTopUsers(users);

        // Encontrar posição do usuário atual
        const currentUser = users.find(u => u.user_id === user.id);
        if (currentUser) {
          setCurrentUserRank(currentUser);
        } else {
          // Se não está no top 50, buscar posição
          const { data: userPoints } = await supabase
            .from('user_points')
            .select('total_points')
            .eq('user_id', user.id)
            .single();

          if (userPoints) {
            const { count } = await supabase
              .from('user_points')
              .select('*', { count: 'exact', head: true })
              .gt('total_points', userPoints.total_points);

            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single();

            const { data: pointsData } = await supabase
              .from('user_points')
              .select('level, current_streak')
              .eq('user_id', user.id)
              .single();

            setCurrentUserRank({
              user_id: user.id,
              full_name: profile?.full_name || 'Você',
              total_points: userPoints.total_points,
              level: pointsData?.level || 1,
              current_streak: pointsData?.current_streak || 0,
              rank: (count || 0) + 1,
              isCurrentUser: true,
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0072BC] mx-auto mb-4" />
          <p className="text-gray-600">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20 pb-12">
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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Ranking
              </h1>
              <p className="text-gray-600">
                Veja sua posição entre os alunos
              </p>
            </div>
          </div>
        </div>

        {/* Current User Card */}
        {currentUserRank && (
          <Card className="mb-8 border-2 border-[#0072BC] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0072BC] rounded-full flex items-center justify-center">
                    {getMedalIcon(currentUserRank.rank)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sua Posição</p>
                    <p className="text-2xl font-bold text-gray-900">
                      #{currentUserRank.rank}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Pontos</p>
                  <p className="text-2xl font-bold text-[#FF6B00]">
                    {currentUserRank.total_points}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Nível</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentUserRank.level}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top 50 Alunos
            </CardTitle>
            <CardDescription>
              Os alunos com mais pontos no curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topUsers.map((user) => (
                <div
                  key={user.user_id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    user.isCurrentUser
                      ? 'bg-blue-50 border-2 border-[#0072BC]'
                      : getRankColor(user.rank)
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getMedalIcon(user.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-[#0072BC] to-[#FF6B00] text-white">
                        {user.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <div className="flex-1">
                      <p className={`font-semibold ${user.rank <= 3 && !user.isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
                        {user.full_name}
                        {user.isCurrentUser && ' (Você)'}
                      </p>
                      <p className={`text-sm ${user.rank <= 3 && !user.isCurrentUser ? 'text-white/80' : 'text-gray-600'}`}>
                        Nível {user.level}
                      </p>
                    </div>

                    {/* Streak */}
                    {user.current_streak > 0 && (
                      <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">{user.current_streak} dias</span>
                      </div>
                    )}

                    {/* Points */}
                    <div className="text-right">
                      <p className={`text-xl font-bold ${user.rank <= 3 && !user.isCurrentUser ? 'text-white' : 'text-[#FF6B00]'}`}>
                        {user.total_points}
                      </p>
                      <p className={`text-xs ${user.rank <= 3 && !user.isCurrentUser ? 'text-white/80' : 'text-gray-600'}`}>
                        pontos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
