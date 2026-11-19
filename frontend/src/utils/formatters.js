export const STATUS_META = {
  em_analise: {
    label: 'Em análise',
    badge: 'bg-gold/15 text-gold-light border-gold/30',
    dot: 'bg-gold',
  },
  confirmado: {
    label: 'Confirmado',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  cancelado: {
    label: 'Cancelado',
    badge: 'bg-red-500/15 text-red-300 border-red-500/30',
    dot: 'bg-red-400',
  },
  limite_atingido: {
    label: 'Limite atingido',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    dot: 'bg-orange-400',
  },
};

export const CATEGORIAS = [
  { value: 'entradas', label: 'Entradas', descricao: 'Para começar bem' },
  { value: 'principais', label: 'Pratos Principais', descricao: 'O coração do cardápio' },
  { value: 'sobremesas', label: 'Sobremesas', descricao: 'O doce final' },
  { value: 'bebidas', label: 'Bebidas', descricao: 'Para acompanhar' },
  { value: 'sugestao_chef', label: 'Sugestão do Chef', descricao: 'Seleção especial' },
];

export const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function statusMeta(status) {
  return STATUS_META[status] || { label: status, badge: 'bg-white/10 text-ivory border-white/20', dot: 'bg-ivory' };
}

export function categoriaLabel(categoria) {
  return CATEGORIAS.find((item) => item.value === categoria)?.label || categoria;
}

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);
}

export function formatarData(valor, opcoes = {}) {
  if (!valor) return '—';
  const data = new Date(`${String(valor).slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(data.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...opcoes,
  }).format(data);
}

export function formatarDataLonga(valor) {
  return formatarData(valor, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatarDataHora(valor) {
  if (!valor) return '—';
  // dateStrings do MySQL devolve "AAAA-MM-DD HH:mm:ss"; converter para ISO local.
  const texto = String(valor).replace(' ', 'T').slice(0, 16);
  const data = new Date(texto);
  if (Number.isNaN(data.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

export function apenasDigitos(valor = '') {
  return String(valor).replace(/\D/g, '');
}

export function formatarTelefone(valor = '') {
  const digitos = apenasDigitos(valor);
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return String(valor);
}

export function hojeISO() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
}

export function dataRelativaISO(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

export function gerarLinkWhatsApp(telefone, mensagem) {
  let numero = apenasDigitos(telefone);
  if (numero.length === 10 || numero.length === 11) numero = `55${numero}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export const CONTATO = {
  telefone: '11940028922',
  endereco: 'Endereço: SC-401, 3730 – Saco Grande, Florianópolis - SC, CEP: 88032-005',
  whatsappMensagem: 'Olá! Gostaria de saber mais sobre o TechBistro e fazer uma reserva.',
};
