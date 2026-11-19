import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';

export default function Login() {
  const { login, isAutenticado } = useAuth();
  const { toast } = useToast();
  const navegar = useNavigate();
  const localizacao = useLocation();
  const [email, setEmail] = useState('admin@techbistro.com.br');
  const [senha, setSenha] = useState('Admin@123');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  if (isAutenticado) return <Navigate to="/admin" replace />;

  async function entrar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      const usuario = await login(email, senha);
      toast.success(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}!`);
      navegar(localizacao.state?.origem || '/admin', { replace: true });
    } catch (err) {
      setErro(err.message);
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-graphite md:grid-cols-2">
      <section className="relative hidden items-end overflow-hidden p-8 md:flex md:min-h-screen lg:p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=85)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/70 to-transparent" />
        <div className="relative max-w-md lg:max-w-lg">
          <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 text-gold lg:mb-6 lg:h-12 lg:w-12">
            <ChefHat size={22} />
          </span>
          <p className="eyebrow mb-3 lg:mb-4">Área restrita</p>
          <h1 className="heading-serif text-3xl text-ivory sm:text-4xl lg:text-5xl">
            O coração da operação, <span className="italic text-gold">em suas mãos.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ivory/60 lg:mt-5">
            Gerencie agendamentos, comandas, cardápio e mesas em um só lugar. Cada ação é registrada
            no log de auditoria.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 md:min-h-0 md:py-10">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="mb-7 flex items-center gap-3 md:hidden">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
              <UtensilsCrossed size={18} />
            </span>
            <span className="font-serif text-2xl text-ivory">
              Tech<span className="text-gold">Bistro</span>
            </span>
          </div>

          <div className="mb-7 md:mb-8">
            <p className="eyebrow mb-2 hidden md:block">Acesso restrito</p>
            <h2 className="font-serif text-2xl text-ivory sm:text-3xl">Acessar o painel</h2>
            <p className="mt-2 text-sm text-ivory/50">Entre com sua conta para continuar.</p>
          </div>

          <form onSubmit={entrar} className="card-ivory p-5 sm:p-7 lg:p-8">
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@techbistro.com.br"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              icon={Mail}
              required
            />
            <div className="mt-5">
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                icon={LockKeyhole}
                required
              />
            </div>
            {erro && (
              <p
                role="alert"
                className="mt-4 break-words rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600"
              >
                {erro}
              </p>
            )}
            <div className="mt-7">
              <Button type="submit" loading={enviando} icon={ArrowRight} fullWidth size="lg">
                Entrar no sistema
              </Button>
            </div>
          </form>

          <div className="mt-5 rounded-xl border border-gold/20 bg-graphite-light/60 p-4 sm:mt-6">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold sm:text-xs">
              <ShieldCheck size={15} className="shrink-0" /> Contas de demonstração
            </p>
            <div className="space-y-2.5 text-[11px] text-ivory/60 sm:text-xs">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <strong className="shrink-0 text-ivory">Admin:</strong>
                <span className="min-w-0 break-all">admin@techbistro.com.br / Admin@123</span>
              </p>
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <strong className="shrink-0 text-ivory">Funcionário:</strong>
                <span className="min-w-0 break-all">funcio@techbistro.com.br / Func@123</span>
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-ivory/50 transition hover:text-gold"
          >
            <ArrowLeft size={14} /> Voltar ao início
          </Link>
        </div>
      </section>
    </div>
  );
}
