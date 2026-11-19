import { reservaService } from '../services/reservaService.js';
import { exigirCampos } from '../utils/validation.js';
import { created, ok } from '../utils/response.js';

export const reservaController = {
  // ----- Público -----
  async disponibilidade(req, res) {
    exigirCampos(req.query, ['data', 'pessoas']);
    const dados = await reservaService.verDisponibilidade(req.query.data, req.query.pessoas);
    return ok(res, dados);
  },

  async criar(req, res) {
    exigirCampos(req.body, ['data_reserva', 'hora_inicio', 'qtd_pessoas', 'nome_completo', 'telefone']);
    const reserva = await reservaService.criar(req.body, req.user?.id || null);
    return created(res, reserva, 'Reserva realizada! Aguarde a confirmação da equipe.');
  },

  async consultar(req, res) {
    exigirCampos(req.query, ['termo']);
    const reservas = await reservaService.consultar(req.query.termo);
    return ok(res, reservas);
  },

  async cancelarPublico(req, res) {
    exigirCampos(req.body, ['termo']);
    const reserva = await reservaService.cancelarPublico(req.params.id, req.body.termo);
    return ok(res, reserva, 'Reserva cancelada com sucesso.');
  },

  async alterarPublico(req, res) {
    exigirCampos(req.body, ['termo', 'data_reserva', 'hora_inicio', 'qtd_pessoas']);
    const reserva = await reservaService.alterarPublico(req.params.id, req.body);
    return ok(res, reserva, 'Reserva alterada com sucesso.');
  },

  // ----- Interno -----
  async listar(req, res) {
    const reservas = await reservaService.listarInterno({
      data: req.query.data || null,
      status: req.query.status || null,
      limite: req.query.limite || 200,
    });
    return ok(res, reservas);
  },

  async buscarPorId(req, res) {
    return ok(res, await reservaService.buscarPorId(req.params.id));
  },

  async confirmar(req, res) {
    const reserva = await reservaService.confirmar(req.params.id, req.user.id);
    return ok(res, reserva, 'Reserva confirmada e link do WhatsApp gerado.');
  },

  async cancelar(req, res) {
    const reserva = await reservaService.cancelar(req.params.id, req.user.id, req.body?.motivo);
    return ok(res, reserva, 'Reserva cancelada.');
  },

  async alterarMesa(req, res) {
    exigirCampos(req.body, ['mesa_id']);
    const reserva = await reservaService.alterarMesa(req.params.id, req.body.mesa_id, req.user.id);
    return ok(res, reserva, 'Mesa da reserva alterada.');
  },

  async excluir(req, res) {
    const resultado = await reservaService.excluir(req.params.id, req.user.id);
    return ok(res, resultado, 'Reserva excluída.');
  },
};
