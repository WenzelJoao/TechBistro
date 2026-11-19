import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Menu, X } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Início', fim: true },
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/reservar', label: 'Reservar mesa' },
  { to: '/consulta', label: 'Consultar reserva' },
];

export default function Navbar() {
  const [aberto, setAberto] = useState(false);

  const classeLink = ({ isActive }) =>
    `group relative py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-gold' : 'text-ivory/65 hover:text-ivory'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gold/10 bg-graphite/90 backdrop-blur-xl">
      <div className="container-tech flex h-[76px] items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setAberto(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 font-serif text-lg text-gold transition group-hover:bg-gold group-hover:text-graphite">
            T
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-xl tracking-wide text-ivory">
              Tech<span className="text-gold">Bistro</span>
            </span>
            <span className="hidden text-[8px] uppercase tracking-luxo text-ivory/40 sm:block">
              Bistrô & Culinária
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.fim} className={classeLink}>
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden items-center gap-1.5 text-xs font-semibold text-ivory/60 transition hover:text-gold sm:flex"
          >
            Área interna <ArrowUpRight size={14} />
          </Link>
          <Link
            to="/reservar"
            className="hidden items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-xs font-bold text-graphite transition hover:bg-gold-light sm:inline-flex"
          >
            <CalendarDays size={15} /> Reservar
          </Link>
          <button
            type="button"
            onClick={() => setAberto((valor) => !valor)}
            className="rounded-lg border border-gold/25 p-2 text-gold lg:hidden"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={aberto}
          >
            {aberto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav className="border-t border-gold/10 bg-graphite-deep px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.fim}
                onClick={() => setAberto(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm transition ${
                    isActive ? 'bg-gold/10 text-gold' : 'text-ivory/70 hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              onClick={() => setAberto(false)}
              className="mt-2 rounded-lg border border-gold/30 px-4 py-3 text-center text-sm text-gold"
            >
              Acessar painel interno
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
