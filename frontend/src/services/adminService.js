import api, { extrairDados } from './api.js';

export const adminService = {
  dashboard: (periodo = {}) => extrairDados(api.get('/admin/dashboard', { params: periodo })),

  logs: (filtros = {}) => extrairDados(api.get('/admin/logs', { params: filtros })),

  regras: () => extrairDados(api.get('/admin/configuracoes')),

  atualizarRegras: (dados) => extrairDados(api.put('/admin/configuracoes', dados)),

  usuarios: () => extrairDados(api.get('/admin/usuarios')),

  mesas: () => extrairDados(api.get('/mesas')),
  criarMesa: (dados) => extrairDados(api.post('/mesas', dados)),
  atualizarMesa: (id, dados) => extrairDados(api.put(`/mesas/${id}`, dados)),
  excluirMesa: (id) => extrairDados(api.delete(`/mesas/${id}`)),
};
