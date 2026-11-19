import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ESTILOS = {
  success: { icone: CheckCircle2, classe: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' },
  error: { icone: AlertCircle, classe: 'border-red-500/40 bg-red-500/10 text-red-200' },
  info: { icone: Info, classe: 'border-gold/40 bg-gold/10 text-gold-light' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remover = useCallback((id) => {
    setToasts((atual) => atual.filter((toast) => toast.id !== id));
  }, []);

  const notificar = useCallback(
    (mensagem, tipo = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((atual) => [...atual, { id, mensagem, tipo }]);
      window.setTimeout(() => remover(id), 5000);
    },
    [remover],
  );

  // API conveniente: toast(mensagem, tipo), toast.success(), toast.error() e toast.info().
  const toast = useMemo(() => {
    const funcao = (mensagem, tipo) => notificar(mensagem, tipo);
    funcao.success = (mensagem) => notificar(mensagem, 'success');
    funcao.error = (mensagem) => notificar(mensagem, 'error');
    funcao.info = (mensagem) => notificar(mensagem, 'info');
    return funcao;
  }, [notificar]);

  const valor = useMemo(() => ({ toast, remover }), [toast, remover]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((item) => {
          const estilo = ESTILOS[item.tipo] || ESTILOS.info;
          const Icone = estilo.icone;
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-elegante backdrop-blur-md ${estilo.classe}`}
            >
              <Icone size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1 leading-relaxed">{item.mensagem}</span>
              <button
                type="button"
                onClick={() => remover(item.id)}
                className="shrink-0 opacity-60 transition hover:opacity-100"
                aria-label="Fechar aviso"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast deve ser usado dentro de ToastProvider.');
  return contexto;
}
