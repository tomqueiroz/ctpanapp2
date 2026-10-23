import { describe, expect, it } from 'vitest';
import {
  buildChecklistPdf,
  buildChecklistPdfFileName,
  type ChecklistPdfInput,
} from './checklist-pdf';

function makeInput(itemCount = 40): ChecklistPdfInput {
  return {
    client: {
      date: '2026-08-31',
      name: 'João da Silva',
      phone: '(11) 99999-0000',
      email: 'joao@example.test',
      address: 'Rua das Piscinas, 100, São Paulo/SP',
      notes: 'Serviço concluído e parâmetros conferidos.',
    },
    category: {
      title: 'Residencial',
      description: 'Uso intermitente',
      sections: [
        {
          title: 'Procedimentos',
          items: Array.from({ length: itemCount }, (_, index) => ({
            id: `item-${index}`,
            label: `Procedimento técnico número ${index + 1}`,
            tip: index % 4 === 0 ? 'Verifique o equipamento antes de continuar.' : undefined,
          })),
        },
      ],
    },
    checks: { 'item-0': true, 'item-3': true },
  };
}

describe('checklist PDF', () => {
  it('gera um PDF multipágina não vazio com todos os dados', () => {
    const pdf = buildChecklistPdf(makeInput());
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
    expect(pdf.output('arraybuffer').byteLength).toBeGreaterThan(2_000);
  });

  it('gera um nome de arquivo seguro e legível', () => {
    expect(buildChecklistPdfFileName(makeInput())).toBe(
      'Checklist-CTP-ANAPP-Joao-da-Silva-2026-08-31.pdf',
    );
  });
});
