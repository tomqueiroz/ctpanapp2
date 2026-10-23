import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  TicketPercent,
  XCircle,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ROUTE_PATHS } from "@/lib";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  max_installments: number | null;
  requires_anapp_membership: boolean | null;
}

interface PaymentConfiguration {
  enabled: boolean;
  configured: boolean;
  environment: "sandbox" | "production" | "not_configured";
  environment_matches: boolean;
  pv_matches: boolean;
  pricing_mode_valid: boolean;
  supported_methods: string[];
}

interface PaymentResult {
  success: boolean;
  payment_id?: string | null;
  status?: string;
  transaction_id?: string | null;
  authorization?: string | null;
  nsu?: string | null;
  final_amount?: number;
  original_amount?: number;
  discount_amount?: number;
  coupon_code?: string | null;
  message?: string;
  return_code?: string;
  error?: {
    code?: string;
    message?: string;
  };
}

interface CouponValidationResult {
  success: boolean;
  valid: boolean;
  coupon_code: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  valid_until: string;
  message: string;
}

interface FunctionErrorLike {
  message?: string;
  context?: Response;
}

type CheckoutStep = "plans" | "payment" | "processing" | "success" | "error";

const EXPOLAZER_COUPON = "EXPOLAZER2026";
const MAX_STANDARD_INSTALLMENTS = 6;
const COMMERCIAL_PLAN_PRICES: Readonly<Record<string, number>> = Object.freeze({
  "6e18e621-f7ae-40bd-ad25-3818eaa51ba8": 600,
  "32fde0de-2cc7-4ca3-bc99-cd2062d89804": 299,
});

const digitsOnly = (value: string): string => value.replace(/\D/g, "");

const normalizeCouponCode = (value: string): string =>
  value.toUpperCase().replace(/\s+/g, "").slice(0, 40);

const formatCardNumber = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
};

const formatExpiry = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const passesLuhn = (value: string): boolean => {
  let sum = 0;
  let doubleDigit = false;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
};

const isFutureExpiry = (value: string): boolean => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) return false;
  const [month, shortYear] = value.split("/");
  const expiry = new Date(Date.UTC(2000 + Number(shortYear), Number(month), 1));
  const now = new Date();
  const currentMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  return expiry > currentMonth;
};

const parseFunctionError = async (
  error: unknown,
  fallback: string,
): Promise<string> => {
  const functionError = error as FunctionErrorLike | null;
  if (functionError?.context instanceof Response) {
    try {
      const body = (await functionError.context.clone().json()) as PaymentResult;
      return body.error?.message || body.message || functionError.message || fallback;
    } catch {
      return functionError.message || fallback;
    }
  }
  return functionError?.message || fallback;
};

