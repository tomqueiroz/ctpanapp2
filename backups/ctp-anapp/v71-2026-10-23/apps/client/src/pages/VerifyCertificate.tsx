import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Award,
  CheckCircle,
  ExternalLink,
  Mail,
  MessageCircle,
  Search,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface VerificationResult {
  valid: boolean;
  message?: string;
  certificate_number?: string;
  full_name?: string;
  course_name?: string;
  completion_date?: string;
  total_hours?: number;
  verification_code?: string;
}

const ESTIMATED_BEGINNER_WORKLOAD_HOURS = 240;

export default function VerifyCertificate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verify = async (verificationCode: string) => {
    const normalizedCode = verificationCode.trim().toUpperCase();
    if (!normalizedCode) return;

    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.rpc('lms_verify_certificate', {
        p_verification_code: normalizedCode,
      });
      if (error) throw error;
      setResult(data as VerificationResult);
      setSearchParams({ code: normalizedCode }, { replace: true });
    } catch (error) {
      setResult({
        valid: false,
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível consultar o certificado.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCode = searchParams.get('code');
    if (initialCode) void verify(initialCode);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void verify(code);
  };

  const whatsappMessage = encodeURIComponent(
    `Olá, gostaria de solicitar uma confirmação da certificação CTP ANAPP referente ao código ${result?.verification_code || code.trim().toUpperCase()}.`,
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-16 pt-28">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Award className="h-7 w-7 text-[#0072BC]" />
            </div>
            <CardTitle className="text-2xl text-[#0072BC]">
              Confirmação de profissional certificado
            </CardTitle>
            <CardDescription>
              Escaneie a carteirinha ou informe o código para consultar a certificação CTP ANAPP.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="Código de verificação"
                autoComplete="off"
                className="uppercase"
              />
              <Button type="submit" disabled={loading || !code.trim()}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? 'Consultando...' : 'Validar'}
              </Button>
            </form>

            {result && (
              <div
                className={`rounded-lg border p-5 ${
                  result.valid
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="mb-4 flex items-center gap-2">
                  {result.valid ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <p
                    className={`font-semibold ${
                      result.valid ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.valid
                      ? 'Profissional certificado pelo CTP ANAPP'
                      : 'Certificação não validada'}
                  </p>
                </div>

                {result.valid ? (
                  <div className="space-y-5">
                    <p className="text-sm leading-6 text-green-900">
                      A certificação abaixo está ativa e foi localizada na base oficial do CTP ANAPP.
                    </p>
                    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-gray-600">Titular</dt>
                        <dd className="font-semibold">{result.full_name}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Registro</dt>
                        <dd className="font-semibold">{result.certificate_number}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Curso</dt>
                        <dd className="font-semibold">{result.course_name}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Conclusão</dt>
                        <dd className="font-semibold">
                          {result.completion_date
                            ? new Date(`${result.completion_date}T12:00:00`).toLocaleDateString('pt-BR')
                            : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Carga horária do certificado</dt>
                        <dd className="font-semibold">
                          {typeof result.total_hours === 'number' &&
                          Number.isFinite(result.total_hours) &&
                          result.total_hours > 0
                            ? `${result.total_hours} horas`
                            : 'Não informada'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Estudo estimado para iniciantes</dt>
                        <dd className="font-semibold">
                          {ESTIMATED_BEGINNER_WORKLOAD_HOURS} horas
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Código</dt>
                        <dd className="break-all font-semibold">{result.verification_code}</dd>
                      </div>
                    </dl>
                    <p className="text-xs leading-5 text-gray-600">
                      Estimativa para alunos iniciantes que se aprofundam em todos os conceitos e exercícios do programa.
                    </p>

                    <div className="rounded-lg border border-blue-200 bg-white p-4">
                      <p className="font-semibold text-[#06396B]">
                        Precisa de confirmação adicional?
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Solicite uma confirmação formal diretamente à ANAPP pelo site, por e-mail ou WhatsApp.
                      </p>
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <Button asChild variant="outline" size="sm">
                          <a
                            href="https://anapp.org.br"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Site ANAPP
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <a href="mailto:contato@anapp.org.br?subject=Confirma%C3%A7%C3%A3o%20de%20certifica%C3%A7%C3%A3o%20CTP%20ANAPP">
                            <Mail className="mr-2 h-4 w-4" />
                            E-mail
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={`https://wa.me/5511990001750?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            WhatsApp
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-800">{result.message}</p>
                )}
              </div>
            )}

            <div className="text-center">
              <Link className="text-sm font-medium text-[#0072BC] hover:underline" to="/">
                Voltar ao site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
