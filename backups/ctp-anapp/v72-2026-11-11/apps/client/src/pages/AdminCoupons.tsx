import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  TicketPercent,
  Trash2,
  Users,
  XCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface CouponUsageSummary {
  attempts: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
  refunded: number;
  revenue: number;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  final_price: number;
  starts_at: string;
  ends_at: string;
  applies_to_plan_id: string | null;
  is_active: boolean;
  usage: CouponUsageSummary;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

interface CouponUsageRow {
  id: string;
  email: string;
  full_name: string;
  plan_name: string;
  status: string;
  amount: number;
  original_amount: number | null;
  discount_amount: number;
  installments: number | null;
  created_at: string;
  paid_at: string | null;
  payment_completed: boolean;
}

interface CouponForm {
  id?: string;
  code: string;
  description: string;
  final_price: string;
  starts_at: string;
  ends_at: string;
  applies_to_plan_id: string;
  is_active: boolean;
}

const emptySummary: CouponUsageSummary = {
  attempts: 0,
  approved: 0,
  pending: 0,
  rejected: 0,
  cancelled: 0,
  refunded: 0,
  revenue: 0,
};

const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

const toBrazilDateTime = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);
  const valueByPart = new Map(
    parts.map((part) => [part.type, part.value]),
  );
  return `${valueByPart.get("year")}-${valueByPart.get("month")}-${
    valueByPart.get("day")
  }T${valueByPart.get("hour")}:${valueByPart.get("minute")}`;
};

const fromBrazilDateTime = (
  value: string,
  endOfMinute = false,
): string =>
  new Date(
    `${value}:${endOfMinute ? "59.999" : "00"}-03:00`,
  ).toISOString();

const newCouponForm = (): CouponForm => {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  return {
    code: "",
    description: "",
    final_price: "",
    starts_at: toBrazilDateTime(start),
    ends_at: toBrazilDateTime(end),
    applies_to_plan_id: "all",
    is_active: true,
  };
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
      timeZone: BRAZIL_TIME_ZONE,
    })
    : "—";

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

