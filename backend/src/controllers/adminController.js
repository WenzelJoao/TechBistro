import { dashboardService } from '../services/dashboardService.js';
import { auditoriaService } from '../services/auditoriaService.js';
import { configService } from '../services/configService.js';
import { usuarioService } from '../services/usuarioService.js';
import { ok } from '../utils/response.js';

export const adminController = {
  async resumo(req, res) {
    const dados = await dashboardService.resumo(req.query.dataInicio, req.query.dataFim);
    return ok(res, dados);
  },

  async logs(req, res) {
    const logs = await auditoriaService.listar({
      limite: req.query.limite || 200,
      usuarioId: req.query.usuarioId || null,
      acao: req.query.acao || null,
    });
    return ok(res, logs);
  },

  async regras(_req, res) {
    return ok(res, await configService.buscarRegras());
  },

  async atualizarRegras(req, res) {
    const regras = await configService.atualizarRegras(req.body, req.user.id);
    return ok(res, regras, 'Configurações atualizadas.');
  },

  async usuarios(_req, res) {
    return ok(res, await usuarioService.listar());
  },
};
