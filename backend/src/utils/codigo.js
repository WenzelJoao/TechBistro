import { randomBytes } from 'node:crypto';

/** Código legível e único: TB-20261118-A3F9. */
export function gerarCodigoReserva(dataISO) {
  const sufixo = randomBytes(4).toString('hex').toUpperCase().slice(0, 4);
  return `TB-${String(dataISO).replaceAll('-', '')}-${sufixo}`;
}
