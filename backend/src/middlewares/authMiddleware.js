import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/** Verifica o token JWT Bearer e expõe req.user. */
export function authenticate(req, _res, next) {
  const cabecalho = req.headers.authorization || '';
  const [esquema, token] = cabecalho.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Token de acesso não fornecido.', 'TOKEN_AUSENTE'));
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = {
      id: payload.id,
      nome: payload.nome,
      cargo: payload.cargo,
    };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Sua sessão expirou. Faça login novamente.', 'TOKEN_EXPIRADO'));
    }
    return next(AppError.unauthorized('Token de acesso inválido.', 'TOKEN_INVALIDO'));
  }
}
