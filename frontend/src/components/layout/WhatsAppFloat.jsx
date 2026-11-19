import { MessageCircle } from 'lucide-react';
import { CONTATO, gerarLinkWhatsApp } from '../../utils/formatters.js';

export default function WhatsAppFloat() {
  const link = gerarLinkWhatsApp(CONTATO.telefone, CONTATO.whatsappMensagem);
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-graphite shadow-[0_12px_35px_rgba(184,149,88,0.4)] transition hover:scale-105 hover:bg-gold-light sm:bottom-7 sm:right-7"
      aria-label="Falar com o TechBistro no WhatsApp"
      title="Falar no WhatsApp"
    >
      <MessageCircle size={24} />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-gold/30 bg-graphite px-3 py-2 text-xs text-ivory opacity-0 shadow-elegante transition group-hover:opacity-100 sm:block">
        Vamos conversar?
      </span>
    </a>
  );
}
