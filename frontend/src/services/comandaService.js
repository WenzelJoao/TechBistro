import api, { extrairDados } from './api.js';

export const comandaService = {
  listar: (status) => extrairDados(api.get('/comandas', { params: status ? { status } : {} })),
  buscar: (id) => extrairDados(api.get(`/comandas/${id}`)),
  abrir: (mesaId) => extrairDados(api.post('/comandas', { mesa_id: mesaId })),
  adicionarItem: (id, produtoId, quantidade) =>
    extrairDados(api.post(`/comandas/${id}/itens`, { produto_id: produtoId, quantidade })),
  fechar: (id) => extrairDados(api.patch(`/comandas/${id}/fechar`)),
  excluir: (id) => extrairDados(api.delete(`/comandas/${id}`)),
};
