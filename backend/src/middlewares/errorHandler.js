import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 'ROTA_NAO_ENCONTRADA'));
}

function mapearErroBanco(error) {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return AppError.conflict('Já existe um registro com este valor único.', 'REGISTRO_DUPLICADO');
    case 'ER_NO_REFERENCED_ROW_2':
      return AppError.badRequest('Referência inválida: o registro relacionado não existe.', 'FK_INVALIDA');
    case 'ER_ROW_IS_REFERENCED_2':
      return AppError.conflict('Não é possível excluir: existem registros vinculados.', 'REGISTRO_EM_USO');
    case 'ER_TRUNCATED_WRONG_VALUE':
    case 'ER_DATA_TOO_LONG':
      return AppError.badRequest('Dados enviados são inválidos ou muito longos.', 'DADOS_INVALIDOS');
    default:
      return null;
  }
}

/** Middleware global de erros — deve ser registrado por último no Express. */
export function errorHandler(error, _req, res, _next) {
  if (config.environment === 'development') {
    console.error('[TechBistro] Erro:', error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: { code: 'JSON_INVALIDO', message: 'Corpo da requisição com JSON inválido.' },
    });
  }

  const erroBanco = mapearErroBanco(error);
  if (erroBanco) {
    return res.status(erroBanco.statusCode).json({
      success: false,
      error: { code: erroBanco.code, message: erroBanco.message },
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: 'ERRO_INTERNO', message: 'Ocorreu um erro inesperado. Tente novamente.' },
  });
}
