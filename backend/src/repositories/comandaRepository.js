import { getPool, query } from '../config/db.js';

const SELECT_COMANDA = `
  SELECT pc.*,
         m.numero_mesa,
         u.nome AS funcionario_nome,
         COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0) AS total_calculado,
         COUNT(pi.id) AS total_itens
    FROM pedidos_comandas pc
    JOIN mesas m ON m.id = pc.mesa_id
    JOIN usuarios u ON u.id = pc.funcionario_id
    LEFT JOIN pedido_itens pi ON pi.pedido_id = pc.id
`;

export const comandaRepository = {
  async listar({ status = null, limite = 200 } = {}) {
    const where = status ? 'WHERE pc.status = ?' : '';
    const parametros = status ? [status, Number(limite)] : [Number(limite)];
    return query(
      `${SELECT_COMANDA} ${where} GROUP BY pc.id ORDER BY pc.criado_em DESC LIMIT ?`,
      parametros,
    );
  },

  async buscarPorId(id) {
    const rows = await query(`${SELECT_COMANDA} WHERE pc.id = ? GROUP BY pc.id LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async buscarAbertaPorMesa(mesaId) {
    const rows = await query(
      'SELECT * FROM pedidos_comandas WHERE mesa_id = ? AND status = ? LIMIT 1',
      [mesaId, 'aberta'],
    );
    return rows[0] || null;
  },

  async buscarItens(pedidoId) {
    return query(
      `SELECT pi.*, p.nome AS produto_nome, p.categoria
         FROM pedido_itens pi
         JOIN produtos p ON p.id = pi.produto_id
        WHERE pi.pedido_id = ?
        ORDER BY pi.id`,
      [pedidoId],
    );
  },

  async criar({ mesa_id, funcionario_id }, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      'INSERT INTO pedidos_comandas (mesa_id, funcionario_id, status) VALUES (?, ?, ?)',
      [mesa_id, funcionario_id, 'aberta'],
    );
    return result.insertId;
  },

  async adicionarItem({ pedido_id, produto_id, quantidade, preco_unitario }, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      `INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario)
       VALUES (?, ?, ?, ?)`,
      [pedido_id, produto_id, quantidade, preco_unitario],
    );
    return result.insertId;
  },

  async fechar(id, valorTotal, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      `UPDATE pedidos_comandas
          SET status = 'fechada', valor_total = ?, fechado_em = NOW()
        WHERE id = ?`,
      [valorTotal, id],
    );
    return result.affectedRows > 0;
  },

  async excluir(id, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute('DELETE FROM pedidos_comandas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async listarParaRelatorio(dataInicio, dataFim) {
    return query(
      `SELECT pc.id, m.numero_mesa, u.nome AS funcionario_nome,
              pc.status, pc.valor_total, pc.criado_em, pc.fechado_em,
              COUNT(pi.id) AS itens
         FROM pedidos_comandas pc
         JOIN mesas m ON m.id = pc.mesa_id
         JOIN usuarios u ON u.id = pc.funcionario_id
         LEFT JOIN pedido_itens pi ON pi.pedido_id = pc.id
        WHERE DATE(pc.criado_em) BETWEEN ? AND ?
        GROUP BY pc.id
        ORDER BY pc.criado_em DESC`,
      [dataInicio, dataFim],
    );
  },
};
