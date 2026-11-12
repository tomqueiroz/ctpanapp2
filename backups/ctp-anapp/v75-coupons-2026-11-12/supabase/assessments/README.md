# Provas alinhadas às apostilas publicadas — 19/10/2026

Fonte de verdade: os PDFs retornados por `chapters.apostila_pdf_url`, não
anexos antigos nem planilhas de rascunho. Os 12 arquivos publicados diferem
dos anexos da revisão anterior. Os hashes estão em `20261019-sources.json`.

## Contrato

- Capítulos 1 a 12: dez questões por prova, cinco alternativas, uma correta.
- Final: dez questões integradas; as referências, incluindo duas questões
  transversais, abrangem os doze capítulos.
- Cada linha dos arquivos PSV registra a página física do PDF e um trecho
  literal que fundamenta a resposta. Os distratores foram revisados para não
  duplicar a resposta correta.
- Nota mínima atual: 70%. Capítulos 0, 13 e 14 seguem isentos.
- A final é liberada após as doze provas, respeitando aprovações históricas.
  Esta implantação não cria um requisito retroativo para certificados.

## Randomização e correção

`lms_get_exam_v2` randomiza a ordem das questões e as cinco alternativas no
servidor. A posição correta não se repete em duas questões consecutivas.
O cliente recebe somente textos e o mapeamento dos índices canônicos,
nunca o gabarito ou a explicação. A ordem permanece estável durante a
tentativa. `getDisplayOptions` não embaralha novamente.

`lms_submit_exam` corrige os índices canônicos no servidor e rejeita
respostas incompletas, índices inválidos, chaves extras ou versões
misturadas. Perguntas antigas ficam inativas, não são apagadas: tentativas
carregadas antes da troca continuam sendo corrigidas contra a sua versão.
Notas anteriores não são recalculadas. A melhor nota nunca é reduzida.

## Banco e auditoria

A migração `202610190001_current_pdf_exams_and_randomization.sql` é
transacional. Registra backup da base anterior e das funções alteradas em
`lms_assessment_release_audit` (sem acesso público), bem como contagens e
hashes completos das tabelas de histórico antes/depois. Qualquer divergência
faz abortar a implantação. Não sobrescrever uma versão já implantada para
futuras alterações: criar nova versão de banco e novos IDs de questão.

Os gabaritos e os backups não são acessíveis diretamente pelo navegador.
Conteúdo privado é entregue somente por RPC autenticada com validação do
acesso integral ao curso.

## QA específico

1. `python scripts/verify-assessment-bank.py <diretório-dos-pdfs-atuais>`
   valida contagens, alternativas e evidência em cada página.
2. `node --experimental-strip-types scripts/qa-exam-options.mjs`
   verifica todas as 120 permutações, 600 mapeamentos e estabilidade.
3. `20261019-qa.sql`, dentro de transação, testa 50 entregas de cada prova
   (650 entregas), não repetição consecutiva, mapeamento privado, correção
   com 100%, 70% e 60%, rejeição de entradas inválidas, provas legadas,
   pré-requisitos da final e bloqueio anônimo. Todos os dados de QA são
   desfeitos por `ROLLBACK TO SAVEPOINT`.
