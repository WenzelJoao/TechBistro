import { getPool, query } from '../config/db.js';

export const produtoRepository = {
  async listar({ apenasAtivos = true, categoria = null, busca = null } = {}) {
    const condicoes = [];
    const parametros = [];

    if (apenasAtivos) condicoes.push('ativo = TRUE');
    if (categoria) {
      condicoes.push('categoria = ?');
      parametros.push(categoria);
    }
    if (busca) {
      condicoes.push('(nome LIKE ? OR descricao LIKE ?)');
      parametros.push(`%${busca}%`, `%${busca}%`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
    return query(`SELECT * FROM produtos ${where} ORDER BY categoria, nome`, parametros);
  },

  async buscarPorId(id) {
    const rows = await query('SELECT * FROM produtos WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async criar({ nome, descricao, categoria, preco, imagem_url = null, tags = null, ativo = true }) {
    const [result] = await getPool().execute(
      `INSERT INTO produtos (nome, descricao, categoria, preco, imagem_url, tags, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao, categoria, preco, imagem_url, tags, ativo],
    );
    return result.insertId;
  },

  async atualizar(id, { nome, descricao, categoria, preco, imagem_url, tags, ativo }) {
    const [result] = await getPool().execute(
      `UPDATE produtos
          SET nome = COALESCE(?, nome),
              descricao = COALESCE(?, descricao),
              categoria = COALESCE(?, categoria),
              preco = COALESCE(?, preco),
              imagem_url = CASE WHEN ? IS NULL THEN imagem_url ELSE ? END,
              tags = CASE WHEN ? IS NULL THEN tags ELSE ? END,
              ativo = COALESCE(?, ativo)
        WHERE id = ?`,
      [
        nome ?? null,
        descricao ?? null,
        categoria ?? null,
        preco ?? null,
        imagem_url ?? null,
        imagem_url ?? null,
        tags ?? null,
        tags ?? null,
        ativo ?? null,
        id,
      ],
    );
    return result.affectedRows > 0;
  },

  async desativar(id) {
    const [result] = await getPool().execute('UPDATE produtos SET ativo = FALSE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async excluir(id) {
    const [result] = await getPool().execute('DELETE FROM produtos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
