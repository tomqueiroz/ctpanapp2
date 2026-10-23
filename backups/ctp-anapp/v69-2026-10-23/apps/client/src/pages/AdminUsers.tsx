import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowLeft, Search, Shield, User, CheckCircle, XCircle, Edit,
  Loader2, Mail, Trash2, Award, MessageSquare, CreditCard,
  Ban, RefreshCw, Send, UserCheck, UserX, KeyRound, Plus, ClipboardCheck,
  BookOpen,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { isAdministrativeRole, isMasterAdminRole } from '@/lib/roles';
import { useToast } from '@/hooks/use-toast';
import { PasswordField } from '@/components/auth/PasswordField';
import { PasswordRequirements } from '@/components/auth/PasswordRequirements';
import { isStrongPassword, normalizeEmail } from '@/lib/password-policy';
import { COURSE_PASSING_SCORE_PERCENT } from '@/lib/course-requirements';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  role: string;
  has_paid: boolean;
  is_anapp_member: boolean;
  access_blocked: boolean;
  full_name: string | null;
  notes: string | null;
  payment_amount?: number;
  payment_method?: string | null;
  payment_installments?: number | null;
  card_last4?: string | null;
  coupon_code?: string | null;
  payment_date?: string;
  certificate_id?: string;
  certificate_number?: string;
  certificate_date?: string;
  certificate_is_valid?: boolean;
  user_origin?: string;
  is_alumni?: boolean;
  user_tag?: string;
  alumni_type?: 'alumni' | 'certified_professional' | 'alumni_certified' | null;
  registration_cohort?: string | null;
  access_granted_without_payment?: boolean;
  email_locked?: boolean;
  phone?: string | null;
  rg?: string | null;
  cpf?: string | null;
  street?: string | null;
  address_number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  gender?: string | null;
  registration_complete?: boolean;
  enrollment_status?: string;
  activated_at?: string | null;
  student_classification?:
    | 'alumni'
    | 'new_student'
    | 'coupon_promo'
    | 'active_student'
    | 'inactive_student'
    | 'administrative';
  is_new_student?: boolean;
  is_active_student?: boolean;
  learning_status?:
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'certified'
    | null;
  current_chapter_number?: number | null;
  current_chapter_title?: string | null;
  current_chapter_progress?: number | null;
  completed_chapters_count?: number | null;
  total_chapters_count?: number | null;
  attempted_exams_count?: number | null;
  passed_exams_count?: number | null;
  total_required_exams?: number | null;
  attempted_exam_chapters?: number[];
  passed_exam_chapters?: number[];
  last_learning_activity_at?: string | null;
}

interface GradeItem {
  assessment_id: string;
  title: string;
  chapter_number: number;
  best_score: number | null;
  attempts_count: number;
  passing_score?: number;
  is_approved?: boolean;
  historically_approved?: boolean;
  approval_rule?: 'current_70' | 'historical_60' | 'pending';
}

interface GradeData {
  exams: GradeItem[];
  quizzes: GradeItem[];
}

type StudentClassification = NonNullable<UserData['student_classification']>;
type StudentTypeSelection = 'new_student' | 'alumni' | 'coupon_promo';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleDateString('pt-BR');
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleString('pt-BR');
}

function genderLabel(value: string | null | undefined): string {
  if (value === 'masculino') return 'Masculino';
  if (value === 'feminino') return 'Feminino';
  if (value === 'prefiro_nao_informar') return 'Não informar';
  return '—';
}

function classificationLabel(value: UserData['student_classification']): string {
  if (value === 'alumni') return 'Ex-aluno';
  if (value === 'new_student') return 'Novo aluno';
  if (value === 'coupon_promo') return 'Aluno com Cupom Promo';
  if (value === 'active_student') return 'Aluno ativo';
  if (value === 'inactive_student') return 'Aluno inativo';
  if (value === 'administrative') return 'Administrativo';
  return 'Não classificado';
}

function classificationClass(value: UserData['student_classification']): string {
  if (value === 'alumni') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (value === 'new_student') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (value === 'coupon_promo') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (value === 'active_student') return 'bg-green-100 text-green-800 border-green-200';
  if (value === 'inactive_student') return 'bg-gray-100 text-gray-700 border-gray-200';
  return 'bg-purple-100 text-purple-800 border-purple-200';
}

function effectiveStudentClassification(user: UserData): StudentClassification | undefined {
  if (user.student_classification === 'administrative') return 'administrative';
  if (user.student_classification === 'alumni' || user.is_alumni) return 'alumni';
  if (user.coupon_code) return 'coupon_promo';
  return user.student_classification;
}

function paymentMethodLabel(value: string | null | undefined): string {
  if (!value) return '—';
  if (value === 'pix' || value === 'chave_pix') return 'Chave PIX';
  if (value === 'credit_card') return 'Cartão de crédito';
  if (value === 'admin_free_access' || value === 'alumni_free_access' || value === 'legacy_free_access') {
    return 'Acesso gratuito';
  }
  if (value === 'manual') return 'Manual';
  return value;
}

function learningStatusLabel(value: UserData['learning_status']): string {
  if (value === 'certified') return 'Certificado';
  if (value === 'completed') return 'Provas concluídas';
  if (value === 'in_progress') return 'Em andamento';
  return 'Não iniciado';
}

