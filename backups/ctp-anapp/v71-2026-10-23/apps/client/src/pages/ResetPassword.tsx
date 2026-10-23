import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import {
  clearPasswordRecoveryAttempt,
  hasRecentPasswordRecoveryAttempt,
  markPasswordRecoveryAttempt,
  supabase,
} from "@/integrations/supabase/client";
import { ROUTE_PATHS } from "@/lib";
import { isStrongPassword } from "@/lib/password-policy";
import { useToast } from "@/hooks/use-toast";

type RecoveryState = "checking" | "ready" | "invalid";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    let recoveryDetected = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        recoveryDetected = true;
        markPasswordRecoveryAttempt();
        setState("ready");
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (!error && data.session && hasRecentPasswordRecoveryAttempt()) {
        setState("ready");
      } else {
        window.setTimeout(() => {
          if (active && !recoveryDetected) {
            clearPasswordRecoveryAttempt();
            setState("invalid");
          }
        }, 1800);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isStrongPassword(password) || password !== confirmPassword) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      clearPasswordRecoveryAttempt();
      await supabase.auth.signOut();
      navigate(`${ROUTE_PATHS.LOGIN}?reset=success`, { replace: true });
    } catch (error: unknown) {
      toast({
        title: "Não foi possível atualizar a senha",
        description:
          error instanceof Error ? error.message : "Solicite um novo link de redefinição.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardContent className="p-8">
          {state === "checking" && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#0072BC]/25 border-t-[#0072BC]" />
              <p className="text-sm text-gray-600">Validando o link de redefinição...</p>
            </div>
          )}

          {state === "invalid" && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-9 w-9 text-orange-600" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900">Link inválido ou expirado</h1>
              <p className="mb-7 text-sm text-gray-600">
                Solicite um novo link para redefinir sua senha.
              </p>
              <Button asChild className="w-full bg-[#0072BC] hover:bg-[#005a9e]">
                <Link to={ROUTE_PATHS.FORGOT_PASSWORD}>Solicitar novo link</Link>
              </Button>
            </div>
          )}

          {state === "ready" && (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0072BC]/10">
                  <KeyRound className="h-7 w-7 text-[#0072BC]" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Criar nova senha</h1>
                <p className="text-gray-600">Defina uma senha forte e exclusiva para sua conta.</p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label htmlFor="reset-password" className="mb-2 block text-sm font-medium text-gray-700">
                    Nova senha
                  </label>
                  <PasswordField
                    id="reset-password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    placeholder="Digite a nova senha"
                    disabled={loading}
                  />
                  <div className="mt-3">
                    <PasswordRequirements password={password} />
                  </div>
                </div>

                <div>
                  <label htmlFor="reset-password-confirm" className="mb-2 block text-sm font-medium text-gray-700">
                    Confirmar nova senha
                  </label>
                  <PasswordField
                    id="reset-password-confirm"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full bg-[#0072BC] hover:bg-[#005a9e]"
                  disabled={
                    loading ||
                    !isStrongPassword(password) ||
                    password !== confirmPassword
                  }
                >
                  {loading ? "Atualizando..." : "Salvar nova senha"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
