import { getPool, query } from '../config/db.js';

const SELECT = `
  SELECT l.*, u.nome AS usuario_nome, u.cargo AS usuario_cargo
    FROM logs_auditoria l
    LEFT JOIN usuarios u ON u.id = l.usuario_id
`;

export const auditoriaRepository = {
  async listar({ limite = 200, usuarioId = null, acao = null } = {}) {
    const condicoes = [];
    const parametros = [];

    if (usuarioId) {
      condicoes.push('l.usuario_id = ?');
      parametros.push(usuarioId);
    }
    if (acao) {
      condicoes.push('l.acao LIKE ?');
      parametros.push(`%${acao}%`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
    const sql = `${SELECT} ${where} ORDER BY l.data_hora DESC, l.id DESC LIMIT ?`;
    return query(sql, [...parametros, Number(limite)]);
  },

  async registrar({ usuario_id = null, acao, referencia, detalhes = null }, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      'INSERT INTO logs_auditoria (usuario_id, acao, referencia, detalhes) VALUES (?, ?, ?, ?)',
      [usuario_id, acao, referencia, detalhes],
    );
    return result.insertId;
  },
};
