import api, { extrairDados } from './api.js';

export const authService = {
  login: (email, senha) => extrairDados(api.post('/auth/login', { email, senha })),
  me: () => extrairDados(api.get('/auth/me')),
};
