# CTP ANAPP — backup integral do código recuperado, v69

Snapshot da aplicação recuperada no Skywork em 23/10/2026. O projeto está em
[`v69-2026-10-23/`](./v69-2026-10-23/), preservado sem alterações de conteúdo.
A aplicação antiga na raiz do repositório permanece intacta.

## Identificação

- Website ID: `019fb9b9-b873-7bdc-8fa9-2399c9f61b24`
- Versão recuperada e publicada: `69`
- Commit da publicação no Git interno do Skywork:
  `f46f294a225c359b557a7292bbd216f518839136`
- Revisão do código validado: `src_569a58f79af7`
- Projeto Supabase referenciado: `egihufoowzfykieozusr`
- Validação local do Website: aprovada, sem falhas ou avisos.
- O commit deste backup no GitHub é independente do commit interno do Skywork.

## Conteúdo

O snapshot inclui frontend, arquivos de backend presentes no pacote original,
componentes e páginas, assets estáticos, certificados/layouts, testes e scripts,
dependências declaradas e lockfiles, migrations SQL, funções Supabase e templates
de e-mail. A presença de um arquivo não significa que o serviço correspondente
foi validado em produção. O Website recuperado usa o modo frontend e o Supabase
externo existente.

As únicas exclusões do pacote de origem são os arquivos temporários em
`supabase/.temp/`. Não foram incluídos arquivos `.env`, credenciais do vault,
chaves privadas ou tokens privilegiados. A chave Supabase `anon` presente no
frontend é uma credencial pública da aplicação, não uma chave `service_role`.

## Verificação de integridade

Na raiz deste repositório, com Node.js instalado:

```sh
node backups/ctp-anapp/verify-backup.mjs
```

O comando compara tamanho e SHA-256 de todos os arquivos do snapshot com
[`v69-2026-10-23.manifest.json`](./v69-2026-10-23.manifest.json), identifica arquivos
ausentes, alterados e adicionais, e retorna código de saída diferente de zero
em caso de divergência. Não instala dependências nem acessa dados privados.

Para trabalhar no projeto recuperado, use a pasta `v69-2026-10-23/` como raiz
do projeto e consulte seu `AGENTS.md`, `README.md` e `package.json`. Não use a
aplicação antiga da raiz do repositório como se fosse a versão recuperada.
Não reaplique migrations automaticamente sobre o banco existente.

## Limites deste backup

Este é um backup integral **do código e dos assets contidos no pacote
recuperado**, não de toda a infraestrutura operacional:

- Não inclui dump dos dados Postgres, usuários Auth, progresso ou pagamentos.
- Não inclui objetos privados ou mídia hospedada no Supabase Storage.
- Não inclui segredos do Supabase, e.Rede, e-mail ou Skywork Vault.
- Não comprova o estado efetivamente implantado de funções, policies ou cron.
- Não recupera commits antigos ausentes, mudanças nunca salvas ou o histórico
  da conversa excluída no Skywork.

Esses elementos exigem um backup separado, privado e seguro do Supabase.
O repositório `tomqueiroz/ctpanapp2` é público: não envie dumps, dados pessoais
ou segredos para ele.
