import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AlertCircle, LockKeyhole } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { canAccessChapter, getLmsAccessContext } from "@/lib/lms-access";
import { ROUTE_PATHS } from "@/lib";

type AccessState = "loading" | "allowed" | "payment_required" | "blocked" | "error";

function AccessMessage({ state }: { state: Exclude<AccessState, "loading" | "allowed"> }) {
  if (state === "blocked") {
    return (
      <div className="mx-auto max-w-xl px-4 py-28">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso bloqueado</AlertTitle>
          <AlertDescription>Fale com a administração do CTP ANAPP para revisar seu cadastro.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (state === "payment_required") {
    return (
      <div className="mx-auto max-w-xl px-4 py-28">
        <Alert className="border-blue-200 bg-blue-50 text-blue-950">
          <LockKeyhole className="h-4 w-4 text-[#0072BC]" />
          <AlertTitle>Conteúdo disponível após a inscrição</AlertTitle>
          <AlertDescription className="mt-2">
            Seu e-mail já foi confirmado. Você pode acessar o Capítulo 0 e concluir o pagamento para liberar o curso completo.
            <div className="mt-4 flex gap-3">
              <Button asChild className="bg-[#0072BC] hover:bg-[#005a9e]">
                <a href={ROUTE_PATHS.CHECKOUT}>Ir para pagamento</a>
              </Button>
              <Button asChild variant="outline">
                <a href={`${ROUTE_PATHS.DASHBOARD}/chapter/0`}>Abrir Capítulo 0</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
}

export function RequireFullCourseAccess({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessState>("loading");

  useEffect(() => {
    let active = true;
    void getLmsAccessContext()
      .then((access) => {
        if (!active) return;
        if (access.access_blocked) setState("blocked");
        else setState(access.can_access_paid_content ? "allowed" : "payment_required");
      })
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return <div className="min-h-screen bg-gray-50 pt-28 text-center text-gray-600">Validando acesso...</div>;
  }
  if (state !== "allowed") return <AccessMessage state={state} />;
  return <>{children}</>;
}

export function RequireChapterAccess({ children }: { children: ReactNode }) {
  const { chapterId } = useParams();
  const [state, setState] = useState<AccessState>("loading");

  useEffect(() => {
    let active = true;
    const chapterNumber = Number(chapterId);
    if (!Number.isInteger(chapterNumber) || chapterNumber < 0) {
      setState("error");
      return () => {
        active = false;
      };
    }
    void canAccessChapter(chapterNumber)
      .then((allowed) => active && setState(allowed ? "allowed" : "payment_required"))
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [chapterId]);

  if (state === "loading") {
    return <div className="min-h-screen bg-gray-50 pt-28 text-center text-gray-600">Validando capítulo...</div>;
  }
  if (state !== "allowed") return <AccessMessage state={state} />;
  return <>{children}</>;
}
