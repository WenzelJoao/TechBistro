import { useCallback, useEffect, useState } from 'react';

/** Hook para carregar dados assíncronos com estados de loading/erro e recarga manual. */
export function useAsync(funcao, dependencias = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null });

  const executar = useCallback(
    async (...argumentos) => {
      setEstado((atual) => ({ ...atual, carregando: true, erro: null }));
      try {
        const dados = await funcao(...argumentos);
        setEstado({ dados, carregando: false, erro: null });
        return dados;
      } catch (erro) {
        setEstado({ dados: null, carregando: false, erro });
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencias,
  );

  useEffect(() => {
    executar();
  }, [executar]);

  return { ...estado, recarregar: executar, setDados: (dados) => setEstado((e) => ({ ...e, dados })) };
}
