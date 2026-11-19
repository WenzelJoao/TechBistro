import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ aberto, onClose, titulo, subtitulo, children, rodape, tamanho = 'md' }) {
  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [aberto, onClose]);

  if (!aberto) return null;

  const larguras = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`relative z-10 max-h-[92vh] w-full ${larguras[tamanho]} overflow-y-auto rounded-t-3xl border border-gold/20 bg-graphite shadow-elegante sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gold/15 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h3 className="heading-serif text-lg text-ivory sm:text-xl">{titulo}</h3>
            {subtitulo && <p className="mt-1 text-xs text-ivory/50">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ivory/50 transition hover:bg-white/5 hover:text-ivory"
            aria-label="Fechar"
          >
            <X size={19} />
          </button>
        </div>
        <div className="min-w-0 px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        {rodape && (
          <div className="flex flex-col gap-2 border-t border-gold/15 px-4 py-4 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3 sm:px-6">
            {rodape}
          </div>
        )}
      </div>
    </div>
  );
}
