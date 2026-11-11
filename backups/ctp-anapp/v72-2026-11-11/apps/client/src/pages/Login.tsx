import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordField } from "@/components/auth/PasswordField";
import { supabase } from "@/integrations/supabase/client";
import { ROUTE_PATHS } from "@/lib";
import { normalizeEmail } from "@/lib/password-policy";
import { useToast } from "@/hooks/use-toast";

interface LoginLocationState {
  from?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const requestedPath = (location.state as LoginLocationState | null)?.from;
  const destination =
    requestedPath &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !requestedPath.startsWith(ROUTE_PATHS.LOGIN)
      ? requestedPath
      : ROUTE_PATHS.DASHBOARD;

  useEffect(() => {
    let active = true;

    const validateStoredSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (!active) return;

      if (sessionError || !session) {
        if (sessionError) {
          await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        }
        if (!active) return;
        setAuthenticated(false);
        setCheckingSession(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!active) return;

      if (userError || !user) {
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        if (!active) return;
        setAuthenticated(false);
        setCheckingSession(false);
        return;
      }

      setAuthenticated(true);
      setCheckingSession(false);
    };

    void validateStoredSession();

    const params = new URLSearchParams(location.search);
    if (params.get("confirmed") === "1") {
      toast({
        title: "E-mail confirmado",
        description: "Sua conta está pronta. Entre com sua senha.",
      });
    }
    if (params.get("confirmation") === "invalid") {
      toast({
        title: "Link inválido ou expirado",
        description: "Cadastre-se novamente ou solicite o reenvio do e-mail de confirmação.",
        variant: "destructive",
      });
    }
    if (params.get("reset") === "success") {
      toast({
        title: "Senha atualizada",
        description: "Entre novamente usando sua nova senha.",
      });
    }

    return () => {
      active = false;
    };
  }, [location.search, toast]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });

      if (error) {
        const invalidCredentials =
          error.message.toLowerCase().includes("invalid login credentials");
        const emailNotConfirmed =
          error.message.toLowerCase().includes("email not confirmed");
        throw new Error(
          emailNotConfirmed
            ? "Confirme seu e-mail antes de entrar. Use o reenvio disponível na página de cadastro."
            : invalidCredentials
            ? "E-mail ou senha inválidos. Verifique os dados e tente novamente."
            : error.message,
        );
      }

      const { error: alumniError } = await supabase.functions.invoke('alumni_check_on_signup');
      if (alumniError) {
        console.error('Não foi possível confirmar o direito de ex-aluno:', alumniError);
      }

      navigate(destination, { replace: true });
    } catch (error: unknown) {
      toast({
        title: "Não foi possível entrar",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0072BC]/25 border-t-[#0072BC]" />
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0072BC]/10">
              <ShieldCheck className="h-7 w-7 text-[#0072BC]" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Acessar o CTP ANAPP</h1>
            <p className="text-gray-600">Entre com seu e-mail e sua senha.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link
                  to={ROUTE_PATHS.FORGOT_PASSWORD}
                  className="text-sm font-medium text-[#0072BC] hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <PasswordField
                id="login-password"
                value={password}
                onChange={setPassword}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-[#0072BC] text-base hover:bg-[#005a9e]"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-950">
            <div className="flex gap-2">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#0072BC]" />
              <p>
                Ainda não possui conta?{" "}
                <Link to={ROUTE_PATHS.SIGNUP} className="font-semibold text-[#0072BC] hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
