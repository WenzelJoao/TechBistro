import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarRange,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ScrollText,
  Settings2,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ITENS = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, fim: true },
  { to: '/admin/agendamentos', label: 'Agendamentos', icon: CalendarRange },
  { to: '/admin/comandas', label: 'Comandas', icon: ReceiptText },
  { to: '/admin/usuarios', label: 'Equipe / Usuários', icon: Users, admin: true },
  { to: '/admin/cardapio', label: 'Cardápio', icon: UtensilsCrossed, admin: true },
  { to: '/admin/mesas', label: 'Mesas', icon: ClipboardList, admin: true },
  { to: '/admin/auditoria', label: 'Auditoria', icon: ScrollText, admin: true },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings2, admin: true },
];

export default function PrivateLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { usuario, isAdmin, logout } = useAuth();
  const localizacao = useLocation();
  const navegar = useNavigate();

  const visiveis = ITENS.filter((item) => !item.admin || isAdmin);
  const atual = visiveis.find((item) =>
    item.fim ? localizacao.pathname === item.to : localizacao.pathname.startsWith(item.to),
  );

  function sair() {
    logout();
    navegar('/login', { replace: true });
  }

  const conteudoSidebar = (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-gold/10 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 text-gold">
          <ChefHat size={18} />
        </span>
        <div className="leading-tight">
          <p className="font-serif text-lg text-ivory">
            Tech<span className="text-gold">Bistro</span>
          </p>
          <p className="text-[9px] uppercase tracking-luxo text-ivory/35">Gestão interna</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-luxo text-ivory/30">Menu</p>
        {visiveis.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.fim}
            onClick={() => setMenuAberto(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                isActive
                  ? 'bg-gold/15 text-gold shadow-[inset_2px_0_0_#B89558]'
                  : 'text-ivory/55 hover:bg-white/5 hover:text-ivory'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gold/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/[0.03] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-serif text-sm text-gold">
            {usuario?.nome?.charAt(0) || 'T'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ivory">{usuario?.nome}</p>
            <p className="text-[10px] uppercase tracking-wide text-gold/80">
              {isAdmin ? 'Administrador' : 'Funcionário'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={sair}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 px-3 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
        >
          <LogOut size={15} /> Sair do painel
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-graphite">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-gold/10 bg-graphite-deep lg:flex">
        {conteudoSidebar}
      </aside>

      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-gold/10 bg-graphite-deep">
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="absolute right-3 top-5 z-10 rounded-lg p-2 text-ivory/60"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            {conteudoSidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-gold/10 bg-graphite/90 px-5 backdrop-blur-xl sm:px-8">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            className="rounded-lg border border-gold/25 p-2 text-gold lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={19} />
          </button>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-luxo text-gold/80">Painel TechBistro</p>
            <h1 className="font-serif text-xl text-ivory sm:text-2xl">{atual?.label || 'Visão geral'}</h1>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-xs text-ivory/70">{usuario?.nome}</p>
            <p className="text-[10px] uppercase tracking-wide text-ivory/35">
              {isAdmin ? 'Administrador' : 'Funcionário'}
            </p>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
