import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  ".cache",
  "__pycache__",
]);
const ignoredExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".pyc",
  ".png",
  ".webp",
  ".woff",
  ".woff2",
  ".zip",
]);

const forbiddenLiterals = [
  {
    label: "domínio público legado",
    value: ["ctpanapp", "online"].join("."),
  },
  {
    label: "domínio técnico legado sem versão",
    value: ["ctpanapp", "skywork", "website"].join("."),
  },
  {
    label: "domínio técnico legado v2",
    value: ["ctp-anapp-2", "skywork", "website"].join("."),
  },
  {
    label: "domínio fictício de e-mail",
    value: ["example", "com"].join("."),
  },
  {
    label: "configuração legada de checkout fixo",
    value: ["erede", "public", "checkout", "amount"].join("_"),
  },
  {
    label: "método administrativo legado de teste",
    value: ["credit", "card", "admin", "live", "test"].join("_"),
  },
  {
    label: "migration legada de cobrança",
    value: ["public", "one", "real", "checkout"].join("_"),
  },
];

const forbiddenTechnicalOrigin = new RegExp(
  String.raw`https:\/\/(?:ctpanapp|ctp-anapp-(?!3(?:[./]|$))[^./]+)\.skywork\.website`,
  "i",
);
const forbiddenOneRealCopy = new RegExp(
  String.raw`R\$\s*1(?:[,.]00)?\b`,
  "i",
);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...await collectFiles(path));
      }
      continue;
    }
    if (entry.isFile() && !ignoredExtensions.has(extname(entry.name).toLowerCase())) {
      files.push(path);
    }
  }

  return files;
}

const violations = [];
for (const path of await collectFiles(projectRoot)) {
  const content = await readFile(path, "utf8").catch(() => "");
  const relativePath = path.slice(projectRoot.length + 1);

  for (const forbidden of forbiddenLiterals) {
    if (content.toLowerCase().includes(forbidden.value.toLowerCase())) {
      violations.push(`${relativePath}: ${forbidden.label}`);
    }
  }
  if (forbiddenTechnicalOrigin.test(content)) {
    violations.push(`${relativePath}: domínio técnico Skywork não autorizado`);
  }
  if (forbiddenOneRealCopy.test(content)) {
    violations.push(`${relativePath}: referência visual à cobrança legada`);
  }
}

if (violations.length > 0) {
  console.error("Referências proibidas encontradas:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Nenhuma URL ou domínio proibido foi encontrado.");
