import api, { extrairDados } from './api.js';

export const reservaService = {
  disponibilidade: (data, pessoas) =>
    extrairDados(api.get('/reservas/disponibilidade', { params: { data, pessoas } })),

  criar: (dados) => extrairDados(api.post('/reservas', dados)),

  consultar: (termo) => extrairDados(api.get('/reservas/consulta', { params: { termo } })),

  cancelarPublico: (id, termo) =>
    extrairDados(api.patch(`/reservas/${id}/cancelar-publico`, { termo })),

  alterarPublico: (id, dados) =>
    extrairDados(api.patch(`/reservas/${id}/alterar-publico`, dados)),

  listarInterno: (filtros = {}) => extrairDados(api.get('/reservas', { params: filtros })),

  confirmar: (id) => extrairDados(api.patch(`/reservas/${id}/confirmar`)),

  cancelar: (id, motivo) => extrairDados(api.patch(`/reservas/${id}/cancelar`, { motivo })),

  alterarMesa: (id, mesaId) =>
    extrairDados(api.patch(`/reservas/${id}/mesa`, { mesa_id: mesaId })),

  excluir: (id) => extrairDados(api.delete(`/reservas/${id}`)),
};
