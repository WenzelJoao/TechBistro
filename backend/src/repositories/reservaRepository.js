import { getPool, query } from '../config/db.js';

const SELECT_RESERVA = `
  SELECT r.*,
         c.nome_completo, c.telefone, c.cpf,
         m.numero_mesa, m.capacidade AS mesa_capacidade
    FROM reservas r
    JOIN clientes c ON c.id = r.cliente_id
    JOIN mesas m ON m.id = r.mesa_id
`;

export const reservaRepository = {
  async listar({ data = null, status = null, limite = 200 } = {}) {
    const condicoes = [];
    const parametros = [];

    if (data) {
      condicoes.push('r.data_reserva = ?');
      parametros.push(data);
    }
    if (status) {
      condicoes.push('r.status = ?');
      parametros.push(status);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
    const sql = `${SELECT_RESERVA} ${where}
      ORDER BY r.data_reserva DESC, r.hora_inicio ASC, r.id DESC LIMIT ?`;
    return query(sql, [...parametros, Number(limite)]);
  },

  async buscarPorId(id) {
    const rows = await query(`${SELECT_RESERVA} WHERE r.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async buscarPorCodigo(codigo) {
    const rows = await query(`${SELECT_RESERVA} WHERE r.codigo_reserva = ? LIMIT 1`, [codigo]);
    return rows[0] || null;
  },

  async buscarPorTelefone(telefone) {
    return query(
      `${SELECT_RESERVA} WHERE c.telefone = ? ORDER BY r.data_reserva DESC, r.hora_inicio DESC LIMIT 50`,
      [telefone],
    );
  },

  /** Reservas ativas (em análise + confirmadas) que podem conflitar com um novo agendamento. */
  async buscarAtivasPorData(data, connection = null) {
    const db = connection || getPool();
    const [rows] = await db.execute(
      `SELECT id, mesa_id, hora_inicio, hora_fim, qtd_pessoas, codigo_reserva, status
         FROM reservas
        WHERE data_reserva = ? AND status IN ('em_analise', 'confirmado')`,
      [data],
    );
    return rows;
  },

  async criar(
    { codigo_reserva, cliente_id, mesa_id, data_reserva, hora_inicio, hora_fim, qtd_pessoas, status = 'em_analise', observacoes = null },
    connection = null,
  ) {
    const db = connection || getPool();
    const [result] = await db.execute(
      `INSERT INTO reservas
        (codigo_reserva, cliente_id, mesa_id, data_reserva, hora_inicio, hora_fim, qtd_pessoas, status, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_reserva, cliente_id, mesa_id, data_reserva, hora_inicio, hora_fim, qtd_pessoas, status, observacoes],
    );
    return result.insertId;
  },

  async atualizarStatus(id, status, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute('UPDATE reservas SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async atualizarDados(
    id,
    { mesa_id, data_reserva, hora_inicio, hora_fim, qtd_pessoas },
    connection = null,
  ) {
    const db = connection || getPool();
    const [result] = await db.execute(
      `UPDATE reservas
          SET mesa_id = ?, data_reserva = ?, hora_inicio = ?, hora_fim = ?, qtd_pessoas = ?
        WHERE id = ?`,
      [mesa_id, data_reserva, hora_inicio, hora_fim, qtd_pessoas, id],
    );
    return result.affectedRows > 0;
  },

  async excluir(id, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute('DELETE FROM reservas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async resumoPorStatus(dataInicio, dataFim) {
    return query(
      `SELECT status, COUNT(*) AS total, COALESCE(SUM(qtd_pessoas), 0) AS pessoas
         FROM reservas
        WHERE data_reserva BETWEEN ? AND ?
        GROUP BY status`,
      [dataInicio, dataFim],
    );
  },

  async fluxoPorData(dataInicio, dataFim) {
    return query(
      `SELECT data_reserva,
              COUNT(*) AS total,
              SUM(status = 'confirmado') AS confirmadas,
              SUM(status = 'em_analise') AS pendentes,
              SUM(status = 'cancelado') AS canceladas,
              COALESCE(SUM(qtd_pessoas), 0) AS pessoas
         FROM reservas
        WHERE data_reserva BETWEEN ? AND ?
        GROUP BY data_reserva
        ORDER BY data_reserva`,
      [dataInicio, dataFim],
    );
  },
};
