import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  CreditCard,
  GraduationCap,
  TrendingUp,
  TicketPercent,
  FileSpreadsheet,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0,
    activeStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
    loadStats();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadStats = async () => {
    try {
      const { data: usersData } = await supabase
        .from('admin_users_view')
        .select('has_paid, access_granted_without_payment');

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, payment_method')
        .eq('status', 'approved');

      const realPayments = (paymentsData || []).filter(
        (payment) => payment.payment_method !== 'alumni_free_access',
      );
      const totalRevenue = realPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      );
      const activeStudents = (usersData || []).filter(
        (item) => item.has_paid || item.access_granted_without_payment,
      ).length;

      setStats({
        totalUsers: usersData?.length || 0,
        totalPayments: realPayments.length,
        totalRevenue,
        activeStudents,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE_PATHS.LOGIN);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: ROUTE_PATHS.ADMIN },
    { icon: Users, label: 'Usuários', path: ROUTE_PATHS.ADMIN_USERS },
    { icon: BarChart3, label: 'Analytics', path: ROUTE_PATHS.ADMIN_ANALYTICS },
    { icon: TicketPercent, label: 'Cupons', path: ROUTE_PATHS.ADMIN_COUPONS },
    { icon: FileSpreadsheet, label: 'Relatórios', path: ROUTE_PATHS.ADMIN_REPORTS },
    { icon: Settings, label: 'Configurações', path: ROUTE_PATHS.ADMIN_SETTINGS },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 fixed left-0 top-20 bottom-0 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Painel Admin</h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:text-[#0072BC]"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition text-gray-700 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed top-24 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar - Mobile */}
        {mobileMenuOpen && (
          <aside className="lg:hidden fixed inset-0 top-20 bg-white z-40 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Painel Admin</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:text-[#0072BC]"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto px-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
Painel Administrativo
              </h1>
              <p className="text-gray-600">
                Visão geral da plataforma CTP ANAPP
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total de Usuários
                  </CardTitle>
                  <Users className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cadastrados na plataforma
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Alunos Ativos
                  </CardTitle>
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeStudents}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pagamento ou acesso gratuito
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pagamentos
                  </CardTitle>
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPayments}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Transações aprovadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Receita Total
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor total arrecadado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse as principais funcionalidades do painel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => navigate(ROUTE_PATHS.ADMIN_USERS)}
                  >
                    <Users className="w-8 h-8 text-[#0072BC]" />
                    <span className="font-semibold">Gerenciar Usuários</span>
                    <span className="text-xs text-gray-500">
                      Atribuir roles e permissões
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => navigate(ROUTE_PATHS.ADMIN_ANALYTICS)}
                  >
                    <BarChart3 className="w-8 h-8 text-[#0072BC]" />
                    <span className="font-semibold">Ver Analytics</span>
                    <span className="text-xs text-gray-500">
                      Relatórios e dashboards
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => navigate(ROUTE_PATHS.ADMIN_SETTINGS)}
                  >
                    <Settings className="w-8 h-8 text-[#0072BC]" />
                    <span className="font-semibold">Configurações</span>
                    <span className="text-xs text-gray-500">
                      e.Rede e sistema
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => navigate(ROUTE_PATHS.ADMIN_COUPONS)}
                  >
                    <TicketPercent className="w-8 h-8 text-[#0072BC]" />
                    <span className="font-semibold">Gerenciar Cupons</span>
                    <span className="text-xs text-gray-500">
                      Regras, validade e uso
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => navigate(ROUTE_PATHS.ADMIN_REPORTS)}
                  >
                    <FileSpreadsheet className="w-8 h-8 text-[#0072BC]" />
                    <span className="font-semibold">Relatório de Alunos</span>
                    <span className="text-xs text-gray-500">
                      Filtros e exportação
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
