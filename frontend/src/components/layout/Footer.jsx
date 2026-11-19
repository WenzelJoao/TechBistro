import { Link } from 'react-router-dom';
import { Clock3, Heart, MapPin, MessageCircle, Phone } from 'lucide-react';
import { CONTATO, formatarTelefone } from '../../utils/formatters.js';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gold/15 bg-graphite-deep">
      <div className="container-tech grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-serif text-2xl text-ivory">
            Tech<span className="text-gold">Bistro</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/45">
            Culinária contemporânea com alma de bistrô. Cada detalhe pensado para transformar um
            jantar em uma memória.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-luxo text-gold">Explore</h4>
          <ul className="space-y-2.5 text-sm text-ivory/55">
            <li><Link to="/" className="hover:text-gold">Início</Link></li>
            <li><Link to="/cardapio" className="hover:text-gold">Cardápio digital</Link></li>
            <li><Link to="/reservar" className="hover:text-gold">Nova reserva</Link></li>
            <li><Link to="/consulta" className="hover:text-gold">Consultar reserva</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-luxo text-gold">Visite-nos</h4>
          <ul className="space-y-3 text-sm text-ivory/55">
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" />{CONTATO.endereco}</li>
            <li className="flex gap-2.5"><Phone size={16} className="shrink-0 text-gold" />{formatarTelefone(CONTATO.telefone)}</li>
            <li className="flex gap-2.5"><MessageCircle size={16} className="shrink-0 text-gold" />Respostas rápidas via WhatsApp</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-luxo text-gold">Horários</h4>
          <ul className="space-y-3 text-sm text-ivory/55">
            <li className="flex gap-2.5"><Clock3 size={16} className="shrink-0 text-gold" /><span>Terça a sábado · 18h às 23h</span></li>
            <li className="flex gap-2.5"><Clock3 size={16} className="shrink-0 text-gold" /><span>Domingo · 11h30 às 15h</span></li>
            <li className="flex gap-2.5"><Clock3 size={16} className="shrink-0 text-gold" /><span>Segunda-feira · fechado</span></li>
          </ul>
        </div>
      </div>

      <div className="surface-line">
        <div className="container-tech flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory/35 sm:flex-row">
          <p>© {new Date().getFullYear()} TechBistro. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">Feito com <Heart size={12} className="text-gold" /> para experiências memoráveis.</p>
        </div>
      </div>
    </footer>
  );
}