export default function AdminCoupons() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CouponForm>(newCouponForm);
  const [usageOpen, setUsageOpen] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageRows, setUsageRows] = useState<CouponUsageRow[]>([]);
  const [usageCoupon, setUsageCoupon] = useState<Coupon | null>(null);

  const callFunction = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke(
      "admin_commercial_reports",
      { body },
    );
    if (error) throw error;
    if (data?.success === false || data?.error) {
      throw new Error(data?.error || "Operação administrativa recusada");
    }
    return data;
  };

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await callFunction({ action: "list_coupons" });
      setCoupons(
        ((data.coupons || []) as Coupon[]).map((coupon) => ({
          ...coupon,
          final_price: Number(coupon.final_price),
          usage: coupon.usage || emptySummary,
        })),
      );
      setPlans(
        ((data.plans || []) as Plan[]).map((plan) => ({
          ...plan,
          price: Number(plan.price),
        })),
      );
    } catch (error: unknown) {
      toast({
        title: "Não foi possível carregar os cupons",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  const activeCoupons = useMemo(
    () =>
      coupons.filter(
        (coupon) =>
          coupon.is_active && new Date(coupon.ends_at).getTime() > Date.now(),
      ).length,
    [coupons],
  );
  const totalApproved = useMemo(
    () =>
      coupons.reduce((sum, coupon) => sum + coupon.usage.approved, 0),
    [coupons],
  );
  const totalRevenue = useMemo(
    () =>
      coupons.reduce((sum, coupon) => sum + coupon.usage.revenue, 0),
    [coupons],
  );

  const openCreate = () => {
    setForm(newCouponForm());
    setFormOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setForm({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description || "",
      final_price: String(coupon.final_price),
      starts_at: toBrazilDateTime(coupon.starts_at),
      ends_at: toBrazilDateTime(coupon.ends_at),
      applies_to_plan_id: coupon.applies_to_plan_id || "all",
      is_active: coupon.is_active,
    });
    setFormOpen(true);
  };

  const saveCoupon = async () => {
    const price = Number(form.final_price.replace(",", "."));
    if (
      !form.code.trim() ||
      !Number.isFinite(price) ||
      !form.starts_at ||
      !form.ends_at
    ) {
      toast({
        title: "Dados incompletos",
        description: "Preencha código, valor e período de validade.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await callFunction({
        action: "upsert_coupon",
        coupon: {
          id: form.id,
          code: form.code.toUpperCase().replace(/\s+/g, ""),
          description: form.description,
          final_price: price,
          starts_at: fromBrazilDateTime(form.starts_at),
          ends_at: fromBrazilDateTime(form.ends_at, true),
          applies_to_plan_id:
            form.applies_to_plan_id === "all"
              ? null
              : form.applies_to_plan_id,
          is_active: form.is_active,
        },
      });
      setFormOpen(false);
      await loadCoupons();
      toast({
        title: form.id ? "Cupom atualizado" : "Cupom criado",
        description: "As regras comerciais já estão disponíveis no checkout.",
      });
    } catch (error: unknown) {
      toast({
        title: "Não foi possível salvar o cupom",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeCoupon = async (coupon: Coupon) => {
    if (
      !window.confirm(
        coupon.usage.attempts > 0
          ? "Este cupom possui histórico. Ele será desativado e preservado no relatório. Continuar?"
          : `Excluir definitivamente o cupom ${coupon.code}?`,
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const data = await callFunction({
        action: "delete_coupon",
        coupon: { id: coupon.id },
      });
      await loadCoupons();
      toast({
        title: data.archived ? "Cupom desativado" : "Cupom excluído",
        description:
          data.message ||
          "O cupom foi removido porque não possuía histórico de uso.",
      });
    } catch (error: unknown) {
      toast({
        title: "Não foi possível excluir",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openUsage = async (coupon: Coupon) => {
    setUsageCoupon(coupon);
    setUsageRows([]);
    setUsageOpen(true);
    setUsageLoading(true);
    try {
      const data = await callFunction({
        action: "coupon_usage",
        coupon: { id: coupon.id, code: coupon.code },
      });
      setUsageRows((data.usage || []) as CouponUsageRow[]);
    } catch (error: unknown) {
      toast({
        title: "Não foi possível carregar o relatório",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUsageLoading(false);
    }
  };

  const exportUsage = () => {
    if (!usageCoupon) return;
    downloadCsv(
      `uso-cupom-${usageCoupon.code}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        [
          "Cupom",
          "Nome",
          "E-mail",
          "Plano",
          "Status",
          "Pagamento concluído",
          "Valor original",
          "Desconto",
          "Valor cobrado",
          "Parcelas",
          "Data da tentativa",
          "Data do pagamento",
        ],
        ...usageRows.map((row) => [
          usageCoupon.code,
          row.full_name,
          row.email,
          row.plan_name,
          row.status,
          row.payment_completed ? "Sim" : "Não",
          row.original_amount,
          row.discount_amount,
          row.amount,
          row.installments,
          formatDate(row.created_at),
          formatDate(row.paid_at),
        ]),
      ],
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(ROUTE_PATHS.ADMIN)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao painel
        </Button>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              Cupons e campanhas
            </h1>
            <p className="mt-2 text-slate-600">
              Todos os Admins e Master Admins podem criar, editar, ativar,
              desativar e excluir cupons, além de acompanhar pagamentos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadCoupons()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo cupom
            </Button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Cupons cadastrados",
              value: coupons.length,
              icon: TicketPercent,
            },
            { label: "Ativos agora", value: activeCoupons, icon: CalendarDays },
            { label: "Pagamentos aprovados", value: totalApproved, icon: Users },
            {
              label: "Receita com cupons",
              value: money(totalRevenue),
              icon: CheckCircle2,
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {item.value}
                  </p>
                </div>
                <item.icon className="h-6 w-6 text-[#0072BC]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cupons cadastrados</CardTitle>
            <CardDescription>
              Cupons com histórico são desativados, não apagados, para preservar
              a auditoria financeira.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Carregando cupons...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cupom</TableHead>
                      <TableHead>Valor final</TableHead>
                      <TableHead>Vigência</TableHead>
                      <TableHead>Uso</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-12 text-center text-slate-500"
                        >
                          Nenhum cupom cadastrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell>
                            <div className="font-semibold text-slate-950">
                              {coupon.code}
                            </div>
                            <div className="max-w-xs text-xs text-slate-500">
                              {coupon.description || "Sem descrição"}
                            </div>
                            <Badge
                              className="mt-2"
                              variant={coupon.is_active ? "default" : "secondary"}
                            >
                              {coupon.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {money(coupon.final_price)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            <div>{formatDate(coupon.starts_at)}</div>
                            <div>até {formatDate(coupon.ends_at)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {coupon.usage.attempts} tentativa(s)
                            </div>
                            <div className="text-xs text-slate-500">
                              {coupon.usage.approved} aprovada(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" />
                              {coupon.usage.approved}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <XCircle className="h-3 w-3" />
                              {coupon.usage.rejected} recusada(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void openUsage(coupon)}
                              >
                                <Users className="mr-1 h-4 w-4" />
                                Relatório
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Editar ${coupon.code}`}
                                onClick={() => openEdit(coupon)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Excluir ${coupon.code}`}
                                disabled={saving}
                                onClick={() => void removeCoupon(coupon)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
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
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Editar cupom" : "Criar cupom"}
            </DialogTitle>
            <DialogDescription>
              O código será salvo em letras maiúsculas e validado no servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Código</Label>
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value
                      .toUpperCase()
                      .replace(/\s+/g, ""),
                  }))
                }
                placeholder="CUPOM2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-price">Valor final</Label>
              <Input
                id="coupon-price"
                inputMode="decimal"
                value={form.final_price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    final_price: event.target.value,
                  }))
                }
                placeholder="50,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-start">
                Início da validade — horário de Brasília
              </Label>
              <Input
                id="coupon-start"
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    starts_at: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-end">
                Fim da validade — horário de Brasília
              </Label>
              <Input
                id="coupon-end"
                type="datetime-local"
                value={form.ends_at}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    ends_at: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Plano elegível</Label>
              <Select
                value={form.applies_to_plan_id}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    applies_to_plan_id: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  {plans
                    .filter((plan) => plan.is_active)
                    .map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} · {money(plan.price)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="coupon-description">Descrição administrativa</Label>
              <Textarea
                id="coupon-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Campanha, evento ou condição comercial."
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
              <div>
                <Label htmlFor="coupon-active">Cupom ativo</Label>
                <p className="text-xs text-slate-500">
                  A vigência também é verificada em cada uso.
                </p>
              </div>
              <Switch
                id="coupon-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    is_active: checked,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={saving} onClick={() => void saveCoupon()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar cupom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={usageOpen} onOpenChange={setUsageOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              Uso do cupom {usageCoupon?.code ?? ""}
            </DialogTitle>
            <DialogDescription>
              Cada linha representa uma tentativa de pagamento registrada.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              variant="outline"
              disabled={!usageRows.length}
              onClick={exportUsage}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar CSV
            </Button>
          </div>
          <div className="max-h-[55vh] overflow-auto rounded-lg border">
            {usageLoading ? (
              <div className="flex justify-center py-16 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Carregando relatório...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Parcelas</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-slate-500"
                      >
                        Nenhuma tentativa registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usageRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">{row.full_name || "—"}</div>
                          <div className="text-xs text-slate-500">{row.email}</div>
                        </TableCell>
                        <TableCell>{row.plan_name || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.payment_completed ? "default" : "secondary"
                            }
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{money(row.amount)}</TableCell>
                        <TableCell>{row.installments || 1}x</TableCell>
                        <TableCell className="text-xs">
                          {formatDate(row.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
