import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, ShieldAlert, RefreshCw } from 'lucide-react';
import { isMasterAdminRole, type LmsRole } from '@/lib/roles';

interface PendingAuthorization {
  id: string;
  action_type: string;
  description: string;
  requested_by: string;
  requester_email?: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  created_at: string;
  expires_at: string;
  payload?: Record<string, unknown>;
}

export default function AdminAuthorize() {
  const { toast } = useToast();
  const [authorizations, setAuthorizations] = useState<PendingAuthorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: LmsRole | null } | null>(null);

  useEffect(() => {
    loadUser();
    loadAuthorizations();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setCurrentUser(null);
      return;
    }

    const { data: roleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Erro ao verificar perfil Master Admin:', error);
    }

    setCurrentUser({
      id: user.id,
      email: user.email,
      role: (roleData?.role as LmsRole | undefined) ?? null,
    });
  };

  const loadAuthorizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_authorizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuthorizations((data || []) as PendingAuthorization[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar autorizações';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (authId: string, action: 'approve' | 'deny') => {
    if (!currentUser || !isMasterAdminRole(currentUser.role)) {
      toast({ title: 'Acesso negado', description: 'Apenas Master Admins podem autorizar ações críticas.', variant: 'destructive' });
      return;
    }

    setProcessing(authId);
    try {
      const { error } = await supabase.functions.invoke('request_master_authorization', {
        body: {
          action: action === 'approve' ? 'approve_request' : 'deny_request',
          authorization_id: authId,
          master_admin_email: currentUser.email,
          master_admin_user_id: currentUser.id,
        },
      });

      if (error) throw error;

      toast({
        title: action === 'approve' ? '✅ Ação autorizada' : '❌ Ação negada',
        description: action === 'approve' ? 'A ação crítica foi aprovada e será executada.' : 'A solicitação foi negada.',
      });

      loadAuthorizations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const expired = new Date(expiresAt) < new Date();
    if (expired && status === 'pending') {
      return <Badge variant="outline" className="text-gray-500">Expirado</Badge>;
    }
    switch (status) {
      case 'pending':   return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">⏳ Pendente</Badge>;
      case 'approved':  return <Badge className="bg-green-100 text-green-800 border-green-300">✅ Aprovado</Badge>;
      case 'denied':    return <Badge className="bg-red-100 text-red-800 border-red-300">❌ Negado</Badge>;
      default:          return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const isMasterAdmin = Boolean(currentUser && isMasterAdminRole(currentUser.role));
  const pendingCount = authorizations.filter(a => a.status === 'pending' && new Date(a.expires_at) > new Date()).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Autorizações Master Admin</h1>
            <p className="text-sm text-gray-500">Ações críticas que requerem aprovação de Master Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-red-100 text-red-800 border-red-300 text-sm px-3 py-1">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={loadAuthorizations}>
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </div>
      </div>

      {!isMasterAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Acesso somente leitura</p>
            <p className="text-sm text-yellow-700">Você pode visualizar as solicitações, mas apenas Master Admins podem aprovar ou negar.</p>
            <p className="text-xs text-yellow-600 mt-1">As permissões são verificadas pelo perfil do usuário no Supabase.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : authorizations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Nenhuma solicitação pendente</p>
            <p className="text-sm text-gray-400">Todas as ações críticas estão em conformidade.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {authorizations.map((auth) => {
            const isExpired = new Date(auth.expires_at) < new Date();
            const isPending = auth.status === 'pending' && !isExpired;

            return (
              <Card key={auth.id} className={`border-l-4 ${
                isPending ? 'border-l-yellow-400' :
                auth.status === 'approved' ? 'border-l-green-400' :
                'border-l-red-400'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        {auth.action_type?.replace(/_/g, ' ').toUpperCase()}
                      </CardTitle>
                      <CardDescription className="mt-1">{auth.description}</CardDescription>
                    </div>
                    {getStatusBadge(auth.status, auth.expires_at)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Solicitado: {new Date(auth.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expira: {new Date(auth.expires_at).toLocaleString('pt-BR')}</span>
                    </div>
                    {auth.requester_email && (
                      <div className="col-span-2">
                        <span className="font-medium">Solicitado por:</span> {auth.requester_email}
                      </div>
                    )}
                  </div>

                  {auth.payload && Object.keys(auth.payload).length > 0 && (
                    <details className="mb-4">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Ver detalhes da ação</summary>
                      <pre className="text-xs bg-gray-50 rounded p-2 mt-1 overflow-auto">
                        {JSON.stringify(auth.payload, null, 2)}
                      </pre>
                    </details>
                  )}

                  {isPending && isMasterAdmin && (
                    <div className="flex gap-3">
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        disabled={processing === auth.id}
                        onClick={() => handleAction(auth.id, 'approve')}
                      >
                        {processing === auth.id ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={processing === auth.id}
                        onClick={() => handleAction(auth.id, 'deny')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Negar
                      </Button>
                    </div>
                  )}

                  {isPending && !isMasterAdmin && (
                    <p className="text-xs text-gray-400 italic">Aguardando aprovação de Master Admin...</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
