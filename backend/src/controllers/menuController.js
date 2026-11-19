import { menuService } from '../services/menuService.js';
import { exigirCampos } from '../utils/validation.js';
import { created, ok } from '../utils/response.js';

export const menuController = {
  async listarPublico(req, res) {
    return ok(res, await menuService.listarPublico(req.query.categoria || null));
  },

  async listarAdministrativo(req, res) {
    return ok(
      res,
      await menuService.listarAdministrativo(req.query.categoria || null, req.query.busca || null),
    );
  },

  async buscarPorId(req, res) {
    return ok(res, await menuService.buscarPorId(req.params.id));
  },

  async criar(req, res) {
    exigirCampos(req.body, ['nome', 'descricao', 'categoria', 'preco']);
    const produto = await menuService.criar(req.body, req.user.id);
    return created(res, produto, 'Item adicionado ao cardápio.');
  },

  async atualizar(req, res) {
    const produto = await menuService.atualizar(req.params.id, req.body, req.user.id);
    return ok(res, produto, 'Item atualizado.');
  },

  async excluir(req, res) {
    const resultado = await menuService.excluir(req.params.id, req.user.id);
    return ok(res, resultado, 'Item removido do cardápio.');
  },
};
