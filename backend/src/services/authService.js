import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { usuarioRepository } from '../repositories/usuarioRepository.js';

function semSenha(usuario) {
  const { senha_hash: _senhaHash, ...seguro } = usuario;
  return seguro;
}

export const authService = {
  async login(email, senha) {
    const usuario = await usuarioRepository.buscarPorEmail(String(email).trim().toLowerCase());

    if (!usuario || !(await bcrypt.compare(String(senha), usuario.senha_hash))) {
      throw AppError.unauthorized('E-mail ou senha incorretos.', 'LOGIN_INVALIDO');
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      cargo: usuario.cargo,
    };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

    return { token, usuario: semSenha(usuario) };
  },

  async perfil(id) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) throw AppError.notFound('Usuário não encontrado.', 'USUARIO_NAO_ENCONTRADO');
    return semSenha(usuario);
  },
};
