import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  MessageCircle,
  Users,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Input, TextArea } from '../../components/ui/Field.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { reservaService } from '../../services/reservaService.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import {
  apenasDigitos,
  formatarDataLonga,
  gerarLinkWhatsApp,
  hojeISO,
} from '../../utils/formatters.js';

const PASSOS = ['Data e horário', 'Seus dados', 'Reserva feita'];

function Stepper({ etapa }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
      {PASSOS.map((passo, indice) => {
        const numero = indice + 1;
        const concluido = numero < etapa;
        const ativo = numero === etapa;
        return (
          <div key={passo} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition ${
                  concluido
                    ? 'border-gold bg-gold text-graphite'
                    : ativo
                      ? 'border-gold text-gold shadow-[0_0_0_4px_rgba(184,149,88,0.12)]'
                      : 'border-ivory/20 text-ivory/30'
                }`}
              >
                {concluido ? <Check size={16} /> : numero}
              </span>
              <span className={`hidden text-[10px] uppercase tracking-wider sm:block ${ativo ? 'text-gold' : 'text-ivory/35'}`}>
                {passo}
              </span>
            </div>
            {indice < PASSOS.length - 1 && (
              <span className={`mb-5 h-px w-8 sm:w-16 ${concluido ? 'bg-gold' : 'bg-ivory/15'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NovaReserva() {
  const { toast } = useToast();
  const [etapa, setEtapa] = useState(1);
  const [data, setData] = useState(hojeISO());
  const [pessoas, setPessoas] = useState(2);
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [erroSlots, setErroSlots] = useState('');
  const [hora, setHora] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [form, setForm] = useState({ nome_completo: '', telefone: '', cpf: '', observacoes: '' });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [reserva, setReserva] = useState(null);

  useEffect(() => {
    let ativo = true;
    setCarregandoSlots(true);
    setErroSlots('');
    setHora('');
    setSugestoes([]);

    reservaService
      .disponibilidade(data, pessoas)
      .then((resposta) => {
        if (ativo) setDisponibilidade(resposta);
      })
      .catch((erro) => {
        if (ativo) {
          setDisponibilidade(null);
          setErroSlots(erro.message);
        }
      })
      .finally(() => {
        if (ativo) setCarregandoSlots(false);
      });

    return () => {
      ativo = false;
    };
  }, [data, pessoas]);

  const horarios = disponibilidade?.horarios || [];
  const disponiveis = horarios.filter((item) => item.disponivel);

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function validarFormulario() {
    const novosErros = {};
    if (form.nome_completo.trim().length < 3) novosErros.nome_completo = 'Informe o nome completo.';
    const digitos = apenasDigitos(form.telefone);
    if (digitos.length < 10 || digitos.length > 11) novosErros.telefone = 'Informe um telefone com DDD.';
    if (form.cpf && apenasDigitos(form.cpf).length !== 11) novosErros.cpf = 'CPF deve ter 11 dígitos.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function submeter(evento) {
    evento.preventDefault();
    if (!validarFormulario()) return;

    setEnviando(true);
    try {
      const criada = await reservaService.criar({
        data_reserva: data,
        hora_inicio: hora,
        qtd_pessoas: pessoas,
        nome_completo: form.nome_completo.trim(),
        telefone: apenasDigitos(form.telefone),
        cpf: form.cpf ? apenasDigitos(form.cpf) : null,
        observacoes: form.observacoes || null,
      });
      setReserva(criada);
      setEtapa(3);
      toast.success('Reserva registrada! Guarde o código para consultar depois.');
    } catch (erro) {
      toast.error(erro.message);
      if (erro.details?.alternativas?.length) setSugestoes(erro.details.alternativas);
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setEtapa(1);
    setReserva(null);
    setForm({ nome_completo: '', telefone: '', cpf: '', observacoes: '' });
    setHora('');
  }

  return (
    <div className="container-tech py-14 sm:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <p className="eyebrow mb-4">Reserve sua experiência</p>
        <h1 className="heading-serif text-4xl text-ivory sm:text-5xl">
          Sua mesa no <span className="italic text-gold">TechBistro</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory/50">
          Três passos rápidos. Mostramos apenas os horários realmente disponíveis, respeitando o
          bloqueio de 90 minutos por mesa.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <Stepper etapa={etapa} />

        {/* ETAPA 1 */}
        {etapa === 1 && (
          <div className="card-ivory animate-fade-up p-6 sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="label-tech">Data da reserva</span>
                <input
                  type="date"
                  min={hojeISO()}
                  value={data}
                  onChange={(evento) => setData(evento.target.value)}
                  className="input-tech"
                />
              </label>
              <label className="block">
                <span className="label-tech">Quantidade de pessoas</span>
                <select
                  value={pessoas}
                  onChange={(evento) => setPessoas(Number(evento.target.value))}
                  className="input-tech"
                >
                  {Array.from({ length: 10 }, (_, indice) => indice + 1).map((quantidade) => (
                    <option key={quantidade} value={quantidade}>
                      {quantidade} {quantidade === 1 ? 'pessoa' : 'pessoas'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-graphite">
                  <Clock3 size={17} className="text-gold" /> Horários disponíveis
                </div>
                {disponibilidade && (
                  <span className="text-xs text-graphite/50">
                    {formatarDataLonga(data)} · {disponibilidade.abertura}–{disponibilidade.fechamento}
                  </span>
                )}
              </div>

              {carregandoSlots ? (
                <div className="flex items-center justify-center gap-3 py-14 text-graphite/50">
                  <Spinner className="text-gold" /> Consultando a disponibilidade...
                </div>
              ) : erroSlots ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
                  <div className="flex gap-3">
                    <AlertTriangle className="shrink-0 text-red-500" size={20} />
                    <div>
                      <p className="font-semibold text-graphite">{erroSlots}</p>
                      <p className="mt-1 text-sm text-graphite/60">
                        Tente outra data. Sugestões:
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[1, 2, 3].map((delta) => {
                          const proxima = new Date(`${data}T12:00:00`);
                          proxima.setDate(proxima.getDate() + delta);
                          const valor = proxima.toISOString().slice(0, 10);
                          return (
                            <button
                              key={delta}
                              type="button"
                              onClick={() => setData(valor)}
                              className="rounded-lg border border-gold/50 px-3 py-1.5 text-xs font-semibold text-gold-dark hover:bg-gold/10"
                            >
                              {formatarDataLonga(valor)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : disponiveis.length === 0 ? (
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                  <p className="font-semibold text-graphite">Todos os horários estão lotados nesta data.</p>
                  <p className="mt-1 text-sm text-graphite/60">Escolha outra data para ver novas opções.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                  {horarios.map((item) => (
                    <button
                      key={item.hora}
                      type="button"
                      disabled={!item.disponivel}
                      onClick={() => {
                        setHora(item.hora);
                        setSugestoes([]);
                      }}
                      className={`rounded-lg border px-2 py-3 text-center transition ${
                        !item.disponivel
                          ? 'cursor-not-allowed border-graphite/10 bg-graphite/5 text-graphite/30'
                          : hora === item.hora
                            ? 'border-gold bg-gold text-graphite shadow-md'
                            : 'border-gold/25 bg-white text-graphite hover:border-gold hover:bg-gold/5'
                      }`}
                    >
                      <span className="block text-sm font-bold">{item.hora}</span>
                      <span className="mt-0.5 block text-[10px] opacity-70">
                        {item.disponivel
                          ? `Mesa ${item.mesa?.numero_mesa}`
                          : item.motivo === 'LIMITE_ATINGIDO'
                            ? 'Limite'
                            : 'Indisponível'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {sugestoes.length > 0 && (
                <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-graphite">
                    <AlertTriangle size={15} /> Horários alternativos próximos:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sugestoes.map((sugestao) => (
                      <button
                        key={sugestao.hora}
                        type="button"
                        onClick={() => setHora(sugestao.hora)}
                        className="rounded-lg bg-graphite px-3 py-1.5 text-xs font-semibold text-ivory hover:bg-gold hover:text-graphite"
                      >
                        {sugestao.hora} · Mesa {sugestao.mesa_numero}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-graphite/10 pt-6">
              <p className="text-xs text-graphite/50">
                {hora ? `Selecionado: ${hora} para ${pessoas} pessoa(s)` : 'Selecione um horário para continuar'}
              </p>
              <Button
                icon={ArrowRight}
                disabled={!hora}
                onClick={() => setEtapa(2)}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 2 */}
        {etapa === 2 && (
          <form onSubmit={submeter} className="animate-fade-up space-y-6">
            <div className="card-dark flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-ivory/80">
                  <CalendarDays size={16} className="text-gold" /> {formatarDataLonga(data)}
                </span>
                <span className="flex items-center gap-2 text-ivory/80">
                  <Clock3 size={16} className="text-gold" /> {hora}
                </span>
                <span className="flex items-center gap-2 text-ivory/80">
                  <Users size={16} className="text-gold" /> {pessoas} pessoa(s)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEtapa(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-light"
              >
                <ArrowLeft size={14} /> Alterar horário
              </button>
            </div>

            <div className="card-ivory p-6 sm:p-9">
              <h2 className="font-serif text-2xl text-graphite">Quem vem jantar?</h2>
              <p className="mt-2 text-sm text-graphite/55">
                Enviaremos a confirmação para o WhatsApp informado.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Nome completo"
                    placeholder="Ex.: Ana Clara Souza"
                    value={form.nome_completo}
                    onChange={(evento) => atualizarCampo('nome_completo', evento.target.value)}
                    error={erros.nome_completo}
                  />
                </div>
                <Input
                  label="WhatsApp com DDD"
                  placeholder="(11) 98800-1111"
                  value={form.telefone}
                  onChange={(evento) => atualizarCampo('telefone', evento.target.value)}
                  error={erros.telefone}
                />
                <Input
                  label="CPF (opcional)"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(evento) => atualizarCampo('cpf', evento.target.value)}
                  error={erros.cpf}
                />
                <div className="sm:col-span-2">
                  <TextArea
                    label="Alguma observação? (opcional)"
                    placeholder="Aniversário, preferência de mesa, alergias..."
                    value={form.observacoes}
                    onChange={(evento) => atualizarCampo('observacoes', evento.target.value)}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-graphite/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-graphite/50">
                  Ao concluir, você recebe um código único para consultar ou cancelar a reserva.
                </p>
                <Button type="submit" loading={enviando} icon={CheckCircle2}>
                  Confirmar reserva
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* ETAPA 3 */}
        {etapa === 3 && reserva && (
          <div className="card-ivory animate-fade-up p-8 text-center sm:p-12">
            <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
              <CheckCircle2 size={34} />
            </span>
            <h2 className="font-serif text-3xl text-graphite">Reserva registrada com sucesso!</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-graphite/60">
              Guarde o código abaixo. Nossa equipe irá confirmar seu agendamento e enviar uma
              mensagem no WhatsApp.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-xl border border-gold/40 bg-white/70 p-6">
              <p className="text-[10px] font-bold uppercase tracking-luxo text-graphite/50">Código da reserva</p>
              <p className="mt-2 font-serif text-3xl tracking-wide text-gold-dark">{reserva.codigo_reserva}</p>
              <div className="divider-gold mx-auto my-5" />
              <div className="space-y-2 text-sm text-graphite/70">
                <p>{formatarDataLonga(reserva.data_reserva)}</p>
                <p>
                  {reserva.hora_inicio} às {reserva.hora_fim} · Mesa {reserva.numero_mesa} ·{' '}
                  {reserva.qtd_pessoas} pessoa(s)
                </p>
                <p>Status: {reserva.status_label}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(reserva.codigo_reserva);
                  toast.info('Código copiado!');
                }}
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-gold-dark hover:underline"
              >
                <ClipboardCopy size={14} /> Copiar código
              </button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/consulta">
                <Button icon={CalendarDays}>Consultar minha reserva</Button>
              </Link>
              <a
                href={gerarLinkWhatsApp(
                  form.telefone,
                  `Olá! Acabei de fazer a reserva ${reserva.codigo_reserva} no TechBistro.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" icon={MessageCircle}>
                  Enviar no WhatsApp
                </Button>
              </a>
              <Button variant="ghost" onClick={reiniciar}>
                Fazer outra reserva
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
