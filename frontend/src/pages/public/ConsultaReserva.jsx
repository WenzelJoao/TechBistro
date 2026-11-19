import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock3,
  Hash,
  PencilLine,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { reservaService } from '../../services/reservaService.js';
import AlterarReservaModal from '../../components/reservas/AlterarReservaModal.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatarDataLonga } from '../../utils/formatters.js';

export default function ConsultaReserva() {
  const { toast } = useToast();
  const [termo, setTermo] = useState('');
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const [erro, setErro] = useState('');
  const [cancelando, setCancelando] = useState(null);
  const [alterando, setAlterando] = useState(null);

  async function buscar(evento) {
    evento?.preventDefault();
    if (termo.trim().length < 4) {
      setErro('Informe o código da reserva ou um telefone com DDD.');
      return;
    }
    setCarregando(true);
    setErro('');
    setBuscou(true);
    try {
      setReservas(await reservaService.consultar(termo.trim()));
    } catch (err) {
      setErro(err.message);
      setReservas([]);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarCancelamento() {
    if (!cancelando) return;
    try {
      await reservaService.cancelarPublico(cancelando.id, cancelando.codigo_reserva);
      toast.success('Reserva cancelada com sucesso.');
      setReservas((atual) =>
        atual.map((item) =>
          item.id === cancelando.id ? { ...item, status: 'cancelado', status_label: 'Cancelado' } : item,
        ),
      );
      setCancelando(null);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="container-tech py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-4">Sua reserva</p>
        <h1 className="heading-serif text-4xl text-ivory sm:text-5xl">Consulte e gerencie</h1>
        <p className="mt-4 text-sm leading-relaxed text-ivory/50">
          Informe o telefone usado na reserva ou o código recebido para ver o status, alterar o
          horário ou cancelar — respeitando o prazo definido pela casa.
        </p>
      </div>

      <form onSubmit={buscar} className="mx-auto mt-10 max-w-2xl">
        <div className="card-ivory flex flex-col gap-3 p-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Ex.: TB-20261120-A3F9 ou (11) 98800-1111"
              value={termo}
              onChange={(evento) => setTermo(evento.target.value)}
              aria-label="Código ou telefone"
            />
          </div>
          <Button type="submit" loading={carregando} icon={Search} size="lg">
            Buscar
          </Button>
        </div>
        {erro && <p className="mt-3 text-center text-xs text-red-300">{erro}</p>}
      </form>

      <div className="mx-auto mt-10 max-w-3xl">
        {carregando ? (
          <div className="flex flex-col items-center gap-4 py-20 text-ivory/50">
            <Spinner size={28} className="text-gold" /> Procurando sua reserva...
          </div>
        ) : buscou && reservas.length === 0 && !erro ? (
          <EmptyState
            icone={Search}
            titulo="Nenhuma reserva encontrada"
            descricao="Confira o código informado ou use o telefone cadastrado no momento da reserva."
            acao={<Link to="/reservar"><Button>Fazer nova reserva</Button></Link>}
          />
        ) : (
          <div className="space-y-4">
            {reservas.map((reserva) => (
              <article key={reserva.id} className="card-dark p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-serif text-xl text-ivory">{reserva.nome_completo}</h2>
                      <StatusBadge status={reserva.status} />
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gold">
                      <Hash size={12} /> {reserva.codigo_reserva}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reserva.pode_alterar && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={PencilLine}
                        onClick={() => setAlterando(reserva)}
                      >
                        Alterar
                      </Button>
                    )}
                    {reserva.pode_cancelar && (
                      <Button
                        size="sm"
                        variant="danger"
                        icon={XCircle}
                        onClick={() => setCancelando(reserva)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-gold/15 pt-5 text-sm text-ivory/70 sm:grid-cols-3">
                  <p className="flex items-center gap-2"><CalendarDays size={15} className="text-gold" />{formatarDataLonga(reserva.data_reserva)}</p>
                  <p className="flex items-center gap-2"><Clock3 size={15} className="text-gold" />{reserva.hora_inicio} – {reserva.hora_fim}</p>
                  <p className="flex items-center gap-2"><Users size={15} className="text-gold" />Mesa {reserva.numero_mesa} · {reserva.qtd_pessoas} pessoa(s)</p>
                </div>

                {!reserva.pode_alterar && !['cancelado'].includes(reserva.status) && (
                  <p className="mt-4 text-xs text-ivory/40">
                    O prazo para alteração ou cancelamento já foi encerrado. Fale com a equipe pelo
                    WhatsApp se precisar de ajuda.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {!buscou && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ivory/40">
            <ShieldCheck size={15} className="text-gold" /> Seus dados são usados apenas para gestão da reserva.
          </div>
        )}
      </div>

      {cancelando && (
        <Modal
          aberto
          onClose={() => setCancelando(null)}
          titulo="Cancelar reserva"
          subtitulo={cancelando.codigo_reserva}
          rodape={
            <>
              <Button variant="ghost" onClick={() => setCancelando(null)}>Voltar</Button>
              <Button variant="danger" icon={XCircle} onClick={confirmarCancelamento}>
                Confirmar cancelamento
              </Button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-ivory/65">
            Tem certeza de que deseja cancelar a reserva de{' '}
            <strong className="text-ivory">{cancelando.nome_completo}</strong> para{' '}
            {formatarDataLonga(cancelando.data_reserva)} às {cancelando.hora_inicio}?
          </p>
          <p className="mt-3 text-xs text-gold/80">Esta ação registrará o cancelamento no histórico.</p>
        </Modal>
      )}

      {alterando && (
        <AlterarReservaModal
          reserva={alterando}
          onClose={() => setAlterando(null)}
          onSucesso={buscar}
        />
      )}
    </div>
  );
}
