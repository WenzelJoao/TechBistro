import { comandaService } from '../services/comandaService.js';
import { exigirCampos } from '../utils/validation.js';
import { created, ok } from '../utils/response.js';

export const comandaController = {
  async listar(req, res) {
    return ok(res, await comandaService.listar(req.query.status || null));
  },

  async buscarPorId(req, res) {
    return ok(res, await comandaService.buscarComItens(req.params.id));
  },

  async abrir(req, res) {
    exigirCampos(req.body, ['mesa_id']);
    return created(res, await comandaService.abrir(req.body, req.user.id), 'Comanda aberta.');
  },

  async adicionarItem(req, res) {
    exigirCampos(req.body, ['produto_id', 'quantidade']);
    return ok(
      res,
      await comandaService.adicionarItem(req.params.id, req.body, req.user.id),
      'Item adicionado à comanda.',
    );
  },

  async fechar(req, res) {
    return ok(res, await comandaService.fechar(req.params.id, req.user.id), 'Comanda fechada.');
  },

  async excluir(req, res) {
    return ok(res, await comandaService.excluir(req.params.id, req.user.id), 'Comanda excluída.');
  },
};
