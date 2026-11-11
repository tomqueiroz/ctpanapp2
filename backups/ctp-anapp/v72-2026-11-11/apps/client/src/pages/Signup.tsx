import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { supabase } from "@/integrations/supabase/client";
import { ROUTE_PATHS } from "@/lib";
import { isStrongPassword, normalizeEmail } from "@/lib/password-policy";
import { useToast } from "@/hooks/use-toast";

const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

interface FunctionErrorLike {
  message?: string;
  context?: Response;
}

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const formatCpf = (value: string) =>
  digitsOnly(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const formatPhone = (value: string) =>
  digitsOnly(value)
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");

const formatZipCode = (value: string) =>
  digitsOnly(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");

const isValidCpf = (value: string) => {
  const cpf = digitsOnly(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const calculateDigit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return (
    calculateDigit(9) === Number(cpf[9]) &&
    calculateDigit(10) === Number(cpf[10])
  );
};

const registrationErrorMessage = async (
  error: unknown,
  responseData: unknown,
) => {
  let code =
    responseData && typeof responseData === "object" && "error" in responseData
      ? String((responseData as { error?: unknown }).error ?? "")
      : "";
  const functionError = error as FunctionErrorLike | null;
  if (!code && functionError?.context instanceof Response) {
    try {
      const body = (await functionError.context.clone().json()) as {
        error?: string;
      };
      code = body.error ?? "";
    } catch {
      code = "";
    }
  }

  const messages: Record<string, string> = {
    INCOMPLETE_REGISTRATION:
      "Preencha corretamente todos os campos obrigatórios antes de criar a conta.",
    INVALID_EMAIL: "Informe um endereço de e-mail válido.",
    INVALID_PASSWORD: "Crie uma senha que atenda a todos os requisitos.",
    CPF_ALREADY_REGISTERED:
      "Este CPF já está vinculado a outro cadastro. Procure a administração.",
    RATE_LIMITED:
      "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.",
    EMAIL_DELIVERY_FAILED:
      "O cadastro não pôde enviar a confirmação agora. Tente novamente em alguns minutos.",
    PROFILE_PERSISTENCE_FAILED:
      "Não foi possível gravar os dados completos do cadastro.",
  };
  return (
    messages[code] ||
    functionError?.message ||
    "Revise seus dados e tente novamente."
  );
};

export default function Signup() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rg, setRg] = useState("");
  const [cpf, setCpf] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const registrationReady = useMemo(
    () =>
      fullName.trim().split(/\s+/).length >= 2 &&
      email.trim().length > 0 &&
      digitsOnly(phone).length === 11 &&
      rg.replace(/[^A-Za-z0-9]/g, "").length >= 3 &&
      isValidCpf(cpf) &&
      street.trim().length > 0 &&
      number.trim().length > 0 &&
      neighborhood.trim().length > 0 &&
      city.trim().length > 0 &&
      state.length === 2 &&
      digitsOnly(zipCode).length === 8 &&
      ["masculino", "feminino", "prefiro_nao_informar"].includes(gender) &&
      acceptedTerms &&
      isStrongPassword(password) &&
      password === confirmPassword,
    [
      acceptedTerms,
      city,
      confirmPassword,
      cpf,
      email,
      fullName,
      gender,
      neighborhood,
      number,
      password,
      phone,
      rg,
      state,
      street,
      zipCode,
    ],
  );

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    if (fullName.trim().split(/\s+/).length < 2) {
      toast({
        title: "Informe o nome completo",
        description: "Digite nome e sobrenome.",
        variant: "destructive",
      });
      return;
    }
    if (digitsOnly(phone).length !== 11) {
      toast({
        title: "Celular inválido",
        description: "Informe DDD e número do celular.",
        variant: "destructive",
      });
      return;
    }
    if (!isValidCpf(cpf)) {
      toast({
        title: "CPF inválido",
        description: "Confira os 11 dígitos do CPF.",
        variant: "destructive",
      });
      return;
    }
    if (!registrationReady) {
      toast({
        title: "Cadastro incompleto",
        description:
          "Preencha todos os campos obrigatórios e confirme os termos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      const { data, error } = await supabase.functions.invoke(
        "student_registration",
        {
          body: {
            action: "register",
            email: normalizedEmail,
            password,
            full_name: fullName.trim(),
            phone,
            rg: rg.trim().toUpperCase(),
            cpf,
            street: street.trim(),
            number: number.trim(),
            complement: complement.trim() || null,
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state,
            zip_code: zipCode,
            gender,
          },
        },
      );
      if (error || !data?.success) {
        throw new Error(await registrationErrorMessage(error, data));
      }
      setEmail(normalizedEmail);
      setSubmitted(true);
    } catch (error: unknown) {
      toast({
        title: "Não foi possível concluir o cadastro",
        description:
          error instanceof Error
            ? error.message
            : "Revise seus dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    setResending(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "student_registration",
        {
          body: { action: "resend", email },
        },
      );
      if (error || !data?.success) throw error ?? new Error("Falha ao reenviar.");
      toast({
        title: "E-mail reenviado",
        description:
          "Confira também as pastas Spam, Promoções e Lixo eletrônico.",
      });
    } catch {
      toast({
        title: "Não foi possível reenviar agora",
        description: "Aguarde alguns minutos e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              Confirme seu cadastro
            </h1>
            <p className="mb-2 text-sm text-gray-600">
              Seu cadastro completo foi salvo. Enviamos a confirmação para:
            </p>
            <p className="mb-6 break-all font-semibold text-[#0072BC]">
              {email}
            </p>
            <p className="mb-8 text-sm text-gray-500">
              Abra o e-mail, confirme sua conta e depois entre com a senha
              criada. O link expira em 30 minutos.
            </p>
            <Button
              asChild
              className="mb-3 w-full bg-[#0072BC] hover:bg-[#005a9e]"
            >
              <Link to={ROUTE_PATHS.LOGIN}>Voltar para o login</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={resendConfirmation}
              disabled={resending}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  resending ? "animate-spin" : ""
                }`}
              />
              {resending ? "Reenviando..." : "Reenviar confirmação"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <Card className="mx-auto w-full max-w-4xl border-0 shadow-xl">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0072BC]/10">
              <UserPlus className="h-7 w-7 text-[#0072BC]" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Criar conta
            </h1>
            <p className="mx-auto max-w-2xl text-gray-600">
              Para proteger sua matrícula, somente cadastros completos podem ser
              confirmados.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0072BC]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Dados pessoais
                </h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nome completo" htmlFor="signup-name">
                  <Input
                    id="signup-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    required
                    disabled={loading}
                    placeholder="Nome e sobrenome"
                  />
                </Field>
                <Field label="E-mail" htmlFor="signup-email">
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    disabled={loading}
                    placeholder="seu@email.com"
                  />
                </Field>
                <Field label="Telefone celular" htmlFor="signup-phone">
                  <Input
                    id="signup-phone"
                    value={phone}
                    onChange={(event) =>
                      setPhone(formatPhone(event.target.value))
                    }
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={15}
                    required
                    disabled={loading}
                    placeholder="(00) 00000-0000"
                  />
                </Field>
                <Field label="RG" htmlFor="signup-rg">
                  <Input
                    id="signup-rg"
                    value={rg}
                    onChange={(event) =>
                      setRg(event.target.value.toUpperCase().slice(0, 30))
                    }
                    maxLength={30}
                    required
                    disabled={loading}
                    placeholder="Número do RG"
                  />
                </Field>
                <Field label="CPF" htmlFor="signup-cpf">
                  <Input
                    id="signup-cpf"
                    value={cpf}
                    onChange={(event) => setCpf(formatCpf(event.target.value))}
                    inputMode="numeric"
                    maxLength={14}
                    required
                    disabled={loading}
                    placeholder="000.000.000-00"
                  />
                </Field>
                <Field label="Gênero" htmlFor="signup-gender">
                  <Select
                    value={gender}
                    onValueChange={setGender}
                    disabled={loading}
                  >
                    <SelectTrigger id="signup-gender">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="prefiro_nao_informar">
                        Não informar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0072BC]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Endereço residencial
                </h2>
              </div>
              <div className="grid gap-5 md:grid-cols-6">
                <div className="md:col-span-4">
                  <Field label="Logradouro" htmlFor="signup-street">
                    <Input
                      id="signup-street"
                      value={street}
                      onChange={(event) => setStreet(event.target.value)}
                      autoComplete="street-address"
                      required
                      disabled={loading}
                      placeholder="Rua, avenida, alameda..."
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Número" htmlFor="signup-number">
                    <Input
                      id="signup-number"
                      value={number}
                      onChange={(event) => setNumber(event.target.value)}
                      required
                      disabled={loading}
                      placeholder="123"
                    />
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field
                    label="Complemento (opcional)"
                    htmlFor="signup-complement"
                    optional
                  >
                    <Input
                      id="signup-complement"
                      value={complement}
                      onChange={(event) => setComplement(event.target.value)}
                      disabled={loading}
                      placeholder="Apartamento, bloco, sala..."
                    />
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field label="Bairro" htmlFor="signup-neighborhood">
                    <Input
                      id="signup-neighborhood"
                      value={neighborhood}
                      onChange={(event) => setNeighborhood(event.target.value)}
                      required
                      disabled={loading}
                    />
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field label="Cidade" htmlFor="signup-city">
                    <Input
                      id="signup-city"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      autoComplete="address-level2"
                      required
                      disabled={loading}
                    />
                  </Field>
                </div>
                <div className="md:col-span-1">
                  <Field label="UF" htmlFor="signup-state">
                    <Select
                      value={state}
                      onValueChange={setState}
                      disabled={loading}
                    >
                      <SelectTrigger id="signup-state">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="CEP" htmlFor="signup-zip-code">
                    <Input
                      id="signup-zip-code"
                      value={zipCode}
                      onChange={(event) =>
                        setZipCode(formatZipCode(event.target.value))
                      }
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={9}
                      required
                      disabled={loading}
                      placeholder="00000-000"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0072BC]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Segurança da conta
                </h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Senha" htmlFor="signup-password">
                  <PasswordField
                    id="signup-password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    placeholder="Crie uma senha forte"
                    disabled={loading}
                  />
                  <div className="mt-3">
                    <PasswordRequirements password={password} />
                  </div>
                </Field>
                <Field
                  label="Confirmar senha"
                  htmlFor="signup-password-confirm"
                >
                  <PasswordField
                    id="signup-password-confirm"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    disabled={loading}
                  />
                </Field>
              </div>
            </section>

            <label className="flex items-start gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1"
                required
              />
              <span>
                Li e aceito os{" "}
                <Link
                  to={ROUTE_PATHS.TERMS_OF_USE}
                  className="text-[#0072BC] hover:underline"
                >
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  to={ROUTE_PATHS.PRIVACY_POLICY}
                  className="text-[#0072BC] hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>

            <Button
              type="submit"
              className="h-12 w-full bg-[#0072BC] text-base hover:bg-[#005a9e]"
              disabled={loading || !registrationReady}
            >
              {loading ? "Validando e criando conta..." : "Criar conta completa"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Já possui conta?{" "}
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="font-semibold text-[#0072BC] hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  optional = false,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
        {!optional && <span aria-hidden="true"> *</span>}
      </label>
      {children}
    </div>
  );
}
