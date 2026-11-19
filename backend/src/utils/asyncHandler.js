/** Envolve handlers assíncronos e repassa erros ao middleware global. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
