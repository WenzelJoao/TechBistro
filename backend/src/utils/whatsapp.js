import { somenteDigitos } from './telefone.js';
import { formatarDataBr } from './date.js';

/** Monta link wa.me com DDI 55 e mensagem pré-codificada. */
export function gerarLinkWhatsApp(telefone, mensagem) {
  let numero = somenteDigitos(telefone);
  if (numero.length === 10 || numero.length === 11) numero = `55${numero}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagemConfirmacaoReserva({ nome, data, hora, numeroMesa, qtdPessoas }) {
  return `Olá, ${nome}! Sua reserva no TechBistro está confirmada para ${formatarDataBr(
    data,
  )} às ${hora} (Mesa ${numeroMesa} para ${qtdPessoas} pessoas).`;
}

export function mensagemContatoPadrao() {
  return 'Olá! Gostaria de saber mais sobre o TechBistro.';
}
