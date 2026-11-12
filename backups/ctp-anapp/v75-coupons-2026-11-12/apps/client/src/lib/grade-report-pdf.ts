import jsPDF from "jspdf";
import type { GradeReport } from "@/lib";
import { COURSE_PASSING_SCORE_PERCENT } from "@/lib/course-requirements";

const PAGE_MARGIN = 16;
const FOOTER_HEIGHT = 14;
const BRAND_BLUE: [number, number, number] = [0, 114, 188];
const TEXT_COLOR: [number, number, number] = [24, 24, 27];
const MUTED_COLOR: [number, number, number] = [82, 82, 91];
const BORDER_COLOR: [number, number, number] = [212, 212, 216];

function normalizeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function formatScore(value: number): string {
  return `${normalizeNumber(value).toFixed(1).replace(".", ",")}%`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toLocaleDateString("pt-BR")
    : date.toLocaleDateString("pt-BR");
}

export function buildGradeReportFileName(report: GradeReport): string {
  const studentName = `${report.user.first_name} ${report.user.last_name}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `Boletim_CTP_ANAPP_${studentName || "Aluno"}.pdf`;
}

export function buildGradeReportPdf(report: GradeReport): jsPDF {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const bottomLimit = pageHeight - FOOTER_HEIGHT;
  const passingScore =
    Number.isFinite(report.passing_score) && report.passing_score > 0
      ? report.passing_score
      : COURSE_PASSING_SCORE_PERCENT;
  let y = PAGE_MARGIN;

  const drawHeader = () => {
    pdf.setFillColor(...BRAND_BLUE);
    pdf.rect(0, 0, pageWidth, 26, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Boletim de Notas", PAGE_MARGIN, 11);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(
      "Curso de Tratador de Piscinas - CTP ANAPP",
      PAGE_MARGIN,
      18,
    );
    pdf.setTextColor(...TEXT_COLOR);
    y = 34;
  };

  const addPage = () => {
    pdf.addPage();
    drawHeader();
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > bottomLimit) addPage();
  };

  const addSectionTitle = (title: string) => {
    ensureSpace(13);
    pdf.setFillColor(239, 246, 255);
    pdf.roundedRect(PAGE_MARGIN, y, contentWidth, 9, 1.5, 1.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...BRAND_BLUE);
    pdf.text(title, PAGE_MARGIN + 3, y + 6);
    pdf.setTextColor(...TEXT_COLOR);
    y += 13;
  };

  const addLabelValue = (label: string, value: string) => {
    ensureSpace(9);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...MUTED_COLOR);
    pdf.text(label, PAGE_MARGIN, y);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...TEXT_COLOR);
    pdf.text(value || "Não informado", PAGE_MARGIN, y + 5);
    y += 10;
  };

  drawHeader();

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED_COLOR);
  pdf.text(
    `Relatório gerado em ${formatDate(report.generated_at)}`,
    pageWidth - PAGE_MARGIN,
    31,
    { align: "right" },
  );

  addSectionTitle("Dados do aluno");
  addLabelValue(
    "Nome completo",
    `${report.user.first_name} ${report.user.last_name}`.trim(),
  );
  addLabelValue("CPF", report.user.cpf);
  addLabelValue("Status", report.is_certified ? "Certificado" : "Em andamento");

  addSectionTitle("Resumo geral");
  const totalChapters = Math.max(0, normalizeNumber(report.total_chapters));
  const completedChapters = Math.max(
    0,
    normalizeNumber(report.completed_chapters),
  );
  const progress =
    totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

  const columnGap = 4;
  const columnWidth = (contentWidth - columnGap * 2) / 3;
  const summaries = [
    ["Média final", formatScore(report.average_score)],
    ["Provas aprovadas", `${completedChapters}/${totalChapters}`],
    ["Progresso", formatScore(progress)],
  ];

  ensureSpace(24);
  summaries.forEach(([label, value], index) => {
    const x = PAGE_MARGIN + index * (columnWidth + columnGap);
    pdf.setDrawColor(...BORDER_COLOR);
    pdf.roundedRect(x, y, columnWidth, 20, 1.5, 1.5, "S");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...TEXT_COLOR);
    pdf.text(value, x + columnWidth / 2, y + 9, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED_COLOR);
    pdf.text(label, x + columnWidth / 2, y + 15, { align: "center" });
  });
  y += 25;

  addSectionTitle("Notas por capítulo");

  if (report.chapters.length === 0) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...MUTED_COLOR);
    pdf.text("Nenhuma prova realizada até o momento.", PAGE_MARGIN, y);
    y += 8;
  } else {
    report.chapters.forEach((chapter) => {
      const isApproved =
        chapter.is_approved ??
        chapter.best_score >= passingScore;
      const title = `Capítulo ${chapter.chapter_number} - ${chapter.chapter_title}`;
      const titleLines = pdf.splitTextToSize(title, contentWidth - 44);
      const rowHeight = Math.max(17, titleLines.length * 5 + 8);
      ensureSpace(rowHeight + 3);

      pdf.setDrawColor(...BORDER_COLOR);
      pdf.roundedRect(
        PAGE_MARGIN,
        y,
        contentWidth,
        rowHeight,
        1.5,
        1.5,
        "S",
      );
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_COLOR);
      pdf.text(titleLines, PAGE_MARGIN + 3, y + 6);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...MUTED_COLOR);
      pdf.text(
        `${Math.max(0, normalizeNumber(chapter.attempts))} tentativa(s)`,
        PAGE_MARGIN + 3,
        y + rowHeight - 4,
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...TEXT_COLOR);
      pdf.text(
        formatScore(chapter.best_score),
        pageWidth - PAGE_MARGIN - 4,
        y + 8,
        { align: "right" },
      );
      pdf.setFontSize(8);
      if (isApproved) {
        pdf.setTextColor(22, 101, 52);
      } else {
        pdf.setTextColor(185, 28, 28);
      }
      pdf.text(
        chapter.historically_approved
          ? "Aprovação histórica"
          : isApproved
            ? "Aprovado"
            : "Pendente",
        pageWidth - PAGE_MARGIN - 4,
        y + 13,
        { align: "right" },
      );
      y += rowHeight + 3;
    });
  }

  if (report.final_exam) {
    const finalExam = report.final_exam;
    addSectionTitle("Prova final - revisão integrada");
    addLabelValue(
      "Melhor nota",
      finalExam.attempts_count > 0 ? formatScore(finalExam.best_score) : "Ainda não realizada",
    );
    addLabelValue(
      "Situação",
      finalExam.is_approved ? "Aprovado" : finalExam.attempts_count > 0 ? "Pendente de aprovação" : "Sem tentativa",
    );
    addLabelValue("Tentativas", String(finalExam.attempts_count));
  }

  if (report.is_certified) {
    ensureSpace(24);
    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(134, 239, 172);
    pdf.roundedRect(PAGE_MARGIN, y, contentWidth, 20, 1.5, 1.5, "FD");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(22, 101, 52);
    pdf.text(
      "Parabéns! Você concluiu todas as provas e conquistou a Certificação CTP ANAPP.",
      PAGE_MARGIN + 4,
      y + 8,
      { maxWidth: contentWidth - 8 },
    );
    y += 24;
  }

  const pageCount = pdf.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdf.setPage(pageNumber);
    pdf.setDrawColor(...BORDER_COLOR);
    pdf.line(
      PAGE_MARGIN,
      pageHeight - 11,
      pageWidth - PAGE_MARGIN,
      pageHeight - 11,
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED_COLOR);
    pdf.text(
      "Documento acadêmico do Curso de Tratador de Piscinas CTP ANAPP.",
      PAGE_MARGIN,
      pageHeight - 6,
    );
    pdf.text(
      `Página ${pageNumber} de ${pageCount}`,
      pageWidth - PAGE_MARGIN,
      pageHeight - 6,
      { align: "right" },
    );
  }

  return pdf;
}

export function downloadGradeReportPdf(report: GradeReport): void {
  const pdf = buildGradeReportPdf(report);
  const objectUrl = URL.createObjectURL(pdf.output("blob"));
  const downloadLink = document.createElement("a");
  downloadLink.href = objectUrl;
  downloadLink.download = buildGradeReportFileName(report);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
}
