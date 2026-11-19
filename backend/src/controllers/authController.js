import { authService } from '../services/authService.js';
import { exigirCampos } from '../utils/validation.js';
import { ok } from '../utils/response.js';

export const authController = {
  async login(req, res) {
    exigirCampos(req.body, ['email', 'senha']);
    const resultado = await authService.login(req.body.email, req.body.senha);
    return ok(res, resultado, 'Login realizado com sucesso.');
  },

  async me(req, res) {
    const usuario = await authService.perfil(req.user.id);
    return ok(res, usuario);
  },
};
