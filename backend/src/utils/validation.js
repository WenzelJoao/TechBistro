import { AppError } from './AppError.js';

/** Validação básica de presença, usada nos controllers antes de chamar os services. */
export function exigirCampos(body, campos) {
  const faltantes = campos.filter((campo) => {
    const valor = body?.[campo];
    return valor === undefined || valor === null || String(valor).trim() === '';
  });

  if (faltantes.length) {
    throw AppError.badRequest(
      `Campos obrigatórios não informados: ${faltantes.join(', ')}.`,
      'CAMPOS_OBRIGATORIOS',
      { campos: faltantes },
    );
  }
}

export function exigirTipo(valor, tipo, nomeCampo) {
  if (typeof valor !== tipo) {
    throw AppError.badRequest(`O campo ${nomeCampo} deve ser do tipo ${tipo}.`, 'TIPO_INVALIDO');
  }
}

export function inteiroPositivo(valor, nomeCampo) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw AppError.badRequest(`O campo ${nomeCampo} deve ser um número inteiro positivo.`, 'VALOR_INVALIDO');
  }
  return numero;
}
