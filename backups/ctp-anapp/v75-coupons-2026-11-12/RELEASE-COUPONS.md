# CTP ANAPP — cupons, versão 75 — 12/11/2026

## Publicação

- Website: `019fb9b9-b873-7bdc-8fa9-2399c9f61b24`.
- Artefato versão 75: `2120888084735221760`.
- Domínio: https://cursoanapp.org.br
- Domínio técnico: https://ctp-anapp-3.skywork.website
- Validação local final: `src_0d6456c57707`, zero falhas.

## Alterações

- Cadastro e edição de cupons para administradores e master admins.
- Validade manualmente editável no painel de cupons.
- Cupom dos novos cadastros de ex-alunos consultado no banco, sem código fixo no checkout.
- Não substituir silenciosamente a campanha mais recente por uma campanha antiga expirada/desativada.
- Contagem por identidade do cupom, inclusive registros históricos que tinham apenas o código.
- Receita contabiliza somente pagamentos aprovados; tentativas e recusas são separadas.
- Cupom original do pagamento preservado; reatribuição comercial usa campos separados e auditoria.
- Desativação/arquivamento de cupom sem apagar pagamentos anteriores.
- Prévia e confirmação de reatribuição de registros com cupom nas últimas 48 horas.
- Correção de referência a variável de cupom antes de sua inicialização no fluxo de cobrança.
- Classificação de ex-aluno não concede mais acesso gratuito automaticamente.

## Banco aplicado e conferido

Projeto Supabase: `egihufoowzfykieozusr`.

Executados em uma transação, após simulação com ROLLBACK:

1. `202611110001_require_paid_alumni_coupon.sql`
2. `202611120001_dynamic_coupon_reporting.sql`
3. `202611120002_anappfriday_valid_until_nov30.sql`

As três versões foram registradas no histórico de migrations após a execução.

**Não reaplicar** `202611110002_activate_anappfriday_preserve_history.sql`:
é um script preparado anteriormente e substituído pelas migrations acima.
Sua atualização em massa de perfis pendentes NÃO foi executada nesta entrega.
Não executar `db push --include-all` sem reconciliar os scripts históricos.

ANAPPFRIDAY:

- ID `2706b4c1-42e5-4dc8-a0c8-7cdd3284e954`.
- Ativo.
- Fim: `2026-12-01T02:59:59.999Z`, equivalente a 30/11/2026 23h59 em Brasília.
- Prazo explicitamente autorizado pelo proprietário.

EXPOLAZER2026: desativado, sem exclusão ou alteração de seus pagamentos originais.

Reatribuição aplicada:

- Janela UTC: `[2026-11-10T14:10:20.170117Z, 2026-11-12T14:10:20.170117Z)`.
- 31 registros de pagamento, 31 entradas de auditoria.
- Na conferência: 27 aprovados, R$ 810,00; 4 recusados.
- Zero perfis pendentes com cupom previamente preenchido elegíveis à reatribuição.
- Compras sem cupom não foram incluídas.
- Hash do conjunto original de pagamentos comparado antes/depois na transação,
  excluindo apenas os novos campos de atribuição e `updated_at`.
- Valores, status, cupom original e demais evidências financeiras preservados.
- A auditoria identifica execução pelo SQL Editor, sem atribuir falsamente uma
  identidade de administrador da aplicação ao operador do painel Supabase.

Os números acima são um recorte da operação; novas transações continuam ocorrendo.
Não são uma contagem de alunos únicos nem uma certificação de cobrança ponta a ponta.

## Edge Functions

Publicadas pelo editor autenticado do Supabase, preservando as configurações JWT:

- `admin_commercial_reports`
- `admin_manage_user`
- `rede_charge`
- `alumni_check_on_signup`

Para publicação pelo editor, os novos helpers de cupons foram incorporados ao
`index.ts` de cada função; os helpers existentes de origem/e-mail foram preservados.
Os fontes modulares equivalentes estão em `supabase/functions/`.

## Verificações

- `node --experimental-strip-types --test scripts/coupon-reporting.test.mjs`:
  três testes aprovados.
- `deno check` das quatro funções: aprovado.
- `skywork-cli website validate --gate local`: aprovado.
- Publicação do artefato e promoção explícita da versão 75: concluídas.
- GET do domínio principal: HTTP 200.

Nenhuma compra real ou usuário de teste foi criado para validação.

## Escopo deste backup

Snapshot completo do código da aplicação, assets públicos, migrations, funções,
testes, scripts e lockfile. Não contém chaves, `.env`, dados pessoais de alunos,
dependências instaladas, caches, diretórios privados ou dumps do banco.

O banco e o Storage do Supabase permanecem serviços externos; este commit não é
um dump integral desses serviços. Credenciais continuam fora do GitHub.
Para restaurar, configure-as por canal seguro e use o banco existente ou uma
restauração Supabase aprovada. Não reproduza reatribuições históricas sem prévia.
