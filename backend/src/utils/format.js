export const STATUS_RESERVA_LABELS = {
  em_analise: 'Em análise',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  limite_atingido: 'Limite atingido',
};

export const CATEGORIA_LABELS = {
  entradas: 'Entradas',
  principais: 'Pratos Principais',
  sobremesas: 'Sobremesas',
  bebidas: 'Bebidas',
  sugestao_chef: 'Sugestão do Chef',
};

export const CARGO_LABELS = {
  admin: 'Administrador',
  funcionario: 'Funcionário',
};

export function labelStatus(status) {
  return STATUS_RESERVA_LABELS[status] || status;
}

export function labelCategoria(categoria) {
  return CATEGORIA_LABELS[categoria] || categoria;
}

export function normalizarTags(tags) {
  if (!tags) return [];
  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
