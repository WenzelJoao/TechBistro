import { mesaService } from '../services/mesaService.js';
import { exigirCampos } from '../utils/validation.js';
import { created, ok } from '../utils/response.js';

export const mesaController = {
  async listar(req, res) {
    return ok(res, await mesaService.listar());
  },

  async criar(req, res) {
    exigirCampos(req.body, ['numero_mesa', 'capacidade']);
    return created(res, await mesaService.criar(req.body, req.user.id), 'Mesa cadastrada.');
  },

  async atualizar(req, res) {
    return ok(res, await mesaService.atualizar(req.params.id, req.body, req.user.id), 'Mesa atualizada.');
  },

  async excluir(req, res) {
    return ok(res, await mesaService.excluir(req.params.id, req.user.id), 'Mesa excluída.');
  },
};
