import { auditoriaRepository } from '../repositories/auditoriaRepository.js';

export const auditoriaService = {
  registrar({ usuarioId = null, acao, referencia, detalhes = null, connection = null }) {
    return auditoriaRepository.registrar(
      { usuario_id: usuarioId, acao, referencia, detalhes },
      connection,
    );
  },

  listar(filtros) {
    return auditoriaRepository.listar(filtros);
  },
};
