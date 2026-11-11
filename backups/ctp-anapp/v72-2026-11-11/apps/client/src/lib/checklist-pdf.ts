import jsPDF from 'jspdf';

export interface ChecklistPdfItem {
  id: string;
  label: string;
  tip?: string;
}

export interface ChecklistPdfSection {
  title: string;
  items: ChecklistPdfItem[];
}

export interface ChecklistPdfInput {
  client: {
    date: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  };
  category: {
    title: string;
    description: string;
    sections: ChecklistPdfSection[];
  };
  checks: Record<string, boolean>;
}

const PAGE_MARGIN = 14;
const BRAND_BLUE = [0, 114, 188] as const;
const DARK_BLUE = [10, 25, 47] as const;
const ORANGE = [255, 107, 0] as const;
const TEXT = [31, 41, 55] as const;
const MUTED = [100, 116, 139] as const;

function formatBrazilianDate(value: string): string {
  if (!value) return 'Não informada';
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('pt-BR');
}

function safeFilePart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function buildChecklistPdfFileName(input: ChecklistPdfInput): string {
  const clientName = safeFilePart(input.client.name) || 'cliente';
  const date = safeFilePart(input.client.date) || new Date().toISOString().slice(0, 10);
  return `Checklist-CTP-ANAPP-${clientName}-${date}.pdf`;
}

export function buildChecklistPdf(input: ChecklistPdfInput): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  let y = 0;

  const drawPageHeader = () => {
    pdf.setFillColor(...DARK_BLUE);
    pdf.rect(0, 0, pageWidth, 28, 'F');
    pdf.setFillColor(...ORANGE);
    pdf.rect(0, 28, pageWidth, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(17);
    pdf.text('Checklist do Piscineiro', PAGE_MARGIN, 12);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Relatório de manutenção · CTP ANAPP', PAGE_MARGIN, 20);
    y = 38;
  };

  const addPage = () => {
    pdf.addPage();
    drawPageHeader();
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - 18) addPage();
  };

  const addField = (label: string, value: string) => {
    ensureSpace(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text(label.toUpperCase(), PAGE_MARGIN, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(...TEXT);
    const lines = pdf.splitTextToSize(value || 'Não informado', contentWidth);
    pdf.text(lines, PAGE_MARGIN, y + 5);
    y += 6 + lines.length * 4.2;
  };

  drawPageHeader();

  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(PAGE_MARGIN, y, contentWidth, 21, 2, 2, 'F');
  pdf.setTextColor(...BRAND_BLUE);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(input.category.title, PAGE_MARGIN + 4, y + 8);
  pdf.setTextColor(...MUTED);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(
    pdf.splitTextToSize(input.category.description, contentWidth - 8),
    PAGE_MARGIN + 4,
    y + 14,
  );
  y += 28;

  addField('Data', formatBrazilianDate(input.client.date));
  addField('Cliente', input.client.name);
  addField('Endereço', input.client.address);
  if (input.client.phone) addField('Celular', input.client.phone);
  if (input.client.email) addField('E-mail', input.client.email);
  y += 2;

  for (const section of input.category.sections) {
    ensureSpace(18);
    pdf.setFillColor(239, 246, 255);
    pdf.roundedRect(PAGE_MARGIN, y, contentWidth, 9, 1.5, 1.5, 'F');
    pdf.setTextColor(...BRAND_BLUE);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(section.title, PAGE_MARGIN + 3, y + 6);
    y += 13;

    for (const item of section.items) {
      const itemLines = pdf.splitTextToSize(item.label, contentWidth - 11);
      const tipLines = item.tip
        ? pdf.splitTextToSize(`Atenção: ${item.tip}`, contentWidth - 11)
        : [];
      const itemHeight = Math.max(7, itemLines.length * 4.2 + tipLines.length * 3.6 + 3);
      ensureSpace(itemHeight);

      const checked = Boolean(input.checks[item.id]);
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(0.35);
      pdf.rect(PAGE_MARGIN, y, 4, 4, 'S');
      if (checked) {
        pdf.setDrawColor(...ORANGE);
        pdf.setLineWidth(0.7);
        pdf.line(PAGE_MARGIN + 0.7, y + 2, PAGE_MARGIN + 1.7, y + 3.2);
        pdf.line(PAGE_MARGIN + 1.7, y + 3.2, PAGE_MARGIN + 3.5, y + 0.8);
      }

      pdf.setFont('helvetica', checked ? 'bold' : 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT);
      pdf.text(itemLines, PAGE_MARGIN + 7, y + 3.4);
      let textY = y + itemLines.length * 4.2 + 2.5;
      if (tipLines.length > 0) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7.5);
        pdf.setTextColor(...BRAND_BLUE);
        pdf.text(tipLines, PAGE_MARGIN + 7, textY);
        textY += tipLines.length * 3.6;
      }
      y = Math.max(y + itemHeight, textY + 2);
    }
    y += 3;
  }

  if (input.client.notes.trim()) {
    ensureSpace(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(...BRAND_BLUE);
    pdf.text('Anotações e ocorrências', PAGE_MARGIN, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...TEXT);
    const noteLines = pdf.splitTextToSize(input.client.notes.trim(), contentWidth);
    for (const line of noteLines) {
      ensureSpace(5);
      pdf.text(line, PAGE_MARGIN, y);
      y += 4.5;
    }
  }

  const pageCount = pdf.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdf.setPage(pageNumber);
    pdf.setDrawColor(226, 232, 240);
    pdf.line(PAGE_MARGIN, pageHeight - 13, pageWidth - PAGE_MARGIN, pageHeight - 13);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text(
      'Serviço realizado de acordo com as normas técnicas e boas práticas do CTP ANAPP.',
      PAGE_MARGIN,
      pageHeight - 8,
    );
    pdf.text(
      `Página ${pageNumber} de ${pageCount}`,
      pageWidth - PAGE_MARGIN,
      pageHeight - 8,
      { align: 'right' },
    );
  }

  return pdf;
}
