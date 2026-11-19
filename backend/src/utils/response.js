/** Padroniza o formato de todas as respostas bem-sucedidas da API. */
export function ok(res, data = null, message = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
}

export function created(res, data = null, message = 'Registro criado com sucesso.') {
  return ok(res, data, message, 201);
}
