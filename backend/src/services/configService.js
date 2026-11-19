import { AppError } from '../utils/AppError.js';
import { configuracaoRepository } from '../repositories/configuracaoRepository.js';
import { horarioRepository } from '../repositories/horarioRepository.js';
import { auditoriaService } from './auditoriaService.js';
import { validarHora } from '../utils/date.js';

export const configService = {
  async buscarRegras() {
    const [configuracao, horarios] = await Promise.all([
      configuracaoRepository.buscar(),
      horarioRepository.listar(),
    ]);
    if (!configuracao) throw AppError.notFound('Configuração do sistema não encontrada.', 'CONFIG_AUSENTE');
    return { configuracao, horarios };
  },

  async atualizarRegras(dados, usuarioId) {
    const {
      duracao_reserva_minutos,
      intervalo_minutos,
      cancelamento_horas,
      capacidade_por_horario,
      horarios,
    } = dados;

    for (const [campo, valor] of Object.entries({
      duracao_reserva_minutos,
      intervalo_minutos,
      cancelamento_horas,
      capacidade_por_horario,
    })) {
      if (valor !== undefined && (!Number.isFinite(Number(valor)) || Number(valor) <= 0)) {
        throw AppError.badRequest(`O campo ${campo} deve ser um número positivo.`, 'VALOR_INVALIDO');
      }
    }

    if (duracao_reserva_minutos !== undefined && intervalo_minutos !== undefined) {
      if (Number(intervalo_minutos) > Number(duracao_reserva_minutos)) {
        throw AppError.badRequest(
          'O intervalo entre horários não pode ser maior que a duração da reserva.',
          'CONFIG_INCONSISTENTE',
        );
      }
    }

    if (Array.isArray(horarios)) {
      for (const horario of horarios) {
        if (horario.hora_abertura && !validarHora(horario.hora_abertura)) {
          throw AppError.badRequest('Horário de abertura inválido.', 'HORA_INVALIDA');
        }
        if (horario.hora_fechamento && !validarHora(horario.hora_fechamento)) {
          throw AppError.badRequest('Horário de fechamento inválido.', 'HORA_INVALIDA');
        }
        if (
          horario.hora_abertura &&
          horario.hora_fechamento &&
          horario.hora_abertura.slice(0, 5) >= horario.hora_fechamento.slice(0, 5)
        ) {
          throw AppError.badRequest(
            'A abertura deve ser anterior ao fechamento.',
            'HORARIO_INCONSISTENTE',
          );
        }
        await horarioRepository.atualizar(horario.dia_semana, horario);
      }
    }

    await configuracaoRepository.atualizar(dados);
    await auditoriaService.registrar({
      usuarioId,
      acao: 'Configuração atualizada',
      referencia: 'SISTEMA',
      detalhes: 'Regras de reserva e/ou horários de funcionamento alteradas.',
    });

    return this.buscarRegras();
  },
};
