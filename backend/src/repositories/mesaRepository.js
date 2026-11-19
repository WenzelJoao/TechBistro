import { getPool, query } from '../config/db.js';

export const mesaRepository = {
  async listar() {
    return query('SELECT * FROM mesas ORDER BY numero_mesa');
  },

  async buscarPorId(id, connection = null) {
    const db = connection || getPool();
    const [rows] = await db.execute('SELECT * FROM mesas WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async buscarPorCapacidade(capacidadeMinima, connection = null) {
    const db = connection || getPool();
    const [rows] = await db.execute(
      'SELECT * FROM mesas WHERE capacidade >= ? ORDER BY capacidade ASC, numero_mesa ASC',
      [capacidadeMinima],
    );
    return rows;
  },

  async criar({ numero_mesa, capacidade, status = 'disponivel' }) {
    const [result] = await getPool().execute(
      'INSERT INTO mesas (numero_mesa, capacidade, status) VALUES (?, ?, ?)',
      [numero_mesa, capacidade, status],
    );
    return result.insertId;
  },

  async atualizar(id, { numero_mesa, capacidade, status }, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      `UPDATE mesas
          SET numero_mesa = COALESCE(?, numero_mesa),
              capacidade = COALESCE(?, capacidade),
              status = COALESCE(?, status)
        WHERE id = ?`,
      [numero_mesa ?? null, capacidade ?? null, status ?? null, id],
    );
    return result.affectedRows > 0;
  },

  async excluir(id) {
    const [result] = await getPool().execute('DELETE FROM mesas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
