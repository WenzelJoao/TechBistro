/** Utilitários de data/hora — todas as comparações usam horário local do servidor. */

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/;

export function validarDataISO(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [ano, mes, dia] = valor.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

export function validarHora(valor) {
  return typeof valor === 'string' && HORA_REGEX.test(valor);
}

export function horaParaMinutos(hora) {
  const [horas, minutos] = hora.slice(0, 5).split(':').map(Number);
  return horas * 60 + minutos;
}

export function minutosParaHora(totalMinutos) {
  const minutos = ((totalMinutos % 1440) + 1440) % 1440;
  const horas = Math.floor(minutos / 60);
  return `${String(horas).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

export function somarMinutos(hora, minutos) {
  return minutosParaHora(horaParaMinutos(hora) + minutos);
}

export function intervalosSobrepostos(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && inicioB < fimA;
}

export function diaDaSemana(dataISO) {
  return new Date(`${dataISO}T12:00:00`).getDay();
}

export function dataAtualISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function combinarDataHora(dataISO, hora) {
  const horaNormalizada = hora.length === 5 ? `${hora}:00` : hora;
  return new Date(`${dataISO}T${horaNormalizada}`);
}

export function formatarDataBr(dataISO) {
  if (!dataISO) return '';
  const valor = String(dataISO).slice(0, 10);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${valor}T12:00:00Z`));
}

export function formatarDataHoraBr(dataHora) {
  if (!dataHora) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dataHora));
}

/** Gera os horários de início possíveis respeitando duração, intervalo e fechamento. */
export function gerarSlots(abertura, fechamento, duracaoMinutos, intervaloMinutos) {
  const inicio = horaParaMinutos(abertura.slice(0, 5));
  const fim = horaParaMinutos(fechamento.slice(0, 5));
  const slots = [];

  for (let atual = inicio; atual + duracaoMinutos <= fim; atual += intervaloMinutos) {
    slots.push(minutosParaHora(atual));
  }
  return slots;
}
