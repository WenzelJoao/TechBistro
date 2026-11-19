import { useState } from 'react';
import {
  CalendarRange,
  ExternalLink,
  MessageCircle,
  Search,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { reservaService } from '../../services/reservaService.js';
import { adminService } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatarData, formatarTelefone } from '../../utils/formatters.js';

export default function Agendamentos() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [filtros, setFiltros] = useState({ data: '', status: '' });
  const [links, setLinks] = useState({});
  const [confirmacao, setConfirmacao] = useState(null);
  const [alterandoMesa, setAlterandoMesa] = useState(null);
  const [mesaSelecionada, setMesaSelecionada] = useState('');
  const [processando, setProcessando] = useState(false);

  const { dados: reservas, carregando, recarregar } = useAsync(
    () => reservaService.listarInterno(filtros),
    [filtros.data, filtros.status],
  );
  const { dados: mesas } = useAsync(() => adminService.mesas(), []);

  async function confirmar(reserva) {
    setProcessando(true);
    try {
      const resultado = await reservaService.confirmar(reserva.id);
      setLinks((atual) => ({
        ...atual,
        [reserva.id]: {
          link: resultado.whatsapp_link,
          mensagem: resultado.mensagem_whatsapp,
        },
      }));
      toast.success('Reserva confirmada! Link do WhatsApp disponível.');
      recarregar();
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  async function executarConfirmacao() {
    if (!confirmacao) return;
    setProcessando(true);
    try {
      if (confirmacao.tipo === 'cancelar') {
        await reservaService.cancelar(confirmacao.reserva.id);
        toast.success('Reserva cancelada.');
      } else {
        await reservaService.excluir(confirmacao.reserva.id);
        toast.success('Reserva excluída.');
      }
      setConfirmacao(null);
      recarregar();
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  async function salvarMesa() {
    if (!alterandoMesa || !mesaSelecionada) return;
    setProcessando(true);
    try {
      await reservaService.alterarMesa(alterandoMesa.id, mesaSelecionada);
      toast.success('Mesa da reserva alterada e registrada na auditoria.');
      setAlterandoMesa(null);
      recarregar();
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <>
      <PageHeader
        titulo="Agendamentos"
        descricao="Confirme reservas, envie a notificação por WhatsApp e organize a ocupação do salão."
        acoes={
          <div className="flex items-center gap-2 rounded-lg border border-gold/20 bg-graphite-light px-3 py-2 text-xs text-ivory/55">
            <CalendarRange size={15} className="text-gold" />
            {reservas?.length ?? 0} reserva(s) no filtro
          </div>
        }
      />

      <div className="card-dark mb-6 flex flex-wrap items-end gap-4 p-5">
        <label className="min-w-[180px] flex-1">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ivory/45">Data</span>
          <div className="relative">
            <input
              type="date"
              value={filtros.data}
              onChange={(evento) => setFiltros((atual) => ({ ...atual, data: evento.target.value }))}
              className="w-full rounded-lg border border-gold/20 bg-graphite px-3 py-2.5 text-sm text-ivory outline-none focus:border-gold"
            />
          </div>
        </label>
        <div className="min-w-[200px] flex-1">
          <Select
            label="Status"
            value={filtros.status}
            onChange={(evento) => setFiltros((atual) => ({ ...atual, status: evento.target.value }))}
            className="!border-gold/20 !bg-graphite !text-ivory"
          >
            <option value="">Todos os status</option>
            <option value="em_analise">Em análise</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </div>
        <Button variant="secondary" icon={Search} onClick={() => recarregar()}>
          Filtrar
        </Button>
        {(filtros.data || filtros.status) && (
          <Button variant="ghost" onClick={() => setFiltros({ data: '', status: '' })}>
            Limpar filtros
          </Button>
        )}
      </div>

      {carregando ? (
        <div className="flex justify-center py-24"><Spinner size={28} className="text-gold" /></div>
      ) : !reservas?.length ? (
        <EmptyState
          icone={CalendarRange}
          titulo="Nenhuma reserva encontrada"
          descricao="Ajuste os filtros ou aguarde novas reservas do site público."
        />
      ) : (
        <div className="card-dark overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 text-[10px] uppercase tracking-wider text-ivory/40">
                <th className="px-5 py-4 font-semibold">Horário</th>
                <th className="px-5 py-4 font-semibold">Mesa</th>
                <th className="px-5 py-4 font-semibold">Cliente</th>
                <th className="px-5 py-4 font-semibold">Pessoas</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ivory">{reserva.hora_inicio} – {reserva.hora_fim}</p>
                    <p className="mt-0.5 text-xs text-ivory/40">{formatarData(reserva.data_reserva)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
                      Mesa {String(reserva.numero_mesa).padStart(2, '0')}
                    </span>
                    <p className="mt-1 text-[11px] text-ivory/35">Até {reserva.mesa_capacidade} pessoas</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-ivory/85">{reserva.nome_completo}</p>
                    <p className="text-xs text-ivory/40">{formatarTelefone(reserva.telefone)}</p>
                    <p className="text-[10px] text-gold/70">{reserva.codigo_reserva}</p>
                  </td>
                  <td className="px-5 py-4 text-ivory/70">{reserva.qtd_pessoas}</td>
                  <td className="px-5 py-4"><StatusBadge status={reserva.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      {reserva.status !== 'confirmado' && reserva.status !== 'cancelado' && (
                        <Button
                          size="sm"
                          icon={Send}
                          loading={processando}
                          onClick={() => confirmar(reserva)}
                        >
                          Confirmar
                        </Button>
                      )}
                      {links[reserva.id] && (
                        <a
                          href={links[reserva.id].link}
                          target="_blank"
                          rel="noreferrer"
                          title={links[reserva.id].mensagem}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <MessageCircle size={14} /> WhatsApp <ExternalLink size={12} />
                        </a>
                      )}
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setAlterandoMesa(reserva);
                            setMesaSelecionada(String(reserva.mesa_id));
                          }}
                        >
                          Mesa
                        </Button>
                      )}
                      {reserva.status !== 'cancelado' && (
                        <Button
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          onClick={() => setConfirmacao({ tipo: 'cancelar', reserva })}
                        >
                          Cancelar
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Trash2}
                          onClick={() => setConfirmacao({ tipo: 'excluir', reserva })}
                        >
                          Excluir
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmacao && (
        <Modal
          aberto
          onClose={() => setConfirmacao(null)}
          titulo={confirmacao.tipo === 'cancelar' ? 'Cancelar reserva' : 'Excluir reserva'}
          rodape={
            <>
              <Button variant="ghost" onClick={() => setConfirmacao(null)}>Voltar</Button>
              <Button variant="danger" loading={processando} onClick={executarConfirmacao}>
                Confirmar ação
              </Button>
            </>
          }
        >
          <p className="text-sm text-ivory/65">
            {confirmacao.tipo === 'cancelar'
              ? 'O status da reserva será alterado para cancelado e a ação será registrada.'
              : 'O registro histórico será removido. Esta ação é restrita a administradores.'}
          </p>
          <p className="mt-3 text-xs text-gold">{confirmacao.reserva.codigo_reserva} · {confirmacao.reserva.nome_completo}</p>
        </Modal>
      )}

      {alterandoMesa && (
        <Modal
          aberto
          onClose={() => setAlterandoMesa(null)}
          titulo="Alterar mesa"
          subtitulo={`Reserva ${alterandoMesa.codigo_reserva}`}
          rodape={
            <>
              <Button variant="ghost" onClick={() => setAlterandoMesa(null)}>Cancelar</Button>
              <Button loading={processando} onClick={salvarMesa}>Salvar mesa</Button>
            </>
          }
        >
          <div className="rounded-xl bg-ivory p-4">
            <Select
              label="Nova mesa"
              value={mesaSelecionada}
              onChange={(evento) => setMesaSelecionada(evento.target.value)}
            >
              {mesas?.map((mesa) => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {String(mesa.numero_mesa).padStart(2, '0')} · até {mesa.capacidade} pessoas
                </option>
              ))}
            </Select>
          </div>
          <p className="mt-3 text-xs text-ivory/40">
            A reserva possui {alterandoMesa.qtd_pessoas} pessoa(s). Mesas com capacidade menor não serão aceitas.
          </p>
        </Modal>
      )}
    </>
  );
}
