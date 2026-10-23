import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  FileText,
  BookOpen,
  LayoutDashboard,
  ExternalLink,
  Award,
  TrendingUp,
  History,
  Star,
  KeyRound,
  LockKeyhole,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PointsDisplay } from '@/components/PointsDisplay';
import { isAdministrativeRole } from '@/lib/roles';
import { PasswordField } from '@/components/auth/PasswordField';
import { PasswordRequirements } from '@/components/auth/PasswordRequirements';
import { isStrongPassword } from '@/lib/password-policy';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_anapp_member: boolean;
  has_paid: boolean;
  created_at: string;
  is_alumni: boolean;
  alumni_type: 'alumni' | 'certified_professional' | 'alumni_certified' | null;
  registration_cohort: string | null;
  email_locked: boolean;
  access_granted_without_payment: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        navigate('/login');
        return;
      }

      // Get user role and profile
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, is_anapp_member, created_at, user_origin')
        .eq('user_id', user.id)
        .single();

      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, has_paid, is_alumni, alumni_type, registration_cohort')
        .eq('id', user.id)
        .single();

      const userOrigin = roleData?.user_origin || '';
      const isAlumni =
        profileData?.is_alumni === true ||
        ['alumni', 'certified_professional', 'alumni_certified'].includes(userOrigin);

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || '',
        role: roleData?.role || 'student',
        is_anapp_member: roleData?.is_anapp_member || false,
        has_paid: profileData?.has_paid || false,
        created_at: roleData?.created_at || user.created_at,
        is_alumni: isAlumni,
        alumni_type:
          profileData?.alumni_type ||
          (['alumni', 'certified_professional', 'alumni_certified'].includes(userOrigin)
            ? userOrigin
            : null),
        registration_cohort: profileData?.registration_cohort || null,
        email_locked: isAlumni,
        access_granted_without_payment: isAlumni,
      };

      setProfile(userProfile);
      setFullName(userProfile.full_name);
      setEmail(userProfile.email);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seu perfil.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      if (profile.email_locked && email !== profile.email) {
        throw new Error('O e-mail do perfil de ex-aluno é protegido e só pode ser alterado pelo administrador.');
      }

      // E-mail de contas regulares continua usando a confirmação padrão do Supabase.
      if (!profile.email_locked && email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });

        if (emailError) throw emailError;

        toast({
          title: 'Email atualizado',
          description: 'Verifique seu novo email para confirmar a alteração.',
        });
      }

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
      });

      loadProfile();
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    if (!isStrongPassword(newPassword)) {
      toast({
        title: 'Senha ainda não atende aos requisitos',
        description: 'Complete todos os critérios de segurança indicados.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'As senhas não coincidem',
        description: 'Digite a mesma senha nos dois campos.',
        variant: 'destructive',
      });
      return;
    }
    if (currentPassword === newPassword) {
      toast({
        title: 'Escolha uma senha diferente',
        description: 'A nova senha não pode ser igual à senha atual.',
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error: reauthenticationError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (reauthenticationError) {
        const incorrectCurrentPassword =
          reauthenticationError.message.toLowerCase().includes('invalid login credentials');
        throw new Error(
          incorrectCurrentPassword
            ? 'A senha atual está incorreta.'
            : reauthenticationError.message,
        );
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      await supabase.auth.signOut({ scope: 'others' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: 'Senha atualizada',
        description: 'A nova senha já está ativa. As outras sessões foram encerradas.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Não foi possível alterar a senha',
        description:
          error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meu Perfil
          </h1>
          <p className="text-gray-600">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        {/* Points and Level Display */}
        <PointsDisplay />

        {/* Profile Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-[#0072BC] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle>{profile.full_name || 'Usuário'}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {isAdministrativeRole(profile.role) ? (
                    <>
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-purple-700">Administrador</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-blue-700">Aluno</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Pagamento</p>
                <div className="flex items-center gap-2">
                  {profile.has_paid || profile.access_granted_without_payment ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-green-700">
                        {profile.access_granted_without_payment ? 'Acesso gratuito liberado' : 'Ativo'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-orange-700">Pendente</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Membro ANAPP</p>
                <div className="flex items-center gap-2">
                  {profile.is_anapp_member ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-green-700">Sim</span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-700">Não</span>
                  )}
                </div>
              </div>

              {profile.is_alumni && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 mb-1">Classificação</p>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      {profile.alumni_type === 'certified_professional'
                        ? 'Profissional certificado'
                        : profile.alumni_type === 'alumni_certified'
                          ? 'Ex-aluno certificado'
                          : 'Ex-aluno'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>
              Links úteis para navegação rápida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Boletim */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-[#0072BC] hover:text-white transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                <div className="flex items-center gap-2 w-full">
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold">Boletim</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Veja suas notas e progresso
                </p>
              </Button>

              {/* Materiais Adicionais */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-[#FF6B00] hover:text-white transition-colors"
                onClick={() => {
                  // Navegar para primeiro capítulo, aba slides
                  navigate('/dashboard/chapter/1');
                  setTimeout(() => {
                    const slidesTab = document.querySelector('[value="slides"]') as HTMLElement;
                    slidesTab?.click();
                  }, 500);
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-semibold">Materiais Adicionais</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Slides e recursos extras
                </p>
              </Button>

              {/* Painel do Curso */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-[#0072BC] hover:text-white transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                <div className="flex items-center gap-2 w-full">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-semibold">Painel do Curso</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Todos os capítulos e ferramentas
                </p>
              </Button>

              {/* Certificado */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-green-600 hover:text-white transition-colors"
                onClick={() => navigate('/certificate')}
              >
                <div className="flex items-center gap-2 w-full">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Certificado</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Seu certificado digital
                </p>
              </Button>

              {/* Progresso Detalhado */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-purple-600 hover:text-white transition-colors"
                onClick={() => navigate('/progress')}
              >
                <div className="flex items-center gap-2 w-full">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Progresso Detalhado</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Estatísticas e gráficos
                </p>
              </Button>

              {/* Histórico */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-indigo-600 hover:text-white transition-colors"
                onClick={() => navigate('/progress')}
              >
                <div className="flex items-center gap-2 w-full">
                  <History className="w-5 h-5" />
                  <span className="font-semibold">Histórico</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Quizzes e provas realizadas
                </p>
              </Button>

              {/* Badges */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-yellow-600 hover:text-white transition-colors"
                onClick={() => navigate('/badges')}
              >
                <div className="flex items-center gap-2 w-full">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Conquistas</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Badges e recompensas
                </p>
              </Button>

              {/* Ranking */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-purple-600 hover:text-white transition-colors"
                onClick={() => navigate('/ranking')}
              >
                <div className="flex items-center gap-2 w-full">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Ranking</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Sua posição no ranking
                </p>
              </Button>

              {/* Favoritos */}
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-pink-600 hover:text-white transition-colors"
                onClick={() => navigate('/favorites')}
              >
                <div className="flex items-center gap-2 w-full">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">Favoritos</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  Capítulos marcados
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações básicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Digite seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={profile.email_locked}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {profile.email_locked
                  ? 'Este e-mail é a chave de ativação do seu perfil de ex-aluno e só pode ser alterado individualmente por um Master Admin.'
                  : 'Ao alterar o e-mail, você receberá um link de confirmação.'}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-[#0072BC] hover:bg-[#005a9e]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-[#0072BC]" />
              Segurança da conta
            </CardTitle>
            <CardDescription>
              Altere sua senha após confirmar a senha atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <Label htmlFor="current-password">Senha atual</Label>
                <div className="mt-2">
                  <PasswordField
                    id="current-password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    autoComplete="current-password"
                    placeholder="Digite sua senha atual"
                    disabled={changingPassword}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="new-password">Nova senha</Label>
                <div className="mt-2">
                  <PasswordField
                    id="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    autoComplete="new-password"
                    placeholder="Crie uma senha forte"
                    disabled={changingPassword}
                  />
                </div>
                <div className="mt-3">
                  <PasswordRequirements password={newPassword} />
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
                <div className="mt-2">
                  <PasswordField
                    id="confirm-new-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                    disabled={changingPassword}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    changingPassword ||
                    !currentPassword ||
                    !isStrongPassword(newPassword) ||
                    newPassword !== confirmPassword
                  }
                  className="bg-[#0072BC] hover:bg-[#005a9e]"
                >
                  {changingPassword ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  Alterar senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>

    </div>
  );
}
