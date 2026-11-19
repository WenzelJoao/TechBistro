import { useState } from 'react';
import { Clock3 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import { reservaService } from '../../services/reservaService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatarDataLonga, hojeISO } from '../../utils/formatters.js';

export default function AlterarReservaModal({ reserva, onClose, onSucesso }) {
  const { toast } = useToast();
  const [data, setData] = useState(reserva.data_reserva);
  const [pessoas, setPessoas] = useState(reserva.qtd_pessoas);
  const [hora, setHora] = useState(reserva.hora_inicio);
  const [enviando, setEnviando] = useState(false);
  const { dados, carregando, erro } = useAsync(
    () => reservaService.disponibilidade(data, pessoas),
    [data, pessoas],
  );

  const horarios = dados?.horarios || [];

  async function salvar() {
    setEnviando(true);
    try {
      await reservaService.alterarPublico(reserva.id, {
        termo: reserva.codigo_reserva,
        data_reserva: data,
        hora_inicio: hora,
        qtd_pessoas: pessoas,
      });
      toast.success('Reserva alterada com sucesso!');
      onSucesso();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      aberto
      onClose={onClose}
      titulo="Alterar reserva"
      subtitulo={`Código ${reserva.codigo_reserva}`}
      tamanho="lg"
      rodape={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button loading={enviando} disabled={!hora || Boolean(erro)} onClick={salvar}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block rounded-xl bg-ivory p-4">
          <span className="label-tech">Nova data</span>
          <input
            type="date"
            min={hojeISO()}
            value={data}
            onChange={(evento) => {
              setData(evento.target.value);
              setHora('');
            }}
            className="input-tech"
          />
        </label>
        <label className="block rounded-xl bg-ivory p-4">
          <span className="label-tech">Pessoas</span>
          <select
            value={pessoas}
            onChange={(evento) => {
              setPessoas(Number(evento.target.value));
              setHora('');
            }}
            className="input-tech"
          >
            {Array.from({ length: 10 }, (_, indice) => indice + 1).map((quantidade) => (
              <option key={quantidade} value={quantidade}>
                {quantidade} pessoa(s)
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ivory/80">
          <Clock3 size={16} className="text-gold" /> Escolha o novo horário
        </p>
        {carregando ? (
          <div className="flex justify-center py-8"><Spinner className="text-gold" /></div>
        ) : erro ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {erro.message}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {horarios.map((item) => (
              <button
                key={item.hora}
                type="button"
                disabled={!item.disponivel}
                onClick={() => setHora(item.hora)}
                className={`rounded-lg border px-2 py-2.5 text-center text-sm transition ${
                  !item.disponivel
                    ? 'cursor-not-allowed border-white/5 text-ivory/20'
                    : hora === item.hora
                      ? 'border-gold bg-gold font-bold text-graphite'
                      : 'border-gold/25 text-ivory/80 hover:border-gold'
                }`}
              >
                {item.hora}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-ivory/40">
        Nova data selecionada: {formatarDataLonga(data)}. O prazo de alteração é configurado pelo
        administrador.
      </p>
    </Modal>
  );
}
