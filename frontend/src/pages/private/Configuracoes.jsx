import { useEffect, useState } from 'react';
import { Clock3, Save, Settings2, Users } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { DIAS_SEMANA } from '../../utils/formatters.js';

export default function Configuracoes() {
  const { toast } = useToast();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      const resposta = await adminService.regras();
      setDados(resposta);
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function atualizarConfig(campo, valor) {
    setDados((atual) => ({
      ...atual,
      configuracao: { ...atual.configuracao, [campo]: Number(valor) },
    }));
  }

  function atualizarHorario(indice, campo, valor) {
    setDados((atual) => ({
      ...atual,
      horarios: atual.horarios.map((horario, posicao) =>
        posicao === indice ? { ...horario, [campo]: valor } : horario,
      ),
    }));
  }

  async function salvar() {
    setSalvando(true);
    try {
      const resposta = await adminService.atualizarRegras({
        duracao_reserva_minutos: Number(dados.configuracao.duracao_reserva_minutos),
        intervalo_minutos: Number(dados.configuracao.intervalo_minutos),
        cancelamento_horas: Number(dados.configuracao.cancelamento_horas),
        capacidade_por_horario: Number(dados.configuracao.capacidade_por_horario),
        horarios: dados.horarios.map((horario) => ({
          dia_semana: horario.dia_semana,
          hora_abertura: String(horario.hora_abertura).slice(0, 5),
          hora_fechamento: String(horario.hora_fechamento).slice(0, 5),
          ativo: Boolean(horario.ativo),
        })),
      });
      setDados(resposta);
      toast.success('Configurações salvas e registradas na auditoria.');
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <PageHeader
        titulo="Configurações do sistema"
        descricao="Ajuste as regras de reserva, o prazo de cancelamento e o horário de funcionamento."
        acoes={<Button icon={Save} loading={salvando} onClick={salvar}>Salvar alterações</Button>}
      />

      {carregando || !dados ? (
        <div className="flex justify-center py-24"><Spinner size={28} className="text-gold" /></div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card-dark p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <Clock3 size={19} />
              </span>
              <div>
                <h3 className="font-serif text-xl text-ivory">Regras de reserva</h3>
                <p className="text-xs text-ivory/40">Aplicadas em todo o fluxo público</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-ivory p-4">
                <Input
                  label="Duração por mesa (min)"
                  type="number"
                  min="30"
                  value={dados.configuracao.duracao_reserva_minutos}
                  onChange={(e) => atualizarConfig('duracao_reserva_minutos', e.target.value)}
                />
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <Input
                  label="Intervalo entre horários (min)"
                  type="number"
                  min="15"
                  value={dados.configuracao.intervalo_minutos}
                  onChange={(e) => atualizarConfig('intervalo_minutos', e.target.value)}
                />
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <Input
                  label="Prazo de cancelamento (h)"
                  type="number"
                  min="1"
                  value={dados.configuracao.cancelamento_horas}
                  onChange={(e) => atualizarConfig('cancelamento_horas', e.target.value)}
                />
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <Input
                  label="Capacidade por horário (pessoas)"
                  type="number"
                  min="1"
                  value={dados.configuracao.capacidade_por_horario}
                  onChange={(e) => atualizarConfig('capacidade_por_horario', e.target.value)}
                />
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-ivory/40">
              Cada reserva bloqueia a mesa pela duração configurada. O limite por horário soma todas
              as pessoas agendadas em faixas sobrepostas.
            </p>
          </div>

          <div className="card-dark p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <Users size={19} />
              </span>
              <div>
                <h3 className="font-serif text-xl text-ivory">Horários de funcionamento</h3>
                <p className="text-xs text-ivory/40">Desmarque os dias em que a casa está fechada</p>
              </div>
            </div>

            <div className="space-y-3">
              {dados.horarios.map((horario, indice) => (
                <div key={horario.dia_semana} className="flex flex-wrap items-center gap-3 rounded-xl border border-gold/10 bg-graphite-deep p-3">
                  <label className="flex min-w-[150px] flex-1 items-center gap-2 text-sm text-ivory/75">
                    <input
                      type="checkbox"
                      checked={Boolean(horario.ativo)}
                      onChange={(e) => atualizarHorario(indice, 'ativo', e.target.checked)}
                      className="h-4 w-4 accent-gold"
                    />
                    {DIAS_SEMANA[horario.dia_semana]}
                  </label>
                  <input
                    type="time"
                    value={String(horario.hora_abertura).slice(0, 5)}
                    onChange={(e) => atualizarHorario(indice, 'hora_abertura', e.target.value)}
                    className="rounded-lg border border-gold/20 bg-graphite px-3 py-2 text-sm text-ivory outline-none focus:border-gold"
                  />
                  <span className="text-ivory/30">até</span>
                  <input
                    type="time"
                    value={String(horario.hora_fechamento).slice(0, 5)}
                    onChange={(e) => atualizarHorario(indice, 'hora_fechamento', e.target.value)}
                    className="rounded-lg border border-gold/20 bg-graphite px-3 py-2 text-sm text-ivory outline-none focus:border-gold"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/5 p-4">
              <Settings2 size={17} className="mt-0.5 shrink-0 text-gold" />
              <p className="text-xs leading-relaxed text-ivory/50">
                Ao salvar, uma entrada é criada automaticamente no log de auditoria com o usuário
                responsável pela alteração.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
