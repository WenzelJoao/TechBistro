import { useState } from 'react';
import { Crown, Mail, ShieldCheck, UserPlus, UserRound, Users } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { usuarioService } from '../../services/usuarioService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatarData } from '../../utils/formatters.js';

// Campos escuros, alinhados ao grafite TechBistro, com bordas douradas sutis.
const CAMPO =
  'w-full rounded-lg border border-gold/20 bg-graphite-deep px-4 py-3 text-sm text-ivory outline-none transition placeholder:text-ivory/30 focus:border-gold focus:ring-2 focus:ring-gold/20';
const ROTULO = 'mb-2 block text-[11px] font-semibold uppercase tracking-wider text-ivory/50';

const PERFIS = [
  {
    value: 'funcionario',
    label: 'Funcionário',
    descricao: 'Acesso operacional a reservas e comandas.',
  },
  {
    value: 'admin',
    label: 'Administrador',
    descricao: 'Acesso total: cardápio, mesas, equipe, auditoria e configurações.',
  },
];

function BadgeCargo({ cargo }) {
  const administrador = cargo === 'admin';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        administrador
          ? 'border-gold/40 bg-gold/15 text-gold'
          : 'border-ivory/20 bg-white/5 text-ivory/70'
      }`}
    >
      {administrador ? <Crown size={12} /> : <UserRound size={12} />}
      {administrador ? 'Admin' : 'Funcionário'}
    </span>
  );
}

/** Cadastro e listagem da equipe. Renderiza apenas para administradores. */
export default function GerenciarUsuarios() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'funcionario',
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const { dados: usuarios, carregando, recarregar } = useAsync(
    () => usuarioService.listarUsuarios(),
    [],
  );

  // Defesa em profundidade: nem um acesso direto à rota mostra o formulário.
  if (!isAdmin) return null;

  function atualizar(campo, valor) {
    setErro('');
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function validar() {
    const { nome, email, senha, cargo } = formulario;
    if (nome.trim().length < 3) return 'Informe o nome completo (mínimo 3 caracteres).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Informe um e-mail válido.';
    if (senha.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    if (!PERFIS.some((perfil) => perfil.value === cargo)) return 'Selecione um perfil de acesso.';
    return '';
  }

  async function cadastrar(evento) {
    evento.preventDefault();
    const mensagem = validar();
    if (mensagem) {
      setErro(mensagem);
      toast.error(mensagem);
      return;
    }

    setEnviando(true);
    setErro('');
    try {
      await usuarioService.criarUsuario({
        nome: formulario.nome.trim(),
        email: formulario.email.trim(),
        senha: formulario.senha,
        cargo: formulario.cargo,
      });
      toast.success('Usuário cadastrado e registrado na auditoria.');
      setFormulario({ nome: '', email: '', senha: '', cargo: 'funcionario' });
      await recarregar();
    } catch (err) {
      const texto =
        err.code === 'EMAIL_JA_CADASTRADO'
          ? 'Este e-mail já está cadastrado. Informe outro endereço.'
          : err.message;
      setErro(texto);
      toast.error(texto);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="card-dark min-w-0 p-4 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <UserPlus size={19} />
          </span>
          <div className="min-w-0">
            <h3 className="font-serif text-lg text-ivory sm:text-xl">Novo usuário</h3>
            <p className="mt-1 text-xs text-ivory/45">
              Crie contas para a equipe e defina o nível de acesso.
            </p>
          </div>
        </div>

        <form onSubmit={cadastrar} className="space-y-4" noValidate>
          <div>
            <label className={ROTULO} htmlFor="usuario-nome">
              Nome completo
            </label>
            <div className="relative">
              <UserRound
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60"
              />
              <input
                id="usuario-nome"
                className={`${CAMPO} pl-10`}
                placeholder="Ex.: Maria Silva"
                value={formulario.nome}
                onChange={(evento) => atualizar('nome', evento.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label className={ROTULO} htmlFor="usuario-email">
              E-mail
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60"
              />
              <input
                id="usuario-email"
                type="email"
                className={`${CAMPO} pl-10`}
                placeholder="nome@techbistro.com.br"
                value={formulario.email}
                onChange={(evento) => atualizar('email', evento.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className={ROTULO} htmlFor="usuario-senha">
              Senha
            </label>
            <div className="relative">
              <ShieldCheck
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60"
              />
              <input
                id="usuario-senha"
                type="password"
                className={`${CAMPO} pl-10`}
                placeholder="Mínimo 6 caracteres"
                value={formulario.senha}
                onChange={(evento) => atualizar('senha', evento.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <label className={ROTULO} htmlFor="usuario-cargo">
              Perfil de acesso
            </label>
            <select
              id="usuario-cargo"
              className={CAMPO}
              value={formulario.cargo}
              onChange={(evento) => atualizar('cargo', evento.target.value)}
            >
              {PERFIS.map((perfil) => (
                <option key={perfil.value} value={perfil.value}>
                  {perfil.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] leading-relaxed text-ivory/40">
              {PERFIS.find((perfil) => perfil.value === formulario.cargo)?.descricao}
            </p>
          </div>

          {erro && (
            <p
              role="alert"
              className="break-words rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
            >
              {erro}
            </p>
          )}

          <Button type="submit" icon={UserPlus} loading={enviando} fullWidth>
            Criar usuário
          </Button>
        </form>
      </section>

      <section className="card-dark min-w-0 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Users size={19} />
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-lg text-ivory sm:text-xl">Equipe cadastrada</h3>
              <p className="mt-1 text-xs text-ivory/45">Contas com acesso ao painel TechBistro.</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold">
            {usuarios?.length || 0} conta(s)
          </span>
        </div>

        {carregando ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-gold" />
          </div>
        ) : !usuarios?.length ? (
          <EmptyState
            icone={Users}
            titulo="Nenhum usuário encontrado"
            descricao="Cadastre o primeiro membro da equipe usando o formulário."
          />
        ) : (
          <>
            {/* Cartões no mobile: evita tabela apertada em telas pequenas. */}
            <div className="space-y-3 md:hidden">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="rounded-xl border border-gold/15 bg-white/[0.02] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-serif text-sm text-gold">
                      {usuario.nome?.charAt(0) || 'T'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ivory">{usuario.nome}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ivory/45">
                        <Mail size={12} className="shrink-0" /> {usuario.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gold/10 pt-3">
                    <BadgeCargo cargo={usuario.cargo} />
                    <span className="text-[11px] text-ivory/40">
                      Criado em {formatarData(usuario.criado_em)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela completa a partir de md. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/15">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-luxo text-ivory/40">
                      Nome
                    </th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-luxo text-ivory/40">
                      E-mail
                    </th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-luxo text-ivory/40">
                      Perfil
                    </th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-luxo text-ivory/40">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-gold/10 last:border-0">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 font-serif text-xs text-gold">
                            {usuario.nome?.charAt(0) || 'T'}
                          </span>
                          <span className="max-w-[180px] truncate font-medium text-ivory">
                            {usuario.nome}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate py-3.5 pr-3 text-ivory/60">
                        {usuario.email}
                      </td>
                      <td className="py-3.5 pr-3">
                        <BadgeCargo cargo={usuario.cargo} />
                      </td>
                      <td className="whitespace-nowrap py-3.5 text-xs text-ivory/45">
                        {formatarData(usuario.criado_em)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
