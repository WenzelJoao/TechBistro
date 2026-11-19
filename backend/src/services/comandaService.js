import { withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { comandaRepository } from '../repositories/comandaRepository.js';
import { mesaRepository } from '../repositories/mesaRepository.js';
import { produtoRepository } from '../repositories/produtoRepository.js';
import { auditoriaService } from './auditoriaService.js';
import { inteiroPositivo } from '../utils/validation.js';

function formatar(comanda) {
  return {
    ...comanda,
    total_calculado: Number(comanda.total_calculado || 0),
    valor_total: Number(comanda.valor_total || 0),
    total_itens: Number(comanda.total_itens || 0),
  };
}

export const comandaService = {
  listar(status = null) {
    return comandaRepository.listar({ status }).then((linhas) => linhas.map(formatar));
  },

  async buscarComItens(id) {
    const comanda = await comandaRepository.buscarPorId(id);
    if (!comanda) throw AppError.notFound('Comanda não encontrada.', 'COMANDA_NAO_ENCONTRADA');
    const itens = await comandaRepository.buscarItens(id);
    return {
      ...formatar(comanda),
      itens: itens.map((item) => ({
        ...item,
        quantidade: Number(item.quantidade),
        preco_unitario: Number(item.preco_unitario),
        subtotal: Number(item.quantidade) * Number(item.preco_unitario),
      })),
      total_calculado: itens.reduce(
        (total, item) => total + Number(item.quantidade) * Number(item.preco_unitario),
        0,
      ),
    };
  },

  async abrir({ mesa_id }, funcionarioId) {
    const mesaId = inteiroPositivo(mesa_id, 'mesa_id');
    const mesa = await mesaRepository.buscarPorId(mesaId);
    if (!mesa) throw AppError.notFound('Mesa não encontrada.', 'MESA_NAO_ENCONTRADA');
    if (await comandaRepository.buscarAbertaPorMesa(mesaId)) {
      throw AppError.conflict('Já existe uma comanda aberta para esta mesa.', 'COMANDA_JA_ABERTA');
    }

    const id = await withTransaction(async (connection) => {
      const comandaId = await comandaRepository.criar(
        { mesa_id: mesaId, funcionario_id: funcionarioId },
        connection,
      );
      // Usar a MESMA conexão da transação: o INSERT acima bloqueia a linha da mesa
      // pela FK, e um UPDATE em outra conexão causaria espera mútua (deadlock).
      await mesaRepository.atualizar(mesaId, { status: 'ocupada' }, connection);
      await auditoriaService.registrar({
        usuarioId: funcionarioId,
        acao: 'Comanda aberta',
        referencia: `COM-${String(comandaId).padStart(4, '0')}`,
        detalhes: `Comanda aberta para a mesa ${mesa.numero_mesa}.`,
        connection,
      });
      return comandaId;
    });

    return this.buscarComItens(id);
  },

  async adicionarItem(id, { produto_id, quantidade }, funcionarioId) {
    const comanda = await comandaRepository.buscarPorId(id);
    if (!comanda) throw AppError.notFound('Comanda não encontrada.', 'COMANDA_NAO_ENCONTRADA');
    if (comanda.status !== 'aberta') {
      throw AppError.badRequest('Não é possível adicionar itens a uma comanda fechada.', 'COMANDA_FECHADA');
    }

    const produto = await produtoRepository.buscarPorId(produto_id);
    if (!produto || !produto.ativo) {
      throw AppError.notFound('Produto indisponível no cardápio.', 'PRODUTO_NAO_ENCONTRADO');
    }
    const qtd = inteiroPositivo(quantidade, 'quantidade');

    await withTransaction(async (connection) => {
      await comandaRepository.adicionarItem(
        { pedido_id: id, produto_id, quantidade: qtd, preco_unitario: produto.preco },
        connection,
      );
      await auditoriaService.registrar({
        usuarioId: funcionarioId,
        acao: 'Item adicionado à comanda',
        referencia: `COM-${String(id).padStart(4, '0')}`,
        detalhes: `${qtd}x ${produto.nome} na mesa ${comanda.numero_mesa}.`,
        connection,
      });
    });

    return this.buscarComItens(id);
  },

  async fechar(id, funcionarioId) {
    const comanda = await comandaRepository.buscarPorId(id);
    if (!comanda) throw AppError.notFound('Comanda não encontrada.', 'COMANDA_NAO_ENCONTRADA');
    if (comanda.status !== 'aberta') {
      throw AppError.badRequest('Esta comanda já foi fechada.', 'COMANDA_FECHADA');
    }

    const itens = await comandaRepository.buscarItens(id);
    if (!itens.length) {
      throw AppError.badRequest('Adicione ao menos um item antes de fechar a comanda.', 'COMANDA_VAZIA');
    }
    const total = itens.reduce(
      (soma, item) => soma + Number(item.quantidade) * Number(item.preco_unitario),
      0,
    );

    await withTransaction(async (connection) => {
      await comandaRepository.fechar(id, total.toFixed(2), connection);
      await mesaRepository.atualizar(comanda.mesa_id, { status: 'disponivel' }, connection);
      await auditoriaService.registrar({
        usuarioId: funcionarioId,
        acao: 'Comanda fechada',
        referencia: `COM-${String(id).padStart(4, '0')}`,
        detalhes: `Mesa ${comanda.numero_mesa} — total registrado R$ ${total.toFixed(2)}.`,
        connection,
      });
    });

    return this.buscarComItens(id);
  },

  async excluir(id, funcionarioId) {
    const comanda = await comandaRepository.buscarPorId(id);
    if (!comanda) throw AppError.notFound('Comanda não encontrada.', 'COMANDA_NAO_ENCONTRADA');

    await withTransaction(async (connection) => {
      await comandaRepository.excluir(id, connection);
      await auditoriaService.registrar({
        usuarioId: funcionarioId,
        acao: 'Exclusão de comanda',
        referencia: `COM-${String(id).padStart(4, '0')}`,
        detalhes: `Comanda da mesa ${comanda.numero_mesa} removida.`,
        connection,
      });
    });
    return { id: Number(id), removido: true };
  },
};
