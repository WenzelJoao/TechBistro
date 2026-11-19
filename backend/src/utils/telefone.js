export function somenteDigitos(valor = '') {
  return String(valor).replace(/\D/g, '');
}

export function normalizarTelefone(valor = '') {
  return somenteDigitos(valor);
}

export function validarTelefone(valor = '') {
  const digitos = normalizarTelefone(valor);
  return digitos.length === 10 || digitos.length === 11;
}

export function formatarTelefone(valor = '') {
  const digitos = normalizarTelefone(valor);
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return String(valor);
}
