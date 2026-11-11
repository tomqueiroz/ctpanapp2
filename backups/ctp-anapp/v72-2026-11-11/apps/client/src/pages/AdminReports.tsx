import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ROUTE_PATHS } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentReportRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  student_type: "alumni" | "current";
  alumni_type: string | null;
  is_anapp_member: boolean;
  has_access: boolean;
  enrollment_status: string;
  activated_at: string | null;
  payment_status: string;
  payment_method: string;
  payment_amount: number | null;
  payment_date: string | null;
  coupon_code: string | null;
  installments: number | null;
  progress_percentage: number;
  last_activity_at: string | null;
  learning_status:
    | "pending"
    | "in_progress"
    | "stopped"
    | "completed"
    | "certified";
  course_completed: boolean;
  certified: boolean;
  certificate_number: string | null;
  certificate_date: string | null;
  phone: string | null;
  rg: string | null;
  cpf: string | null;
  street: string | null;
  address_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  gender: string | null;
  registration_complete: boolean;
  missing_required_fields: string[];
}

interface Filters {
  search: string;
  date_from: string;
  date_to: string;
  payment_method: string;
  payment_status: string;
  student_type: string;
  learning_status: string;
  certification_status: string;
  registration_status: string;
}

const initialFilters: Filters = {
  search: "",
  date_from: "",
  date_to: "",
  payment_method: "all",
  payment_status: "all",
  student_type: "all",
  learning_status: "all",
  certification_status: "all",
  registration_status: "all",
};

const learningLabels: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  stopped: "Parou",
  completed: "Concluiu",
  certified: "Certificado",
};

const paymentLabels: Record<string, string> = {
  pix: "Chave PIX",
  chave_pix: "Chave PIX",
  credit_card: "Cartão de crédito",
  manual: "Manual",
  admin_free_access: "Acesso gratuito",
  alumni_free_access: "Acesso gratuito",
  legacy_free_access: "Acesso gratuito",
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Recusado",
  cancelled: "Cancelado",
  refunded: "Estornado",
  none: "Sem pagamento",
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("pt-BR") : "—";

const money = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);

const digitsOnly = (value: string | null) => (value ?? "").replace(/\D/g, "");

const formatCpf = (value: string | null) => {
  const digits = digitsOnly(value);
  return digits.length === 11
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : value || "—";
};

const formatPhone = (value: string | null) => {
  const digits = digitsOnly(value);
  return digits.length === 11
    ? digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    : value || "—";
};

const formatZipCode = (value: string | null) => {
  const digits = digitsOnly(value);
  return digits.length === 8
    ? digits.replace(/(\d{5})(\d{3})/, "$1-$2")
    : value || "—";
};

const genderLabels: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  prefiro_nao_informar: "Não informar",
};

const csvCell = (value: unknown) =>
  `"${String(value ?? "").split('"').join('""')}"`;

