import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ROUTE_PATHS } from "@/lib";
import { normalizeEmail } from "@/lib/password-policy";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "student_registration",
        {
          body: {
            action: "recover",
            email: normalizeEmail(email),
          },
        },
      );
      if (error || !data?.success) {
        throw error ?? new Error("EMAIL_DELIVERY_FAILED");
      }
      setSubmitted(true);
    } catch {
      toast({
        title: "Não foi possível enviar o e-mail agora",
        description:
          "Tente novamente em alguns minutos. A solicitação não foi perdida silenciosamente.",
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
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900">Verifique seu e-mail</h1>
              <p className="mb-7 text-sm leading-6 text-gray-600">
                Se existir uma conta associada ao endereço informado, enviaremos um link seguro
                para definir uma nova senha.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to={ROUTE_PATHS.LOGIN}>Voltar para o login</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0072BC]/10">
                  <KeyRound className="h-7 w-7 text-[#0072BC]" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Recuperar senha</h1>
                <p className="text-gray-600">
                  Informe seu e-mail para receber o link de redefinição.
                </p>
              </div>

              <form onSubmit={handleRequest} className="space-y-5">
                <div>
                  <label htmlFor="recovery-email" className="mb-2 block text-sm font-medium text-gray-700">
                    E-mail
                  </label>
                  <Input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full bg-[#0072BC] hover:bg-[#005a9e]"
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm">
                <Link to={ROUTE_PATHS.LOGIN} className="font-medium text-[#0072BC] hover:underline">
                  Voltar para o login
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
