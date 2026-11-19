import axios from 'axios';

const TOKEN_KEY = 'techbistro_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removerToken() {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function normalizarErro(error) {
  const resposta = error.response?.data;
  const detalhe = resposta?.error;
  const err = new Error(
    detalhe?.message || (error.code === 'ECONNABORTED' ? 'O servidor demorou para responder.' : error.message),
  );
  err.code = detalhe?.code || 'ERRO_DE_CONEXAO';
  err.details = detalhe?.details || null;
  err.status = error.response?.status || 0;
  return err;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const possuiToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && possuiToken) {
      removerToken();
      const rotaPrivada = window.location.pathname.startsWith('/admin');
      if (rotaPrivada) window.location.assign('/login');
    }
    return Promise.reject(normalizarErro(error));
  },
);

/** Extrai o payload `data` padronizado da API. */
export async function extrairDados(promise) {
  const resposta = await promise;
  return resposta.data?.data ?? null;
}

export default api;
