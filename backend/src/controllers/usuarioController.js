import { AppError } from '../utils/AppError.js';
import { exigirCampos } from '../utils/validation.js';
import { created, ok } from '../utils/response.js';
import { usuarioService } from '../services/usuarioService.js';

const CARGOS_PERMITIDOS = ['admin', 'funcionario'];

/** Validação de entrada: o controller não acessa banco nem aplica regras de negócio. */
function validarEntrada(body) {
  exigirCampos(body, ['nome', 'email', 'senha', 'cargo']);

  const nome = String(body.nome).trim();
  const email = String(body.email).trim().toLowerCase();
  const senha = String(body.senha);
  const cargo = String(body.cargo).trim().toLowerCase();

  if (nome.length < 3) {
    throw AppError.badRequest('O nome deve ter pelo menos 3 caracteres.', 'NOME_INVALIDO');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw AppError.badRequest('Informe um e-mail válido.', 'EMAIL_INVALIDO');
  }
  if (senha.length < 6) {
    throw AppError.badRequest('A senha deve ter no mínimo 6 caracteres.', 'SENHA_CURTA');
  }
  if (!CARGOS_PERMITIDOS.includes(cargo)) {
    throw AppError.badRequest("O cargo deve ser 'admin' ou 'funcionario'.", 'CARGO_INVALIDO');
  }

  return { nome, email, senha, cargo };
}

export const usuarioController = {
  async listar(_req, res) {
    return ok(res, await usuarioService.listar());
  },

  async criar(req, res) {
    const dados = validarEntrada(req.body);
    const usuario = await usuarioService.criar({
      ...dados,
      // Identidade do administrador autenticado, usada na auditoria.
      criadoPor: { id: req.user.id, nome: req.user.nome },
    });
    return created(res, usuario, 'Usuário criado com sucesso.');
  },
};
