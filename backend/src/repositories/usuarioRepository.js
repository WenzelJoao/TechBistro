import { getPool, query } from '../config/db.js';

/**
 * Acesso a dados de usuários.
 * Todos os SELECT públicos omitem deliberadamente `senha_hash`.
 * Os métodos de escrita aceitam uma `connection` opcional para participar
 * da mesma transação usada pelo service (INSERT + auditoria atômicos).
 */
export const usuarioRepository = {
  async buscarPorEmail(email, connection = null) {
    const db = connection || getPool();
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async buscarPorId(id, connection = null) {
    const db = connection || getPool();
    const [rows] = await db.execute(
      'SELECT id, nome, email, cargo, criado_em FROM usuarios WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] || null;
  },

  async listar() {
    return query('SELECT id, nome, email, cargo, criado_em FROM usuarios ORDER BY nome');
  },

  async criar({ nome, email, senha_hash, cargo }, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)',
      [nome, email, senha_hash, cargo],
    );
    return result.insertId;
  },

  async atualizar(id, { nome, email, cargo, senha_hash }, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute(
      `UPDATE usuarios
          SET nome = COALESCE(?, nome),
              email = COALESCE(?, email),
              cargo = COALESCE(?, cargo),
              senha_hash = COALESCE(?, senha_hash)
        WHERE id = ?`,
      [nome ?? null, email ?? null, cargo ?? null, senha_hash ?? null, id],
    );
    return result.affectedRows > 0;
  },

  async excluir(id, connection = null) {
    const db = connection || getPool();
    const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
