import { query } from '../config/db.js';

export const dashboardRepository = {
  async indicadores(dataInicio, dataFim) {
    const [financeiro, clientes, agendamentos, hoje] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(valor_total), 0) AS faturamento,
                COUNT(*) AS comandas_fechadas
           FROM pedidos_comandas
          WHERE status = 'fechada' AND DATE(criado_em) BETWEEN ? AND ?`,
        [dataInicio, dataFim],
      ),
      query('SELECT COUNT(*) AS total FROM clientes'),
      query(
        `SELECT COUNT(*) AS total FROM reservas
          WHERE status = 'em_analise' AND data_reserva >= CURDATE()`,
      ),
      query(
        `SELECT COUNT(*) AS total, COALESCE(SUM(qtd_pessoas), 0) AS pessoas
           FROM reservas
          WHERE data_reserva = CURDATE() AND status IN ('em_analise', 'confirmado')`,
      ),
    ]);

    return {
      faturamento: Number(financeiro[0].faturamento),
      comandasFechadas: Number(financeiro[0].comandas_fechadas),
      totalClientes: Number(clientes[0].total),
      agendamentosPendentes: Number(agendamentos[0].total),
      reservasHoje: Number(hoje[0].total),
      pessoasHoje: Number(hoje[0].pessoas),
    };
  },

  async produtosMaisPedidos(dataInicio, dataFim) {
    return query(
      `SELECT p.nome, SUM(pi.quantidade) AS quantidade,
              SUM(pi.quantidade * pi.preco_unitario) AS total
         FROM pedido_itens pi
         JOIN pedidos_comandas pc ON pc.id = pi.pedido_id
         JOIN produtos p ON p.id = pi.produto_id
        WHERE pc.status = 'fechada' AND DATE(pc.criado_em) BETWEEN ? AND ?
        GROUP BY p.id
        ORDER BY quantidade DESC
        LIMIT 5`,
      [dataInicio, dataFim],
    );
  },
};
