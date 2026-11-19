import { AppError } from '../utils/AppError.js';
import { produtoRepository } from '../repositories/produtoRepository.js';
import { auditoriaService } from './auditoriaService.js';
import { normalizarTags } from '../utils/format.js';

function formatar(produto) {
  return {
    ...produto,
    preco: Number(produto.preco),
    ativo: Boolean(produto.ativo),
    tags: normalizarTags(produto.tags),
  };
}

export const menuService = {
  async listarPublico(categoria = null) {
    const produtos = await produtoRepository.listar({ apenasAtivos: true, categoria });
    return produtos.map(formatar);
  },

  async listarAdministrativo(categoria = null, busca = null) {
    const produtos = await produtoRepository.listar({ apenasAtivos: false, categoria, busca });
    return produtos.map(formatar);
  },

  async buscarPorId(id) {
    const produto = await produtoRepository.buscarPorId(id);
    if (!produto) throw AppError.notFound('Item do cardápio não encontrado.', 'PRODUTO_NAO_ENCONTRADO');
    return formatar(produto);
  },

  async criar(dados, usuarioId) {
    const { nome, descricao, categoria, preco, imagem_url, tags, ativo } = dados;
    const id = await produtoRepository.criar({
      nome,
      descricao,
      categoria,
      preco: Number(preco),
      imagem_url: imagem_url || null,
      tags: Array.isArray(tags) ? tags.join(', ') : tags || null,
      ativo: ativo === undefined ? true : Boolean(ativo),
    });
    await auditoriaService.registrar({
      usuarioId,
      acao: 'Item cadastrado no cardápio',
      referencia: `PROD-${id}`,
      detalhes: `Item "${nome}" adicionado ao cardápio.`,
    });
    return this.buscarPorId(id);
  },

  async atualizar(id, dados, usuarioId) {
    const atual = await this.buscarPorId(id);
    const idAuditado = await produtoRepository.atualizar(id, {
      ...dados,
      preco: dados.preco === undefined ? undefined : Number(dados.preco),
      tags: Array.isArray(dados.tags) ? dados.tags.join(', ') : dados.tags,
    });
    if (!idAuditado) throw AppError.notFound('Item do cardápio não encontrado.', 'PRODUTO_NAO_ENCONTRADO');

    await auditoriaService.registrar({
      usuarioId,
      acao: 'Item do cardápio alterado',
      referencia: `PROD-${id}`,
      detalhes: `Item "${atual.nome}" foi atualizado.`,
    });
    return this.buscarPorId(id);
  },

  async excluir(id, usuarioId) {
    const produto = await this.buscarPorId(id);
    try {
      await produtoRepository.excluir(id);
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        await produtoRepository.desativar(id);
      } else {
        throw error;
      }
    }
    await auditoriaService.registrar({
      usuarioId,
      acao: 'Exclusão de item',
      referencia: `PROD-${id}`,
      detalhes: `Item "${produto.nome}" removido/desativado do cardápio.`,
    });
    return { id: Number(id), removido: true };
  },
};
