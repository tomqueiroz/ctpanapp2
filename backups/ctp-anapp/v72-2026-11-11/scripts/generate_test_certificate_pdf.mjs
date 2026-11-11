import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";

const dependencyRoot = "/tmp/ctp-certificate-pdf/package.json";
const require = createRequire(dependencyRoot);
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const workspaceRoot = "/data/workspace/skywork/common_workspace";
const backgroundPath =
  `${workspaceRoot}/lms-portal-auth-rebuild-v25/apps/client/public/images/certificado-oficial-anapp-final-1584x1188.png`;
const outputPath =
  `${workspaceRoot}/artifacts/certificado-teste-joao-da-silva.pdf`;
const regularFontPath = "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf";
const boldFontPath = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf";

const width = 1584;
const height = 1188;
const black = rgb(17 / 255, 17 / 255, 17 / 255);

const pdf = await PDFDocument.create();
pdf.registerFontkit(fontkit);
const page = pdf.addPage([width, height]);
const [backgroundBytes, regularBytes, boldBytes] = await Promise.all([
  readFile(backgroundPath),
  readFile(regularFontPath),
  readFile(boldFontPath),
]);
const background = await pdf.embedPng(backgroundBytes);
const regular = await pdf.embedFont(regularBytes);
const bold = await pdf.embedFont(boldBytes);

page.drawImage(background, { x: 0, y: 0, width, height });

function drawCentered(text, centerX, centerY, size, font) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX - textWidth / 2,
    y: height - centerY - size * 0.38,
    size,
    font,
    color: black,
  });
}

drawCentered("JOÃO DA SILVA", 636, 569, 58, bold);
drawCentered("222.333.456-11", 838, 669, 31, regular);
drawCentered("São Paulo, 12 de dezembro de 2026.", 608, 883, 30, regular);

page.drawText("Registro: TESTE-CTP-2026-0001", {
  x: 78,
  y: 88,
  size: 18,
  font: regular,
  color: black,
});
page.drawText("Código de verificação: TESTE-SEM-VALIDADE", {
  x: 78,
  y: 53,
  size: 18,
  font: regular,
  color: black,
});
page.drawText("cursoanapp.org.br/verify-certificate", {
  x: 78,
  y: 21,
  size: 16,
  font: regular,
  color: black,
});
page.drawText("AMOSTRA DE TESTE — SEM VALIDADE", {
  x: 1260,
  y: 22,
  size: 12,
  font: regular,
  color: black,
});

await writeFile(outputPath, await pdf.save());
process.stdout.write(JSON.stringify({ ok: true, outputPath }));