function downloadCsv(fileName: string, rows: unknown[][]) {
  const content = `\uFEFF${rows
    .map((row) => row.map(csvCell).join(";"))
    .join("\n")}`;
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AdminReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [rows, setRows] = useState<StudentReportRow[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadReport = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke(
        "admin_commercial_reports",
        {
          body: {
            action: "student_report",
            filters: nextFilters,
          },
        },
      );
      if (error) throw error;
      if (data?.success === false || data?.error) {
        throw new Error(data?.error || "Relatório recusado");
      }
      setRows((data.rows || []) as StudentReportRow[]);
      setPaymentMethods(data.available_payment_methods || []);
      setDefinitions(data.definitions || {});
    } catch (error: unknown) {
      toast({
        title: "Não foi possível carregar o relatório",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport(initialFilters);
  }, []);

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    void loadReport(initialFilters);
  };

  const exportRows = () => {
    downloadCsv(
      `alunos-ctp-anapp-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        [
          "Nome",
          "E-mail",
          "Telefone celular",
          "RG",
          "CPF",
          "Logradouro",
          "Número",
          "Complemento",
          "Bairro",
          "Cidade",
          "UF",
          "CEP",
          "Gênero",
          "Cadastro completo",
          "Campos pendentes",
          "Data de cadastro",
          "Tipo de aluno",
          "Classificação",
          "Associado ANAPP",
          "Acesso ativo",
          "Status da matrícula",
          "Meio de pagamento",
          "Status do pagamento",
          "Valor",
          "Data do pagamento",
          "Cupom",
          "Parcelas",
          "Progresso",
          "Situação acadêmica",
          "Última atividade",
          "Concluiu",
          "Certificado",
          "Número do certificado",
          "Data do certificado",
        ],
        ...rows.map((row) => [
          row.full_name,
          row.email,
          formatPhone(row.phone),
          row.rg,
          formatCpf(row.cpf),
          row.street,
          row.address_number,
          row.complement,
          row.neighborhood,
          row.city,
          row.state,
          formatZipCode(row.zip_code),
          genderLabels[row.gender || ""] || row.gender,
          row.registration_complete ? "Sim" : "Não",
          row.missing_required_fields.join(", "),
          formatDate(row.created_at),
          row.student_type === "alumni" ? "Ex-aluno" : "Aluno atual",
          row.alumni_type,
          row.is_anapp_member ? "Sim" : "Não",
          row.has_access ? "Sim" : "Não",
          row.enrollment_status,
          row.payment_method,
          paymentLabels[row.payment_status] || row.payment_status,
          row.payment_amount,
          formatDate(row.payment_date),
          row.coupon_code,
          row.installments,
          `${row.progress_percentage}%`,
          learningLabels[row.learning_status] || row.learning_status,
          formatDate(row.last_activity_at),
          row.course_completed ? "Sim" : "Não",
          row.certified ? "Sim" : "Não",
          row.certificate_number,
          row.certificate_date,
        ]),
      ],
    );
  };

  const counts = {
    alumni: rows.filter((row) => row.student_type === "alumni").length,
    current: rows.filter((row) => row.student_type === "current").length,
    completed: rows.filter((row) => row.course_completed).length,
    certified: rows.filter((row) => row.certified).length,
    stopped: rows.filter((row) => row.learning_status === "stopped").length,
    pending: rows.filter((row) => row.learning_status === "pending").length,
    completeRegistrations: rows.filter((row) => row.registration_complete)
      .length,
    incompleteRegistrations: rows.filter((row) => !row.registration_complete)
      .length,
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(ROUTE_PATHS.ADMIN)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao painel
        </Button>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              Relatório de alunos
            </h1>
            <p className="mt-2 text-slate-600">
              Filtre cadastros, pagamentos, origem, progresso e certificação.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
            <Button
              variant="outline"
              disabled={!rows.length}
              onClick={exportRows}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar CSV
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[
            ["Resultados", rows.length],
            ["Cadastros completos", counts.completeRegistrations],
            ["Cadastros incompletos", counts.incompleteRegistrations],
            ["Ex-alunos", counts.alumni],
            ["Alunos atuais", counts.current],
            ["Concluíram", counts.completed],
            ["Certificados", counts.certified],
            ["Parados / pendentes", counts.stopped + counts.pending],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              Os filtros são combinados e aplicados no servidor administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="report-search">
                  Nome, e-mail, CPF, RG ou celular
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="report-search"
                    className="pl-9"
                    value={filters.search}
                    onChange={(event) =>
                      setFilter("search", event.target.value)
                    }
                    placeholder="Buscar aluno ou documento..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-from">Cadastro a partir de</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.date_from}
                  onChange={(event) =>
                    setFilter("date_from", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">Cadastro até</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.date_to}
                  onChange={(event) =>
                    setFilter("date_to", event.target.value)
                  }
                />
              </div>
              <FilterSelect
                label="Situação do cadastro"
                value={filters.registration_status}
                onChange={(value) =>
                  setFilter("registration_status", value)
                }
                options={[
                  ["all", "Todos"],
                  ["complete", "Cadastro completo"],
                  ["incomplete", "Cadastro incompleto"],
                ]}
              />
              <FilterSelect
                label="Tipo de aluno"
                value={filters.student_type}
                onChange={(value) => setFilter("student_type", value)}
                options={[
                  ["all", "Todos"],
                  ["alumni", "Ex-alunos"],
                  ["current", "Alunos atuais"],
                ]}
              />
              <FilterSelect
                label="Situação acadêmica"
                value={filters.learning_status}
                onChange={(value) => setFilter("learning_status", value)}
                options={[
                  ["all", "Todas"],
                  ["pending", "Pendente"],
                  ["in_progress", "Em andamento"],
                  ["stopped", "Parou"],
                  ["completed", "Concluiu"],
                  ["certified", "Certificado"],
                ]}
              />
              <FilterSelect
                label="Certificação"
                value={filters.certification_status}
                onChange={(value) =>
                  setFilter("certification_status", value)
                }
                options={[
                  ["all", "Todos"],
                  ["certified", "Com certificado"],
                  ["not_certified", "Sem certificado"],
                ]}
              />
              <FilterSelect
                label="Status do pagamento"
                value={filters.payment_status}
                onChange={(value) => setFilter("payment_status", value)}
                options={[
                  ["all", "Todos"],
                  ["approved", "Aprovado"],
                  ["pending", "Pendente"],
                  ["rejected", "Recusado"],
                  ["cancelled", "Cancelado"],
                  ["refunded", "Estornado"],
                  ["none", "Sem pagamento"],
                ]}
              />
              <FilterSelect
                label="Meio de pagamento"
                value={filters.payment_method}
                onChange={(value) => setFilter("payment_method", value)}
                options={[
                  ["all", "Todos"],
                  ...paymentMethods.map(
                    (method): [string, string] => [
                      method,
                      paymentLabels[method] ||
                        (method === "none" ? "Sem pagamento" : method),
                    ],
                  ),
                ]}
              />
              <div className="flex items-end xl:col-span-2">
                <Button
                  className="w-full xl:w-auto"
                  disabled={loading}
                  onClick={() => void loadReport()}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#0072BC]" />
              Alunos encontrados ({rows.length})
            </CardTitle>
            <CardDescription>
              “Parou” significa mais de 30 dias sem atividade após iniciar.
              “Pendente” indica matrícula, acesso ou progresso ainda não
              iniciado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-16 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Montando relatório...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Documentos</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Certificado</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="py-12 text-center text-slate-500"
                        >
                          Nenhum aluno corresponde aos filtros.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="font-medium text-slate-950">
                              {row.full_name || "Nome não informado"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {row.email}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatPhone(row.phone)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-slate-700">
                              CPF {formatCpf(row.cpf)}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              RG {row.rg || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-56 text-xs text-slate-700">
                              {row.street
                                ? `${row.street}, ${row.address_number || "s/n"}`
                                : "Endereço não informado"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {[row.city, row.state].filter(Boolean).join("/") ||
                                "—"}{" "}
                              · {formatZipCode(row.zip_code)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.registration_complete
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {row.registration_complete
                                ? "Completo"
                                : "Incompleto"}
                            </Badge>
                            {!row.registration_complete &&
                              row.missing_required_fields.length > 0 && (
                                <div className="mt-1 max-w-48 text-xs text-amber-700">
                                  Falta:{" "}
                                  {row.missing_required_fields.join(", ")}
                                </div>
                              )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {row.student_type === "alumni"
                                ? "Ex-aluno"
                                : "Atual"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {paymentLabels[row.payment_status] ||
                                row.payment_status}
                            </div>
                            <div className="text-xs text-slate-500">
                              {row.payment_method === "none"
                                ? "Sem pagamento"
                                : `${paymentLabels[row.payment_method] || row.payment_method} · ${money(row.payment_amount)}`}
                            </div>
                            {row.coupon_code && (
                              <div className="text-xs font-medium text-[#0072BC]">
                                Cupom {row.coupon_code}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="min-w-36">
                            <div className="mb-1 flex justify-between text-xs">
                              <span>{row.progress_percentage}%</span>
                              <span className="text-slate-400">
                                {formatDate(row.last_activity_at)}
                              </span>
                            </div>
                            <Progress value={row.progress_percentage} />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.learning_status === "stopped" ||
                                row.learning_status === "pending"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {learningLabels[row.learning_status] ||
                                row.learning_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {row.certified ? (
                              <div>
                                <Badge>Certificado</Badge>
                                <div className="mt-1 text-xs text-slate-500">
                                  {row.certificate_number}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {formatDate(row.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {(definitions.stopped || definitions.pending) && (
          <div className="mt-4 text-xs text-slate-500">
            {definitions.stopped && <p>Parou: {definitions.stopped}.</p>}
            {definitions.pending && <p>Pendente: {definitions.pending}.</p>}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
