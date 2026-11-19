import { getPool, query } from '../config/db.js';

export const configuracaoRepository = {
  async buscar() {
    const rows = await query('SELECT * FROM configuracoes WHERE id = 1 LIMIT 1');
    return rows[0] || null;
  },

  async atualizar({ duracao_reserva_minutos, intervalo_minutos, cancelamento_horas, capacidade_por_horario }) {
    const [result] = await getPool().execute(
      `UPDATE configuracoes
          SET duracao_reserva_minutos = COALESCE(?, duracao_reserva_minutos),
              intervalo_minutos = COALESCE(?, intervalo_minutos),
              cancelamento_horas = COALESCE(?, cancelamento_horas),
              capacidade_por_horario = COALESCE(?, capacidade_por_horario)
        WHERE id = 1`,
      [
        duracao_reserva_minutos ?? null,
        intervalo_minutos ?? null,
        cancelamento_horas ?? null,
        capacidade_por_horario ?? null,
      ],
    );
    return result.affectedRows > 0;
  },
};