const money = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [configuration, setConfiguration] =
    useState<PaymentConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<CheckoutStep>("plans");
  const [installments, setInstallments] = useState("1");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] =
    useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID()
  );

  const paymentReady = Boolean(
    configuration?.enabled &&
      configuration.configured &&
      configuration.environment_matches &&
      configuration.pv_matches &&
      configuration.pricing_mode_valid &&
      configuration.supported_methods.includes("credit_card"),
  );

  const maximumInstallments = useMemo(
    () =>
      couponResult
        ? 1
        : Math.max(
            1,
            Math.min(
              MAX_STANDARD_INSTALLMENTS,
              selectedPlan?.max_installments ?? 1,
            ),
          ),
    [couponResult, selectedPlan],
  );

  const payableAmount = couponResult?.final_amount ?? selectedPlan?.price ?? 0;

  useEffect(() => {
    let active = true;

    const loadCheckout = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          navigate(ROUTE_PATHS.LOGIN, { replace: true });
          return;
        }

        const [
          roleResponse,
          registrationResponse,
          plansResponse,
          configResponse,
        ] = await Promise.all([
          supabase
            .from("user_roles")
            .select("user_origin")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("user_extended_profile")
            .select(
              "profile_completed,phone,rg,cpf,street,number,neighborhood,city,state,zip_code,gender",
            )
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("course_plans")
            .select(
              "id,name,description,price,max_installments,requires_anapp_membership",
            )
            .eq("is_active", true)
            .order("price", { ascending: false }),
          supabase.functions.invoke("rede_charge", {
            body: { action: "configuration" },
          }),
        ]);

        if (roleResponse.error || registrationResponse.error) {
          throw new Error(
            "Não foi possível validar se o cadastro do aluno está completo.",
          );
        }
        const userOrigin = roleResponse.data?.user_origin || "new_student";
        const registration = registrationResponse.data;
        if (
          userOrigin === "new_student" &&
          (
            !registration?.profile_completed ||
            digitsOnly(registration.phone).length !== 11 ||
            !registration.rg ||
            digitsOnly(registration.cpf).length !== 11 ||
            !registration.street ||
            !registration.number ||
            !registration.neighborhood ||
            !registration.city ||
            !registration.state ||
            digitsOnly(registration.zip_code).length !== 8 ||
            !registration.gender
          )
        ) {
          navigate(ROUTE_PATHS.COMPLETE_REGISTRATION, { replace: true });
          return;
        }

        if (plansResponse.error) throw plansResponse.error;
        if (configResponse.error || !configResponse.data?.success) {
          throw new Error(
            await parseFunctionError(
              configResponse.error,
              "A configuração de pagamento não pôde ser validada.",
            ),
          );
        }
        if (!active) return;

        const availablePlans = (plansResponse.data ?? []).map((plan) => ({
          ...plan,
          price: Number(plan.price),
        }));
        const invalidPlan = availablePlans.find(
          (plan) =>
            COMMERCIAL_PLAN_PRICES[plan.id] === undefined ||
            plan.price !== COMMERCIAL_PLAN_PRICES[plan.id],
        );
        if (
          invalidPlan ||
          availablePlans.length !== Object.keys(COMMERCIAL_PLAN_PRICES).length
        ) {
          throw new Error(
            "Os valores comerciais do checkout estão inconsistentes. Nenhuma cobrança foi habilitada.",
          );
        }
        setPlans(availablePlans);
        setConfiguration(configResponse.data as PaymentConfiguration);
      } catch (error) {
        if (!active) return;
        setConfiguration(null);
        toast({
          title: "Checkout indisponível",
          description:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o checkout.",
          variant: "destructive",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadCheckout();
    return () => {
      active = false;
    };
  }, [navigate, toast]);

  const resetSensitiveFields = () => {
    setCardNumber("");
    setCardHolderName("");
    setCardExpiry("");
    setCardCvv("");
  };

  const selectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setInstallments("1");
    setCouponResult(null);
    setCouponError("");
  };

  const continueToPayment = () => {
    if (!selectedPlan || !paymentReady) return;
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateCoupon = async (code = couponCode) => {
    if (!selectedPlan) return;
    const normalizedCode = normalizeCouponCode(code);
    if (!normalizedCode) {
      setCouponResult(null);
      setCouponError("Informe o código do cupom.");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");
    setCouponResult(null);
    const { data, error } = await supabase.functions.invoke("rede_charge", {
      body: {
        action: "validate_coupon",
        plan_id: selectedPlan.id,
        coupon_code: normalizedCode,
      },
    });

    if (error) {
      setCouponError(
        await parseFunctionError(error, "Não foi possível validar o cupom."),
      );
      setValidatingCoupon(false);
      return;
    }

    const result = data as CouponValidationResult;
    if (!result.success || !result.valid) {
      setCouponError(result.message || "Cupom inválido ou indisponível.");
      setValidatingCoupon(false);
      return;
    }

    setCouponCode(result.coupon_code);
    setCouponResult(result);
    setInstallments("1");
    setValidatingCoupon(false);
  };

  const validateCard = (): string | null => {
    const number = digitsOnly(cardNumber);
    if (number.length < 13 || number.length > 19 || !passesLuhn(number)) {
      return "Confira o número do cartão.";
    }
    if (cardHolderName.trim().length < 3) {
      return "Informe o nome impresso no cartão.";
    }
    if (!isFutureExpiry(cardExpiry)) {
      return "Informe uma validade futura no formato MM/AA.";
    }
    if (!/^\d{3,4}$/.test(cardCvv)) {
      return "Confira o código de segurança.";
    }
    if (hasCoupon && !couponCode.trim()) {
      return "Informe o código do cupom ou desmarque a opção de cupom.";
    }
    if (hasCoupon && !couponResult) {
      return "Valide o cupom antes de concluir o pagamento.";
    }
    if (!termsAccepted) {
      return "Aceite os Termos de Uso e a Política de Privacidade.";
    }
    return null;
  };

  const handlePayment = async () => {
    if (!selectedPlan || !paymentReady) return;
    const validationMessage = validateCard();
    if (validationMessage) {
      toast({
        title: "Revise os dados",
        description: validationMessage,
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    setPaymentResult(null);

    const [expirationMonth, expirationYear] = cardExpiry.split("/");
    const { data, error } = await supabase.functions.invoke("rede_charge", {
      body: {
        action: "charge",
        plan_id: selectedPlan.id,
        installments: Number(installments),
        idempotency_key: idempotencyKey,
        payment_method: "credit_card",
        coupon_code: couponResult?.coupon_code ?? null,
        card: {
          number: digitsOnly(cardNumber),
          holder_name: cardHolderName.trim(),
          expiration_month: expirationMonth,
          expiration_year: expirationYear,
          security_code: cardCvv,
        },
      },
    });

    if (error) {
      const message = await parseFunctionError(
        error,
        "Não foi possível processar o pagamento.",
      );
      setCardCvv("");
      setPaymentResult({
        success: false,
        message,
      });
      setStep("error");
      return;
    }

    const result = data as PaymentResult;
    setPaymentResult(result);
    if (result.success) {
      resetSensitiveFields();
      setStep("success");
      toast({
        title: "Pagamento aprovado",
        description: "O acesso ao curso foi liberado.",
      });
      return;
    }

    setCardCvv("");
    setStep("error");
  };

  const retryPayment = () => {
    setPaymentResult(null);
    setIdempotencyKey(crypto.randomUUID());
    setStep("payment");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-20">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#0072BC]" />
          <p className="text-sm font-medium text-slate-600">
            Validando checkout seguro...
          </p>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-20">
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <CardContent className="px-8 py-10 text-center">
            <Loader2 className="mx-auto mb-5 h-14 w-14 animate-spin text-[#0072BC]" />
            <h1 className="mb-2 text-2xl font-semibold text-slate-900">
              Processando pagamento
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Não feche esta página. A confirmação e a liberação do acesso estão
              sendo conciliadas com a Rede.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-20">
        <Card className="w-full max-w-lg border-emerald-200 shadow-lg">
          <CardContent className="px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-700" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-slate-900">
              Pagamento aprovado
            </h1>
            <p className="mb-6 text-slate-600">
              Seu acesso ao CTP ANAPP foi liberado.
            </p>
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Plano</span>
                <span className="text-right font-medium text-slate-900">
                  {selectedPlan?.name}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Valor</span>
                <span className="font-semibold text-slate-900">
                  {paymentResult?.final_amount !== undefined
                    ? money(paymentResult.final_amount)
                    : selectedPlan
                      ? money(payableAmount)
                      : ""}
                </span>
              </div>
              {paymentResult?.coupon_code && (
                <>
                  <Separator className="my-3" />
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Cupom</span>
                    <span className="font-medium text-emerald-700">
                      {paymentResult.coupon_code}
                    </span>
                  </div>
                </>
              )}
              {paymentResult?.transaction_id && (
                <>
                  <Separator className="my-3" />
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Transação</span>
                    <span className="font-mono text-xs text-slate-700">
                      {paymentResult.transaction_id}
                    </span>
                  </div>
                </>
              )}
            </div>
            <Button
              className="w-full bg-[#0072BC] hover:bg-[#005a9e]"
              onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
            >
              Acessar o curso
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-20">
        <Card className="w-full max-w-lg border-red-200 shadow-lg">
          <CardContent className="px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-9 w-9 text-red-700" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-slate-900">
              Pagamento não concluído
            </h1>
            <p className="mb-6 text-sm leading-6 text-slate-600">
              {paymentResult?.message ||
                paymentResult?.error?.message ||
                "Não foi possível concluir esta tentativa."}
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-[#0072BC] hover:bg-[#005a9e]"
                onClick={retryPayment}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep("plans")}
              >
                Escolher outro plano
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <Button
          variant="ghost"
          className="mb-5 -ml-3 text-slate-600"
          onClick={
            step === "payment"
              ? () => setStep("plans")
              : () => navigate(ROUTE_PATHS.COURSES)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === "payment" ? "Voltar aos planos" : "Voltar aos cursos"}
        </Button>

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-[#0072BC] text-white hover:bg-[#0072BC]">
                Checkout seguro
              </Badge>
              {configuration?.environment === "sandbox" && (
                <Badge
                  variant="outline"
                  className="border-amber-300 bg-amber-50 text-amber-800"
                >
                  Ambiente de homologação
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              {step === "plans" ? "Escolha seu plano" : "Finalize sua inscrição"}
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              {step === "plans"
                ? "Compare as opções e escolha a condição correta para sua inscrição."
                : "Revise o pedido e informe os dados do cartão de crédito."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <span>Processamento protegido pela Rede Itaú</span>
          </div>
        </div>

        {!paymentReady && (
          <Alert className="mb-8 border-amber-300 bg-amber-50 text-amber-950">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pagamento temporariamente indisponível</AlertTitle>
            <AlertDescription>
              A configuração do meio de pagamento não respondeu corretamente.
              Nenhuma cobrança pode ser iniciada enquanto este estado persistir.
            </AlertDescription>
          </Alert>
        )}

        {step === "plans" && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {plans.map((plan) => {
                const selected = selectedPlan?.id === plan.id;
                const maxInstallments = Math.max(
                  1,
                  Math.min(
                    MAX_STANDARD_INSTALLMENTS,
                    plan.max_installments ?? 1,
                  ),
                );
                return (
                  <Card
                    key={plan.id}
                    className={`relative cursor-pointer overflow-hidden transition ${
                      selected
                        ? "border-[#0072BC] ring-2 ring-[#0072BC]/20"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                    onClick={() => selectPlan(plan)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl text-slate-950">
                            {plan.name}
                          </CardTitle>
                          <CardDescription className="mt-2 min-h-10 leading-5">
                            {plan.description}
                          </CardDescription>
                        </div>
                        <div
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-[#0072BC] bg-[#0072BC] text-white"
                              : "border-slate-300 bg-white text-transparent"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-5 flex items-end gap-2">
                        <span className="text-4xl font-semibold tracking-tight text-slate-950">
                          {money(plan.price)}
                        </span>
                        <span className="pb-1 text-sm text-slate-500">total</span>
                      </div>
                      <p className="mb-6 text-sm text-slate-600">
                        Até {maxInstallments}x de{" "}
                        <strong>{money(plan.price / maxInstallments)}</strong>{" "}
                        sem juros.
                      </p>
                      <div className="space-y-3 text-sm text-slate-700">
                        {[
                          "14 capítulos e materiais completos",
                          "Quizzes, provas e acompanhamento de progresso",
                          "Certificado digital após a conclusão",
                          "Checklist e calculadora técnica",
                        ].map((feature) => (
                          <div key={feature} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
              <div>
                <p className="font-medium text-slate-900">
                  {selectedPlan
                    ? `${selectedPlan.name} selecionado`
                    : "Selecione um plano para continuar"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Somente cartão de crédito está habilitado nesta integração.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full bg-[#0072BC] px-8 hover:bg-[#005a9e] sm:w-auto"
                disabled={!selectedPlan || !paymentReady}
                onClick={continueToPayment}
              >
                Continuar para pagamento
              </Button>
            </div>
          </>
        )}

        {step === "payment" && selectedPlan && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <CreditCard className="h-5 w-5 text-[#0072BC]" />
                  </div>
                  <div>
                    <CardTitle>Cartão de crédito</CardTitle>
                    <CardDescription>
                      Os dados não são armazenados no portal.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Número do cartão</Label>
                  <Input
                    id="card-number"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    maxLength={23}
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(event) =>
                      setCardNumber(formatCardNumber(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-holder">Nome impresso no cartão</Label>
                  <Input
                    id="card-holder"
                    autoComplete="cc-name"
                    maxLength={30}
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                    value={cardHolderName}
                    onChange={(event) =>
                      setCardHolderName(event.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="card-expiry">Validade</Label>
                    <Input
                      id="card-expiry"
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(event) =>
                        setCardExpiry(formatExpiry(event.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-cvv">Código de segurança</Label>
                    <Input
                      id="card-cvv"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="CVV"
                      type="password"
                      value={cardCvv}
                      onChange={(event) =>
                        setCardCvv(digitsOnly(event.target.value).slice(0, 4))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelamento</Label>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger id="installments">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: maximumInstallments },
                        (_, index) => index + 1,
                      ).map((quantity) => (
                        <SelectItem key={quantity} value={String(quantity)}>
                          {quantity}x de {money(payableAmount / quantity)}{" "}
                          sem juros
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="has-coupon"
                      checked={hasCoupon}
                      onCheckedChange={(checked) => {
                        const enabled = checked === true;
                        setHasCoupon(enabled);
                        if (!enabled) {
                          setCouponCode("");
                          setCouponResult(null);
                          setCouponError("");
                          setInstallments("1");
                        }
                      }}
                    />
                    <Label
                      htmlFor="has-coupon"
                      className="flex cursor-pointer items-center gap-2 font-medium text-slate-800"
                    >
                      <TicketPercent className="h-4 w-4 text-[#0072BC]" />
                      Tenho um cupom
                    </Label>
                  </div>

                  {hasCoupon && (
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          aria-label="Código do cupom"
                          autoComplete="off"
                          autoCapitalize="characters"
                          maxLength={40}
                          placeholder="Digite o código"
                          spellCheck={false}
                          value={couponCode}
                          onChange={(event) => {
                            const normalizedCode = normalizeCouponCode(
                              event.target.value,
                            );
                            setCouponCode(normalizedCode);
                            setCouponResult(null);
                            setCouponError("");
                            if (
                              normalizedCode === EXPOLAZER_COUPON &&
                              !validatingCoupon
                            ) {
                              void validateCoupon(normalizedCode);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0"
                          disabled={validatingCoupon || !couponCode.trim()}
                          onClick={() => void validateCoupon()}
                        >
                          {validatingCoupon && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Aplicar cupom
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        O código é convertido para maiúsculas e aplicado
                        automaticamente quando estiver completo.
                      </p>

                      {couponResult && (
                        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle>Cupom aplicado</AlertTitle>
                          <AlertDescription>
                            {couponResult.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      {couponError && (
                        <p className="text-sm font-medium text-red-700">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked === true)
                    }
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-6 text-slate-600"
                  >
                    Li e concordo com os{" "}
                    <a
                      href="/terms-of-use"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#0072BC] underline"
                    >
                      Termos de Uso
                    </a>{" "}
                    e a{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#0072BC] underline"
                    >
                      Política de Privacidade
                    </a>
                    .
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Resumo do pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-slate-900">{selectedPlan.name}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {selectedPlan.description}
                  </p>
                  <Separator className="my-5" />
                  {couponResult && (
                    <>
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-slate-500">Valor do plano</span>
                        <span className="text-slate-700 line-through">
                          {money(couponResult.original_amount)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between gap-4 text-sm">
                        <span className="text-emerald-700">
                          Cupom {couponResult.coupon_code}
                        </span>
                        <span className="font-medium text-emerald-700">
                          − {money(couponResult.discount_amount)}
                        </span>
                      </div>
                      <Separator className="my-5" />
                    </>
                  )}
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm text-slate-500">Total</span>
                    <span className="text-2xl font-semibold text-slate-950">
                      {money(payableAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-emerald-50/60 shadow-none">
                <CardContent className="space-y-3 p-5 text-sm text-emerald-950">
                  <div className="flex items-start gap-3">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Autenticação e cobrança executadas no servidor.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Valor confirmado pelo plano cadastrado no banco.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Proteção contra cobrança duplicada por tentativa.</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full bg-emerald-700 hover:bg-emerald-800"
                disabled={!paymentReady}
                onClick={handlePayment}
              >
                <LockKeyhole className="mr-2 h-4 w-4" />
                Pagar {money(payableAmount)}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
