import { getPool, query } from '../config/db.js';

export const horarioRepository = {
  async listar() {
    return query('SELECT * FROM horarios_funcionamento ORDER BY dia_semana');
  },

  async buscarPorDia(diaSemana) {
    const rows = await query(
      'SELECT * FROM horarios_funcionamento WHERE dia_semana = ? LIMIT 1',
      [diaSemana],
    );
    return rows[0] || null;
  },

  async atualizar(diaSemana, { hora_abertura, hora_fechamento, ativo }) {
    const [result] = await getPool().execute(
      `UPDATE horarios_funcionamento
          SET hora_abertura = COALESCE(?, hora_abertura),
              hora_fechamento = COALESCE(?, hora_fechamento),
              ativo = COALESCE(?, ativo)
        WHERE dia_semana = ?`,
      [hora_abertura ?? null, hora_fechamento ?? null, ativo ?? null, diaSemana],
    );
    return result.affectedRows > 0;
  },
};
