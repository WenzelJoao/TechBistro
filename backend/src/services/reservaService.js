import { withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { configuracaoRepository } from '../repositories/configuracaoRepository.js';
import { horarioRepository } from '../repositories/horarioRepository.js';
import { reservaRepository } from '../repositories/reservaRepository.js';
import { mesaRepository } from '../repositories/mesaRepository.js';
import { clienteRepository } from '../repositories/clienteRepository.js';
import { auditoriaService } from './auditoriaService.js';
import { gerarCodigoReserva } from '../utils/codigo.js';
import { normalizarTelefone, validarTelefone } from '../utils/telefone.js';
import {
  gerarLinkWhatsApp,
  mensagemConfirmacaoReserva,
} from '../utils/whatsapp.js';
import {
  combinarDataHora,
  dataAtualISO,
  diaDaSemana,
  gerarSlots,
  horaParaMinutos,
  intervalosSobrepostos,
  somarMinutos,
  validarDataISO,
  validarHora,
} from '../utils/date.js';
import { labelStatus } from '../utils/format.js';

const STATUS_ATIVOS = ['em_analise', 'confirmado'];

function validarEntradaDataPessoas(data, quantidadePessoas) {
  if (!validarDataISO(data)) {
    throw AppError.badRequest('Data inválida. Use o formato AAAA-MM-DD.', 'DATA_INVALIDA');
  }
  if (data < dataAtualISO()) {
    throw AppError.badRequest('Não é possível reservar para uma data passada.', 'DATA_PASSADA');
  }
  const pessoas = Number(quantidadePessoas);
  if (!Number.isInteger(pessoas) || pessoas < 1) {
    throw AppError.badRequest('Informe uma quantidade válida de pessoas.', 'QUANTIDADE_INVALIDA');
  }
  return pessoas;
}

/** Normaliza registros vindos do MySQL para um contrato estável de API. */
function formatarReserva(reserva) {
  return {
    ...reserva,
    data_reserva: String(reserva.data_reserva).slice(0, 10),
    hora_inicio: String(reserva.hora_inicio).slice(0, 5),
    hora_fim: String(reserva.hora_fim).slice(0, 5),
    qtd_pessoas: Number(reserva.qtd_pessoas),
    numero_mesa: Number(reserva.numero_mesa),
    status_label: labelStatus(reserva.status),
  };
}

function verificarPrazo(reserva, horasCancelamento) {
  if (!STATUS_ATIVOS.includes(reserva.status)) return false;
  const inicio = combinarDataHora(
    String(reserva.data_reserva).slice(0, 10),
    String(reserva.hora_inicio).slice(0, 5),
  );
  const limite = new Date(inicio.getTime() - Number(horasCancelamento) * 60 * 60 * 1000);
  return Date.now() < limite.getTime();
}

function verificarPropriedade(reserva, termo) {
  const termoLimpo = String(termo || '').trim();
  const codigoConfere = termoLimpo.toUpperCase() === reserva.codigo_reserva;
  const telefoneConfere =
    normalizarTelefone(termoLimpo).length >= 10 &&
    normalizarTelefone(termoLimpo) === normalizarTelefone(reserva.telefone);

  if (!codigoConfere && !telefoneConfere) {
    throw AppError.notFound(
      'Reserva não encontrada para o telefone ou código informado.',
      'RESERVA_NAO_ENCONTRADA',
    );
  }
}

function sugerirAlternativas(horarios, horaReferencia) {
  if (!horaReferencia) return horarios.filter((h) => h.disponivel).slice(0, 3);
  const referencia = horaParaMinutos(String(horaReferencia).slice(0, 5));
  return horarios
    .filter((horario) => horario.disponivel)
    .sort(
      (a, b) =>
        Math.abs(horaParaMinutos(a.hora) - referencia) -
        Math.abs(horaParaMinutos(b.hora) - referencia),
    )
    .slice(0, 3)
    .map(({ hora, mesa }) => ({
      hora,
      mesa_numero: mesa?.numero_mesa ?? null,
      mesa_capacidade: mesa?.capacidade ?? null,
    }));
}

/**
 * Regra central: par de mesas + capacidade global por faixa + bloqueio de 90 min.
 * Qualquer reserva ativa cujo intervalo [inicio, fim) cruze a faixa desejada
 * ocupa a mesa e conta pessoas no limite global do horário.
 */
async function calcularDisponibilidade(data, quantidadePessoas, excluirReservaId = null) {
  const pessoas = validarEntradaDataPessoas(data, quantidadePessoas);
  const [configuracao, horario] = await Promise.all([
    configuracaoRepository.buscar(),
    horarioRepository.buscarPorDia(diaDaSemana(data)),
  ]);

  if (!configuracao) {
    throw AppError.notFound('Configuração de reservas não encontrada.', 'CONFIG_AUSENTE');
  }
  if (!horario || !horario.ativo) {
    throw AppError.badRequest(
      'O TechBistro não está aberto neste dia. Escolha outra data.',
      'DIA_FECHADO',
    );
  }

  const duracao = Number(configuracao.duracao_reserva_minutos);
  const slots = gerarSlots(
    horario.hora_abertura,
    horario.hora_fechamento,
    duracao,
    Number(configuracao.intervalo_minutos),
  );
  const [reservas, mesas] = await Promise.all([
    reservaRepository.buscarAtivasPorData(data),
    mesaRepository.listar(),
  ]);

  const agora = new Date();
  const agoraMinutos = agora.getHours() * 60 + agora.getMinutes();
  const ehHoje = data === dataAtualISO();

  const horarios = slots.map((hora) => {
    const inicio = horaParaMinutos(hora);
    const fim = inicio + duracao;
    const conflitantes = reservas
      .filter((reserva) => Number(reserva.id) !== Number(excluirReservaId))
      .filter((reserva) =>
        intervalosSobrepostos(
          inicio,
          fim,
          horaParaMinutos(String(reserva.hora_inicio).slice(0, 5)),
          horaParaMinutos(String(reserva.hora_fim).slice(0, 5)),
        ),
      );

    const ocupantes = conflitantes.reduce(
      (total, reserva) => total + Number(reserva.qtd_pessoas),
      0,
    );
    const mesasOcupadas = new Set(conflitantes.map((reserva) => Number(reserva.mesa_id)));
    const mesasLivres = mesas
      .filter((mesa) => Number(mesa.capacidade) >= pessoas && !mesasOcupadas.has(Number(mesa.id)))
      .sort((a, b) => Number(a.capacidade) - Number(b.capacidade));
    const excedeuLimite = ocupantes + pessoas > Number(configuracao.capacidade_por_horario);
    const horarioPassou = ehHoje && inicio <= agoraMinutos;

    let motivo = null;
    if (horarioPassou) motivo = 'HORARIO_ENCERRADO';
    else if (excedeuLimite) motivo = 'LIMITE_ATINGIDO';
    else if (mesasLivres.length === 0) motivo = 'SEM_MESA';

    return {
      hora,
      hora_fim: somarMinutos(hora, duracao),
      disponivel: motivo === null,
      motivo,
      ocupantes,
      limite: Number(configuracao.capacidade_por_horario),
      mesa: mesasLivres[0]
        ? {
            id: Number(mesasLivres[0].id),
            numero_mesa: Number(mesasLivres[0].numero_mesa),
            capacidade: Number(mesasLivres[0].capacidade),
          }
        : null,
    };
  });

  return {
    data,
    pessoas,
    abertura: String(horario.hora_abertura).slice(0, 5),
    fechamento: String(horario.hora_fechamento).slice(0, 5),
    regras: {
      duracao_minutos: duracao,
      intervalo_minutos: Number(configuracao.intervalo_minutos),
      cancelamento_horas: Number(configuracao.cancelamento_horas),
      capacidade_por_horario: Number(configuracao.capacidade_por_horario),
    },
    horarios,
  };
}

export const reservaService = {
  calcularDisponibilidade,

  /** Consulta pública de disponibilidade para alimentar o wizard de reserva. */
  async verDisponibilidade(data, pessoas) {
    return calcularDisponibilidade(data, pessoas);
  },

  async criar(dados, usuarioId = null) {
    const {
      data_reserva: data,
      hora_inicio,
      qtd_pessoas: quantidadePessoas,
      nome_completo,
      telefone,
      cpf,
      observacoes,
    } = dados;

    if (!validarHora(String(hora_inicio || '').slice(0, 5))) {
      throw AppError.badRequest('Horário inválido.', 'HORA_INVALIDA');
    }
    if (!validarTelefone(telefone)) {
      throw AppError.badRequest('Informe um telefone com DDD válido.', 'TELEFONE_INVALIDO');
    }

    const hora = String(hora_inicio).slice(0, 5);
    const disponibilidade = await calcularDisponibilidade(data, quantidadePessoas);
    const opcao = disponibilidade.horarios.find((item) => item.hora === hora);

    if (!opcao) {
      throw AppError.badRequest(
        'Este horário não está dentro do funcionamento do restaurante.',
        'HORARIO_INVALIDO',
        { horarios_disponiveis: sugerirAlternativas(disponibilidade.horarios) },
      );
    }
    if (!opcao.disponivel) {
      const mensagem =
        opcao.motivo === 'LIMITE_ATINGIDO'
          ? 'Limite de agendamentos atingido para este horário.'
          : opcao.motivo === 'HORARIO_ENCERRADO'
            ? 'Este horário já passou. Escolha um horário posterior.'
            : 'Não há mesas disponíveis com a capacidade solicitada neste horário.';
      throw AppError.conflict(mensagem, opcao.motivo, {
        alternativas: sugerirAlternativas(disponibilidade.horarios, hora),
      });
    }

    const telefoneNormalizado = normalizarTelefone(telefone);
    const cpfNormalizado = cpf ? String(cpf).trim() || null : null;

    const id = await withTransaction(async (connection) => {
      let cliente = await clienteRepository.buscarPorTelefone(telefoneNormalizado, connection);
      if (cliente) {
        await clienteRepository.atualizar(cliente.id, { nome_completo, cpf: cpfNormalizado }, connection);
      } else {
        const clienteId = await clienteRepository.criar(
          { nome_completo, telefone: telefoneNormalizado, cpf: cpfNormalizado },
          connection,
        );
        cliente = { id: clienteId };
      }

      const codigo = gerarCodigoReserva(String(data).slice(0, 10));
      const reservaId = await reservaRepository.criar(
        {
          codigo_reserva: codigo,
          cliente_id: cliente.id,
          mesa_id: opcao.mesa.id,
          data_reserva: data,
          hora_inicio: `${hora}:00`,
          hora_fim: `${opcao.hora_fim}:00`,
          qtd_pessoas: disponibilidade.pessoas,
          status: 'em_analise',
          observacoes: observacoes || null,
        },
        connection,
      );

      await auditoriaService.registrar({
        usuarioId,
        acao: 'Reserva criada',
        referencia: codigo,
        detalhes: `Reserva para ${disponibilidade.pessoas} pessoa(s) na mesa ${opcao.mesa.numero_mesa} às ${hora}.`,
        connection,
      });

      return reservaId;
    });

    const criada = await reservaRepository.buscarPorId(id);
    return {
      ...formatarReserva(criada),
      prazo_cancelamento_horas: disponibilidade.regras.cancelamento_horas,
    };
  },

  /** Busca pública por telefone OU código de reserva. */
  async consultar(termo) {
    const termoLimpo = String(termo || '').trim();
    if (termoLimpo.length < 4) {
      throw AppError.badRequest('Informe o código da reserva ou um telefone válido.', 'TERMO_INVALIDO');
    }

    const { configuracao } = await configServiceBuscarRegras();
    let reservas = [];

    if (/^TB-/i.test(termoLimpo)) {
      const reserva = await reservaRepository.buscarPorCodigo(termoLimpo.toUpperCase());
      reservas = reserva ? [reserva] : [];
    } else if (normalizarTelefone(termoLimpo).length >= 10) {
      reservas = await reservaRepository.buscarPorTelefone(normalizarTelefone(termoLimpo));
    } else {
      throw AppError.badRequest('Informe o código da reserva ou um telefone válido.', 'TERMO_INVALIDO');
    }

    return reservas.map((reserva) => ({
      ...formatarReserva(reserva),
      pode_alterar: verificarPrazo(reserva, configuracao.cancelamento_horas),
      pode_cancelar: verificarPrazo(reserva, configuracao.cancelamento_horas),
    }));
  },

  async cancelarPublico(id, termo) {
    const reserva = await reservaRepository.buscarPorId(id);
    if (!reserva) throw AppError.notFound('Reserva não encontrada.', 'RESERVA_NAO_ENCONTRADA');
    verificarPropriedade(reserva, termo);

    const { configuracao } = await configServiceBuscarRegras();
    if (!verificarPrazo(reserva, configuracao.cancelamento_horas)) {
      throw AppError.conflict(
        `O prazo para cancelamento é de até ${configuracao.cancelamento_horas} hora(s) antes do horário reservado.`,
        'PRAZO_EXPIRADO',
      );
    }

    await withTransaction(async (connection) => {
      await reservaRepository.atualizarStatus(id, 'cancelado', connection);
      await auditoriaService.registrar({
        usuarioId: null,
        acao: 'Reserva cancelada pelo cliente',
        referencia: reserva.codigo_reserva,
        detalhes: 'Cancelamento realizado pela área pública.',
        connection,
      });
    });

    return formatarReserva({ ...reserva, status: 'cancelado' });
  },

  async alterarPublico(id, dados) {
    const { termo, data_reserva: data, hora_inicio, qtd_pessoas } = dados;
    const reserva = await reservaRepository.buscarPorId(id);
    if (!reserva) throw AppError.notFound('Reserva não encontrada.', 'RESERVA_NAO_ENCONTRADA');
    verificarPropriedade(reserva, termo);

    const { configuracao } = await configServiceBuscarRegras();
    if (!verificarPrazo(reserva, configuracao.cancelamento_horas)) {
      throw AppError.conflict(
        `Alterações só são permitidas até ${configuracao.cancelamento_horas} hora(s) antes do horário marcado.`,
        'PRAZO_EXPIRADO',
      );
    }

    const hora = String(hora_inicio || '').slice(0, 5);
    if (!validarHora(hora)) throw AppError.badRequest('Horário inválido.', 'HORA_INVALIDA');

    const disponibilidade = await calcularDisponibilidade(data, qtd_pessoas, reserva.id);
    const opcao = disponibilidade.horarios.find((item) => item.hora === hora);
    if (!opcao || !opcao.disponivel) {
      throw AppError.conflict('O novo horário não está disponível.', 'HORARIO_INDISPONIVEL', {
        alternativas: sugerirAlternativas(disponibilidade.horarios, hora),
      });
    }

    await withTransaction(async (connection) => {
      await reservaRepository.atualizarDados(
        id,
        {
          mesa_id: opcao.mesa.id,
          data_reserva: data,
          hora_inicio: `${hora}:00`,
          hora_fim: `${opcao.hora_fim}:00`,
          qtd_pessoas: disponibilidade.pessoas,
        },
        connection,
      );
      await auditoriaService.registrar({
        usuarioId: null,
        acao: 'Reserva alterada pelo cliente',
        referencia: reserva.codigo_reserva,
        detalhes: `Alterada para ${data} às ${hora}, mesa ${opcao.mesa.numero_mesa}.`,
        connection,
      });
    });

    const alterada = await reservaRepository.buscarPorId(id);
    return formatarReserva(alterada);
  },

  // -------------------------- ÁREA INTERNA --------------------------

  listarInterno(filtros) {
    return reservaRepository.listar(filtros).then((linhas) => linhas.map(formatarReserva));
  },

  buscarPorId(id) {
    return reservaRepository.buscarPorId(id).then((reserva) => {
      if (!reserva) throw AppError.notFound('Reserva não encontrada.', 'RESERVA_NAO_ENCONTRADA');
      return formatarReserva(reserva);
    });
  },

  /** Confirma a reserva e devolve o link wa.me com mensagem pré-formatada. */
  async confirmar(id, usuarioId) {
    const reserva = await reservaRepository.buscarPorId(id);
    if (!reserva) throw AppError.notFound('Reserva não encontrada.', 'RESERVA_NAO_ENCONTRADA');
    if (['cancelado', 'limite_atingido'].includes(reserva.status)) {
      throw AppError.badRequest('Não é possível confirmar uma reserva cancelada.', 'STATUS_INVALIDO');
    }

    const hora = String(reserva.hora_inicio).slice(0, 5);
    const primeiroNome = String(reserva.nome_completo).trim().split(/\s+/)[0];
    const mensagem = mensagemConfirmacaoReserva({
      nome: primeiroNome,
      data: String(reserva.data_reserva).slice(0, 10),
      hora,
      numeroMesa: reserva.numero_mesa,
      qtdPessoas: reserva.qtd_pessoas,
    });
    const whatsappLink = gerarLinkWhatsApp(reserva.telefone, mensagem);

    if (reserva.status !== 'confirmado') {
      await withTransaction(async (connection) => {
        await reservaRepository.atualizarStatus(id, 'confirmado', connection);
        await auditoriaService.registrar({
          usuarioId,
          acao: 'Reserva confirmada',
          referencia: reserva.codigo_reserva,
          detalhes: `Link de confirmação gerado para ${reserva.telefone}.`,
          connection,
        });
      });
    }

    return {
      ...formatarReserva({ ...reserva, status: 'confirmado' }),
      whatsapp_link: whatsappLink,
      mensagem_whatsapp: mensagem,
    };
  },

  async cancelar(id, usuarioId, motivo = null) {
    const reserva = await reservaRepository.buscarPorId(id);
    if (!reserva) throw AppError.notFound('Reserva não encontrada.', 'RESERVA_NAO_ENCONTRADA');
    if (reserva.status === 'cancelado') {
      throw AppError.badRequest('Esta reserva já está cancelada.', 'STATUS_INVALIDO');
    }

    await withTransaction(async (connection) => {
      await reservaRepository.atualizarStatus(id, 'cancelado', connection);
      await auditoriaService.registrar({
        usuarioId,
        acao: 'Reserva cancelada',
        referencia: reserva.codigo_reserva,
        detalhes: motivo || 'Cancelamento realizado pela equipe.',
        connection,
      });
    });

    return formatarReserva({ ...reserva, status: 'cancelado' });
  },

  async alterarMesa(id, mesaId, usuarioId) {
    const reserva = await reservaRepository.buscarPorId(id);
    if (!reserva) throw AppError.notFound('Reserva não encontrada.', 'RESERVA_NAO_ENCONTRADA');
    const mesa = await mesaRepository.buscarPorId(mesaId);
    if (!mesa) throw AppError.notFound('Mesa não encontrada.', 'MESA_NAO_ENCONTRADA');
    if (Number(mesa.capacidade) < Number(reserva.qtd_pessoas)) {
      throw AppError.badRequest('A mesa escolhida não comporta a quantidade de pessoas.', 'CAPACIDADE_INSUFICIENTE');
    }

    await withTransaction(async (connection) => {
      await reservaRepository.atualizarDados(id, {
        mesa_id: mesaId,
        data_reserva: reserva.data_reserva,
        hora_inicio: reserva.hora_inicio,
        hora_fim: reserva.hora_fim,
        qtd_pessoas: reserva.qtd_pessoas,
      }, connection);
      await auditoriaService.registrar({
        usuarioId,
        acao: 'Alteração de mesa',
        referencia: reserva.codigo_reserva,
        detalhes: `Mesa ${reserva.numero_mesa} → ${mesa.numero_mesa}.`,
        connection,
      });
    });

    return this.buscarPorId(id);
  },

  async excluir(id, usuarioId) {
    const reserva = await reservaRepository.buscarPorId(id);
    if (!reserva) throw AppError.notFound('Reserva não encontrada.', 'RESERVA_NAO_ENCONTRADA');

    await withTransaction(async (connection) => {
      await reservaRepository.excluir(id, connection);
      await auditoriaService.registrar({
        usuarioId,
        acao: 'Exclusão de reserva',
        referencia: reserva.codigo_reserva,
        detalhes: 'Registro histórico removido pelo administrador.',
        connection,
      });
    });
    return { id: Number(id), removido: true };
  },
};

// Mantém o service autocontido sem criar dependência circular com configService.
async function configServiceBuscarRegras() {
  const configuracao = await configuracaoRepository.buscar();
  if (!configuracao) {
    throw AppError.notFound('Configuração do sistema não encontrada.', 'CONFIG_AUSENTE');
  }
  return { configuracao };
}
