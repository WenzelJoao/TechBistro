import api, { extrairDados } from './api.js';

/**
 * Gestão de usuários (somente admin).
 * O token JWT é injetado automaticamente pelo interceptor em `api.js`.
 */
export const usuarioService = {
  listarUsuarios: () => extrairDados(api.get('/usuarios')),

  criarUsuario: (dados) => extrairDados(api.post('/usuarios', dados)),
};
