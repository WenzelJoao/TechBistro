import { formatarData, formatarDataHora, formatarMoeda, hojeISO } from './formatters.js';

const GRAFITE = [41, 43, 47];
const MARFIM = [242, 237, 227];
const DOURADO = [184, 149, 88];
const TEXTO = [70, 70, 70];

/** Gera um relatório gerencial em PDF diretamente no navegador (chunk carregado sob demanda). */
export async function exportarRelatorioPDF(resumo) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 16;

  // Cabeçalho institucional
  doc.setFillColor(...GRAFITE);
  doc.rect(0, 0, largura, 32, 'F');
  doc.setFillColor(...DOURADO);
  doc.rect(0, 32, largura, 1.2, 'F');
  doc.setTextColor(...MARFIM);
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text('TechBistro', margem, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DOURADO);
  doc.text('RELATÓRIO GERENCIAL • RESERVAS, FLUXO DE SALÃO E SERVIÇOS', margem, 23);
  doc.setTextColor(...MARFIM);
  doc.setFontSize(9);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, largura - margem, 16, { align: 'right' });
  doc.text(
    `Período: ${formatarData(resumo?.periodo?.dataInicio)} a ${formatarData(resumo?.periodo?.dataFim)}`,
    largura - margem,
    23,
    { align: 'right' },
  );

  let y = 42;

  function secao(titulo) {
    if (y > altura - 45) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...GRAFITE);
    doc.text(titulo, margem, y);
    y += 3;
    doc.setDrawColor(...DOURADO);
    doc.setLineWidth(0.6);
    doc.line(margem, y, largura - margem, y);
    y += 5;
  }

  function tabela(head, body, columnStyles = {}) {
    if (!body.length) body = [['—', '—', '—']];
    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      theme: 'grid',
      margin: { left: margem, right: margem },
      styles: { fontSize: 8, textColor: TEXTO, cellPadding: 2.2, valign: 'middle' },
      headStyles: {
        fillColor: GRAFITE,
        textColor: MARFIM,
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [250, 248, 244] },
      columnStyles,
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  const indicadores = resumo?.indicadores || {};
  secao('1. Indicadores consolidados');
  tabela(
    ['Indicador', 'Valor', 'Observação'],
    [
      ['Faturamento / serviços', formatarMoeda(indicadores.faturamento), `${indicadores.comandasFechadas || 0} comandas fechadas`],
      ['Clientes cadastrados', String(indicadores.totalClientes || 0), 'Base ativa de clientes'],
      ['Agendamentos pendentes', String(indicadores.agendamentosPendentes || 0), 'Aguardando confirmação'],
      ['Reservas para hoje', String(indicadores.reservasHoje || 0), `${indicadores.pessoasHoje || 0} pessoas previstas`],
    ],
    { 0: { cellWidth: 65 } },
  );

  secao('2. Reservas por status');
  tabela(
    ['Status', 'Reservas', 'Pessoas'],
    (resumo?.reservas_por_status || []).map((item) => [item.label, String(item.total), String(item.pessoas)]),
  );

  secao('3. Fluxo de salão por data');
  tabela(
    ['Data', 'Reservas', 'Confirmadas', 'Pendentes', 'Canceladas', 'Pessoas'],
    (resumo?.fluxo || []).map((item) => [
      formatarData(item.data),
      String(item.total),
      String(item.confirmadas),
      String(item.pendentes),
      String(item.canceladas),
      String(item.pessoas),
    ]),
  );

  secao('4. Produtos mais pedidos');
  tabela(
    ['Produto', 'Quantidade', 'Total registrado'],
    (resumo?.produtos_mais_pedidos || []).map((item) => [
      item.nome,
      String(item.quantidade),
      formatarMoeda(item.total),
    ]),
    { 0: { cellWidth: 90 } },
  );

  secao('5. Comandas do período');
  tabela(
    ['ID', 'Mesa', 'Responsável', 'Status', 'Abertura', 'Itens', 'Valor total'],
    (resumo?.comandas || []).map((item) => [
      `#${String(item.id).padStart(4, '0')}`,
      String(item.numero_mesa).padStart(2, '0'),
      item.funcionario_nome,
      item.status === 'fechada' ? 'Fechada' : 'Aberta',
      formatarDataHora(item.criado_em),
      String(item.itens),
      formatarMoeda(item.valor_total),
    ]),
  );

  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DOURADO);
    doc.text('TechBistro • Gestão de Bistrô', margem, altura - 8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Página ${pagina} de ${totalPaginas}`, largura - margem, altura - 8, { align: 'right' });
  }

  doc.save(`techbistro-relatorio-${hojeISO()}.pdf`);
}
