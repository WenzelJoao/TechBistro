import { dashboardRepository } from '../repositories/dashboardRepository.js';
import { reservaRepository } from '../repositories/reservaRepository.js';
import { comandaRepository } from '../repositories/comandaRepository.js';
import { validarDataISO } from '../utils/date.js';
import { AppError } from '../utils/AppError.js';
import { labelStatus } from '../utils/format.js';

function periodoPadrao() {
  const hoje = new Date();
  const passado = new Date(hoje);
  passado.setDate(hoje.getDate() - 30);
  const futuro = new Date(hoje);
  futuro.setDate(hoje.getDate() + 30);
  const iso = (data) => data.toISOString().slice(0, 10);
  return { dataInicio: iso(passado), dataFim: iso(futuro) };
}

export const dashboardService = {
  async resumo(dataInicio, dataFim) {
    const periodo = periodoPadrao();
    const inicio = dataInicio || periodo.dataInicio;
    const fim = dataFim || periodo.dataFim;

    if (!validarDataISO(inicio) || !validarDataISO(fim) || inicio > fim) {
      throw AppError.badRequest('Período informado é inválido.', 'PERIODO_INVALIDO');
    }

    const [indicadores, fluxo, statusReservas, produtos, comandas] = await Promise.all([
      dashboardRepository.indicadores(inicio, fim),
      reservaRepository.fluxoPorData(inicio, fim),
      reservaRepository.resumoPorStatus(inicio, fim),
      dashboardRepository.produtosMaisPedidos(inicio, fim),
      comandaRepository.listarParaRelatorio(inicio, fim),
    ]);

    return {
      periodo: { dataInicio: inicio, dataFim: fim },
      indicadores,
      fluxo: fluxo.map((item) => ({
        data: String(item.data_reserva).slice(0, 10),
        total: Number(item.total),
        confirmadas: Number(item.confirmadas),
        pendentes: Number(item.pendentes),
        canceladas: Number(item.canceladas),
        pessoas: Number(item.pessoas),
      })),
      reservas_por_status: statusReservas.map((item) => ({
        status: item.status,
        label: labelStatus(item.status),
        total: Number(item.total),
        pessoas: Number(item.pessoas),
      })),
      produtos_mais_pedidos: produtos.map((item) => ({
        nome: item.nome,
        quantidade: Number(item.quantidade),
        total: Number(item.total),
      })),
      comandas: comandas.map((item) => ({
        ...item,
        valor_total: Number(item.valor_total),
        itens: Number(item.itens),
      })),
    };
  },
};
