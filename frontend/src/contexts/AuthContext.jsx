import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { getToken, removerToken, setToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    if (!getToken()) {
      setCarregando(false);
      return undefined;
    }

    authService
      .me()
      .then((perfil) => {
        if (ativo) setUsuario(perfil);
      })
      .catch(() => removerToken())
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  async function login(email, senha) {
    const resultado = await authService.login(email, senha);
    setToken(resultado.token);
    setUsuario(resultado.usuario);
    return resultado.usuario;
  }

  function logout() {
    removerToken();
    setUsuario(null);
  }

  const valor = useMemo(
    () => ({
      usuario,
      carregando,
      login,
      logout,
      isAutenticado: Boolean(usuario),
      isAdmin: usuario?.cargo === 'admin',
      isFuncionario: usuario?.cargo === 'funcionario',
    }),
    [usuario, carregando],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return contexto;
}
