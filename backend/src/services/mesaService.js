import { AppError } from '../utils/AppError.js';
import { mesaRepository } from '../repositories/mesaRepository.js';
import { auditoriaService } from './auditoriaService.js';
import { inteiroPositivo } from '../utils/validation.js';

const STATUS_PERMITIDOS = ['disponivel', 'ocupada', 'reservada'];

export const mesaService = {
  listar() {
    return mesaRepository.listar();
  },

  async buscarPorId(id) {
    const mesa = await mesaRepository.buscarPorId(id);
    if (!mesa) throw AppError.notFound('Mesa não encontrada.', 'MESA_NAO_ENCONTRADA');
    return mesa;
  },

  async criar(dados, usuarioId) {
    const numeroMesa = inteiroPositivo(dados.numero_mesa, 'numero_mesa');
    const capacidade = inteiroPositivo(dados.capacidade, 'capacidade');
    const status = dados.status || 'disponivel';
    if (!STATUS_PERMITIDOS.includes(status)) {
      throw AppError.badRequest('Status de mesa inválido.', 'STATUS_INVALIDO');
    }

    const id = await mesaRepository.criar({ numero_mesa: numeroMesa, capacidade, status });
    await auditoriaService.registrar({
      usuarioId,
      acao: 'Mesa cadastrada',
      referencia: `MESA-${numeroMesa}`,
      detalhes: `Mesa ${numeroMesa} criada com capacidade para ${capacidade} pessoas.`,
    });
    return this.buscarPorId(id);
  },

  async atualizar(id, dados, usuarioId) {
    const atual = await this.buscarPorId(id);
    if (dados.status && !STATUS_PERMITIDOS.includes(dados.status)) {
      throw AppError.badRequest('Status de mesa inválido.', 'STATUS_INVALIDO');
    }
    const alterado = await mesaRepository.atualizar(id, {
      numero_mesa: dados.numero_mesa ? inteiroPositivo(dados.numero_mesa, 'numero_mesa') : undefined,
      capacidade: dados.capacidade ? inteiroPositivo(dados.capacidade, 'capacidade') : undefined,
      status: dados.status,
    });
    if (!alterado) throw AppError.notFound('Mesa não encontrada.', 'MESA_NAO_ENCONTRADA');

    await auditoriaService.registrar({
      usuarioId,
      acao: 'Mesa atualizada',
      referencia: `MESA-${atual.numero_mesa}`,
      detalhes: `Dados da mesa ${atual.numero_mesa} foram alterados.`,
    });
    return this.buscarPorId(id);
  },

  async excluir(id, usuarioId) {
    const mesa = await this.buscarPorId(id);
    await mesaRepository.excluir(id);
    await auditoriaService.registrar({
      usuarioId,
      acao: 'Mesa excluída',
      referencia: `MESA-${mesa.numero_mesa}`,
      detalhes: `Mesa ${mesa.numero_mesa} removida da configuração.`,
    });
    return { id: Number(id), removido: true };
  },
};
