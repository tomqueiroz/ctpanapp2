/**
 * Utilitário para geração de PDFs com cabeçalho e rodapé padronizados
 * para apostilas do CTP ANAPP
 */

export const generateApostilaPDF = async (elementId, moduloNumero, moduloNome) => {
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error(`Elemento com ID "${elementId}" não encontrado`);
    }

    const opt = {
      margin: [0.8, 0.5, 0.8, 0.5], // top, right, bottom, left
      filename: `Apostila-CTP-Modulo-${moduloNumero}-${moduloNome}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Gerar o PDF
    const pdf = await html2pdf().set(opt).from(element).toPdf().get('pdf');
    
    const totalPages = pdf.internal.getNumberOfPages();
    
    // Adicionar cabeçalho e rodapé em cada página
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // ===== CABEÇALHO =====
      // Logo/Nome CTP
      pdf.setFontSize(11);
      pdf.setTextColor(0, 114, 188); // Azul CTP (#0072BC)
      pdf.setFont('helvetica', 'bold');
      pdf.text('CTP ANAPP', 0.5, 0.5);
      
      // Nome do Módulo
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Módulo ${moduloNumero} - ${moduloNome}`, 0.5, 0.65);
      
      // Linha decorativa do cabeçalho
      pdf.setDrawColor(0, 114, 188);
      pdf.setLineWidth(0.01);
      pdf.line(0.5, 0.75, 8, 0.75);
      
      // ===== RODAPÉ =====
      // Linha decorativa do rodapé
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.005);
      pdf.line(0.5, 10.55, 8, 10.55);
      
      // Aviso de direitos autorais
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Proibida a reprodução - Direitos Autorais Aplicáveis', 0.5, 10.7);
      
      // Numeração da página (alinhada à direita)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const pageText = `Página ${i} de ${totalPages}`;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const textWidth = pdf.getStringUnitWidth(pageText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
      pdf.text(pageText, pageWidth - textWidth - 0.5, 10.7);
    }
    
    // Salvar o PDF
    pdf.save(`Apostila-CTP-Modulo-${moduloNumero}-${moduloNome}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido ao gerar PDF' 
    };
  }
};

/**
 * Configurações padrão para os módulos
 */
export const MODULOS_CONFIG = {
  1: { nome: 'Calculos', titulo: 'Cálculos' },
  2: { nome: 'Volume-Capacidade', titulo: 'Volume e Capacidade' },
  3: { nome: 'Desinfeccao', titulo: 'Desinfecção e Produtos Químicos' },
  4: { nome: 'Produtos-Quimicos', titulo: 'Produtos Químicos' },
  5: { nome: 'Dosagem-Aplicacao', titulo: 'Dosagem e Aplicação' },
  6: { nome: 'Equilibrio-Agua', titulo: 'Equilíbrio da Água' },
  7: { nome: 'Filtracao-Circulacao', titulo: 'Filtração e Circulação' },
  8: { nome: 'Manutencao', titulo: 'Manutenção' },
  9: { nome: 'Seguranca-Normas', titulo: 'Segurança e Normas' },
  10: { nome: 'Problemas-Solucoes', titulo: 'Problemas e Soluções' },
  11: { nome: 'Atendimento-Cliente', titulo: 'Atendimento ao Cliente' },
  12: { nome: 'Sustentabilidade', titulo: 'Sustentabilidade' }
};
