import api, { extrairDados } from './api.js';

export const menuService = {
  listarPublico: (categoria) =>
    extrairDados(api.get('/menu', { params: categoria ? { categoria } : {} })),

  listarAdministrativo: () => extrairDados(api.get('/menu/admin')),

  criar: (dados) => extrairDados(api.post('/menu', dados)),

  atualizar: (id, dados) => extrairDados(api.put(`/menu/${id}`, dados)),

  excluir: (id) => extrairDados(api.delete(`/menu/${id}`)),
};