function learningStatusClass(value: UserData['learning_status']): string {
  if (value === 'certified') return 'border-green-200 bg-green-100 text-green-800';
  if (value === 'completed') return 'border-blue-200 bg-blue-100 text-blue-800';
  if (value === 'in_progress') return 'border-amber-200 bg-amber-100 text-amber-800';
  return 'border-gray-200 bg-gray-100 text-gray-700';
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterClassification, setFilterClassification] = useState('all');
  const [filterRegistration, setFilterRegistration] = useState('all');
  const [filterLearning, setFilterLearning] = useState('all');
  const [registrationDateFrom, setRegistrationDateFrom] = useState('');
  const [registrationDateTo, setRegistrationDateTo] = useState('');
  const [currentAdminRole, setCurrentAdminRole] = useState<string>('admin');

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Profile fields
  const [editFullName, setEditFullName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editIsAnapp, setEditIsAnapp] = useState(false);
  const [editAccessBlocked, setEditAccessBlocked] = useState(false);
  const [editStudentType, setEditStudentType] = useState<StudentTypeSelection>('new_student');
  const [editPaymentMethod, setEditPaymentMethod] = useState('manual');
  const [editCouponCode, setEditCouponCode] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRg, setEditRg] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editAddressNumber, setEditAddressNumber] = useState('');
  const [editComplement, setEditComplement] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZipCode, setEditZipCode] = useState('');
  const [editGender, setEditGender] = useState('');

  // Email field
  const [newEmail, setNewEmail] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Create user fields
  const [createEmail, setCreateEmail] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createRole, setCreateRole] = useState('student');
  const [createStudentType, setCreateStudentType] = useState<StudentTypeSelection>(
    'new_student',
  );
  const [createIsAnapp, setCreateIsAnapp] = useState(false);

  const handleCreateRoleChange = (value: string) => {
    setCreateRole(value);
    if (value !== 'student') setCreateStudentType('new_student');
  };

  // Grade fields
  const [grades, setGrades] = useState<GradeData>({ exams: [], quizzes: [] });
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});
  const [gradeReason, setGradeReason] = useState('');
  const [gradesLoading, setGradesLoading] = useState(false);

  // Payment fields
  const [paymentAmount, setPaymentAmount] = useState('0');

  // Certificate fields
  const [certName, setCertName] = useState('');
  const [certCpf, setCertCpf] = useState('');

  // Message fields
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');

  // Delete confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    void loadCurrentAdminRole();
    void loadUsers();
  }, []);
  useEffect(() => {
    filterUsers();
  }, [
    searchTerm,
    filterRole,
    filterPayment,
    filterClassification,
    filterRegistration,
    filterLearning,
    registrationDateFrom,
    registrationDateTo,
    users,
  ]);
  useEffect(() => {
    if (activeTab === 'grades' && selectedUser) {
      void loadGrades(selectedUser.id);
    }
  }, [activeTab, selectedUser?.id]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await supabase.functions.invoke('admin_manage_user', {
        body: { action: 'list_users' },
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      setUsers(
        Array.isArray(response.data?.users)
          ? response.data.users as UserData[]
          : [],
      );
    } catch (error: unknown) {
      toast({
        title: 'Erro',
        description: `Não foi possível carregar usuários: ${
          error instanceof Error ? error.message : 'Tente novamente.'
        }`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (data?.role) setCurrentAdminRole(data.role);
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (searchTerm) {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(u =>
        [
          u.email,
          u.full_name,
          u.phone,
          u.rg,
          u.cpf,
          u.street,
          u.address_number,
          u.neighborhood,
          u.city,
          u.state,
          u.zip_code,
        ].some(value => value?.toLowerCase().includes(normalizedSearch))
      );
    }
    if (filterRole !== 'all') filtered = filtered.filter(u => u.role === filterRole);
    if (filterPayment === 'paid') filtered = filtered.filter(u => u.has_paid || u.access_granted_without_payment);
    if (filterPayment === 'unpaid') filtered = filtered.filter(u => !u.has_paid && !u.access_granted_without_payment);
    if (filterClassification !== 'all') {
      filtered = filtered.filter(
        u => effectiveStudentClassification(u) === filterClassification,
      );
    }
    if (filterRegistration === 'complete') {
      filtered = filtered.filter(u => u.registration_complete);
    }
    if (filterRegistration === 'incomplete') {
      filtered = filtered.filter(u => !u.registration_complete);
    }
    if (filterLearning !== 'all') {
      filtered = filtered.filter(
        u =>
          u.is_active_student === true &&
          u.learning_status === filterLearning,
      );
    }
    if (registrationDateFrom) {
      filtered = filtered.filter(
        u => u.created_at?.slice(0, 10) >= registrationDateFrom,
      );
    }
    if (registrationDateTo) {
      filtered = filtered.filter(
        u => u.created_at?.slice(0, 10) <= registrationDateTo,
      );
    }
    setFilteredUsers(filtered);
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setEditFullName(user.full_name || '');
    setEditNotes(user.notes || '');
    setEditRole(user.role);
    setEditIsAnapp(user.is_anapp_member);
    setEditAccessBlocked(user.access_blocked);
    const userClassification = effectiveStudentClassification(user);
    setEditStudentType(
      userClassification === 'alumni' || userClassification === 'coupon_promo'
        ? userClassification
        : 'new_student',
    );
    setEditPaymentMethod(user.payment_method || 'manual');
    setEditCouponCode(user.coupon_code || '');
    setEditPhone(user.phone || '');
    setEditRg(user.rg || '');
    setEditCpf(user.cpf || '');
    setEditStreet(user.street || '');
    setEditAddressNumber(user.address_number || '');
    setEditComplement(user.complement || '');
    setEditNeighborhood(user.neighborhood || '');
    setEditCity(user.city || '');
    setEditState(user.state || '');
    setEditZipCode(user.zip_code || '');
    setEditGender(user.gender || '');
    setNewEmail(user.email);
    setNewPassword('');
    setConfirmNewPassword('');
    setPaymentAmount('0');
    setCertName(user.full_name || '');
    setCertCpf('');
    setMsgSubject('');
    setMsgBody('');
    setActiveTab('profile');
    setEditModalOpen(true);
  };

  const loadGrades = async (userId: string) => {
    setGradesLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_list_grades', {
        target_user_id: userId,
      });
      if (error) throw error;
      const gradeData = data as GradeData;
      setGrades(gradeData);
      const initialDrafts: Record<string, string> = {};
      gradeData.exams.forEach((item) => {
        initialDrafts[`exam:${item.assessment_id}`] =
          item.best_score === null ? '' : String(item.best_score);
      });
      gradeData.quizzes.forEach((item) => {
        initialDrafts[`quiz:${item.assessment_id}`] =
          item.best_score === null ? '' : String(item.best_score);
      });
      setGradeDrafts(initialDrafts);
    } catch (error: unknown) {
      toast({
        title: 'Erro ao carregar notas',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setGradesLoading(false);
    }
  };

  // ── CALL EDGE FUNCTION ─────────────────────────────────────────────────
  const callAdminFunction = async (action: string, params: Record<string, any> = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await supabase.functions.invoke('admin_manage_user', {
      body: { action, target_user_id: selectedUser?.id, ...params }
    });

    if (response.error) throw response.error;
    if (response.data?.error) throw new Error(response.data.error);
    return response.data;
  };

  // ── SAVE PROFILE (via Edge Function with service role to bypass RLS/enum) ──
  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const response = await supabase.functions.invoke('admin_manage_user', {
        body: {
          action: 'update_role',
          target_user_id: selectedUser.id,
          new_role: editRole,
          new_is_anapp_member: editIsAnapp,
          new_notes: editNotes,
          new_access_blocked: editAccessBlocked,
          new_full_name: editFullName,
          // Keep the legacy edge-function contract compatible while sending
          // the richer admin intent for deployments that support it.
          new_student_type: editStudentType === 'coupon_promo' ? 'new_student' : editStudentType,
          new_student_classification: editStudentType,
          new_payment_method: editPaymentMethod,
          new_coupon_code: editCouponCode.trim().toUpperCase() || null,
          new_phone: editPhone,
          new_rg: editRg,
          new_cpf: editCpf,
          new_street: editStreet,
          new_address_number: editAddressNumber,
          new_complement: editComplement,
          new_neighborhood: editNeighborhood,
          new_city: editCity,
          new_state: editState,
          new_zip_code: editZipCode,
          new_gender: editGender,
        }
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      toast({ title: '✅ Perfil atualizado!', description: `Role: ${editRole} | ANAPP: ${editIsAnapp ? 'Sim' : 'Não'}` });
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── CHANGE EMAIL ───────────────────────────────────────────────────────
  const handleChangeEmail = async () => {
    if (!selectedUser || !newEmail) return;
    setSaving(true);
    try {
      if (selectedUser.email_locked) {
        const response = await supabase.functions.invoke('legacy_student_admin', {
          body: {
            action: 'authorize_email_change',
            target_user_id: selectedUser.id,
            new_email: normalizeEmail(newEmail),
          },
        });
        if (response.error) throw response.error;
        if (response.data?.error) throw new Error(response.data.error);
      } else {
        await callAdminFunction('change_email', { new_email: newEmail });
      }
      toast({ title: '✅ Email alterado!', description: `Novo email: ${newEmail}` });
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    if (!isStrongPassword(newPassword)) {
      toast({
        title: 'Senha fora do padrão',
        description:
          'Use pelo menos 12 caracteres, com maiúscula, minúscula, número e símbolo.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'As senhas não coincidem',
        description: 'Digite a mesma senha nos dois campos.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const data = await callAdminFunction('change_password', {
        new_password: newPassword,
      });
      if (!data?.success || !data?.password_changed) {
        throw new Error('O Supabase não confirmou a alteração da senha.');
      }
      setNewPassword('');
      setConfirmNewPassword('');
      toast({
        title: 'Senha alterada',
        description:
          `A nova senha de ${selectedUser.full_name || selectedUser.email} já está ativa.`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Não foi possível alterar a senha',
        description:
          error instanceof Error
            ? error.message
            : 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async () => {
    const email = normalizeEmail(createEmail);
    if (!email || !createFullName.trim()) {
      toast({
        title: 'Dados incompletos',
        description: 'Informe nome completo e e-mail.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const response = await supabase.functions.invoke('admin_manage_user', {
        body: {
          action: 'create_user',
          email,
          full_name: createFullName.trim(),
          role: createRole,
          student_type:
            createRole === 'student' && createStudentType !== 'coupon_promo'
              ? createStudentType
              : 'new_student',
          student_classification:
            createRole === 'student' ? createStudentType : 'new_student',
          is_anapp_member: createIsAnapp,
        },
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      setCreateEmail('');
      setCreateFullName('');
      setCreateRole('student');
      setCreateStudentType('new_student');
      setCreateIsAnapp(false);
      setCreateModalOpen(false);
      await loadUsers();
      toast({
        title: 'Usuário cadastrado',
        description:
          'O e-mail para criar a primeira senha foi aceito pelo provedor e enviado ao endereço cadastrado.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Não foi possível cadastrar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGrade = async (
    type: 'exam' | 'quiz',
    assessmentId: string,
  ) => {
    if (!selectedUser) return;
    const score = Number(gradeDrafts[`${type}:${assessmentId}`]);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      toast({
        title: 'Nota inválida',
        description: 'Informe uma nota entre 0 e 100.',
        variant: 'destructive',
      });
      return;
    }
    if (!gradeReason.trim()) {
      toast({
        title: 'Justificativa obrigatória',
        description: 'Explique o motivo da alteração para a trilha de auditoria.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const functionName =
        type === 'exam' ? 'admin_update_exam_grade' : 'admin_update_quiz_grade';
      const assessmentParam =
        type === 'exam' ? { p_exam_id: assessmentId } : { p_quiz_id: assessmentId };
      const { data, error } = await supabase.rpc(functionName, {
        target_user_id: selectedUser.id,
        ...assessmentParam,
        p_score: score,
        p_reason: gradeReason.trim(),
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: 'Nota atualizada',
        description: 'A alteração foi registrada na auditoria administrativa.',
      });
      setGradeReason('');
      await loadGrades(selectedUser.id);
    } catch (error: unknown) {
      toast({
        title: 'Erro ao alterar nota',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // ── GRANT PAYMENT ──────────────────────────────────────────────────────
  const handleGrantPayment = async () => {
    if (!selectedUser) return;
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast({
        title: 'Valor inválido',
        description: 'Informe um valor igual ou maior que zero.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('admin_grant_payment', {
        target_user_id: selectedUser.id,
        payment_amount: amount,
        payment_method: amount === 0 ? 'admin_free_access' : editPaymentMethod || 'manual',
        payment_notes:
          amount === 0
            ? 'Gratuidade concedida manualmente pelo admin'
            : `Acesso liberado manualmente pelo admin${editCouponCode.trim() ? ` · Cupom ${editCouponCode.trim().toUpperCase()}` : ''}`,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: 'Acesso liberado',
        description:
          amount === 0
            ? 'Gratuidade administrativa registrada.'
            : `Pagamento de R$ ${amount.toFixed(2).replace('.', ',')} registrado via ${paymentMethodLabel(editPaymentMethod)}.`,
      });
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── REVOKE PAYMENT ─────────────────────────────────────────────────────
  const handleRevokePayment = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('admin_revoke_payment', {
        target_user_id: selectedUser.id,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: '✅ Acesso revogado!', description: 'Pagamento removido.' });
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── ISSUE CERTIFICATE ──────────────────────────────────────────────────
  const handleIssueCertificate = async () => {
    if (!selectedUser || !certName || !certCpf) {
      toast({ title: 'Erro', description: 'Preencha nome e CPF.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('issue_certificate', {
        body: {
          targetUserId: selectedUser.id,
          certificateNumber: null,
          certificateFullName: certName,
          certificateCpf: certCpf,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const certificate = data?.certificate;
      toast({
        title: 'Certificado emitido',
        description: certificate?.certificate_number
          ? `Nº ${certificate.certificate_number}. O e-mail foi processado para o aluno.`
          : 'O certificado foi emitido e o e-mail foi processado para o aluno.',
      });
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── REVOKE CERTIFICATE ─────────────────────────────────────────────────
  const handleRevokeCertificate = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('admin_revoke_certificate', {
        target_user_id: selectedUser.id,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: '✅ Certificado revogado!', description: 'Certificado marcado como inválido.' });
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── SEND MESSAGE ───────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!selectedUser || !msgSubject || !msgBody) {
      toast({ title: 'Erro', description: 'Preencha assunto e mensagem.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('admin_send_message', {
        target_user_id: selectedUser.id,
        message_subject: msgSubject,
        message_body: msgBody,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: '✅ Mensagem enviada!', description: `Para: ${selectedUser.email}` });
      setMsgSubject('');
      setMsgBody('');
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE USER ────────────────────────────────────────────────────────
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setSaving(true);
    try {
      // Temporarily set selectedUser for callAdminFunction
      const userToDelete = users.find(u => u.id === deleteUserId);
      if (!userToDelete) throw new Error('User not found');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('admin_manage_user', {
        body: { action: 'delete_user', target_user_id: deleteUserId }
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      toast({ title: '✅ Usuário deletado!', description: `${userToDelete.email} removido da plataforma.` });
      setDeleteConfirmOpen(false);
      setDeleteUserId(null);
      setEditModalOpen(false);
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex">
        <div className="hidden lg:block w-64"></div>
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-6">
              <Button variant="ghost" onClick={() => navigate(ROUTE_PATHS.ADMIN)} className="mb-3">
                <ArrowLeft className="w-4 h-4 mr-2" />Voltar ao Painel
              </Button>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
                  <p className="text-gray-600 mt-1">Gerencie perfis, e-mails, notas, acessos, certificados e mensagens</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => setCreateModalOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />Cadastrar usuário
                  </Button>
                  <Button onClick={loadUsers} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />Atualizar
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-6">
              {[
                { label: 'Total', value: users.length, color: 'text-blue-600' },
                {
                  label: 'Novos alunos',
                  value: users.filter(u => effectiveStudentClassification(u) === 'new_student').length,
                  color: 'text-emerald-600',
                },
                {
                  label: 'Acessos ativos',
                  value: users.filter(u => u.is_active_student).length,
                  color: 'text-green-600',
                },
                {
                  label: 'Ex-alunos',
                  value: users.filter(u => effectiveStudentClassification(u) === 'alumni').length,
                  color: 'text-blue-700',
                },
                {
                  label: 'Admins',
                  value: users.filter(u => isAdministrativeRole(u.role)).length,
                  color: 'text-purple-600',
                },
                {
                  label: 'Cupons promocionais',
                  value: users.filter(u => effectiveStudentClassification(u) === 'coupon_promo').length,
                  color: 'text-amber-600',
                },
              ].map(stat => (
                <Card key={stat.label}>
                  <CardContent className="pt-5 pb-4">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar nome, e-mail, CPF, RG, celular ou endereço..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os roles</SelectItem>
                      <SelectItem value="master_admin">Master Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="student">Aluno</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPayment} onValueChange={setFilterPayment}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por acesso" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Com acesso</SelectItem>
                      <SelectItem value="unpaid">Sem acesso</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterClassification}
                    onValueChange={setFilterClassification}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Classificação do aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as classificações</SelectItem>
                      <SelectItem value="new_student">Novos alunos · últimos 60 dias</SelectItem>
                      <SelectItem value="active_student">Alunos ativos</SelectItem>
                      <SelectItem value="alumni">Ex-alunos</SelectItem>
                      <SelectItem value="coupon_promo">Alunos com Cupom Promo</SelectItem>
                      <SelectItem value="inactive_student">Alunos inativos</SelectItem>
                      <SelectItem value="administrative">Administrativos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterRegistration}
                    onValueChange={setFilterRegistration}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Situação cadastral" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os cadastros</SelectItem>
                      <SelectItem value="complete">Cadastro completo</SelectItem>
                      <SelectItem value="incomplete">Cadastro incompleto</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterLearning} onValueChange={setFilterLearning}>
                    <SelectTrigger>
                      <SelectValue placeholder="Progresso acadêmico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo progresso acadêmico</SelectItem>
                      <SelectItem value="not_started">Ativos · não iniciaram</SelectItem>
                      <SelectItem value="in_progress">Ativos · em andamento</SelectItem>
                      <SelectItem value="completed">Ativos · provas concluídas</SelectItem>
                      <SelectItem value="certified">Ativos · certificados</SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <label
                      htmlFor="registration-date-from"
                      className="mb-1 block text-xs font-medium text-gray-600"
                    >
                      Cadastro a partir de
                    </label>
                    <Input
                      id="registration-date-from"
                      type="date"
                      value={registrationDateFrom}
                      onChange={event => setRegistrationDateFrom(event.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="registration-date-to"
                      className="mb-1 block text-xs font-medium text-gray-600"
                    >
                      Cadastro até
                    </label>
                    <Input
                      id="registration-date-to"
                      type="date"
                      value={registrationDateTo}
                      onChange={event => setRegistrationDateTo(event.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="self-end"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterRole('all');
                      setFilterPayment('all');
                      setFilterClassification('all');
                      setFilterRegistration('all');
                      setFilterLearning('all');
                      setRegistrationDateFrom('');
                      setRegistrationDateTo('');
                    }}
                  >
                    Limpar filtros
                  </Button>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  “Novo aluno” é calculado automaticamente pela data de cadastro:
                  últimos 60 dias. Ex-aluno tem precedência sobre essa classificação.
                </p>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
                <CardDescription>Clique em ✏️ Editar para gerenciar um usuário</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[240px]">Identificação</TableHead>
                        <TableHead className="min-w-[210px]">Contato e documentos</TableHead>
                        <TableHead className="min-w-[280px]">Endereço residencial</TableHead>
                        <TableHead className="min-w-[250px]">Classificação, acesso e pagamento</TableHead>
                        <TableHead className="min-w-[300px]">Progresso acadêmico</TableHead>
                        <TableHead className="min-w-[175px]">Datas</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map(user => (
                          <TableRow key={user.id} className={user.access_blocked ? 'opacity-50' : ''}>
                            <TableCell className="align-top">
                              <div className="font-semibold text-sm text-gray-900">
                                {user.full_name || 'Nome não informado'}
                              </div>
                              <div className="mt-1 text-xs text-gray-600">{user.email}</div>
                              <div className="mt-2 text-xs text-gray-500">
                                Gênero: {genderLabel(user.gender)}
                              </div>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {user.access_blocked && <Badge variant="destructive" className="text-xs">Bloqueado</Badge>}
                                {!user.email_confirmed_at && <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">Email não confirmado</Badge>}
                                <Badge
                                  className={
                                    user.registration_complete
                                      ? 'border-green-200 bg-green-50 text-green-700'
                                      : 'border-amber-200 bg-amber-50 text-amber-700'
                                  }
                                >
                                  {user.registration_complete
                                    ? 'Cadastro completo'
                                    : 'Cadastro incompleto'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="align-top text-xs text-gray-700">
                              <div><span className="font-medium">Celular:</span> {user.phone || '—'}</div>
                              <div className="mt-1"><span className="font-medium">RG:</span> {user.rg || '—'}</div>
                              <div className="mt-1"><span className="font-medium">CPF:</span> {user.cpf || '—'}</div>
                            </TableCell>
                            <TableCell className="align-top text-xs leading-5 text-gray-700">
                              <div>
                                {user.street || 'Logradouro não informado'}
                                {user.address_number ? `, ${user.address_number}` : ''}
                              </div>
                              {user.complement && <div>{user.complement}</div>}
                              <div>{user.neighborhood || 'Bairro não informado'}</div>
                              <div>
                                {user.city || 'Cidade não informada'}
                                {user.state ? `/${user.state}` : ''}
                              </div>
                              <div>CEP: {user.zip_code || '—'}</div>
                            </TableCell>
                            <TableCell className="align-top">
                              <Badge className={classificationClass(effectiveStudentClassification(user))}>
                                {classificationLabel(effectiveStudentClassification(user))}
                              </Badge>
                              <div className="mt-2">
                                <Badge className={isAdministrativeRole(user.role) ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-200 text-gray-700'}>
                                  {isMasterAdminRole(user.role)
                                    ? <><Shield className="w-3 h-3 mr-1" />Master Admin</>
                                    : user.role === 'admin'
                                      ? <><Shield className="w-3 h-3 mr-1" />Admin</>
                                      : <><User className="w-3 h-3 mr-1" />Aluno</>}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                {user.access_granted_without_payment ? (
                                  <div className="flex items-center gap-1 text-blue-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs">Acesso gratuito</span>
                                  </div>
                                ) : user.has_paid ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs">
                                      Acesso pago
                                      {user.payment_amount !== undefined &&
                                      user.payment_amount !== null
                                        ? ` · R$ ${Number(user.payment_amount).toFixed(2).replace('.', ',')}`
                                        : ''}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-xs">Sem acesso</span>
                                  </div>
                                )}
                              </div>
                              {user.has_paid && (
                                <div className="mt-2 space-y-1 text-xs text-gray-700">
                                  <div>
                                    <span className="font-medium">Forma:</span>{' '}
                                    {paymentMethodLabel(user.payment_method)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Cartão:</span>{' '}
                                    {user.card_last4 ? `final ${user.card_last4}` : '—'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Parcelas:</span>{' '}
                                    {user.payment_installments
                                      ? `${user.payment_installments}x`
                                      : '1x'}
                                  </div>
                                  {user.coupon_code && (
                                    <div>
                                      <span className="font-medium">Cupom:</span>{' '}
                                      {user.coupon_code}
                                    </div>
                                  )}
                                </div>
                              )}
                              {user.certificate_id && (
                                <Badge
                                  className={`mt-2 ${
                                    user.certificate_is_valid
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  <Award className="w-3 h-3 mr-1" />
                                  {user.certificate_is_valid
                                    ? 'Certificado válido'
                                    : 'Certificado revogado'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="align-top">
                              {user.is_active_student ? (
                                <div className="space-y-2 text-xs text-gray-700">
                                  <Badge className={learningStatusClass(user.learning_status)}>
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    {learningStatusLabel(user.learning_status)}
                                  </Badge>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      Capítulo {user.current_chapter_number ?? 0}
                                      {user.current_chapter_title
                                        ? ` — ${user.current_chapter_title}`
                                        : ''}
                                    </div>
                                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                                      <div
                                        className="h-full rounded-full bg-[#0072BC]"
                                        style={{
                                          width: `${
                                            Math.max(
                                              0,
                                              Math.min(
                                                100,
                                                Number(user.current_chapter_progress || 0),
                                              ),
                                            )
                                          }%`,
                                        }}
                                      />
                                    </div>
                                    <div className="mt-1 text-gray-500">
                                      {Number(user.current_chapter_progress || 0)}% neste capítulo
                                    </div>
                                  </div>
                                  <div>
                                    Capítulos concluídos:{' '}
                                    <strong>
                                      {user.completed_chapters_count || 0}/
                                      {user.total_chapters_count || 0}
                                    </strong>
                                  </div>
                                  <div>
                                    Provas aprovadas:{' '}
                                    <strong>
                                      {user.passed_exams_count || 0}/
                                      {user.total_required_exams || 0}
                                    </strong>
                                  </div>
                                  <div className="text-gray-600">
                                    Capítulos com prova aprovada:{' '}
                                    {user.passed_exam_chapters?.length
                                      ? user.passed_exam_chapters.join(', ')
                                      : 'nenhum'}
                                  </div>
                                  <div className="text-gray-500">
                                    Última atividade:{' '}
                                    {formatDateTime(user.last_learning_activity_at)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="align-top text-xs leading-5 text-gray-600">
                              <div>
                                <span className="font-medium">Cadastro:</span>{' '}
                                {formatDateTime(user.created_at)}
                              </div>
                              <div className="mt-1">
                                <span className="font-medium">Ativação:</span>{' '}
                                {formatDate(user.activated_at)}
                              </div>
                              <div className="mt-1">
                                <span className="font-medium">Último login:</span>{' '}
                                {formatDate(user.last_sign_in_at)}
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(user)}
                              >
                                <Edit className="w-4 h-4 mr-1" />Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* ── CREATE USER MODAL ───────────────────────────────────────── */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#0072BC]" />
              Cadastrar usuário
            </DialogTitle>
            <DialogDescription>
              O usuário receberá um convite seguro por e-mail para ativar a conta
              e criar a própria senha.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome completo</label>
              <Input
                value={createFullName}
                onChange={(event) => setCreateFullName(event.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <Input
                type="email"
                value={createEmail}
                onChange={(event) => setCreateEmail(event.target.value)}
                placeholder="aluno@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Perfil</label>
              <Select value={createRole} onValueChange={handleCreateRoleChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Aluno</SelectItem>
                  {isMasterAdminRole(currentAdminRole) && (
                    <>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="master_admin">Master Admin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            {createRole === 'student' && (
              <div>
                <label className="mb-1 block text-sm font-medium">Classificação do aluno</label>
                <Select
                  value={createStudentType}
                  onValueChange={(value: StudentTypeSelection) => setCreateStudentType(value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_student">Novo aluno — cobrança normal</SelectItem>
                    <SelectItem value="alumni">Ex-aluno — acesso gratuito</SelectItem>
                    <SelectItem value="coupon_promo">Aluno com Cupom Promo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Novo aluno é o padrão e não recebe acesso gratuito. Ex-aluno ativa acesso sem pagamento.
                  Aluno com Cupom Promo mantém acesso pago e deve ter o cupom registrado na ficha.
                </p>
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={createIsAnapp}
                onChange={(event) => setCreateIsAnapp(event.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Membro ANAPP</span>
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Cadastrar e enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT USER MODAL ─────────────────────────────────────────── */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#0072BC]" />
              Gerenciar Usuário
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-700">
              {selectedUser?.email}
              {selectedUser?.full_name && <span className="ml-2 text-gray-500">({selectedUser.full_name})</span>}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 gap-1 h-auto md:grid-cols-7 w-full">
                <TabsTrigger value="profile" className="text-xs"><User className="w-3 h-3 mr-1" />Perfil</TabsTrigger>
                <TabsTrigger value="email" className="text-xs"><Mail className="w-3 h-3 mr-1" />E-mail</TabsTrigger>
                <TabsTrigger value="password" className="text-xs"><KeyRound className="w-3 h-3 mr-1" />Senha</TabsTrigger>
                <TabsTrigger value="grades" className="text-xs"><ClipboardCheck className="w-3 h-3 mr-1" />Notas</TabsTrigger>
                <TabsTrigger value="access" className="text-xs"><CreditCard className="w-3 h-3 mr-1" />Acesso</TabsTrigger>
                <TabsTrigger value="certificate" className="text-xs"><Award className="w-3 h-3 mr-1" />Cert.</TabsTrigger>
                <TabsTrigger value="message" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />Msg</TabsTrigger>
              </TabsList>

              {/* ── PROFILE TAB ── */}
              <TabsContent value="profile" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome Completo</label>
                    <Input value={editFullName} onChange={e => setEditFullName(e.target.value)} placeholder="Nome completo" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Role</label>
                    <Select value={editRole} onValueChange={setEditRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student"><User className="w-4 h-4 inline mr-1" />Aluno</SelectItem>
                        {isMasterAdminRole(currentAdminRole) && (
                          <>
                            <SelectItem value="admin">
                              <Shield className="w-4 h-4 inline mr-1" />Admin
                            </SelectItem>
                            <SelectItem value="master_admin">
                              <Shield className="w-4 h-4 inline mr-1" />Master Admin
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editRole === 'student' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Classificação do aluno</label>
                    <Select
                      value={editStudentType}
                      onValueChange={(value: StudentTypeSelection) => setEditStudentType(value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_student">Novo aluno — cobrança normal</SelectItem>
                        <SelectItem value="alumni">Ex-aluno — acesso gratuito</SelectItem>
                        <SelectItem value="coupon_promo">Aluno com Cupom Promo</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-gray-500">
                      A alteração é administrativa e fica registrada em auditoria.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Celular</label>
                    <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">RG</label>
                    <Input value={editRg} onChange={e => setEditRg(e.target.value)} placeholder="RG" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">CPF</label>
                    <Input value={editCpf} onChange={e => setEditCpf(e.target.value)} placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Gênero</label>
                    <Select value={editGender} onValueChange={setEditGender}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="prefiro_nao_informar">Não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">Logradouro</label>
                    <Input value={editStreet} onChange={e => setEditStreet(e.target.value)} placeholder="Rua, avenida..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Número</label>
                    <Input value={editAddressNumber} onChange={e => setEditAddressNumber(e.target.value)} placeholder="Número" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Complemento</label>
                    <Input value={editComplement} onChange={e => setEditComplement(e.target.value)} placeholder="Opcional" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bairro</label>
                    <Input value={editNeighborhood} onChange={e => setEditNeighborhood(e.target.value)} placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Cidade</label>
                    <Input value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="Cidade" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">UF</label>
                    <Input value={editState} onChange={e => setEditState(e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" maxLength={2} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">CEP</label>
                    <Input value={editZipCode} onChange={e => setEditZipCode(e.target.value)} placeholder="00000-000" />
                  </div>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsAnapp} onChange={e => setEditIsAnapp(e.target.checked)} className="rounded" />
                    <span className="text-sm">Membro ANAPP</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAccessBlocked}
                      onChange={e => setEditAccessBlocked(e.target.checked)}
                      disabled={
                        selectedUser.role !== 'student' &&
                        !isMasterAdminRole(currentAdminRole)
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-red-600">
                      Bloquear acesso
                    </span>
                  </label>
                </div>
                {!isMasterAdminRole(currentAdminRole) &&
                  selectedUser.role !== 'student' && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      Admins podem administrar, bloquear e excluir alunos. Contas
                      administrativas são geridas somente por Master Admin.
                    </div>
                  )}
                <div>
                  <label className="text-sm font-medium mb-1 block">Notas internas (admin only)</label>
                  <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Anotações sobre este usuário..." rows={3} />
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg space-y-1">
                  <div>ID: {selectedUser.id}</div>
                  <div>Cadastro: {new Date(selectedUser.created_at).toLocaleString('pt-BR')}</div>
                  <div className="flex items-center gap-2">
                    <span>Email confirmado:</span>
                    {selectedUser.email_confirmed_at
                      ? <span className="text-green-600 font-medium">✅ Sim ({new Date(selectedUser.email_confirmed_at).toLocaleDateString('pt-BR')})</span>
                      : <span className="text-red-500 font-medium">❌ Não confirmado</span>
                    }
                  </div>
                </div>
                {!selectedUser.email_confirmed_at && (
                  <Button
                    variant="outline"
                    className="w-full border-orange-400 text-orange-600 hover:bg-orange-50"
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const response = await supabase.functions.invoke('admin_manage_user', {
                          body: { action: 'confirm_email', target_user_id: selectedUser.id }
                        });
                        if (response.error) throw response.error;
                        if (response.data?.error) throw new Error(response.data.error);
                        toast({ title: '✅ Email confirmado!', description: 'O usuário já pode fazer login.' });
                        loadUsers();
                      } catch (e: any) {
                        toast({ title: 'Erro', description: e.message, variant: 'destructive' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                    Confirmar Email Manualmente
                  </Button>
                )}
                <Button
                  onClick={handleSaveProfile}
                  disabled={
                    saving ||
                    (
                      !isMasterAdminRole(currentAdminRole) &&
                      selectedUser.role !== 'student'
                    )
                  }
                  className="w-full bg-[#0072BC] hover:bg-[#005a9e]"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                  Salvar Perfil e Role
                </Button>
                {(
                  selectedUser.role === 'student' ||
                  (
                    isMasterAdminRole(currentAdminRole) &&
                    selectedUser.role === 'admin'
                  )
                ) && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => { setDeleteUserId(selectedUser.id); setDeleteConfirmOpen(true); }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />Deletar Usuário Permanentemente
                  </Button>
                )}
              </TabsContent>

              {/* ── EMAIL TAB ── */}
              <TabsContent value="email" className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                  {selectedUser.email_locked
                    ? 'Este e-mail legado continua protegido contra alteração pelo aluno. Administradores podem alterá-lo; a operação é individual e registrada em auditoria.'
                    : 'Administradores podem alterar este e-mail. A alteração é validada no servidor e registrada em auditoria.'}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Alterar e-mail</label>
                  <div className="flex gap-2">
                    <Input
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="novo@email.com"
                      type="email"
                    />
                    <Button
                      onClick={handleChangeEmail}
                      disabled={saving || !newEmail}
                      variant="outline"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ── PASSWORD TAB ── */}
              <TabsContent value="password" className="space-y-5 pt-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                  Todo Admin e Master Admin pode definir imediatamente uma nova
                  senha para qualquer usuário. A alteração é aplicada diretamente
                  no Supabase, sem depender do envio de e-mail.
                </div>

                <div className="space-y-2">
                  <label htmlFor="admin-new-password" className="block text-sm font-medium text-gray-800">
                    Nova senha
                  </label>
                  <PasswordField
                    id="admin-new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    autoComplete="new-password"
                    placeholder="Digite a nova senha"
                    disabled={saving}
                  />
                  <PasswordRequirements password={newPassword} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="admin-confirm-password" className="block text-sm font-medium text-gray-800">
                    Confirmar nova senha
                  </label>
                  <PasswordField
                    id="admin-confirm-password"
                    value={confirmNewPassword}
                    onChange={setConfirmNewPassword}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                    disabled={saving}
                  />
                  {confirmNewPassword && newPassword !== confirmNewPassword && (
                    <p className="text-xs font-medium text-red-600">
                      As senhas não coincidem.
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full bg-[#0072BC] hover:bg-[#005a9e]"
                  onClick={handleChangePassword}
                  disabled={
                    saving ||
                    !isStrongPassword(newPassword) ||
                    newPassword !== confirmNewPassword
                  }
                >
                  {saving
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <KeyRound className="mr-2 h-4 w-4" />}
                  Alterar senha agora
                </Button>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  A senha é enviada diretamente ao Supabase e não é armazenada no
                  painel nem na auditoria. O registro administrativo contém somente
                  o responsável, o usuário afetado e a data da alteração.
                </div>
              </TabsContent>

              {/* ── GRADES TAB ── */}
              <TabsContent value="grades" className="space-y-4 pt-4">
                {selectedUser.is_active_student && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                    <div className="flex items-center gap-2 font-semibold">
                      <BookOpen className="h-4 w-4" />
                      Acompanhamento do aluno ativo
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <div className="text-xs text-blue-700">Capítulo atual</div>
                        <div className="font-semibold">
                          {selectedUser.current_chapter_number ?? 0} —{' '}
                          {selectedUser.current_chapter_title || 'Capítulo Zero'}
                        </div>
                        <div className="text-xs">
                          {Number(selectedUser.current_chapter_progress || 0)}% de avanço
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-700">Capítulos concluídos</div>
                        <div className="font-semibold">
                          {selectedUser.completed_chapters_count || 0}/
                          {selectedUser.total_chapters_count || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-700">Provas aprovadas</div>
                        <div className="font-semibold">
                          {selectedUser.passed_exams_count || 0}/
                          {selectedUser.total_required_exams || 0}
                        </div>
                        <div className="text-xs">
                          Capítulos:{' '}
                          {selectedUser.passed_exam_chapters?.length
                            ? selectedUser.passed_exam_chapters.join(', ')
                            : 'nenhum'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-blue-800">
                      Última atividade: {formatDateTime(selectedUser.last_learning_activity_at)}
                    </div>
                  </div>
                )}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                  Toda alteração exige justificativa e registra administrador, nota
                  anterior, nota nova, usuário e data na auditoria.
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Justificativa da alteração
                  </label>
                  <Textarea
                    value={gradeReason}
                    onChange={(event) => setGradeReason(event.target.value)}
                    placeholder="Ex.: correção após revisão da prova e validação pedagógica"
                    rows={2}
                  />
                </div>

                {gradesLoading ? (
                  <div className="flex items-center justify-center py-10 text-gray-600">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Carregando notas...
                  </div>
                ) : (
                  <div className="space-y-5">
                    {[
                      { type: 'exam' as const, title: 'Provas', items: grades.exams },
                      { type: 'quiz' as const, title: 'Quizzes', items: grades.quizzes },
                    ].map((group) => (
                      <div key={group.type}>
                        <h3 className="mb-2 font-semibold text-gray-900">{group.title}</h3>
                        <div className="space-y-2">
                          {group.items.map((item) => {
                            const draftKey = `${group.type}:${item.assessment_id}`;
                            const isApproved =
                              item.is_approved ??
                              (
                                item.best_score !== null &&
                                item.best_score >=
                                  (item.passing_score || COURSE_PASSING_SCORE_PERCENT)
                              );
                            return (
                              <div
                                key={draftKey}
                                className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_100px_auto] sm:items-center"
                              >
                                <div>
                                  <p className="text-sm font-medium">
                                    Capítulo {item.chapter_number} — {item.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Tentativas registradas: {item.attempts_count}
                                  </p>
                                  <Badge
                                    className={`mt-1 ${
                                      isApproved
                                        ? 'border-green-200 bg-green-100 text-green-800'
                                        : item.attempts_count > 0
                                          ? 'border-amber-200 bg-amber-100 text-amber-800'
                                          : 'border-gray-200 bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {isApproved
                                      ? item.historically_approved
                                        ? 'Aprovação histórica preservada'
                                        : 'Aprovada'
                                      : item.attempts_count > 0
                                        ? 'Realizada, aguardando aprovação'
                                        : 'Pendente'}
                                  </Badge>
                                </div>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={gradeDrafts[draftKey] || ''}
                                  onChange={(event) =>
                                    setGradeDrafts((current) => ({
                                      ...current,
                                      [draftKey]: event.target.value,
                                    }))
                                  }
                                  aria-label={`Nota de ${item.title}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={saving || !gradeReason.trim()}
                                  onClick={() =>
                                    void handleUpdateGrade(group.type, item.assessment_id)
                                  }
                                >
                                  Salvar nota
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── ACCESS TAB ── */}
              <TabsContent value="access" className="space-y-4 pt-4">
                <div className={`p-4 rounded-lg border ${(selectedUser.has_paid || selectedUser.access_granted_without_payment) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {(selectedUser.has_paid || selectedUser.access_granted_without_payment)
                      ? <CheckCircle className="w-5 h-5 text-green-600" />
                      : <XCircle className="w-5 h-5 text-red-500" />}
                    <span className="font-semibold">
                      {selectedUser.access_granted_without_payment
                        ? 'Acesso gratuito ativo — Ex-aluno'
                        : selectedUser.has_paid ? 'Acesso Ativo' : 'Sem Acesso ao Curso'}
                    </span>
                  </div>
                  {selectedUser.access_granted_without_payment ? (
                    <p className="text-sm text-gray-600">
                      Direito de acesso legado, independente de pagamento. Não registrar como pagamento.
                    </p>
                  ) : selectedUser.has_paid && (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Valor: R$ {Number(selectedUser.payment_amount || 0).toFixed(2).replace('.', ',')}
                        {selectedUser.payment_date && ` • ${new Date(selectedUser.payment_date).toLocaleDateString('pt-BR')}`}
                      </p>
                      <p>
                        Forma: {paymentMethodLabel(selectedUser.payment_method)} ·
                        Cartão: {selectedUser.card_last4 ? `final ${selectedUser.card_last4}` : '—'} ·
                        Parcelas: {selectedUser.payment_installments || 1}x
                      </p>
                      {selectedUser.coupon_code && (
                        <p>Cupom: {selectedUser.coupon_code}</p>
                      )}
                    </div>
                  )}
                </div>

                {!selectedUser.has_paid && !selectedUser.access_granted_without_payment ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Forma de pagamento
                      </label>
                      <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="pix">Chave PIX</SelectItem>
                          <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                          <SelectItem value="admin_free_access">Acesso gratuito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Cupom utilizado
                      </label>
                      <Input
                        value={editCouponCode}
                        onChange={(event) => setEditCouponCode(event.target.value.toUpperCase())}
                        placeholder="EXPOLAZER2026"
                        autoCapitalize="characters"
                        spellCheck={false}
                        maxLength={40}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        O código é normalizado automaticamente em letras maiúsculas.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Valor administrativo (R$) — use 0 para gratuidade
                      </label>
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        placeholder="600"
                      />
                    </div>
                    <Button onClick={handleGrantPayment} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                      Liberar Acesso ao Curso
                    </Button>
                  </div>
                ) : selectedUser.access_granted_without_payment ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                    O acesso de ex-aluno é permanente e não pode ser revogado como se fosse um pagamento.
                  </div>
                ) : (
                  <Button onClick={handleRevokePayment} disabled={saving} variant="destructive" className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserX className="w-4 h-4 mr-2" />}
                    Revogar Acesso ao Curso
                  </Button>
                )}
              </TabsContent>

              {/* ── CERTIFICATE TAB ── */}
              <TabsContent value="certificate" className="space-y-4 pt-4">
                {selectedUser.certificate_id ? (
                  <div className={`p-4 rounded-lg border ${selectedUser.certificate_is_valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className={`w-5 h-5 ${selectedUser.certificate_is_valid ? 'text-green-600' : 'text-red-500'}`} />
                      <span className="font-semibold">
                        {selectedUser.certificate_is_valid ? 'Certificado Válido' : 'Certificado Revogado'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Nº {selectedUser.certificate_number}</p>
                    {selectedUser.certificate_date && (
                      <p className="text-sm text-gray-600">
                        Emitido em: {new Date(selectedUser.certificate_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {selectedUser.certificate_is_valid && (
                      <Button onClick={handleRevokeCertificate} disabled={saving} variant="destructive" className="w-full mt-3">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
                        Revogar Certificado
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                      📜 Emita o certificado manualmente para este usuário. Os dados abaixo serão impressos no certificado.
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome Completo (para o certificado)</label>
                      <Input value={certName} onChange={e => setCertName(e.target.value)} placeholder="NOME COMPLETO EM MAIÚSCULAS" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">CPF</label>
                      <Input value={certCpf} onChange={e => setCertCpf(e.target.value)} placeholder="000.000.000-00" />
                    </div>
                    <Button onClick={handleIssueCertificate} disabled={saving || !certName || !certCpf} className="w-full bg-[#0072BC] hover:bg-[#005a9e]">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
                      Emitir Certificado
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* ── MESSAGE TAB ── */}
              <TabsContent value="message" className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  💬 Envie uma mensagem interna para este usuário. Ela ficará disponível na área do aluno.
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Assunto</label>
                  <Input value={msgSubject} onChange={e => setMsgSubject(e.target.value)} placeholder="Ex: Informação importante sobre seu acesso" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Mensagem</label>
                  <Textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Digite a mensagem completa aqui..." rows={6} />
                </div>
                <Button onClick={handleSendMessage} disabled={saving || !msgSubject || !msgBody} className="w-full bg-[#0072BC] hover:bg-[#005a9e]">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Enviar Mensagem
                </Button>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ─────────────────────────────────────────── */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Esta ação é <strong>irreversível</strong>. Todos os dados do usuário serão apagados permanentemente, incluindo progresso, pagamentos e certificados.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm font-medium text-gray-700 bg-gray-100 p-3 rounded">
            {users.find(u => u.id === deleteUserId)?.email}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={saving}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Sim, deletar permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
