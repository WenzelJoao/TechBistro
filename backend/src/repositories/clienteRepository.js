import { getPool, query } from '../config/db.js';

export const clienteRepository = {
  async buscarPorId(id) {
    const rows = await query('SELECT * FROM clientes WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async buscarPorTelefone(telefone) {
    const rows = await query('SELECT * FROM clientes WHERE telefone = ? LIMIT 1', [telefone]);
    return rows[0] || null;
  },

  async listar() {
    return query('SELECT * FROM clientes ORDER BY nome_completo');
  },

  async contar() {
    const rows = await query('SELECT COUNT(*) AS total FROM clientes');
    return Number(rows[0].total);
  },

  async criar({ nome_completo, telefone, cpf }, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      'INSERT INTO clientes (nome_completo, telefone, cpf) VALUES (?, ?, ?)',
      [nome_completo, telefone, cpf || null],
    );
    return result.insertId;
  },

  async atualizar(id, { nome_completo, cpf }, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      `UPDATE clientes
          SET nome_completo = COALESCE(?, nome_completo),
              cpf = CASE WHEN ? IS NULL THEN cpf ELSE ? END
        WHERE id = ?`,
      [nome_completo ?? null, cpf ?? null, cpf ?? null, id],
    );
    return result.affectedRows > 0;
  },
};
