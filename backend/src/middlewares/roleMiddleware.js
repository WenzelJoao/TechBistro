import { AppError } from '../utils/AppError.js';

/** RBAC: permite apenas os perfis informados. */
export function authorize(...perfisPermitidos) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Autenticação necessária.', 'UNAUTHORIZED'));
    }
    if (!perfisPermitidos.includes(req.user.cargo)) {
      return next(
        AppError.forbidden(
          'Acesso restrito: seu perfil não possui permissão para esta operação.',
          'SEM_PERMISSAO',
        ),
      );
    }
    return next();
  };
}

/** Alias semântico usado pelas rotas de gestão de usuários. */
export const isAdmin = authorize('admin');

/** Mantido para compatibilidade com as rotas já existentes. */
export const adminOnly = isAdmin;
export const staffOnly = authorize('admin', 'funcionario');
