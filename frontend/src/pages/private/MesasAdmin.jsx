import { useState } from 'react';
import { Armchair, PencilLine, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { Input, Select } from '../../components/ui/Field.jsx';
import { adminService } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../contexts/ToastContext.jsx';

const STATUS_MESA = {
  disponivel: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  ocupada: 'border-red-500/30 bg-red-500/10 text-red-300',
  reservada: 'border-gold/30 bg-gold/10 text-gold-light',
};

export default function MesasAdmin() {
  const { toast } = useToast();
  const { dados: mesas, carregando, recarregar } = useAsync(() => adminService.mesas(), []);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ numero_mesa: '', capacidade: '', status: 'disponivel' });
  const [excluindo, setExcluindo] = useState(null);
  const [processando, setProcessando] = useState(false);

  function abrirNovo() {
    setEditando({ id: null });
    setForm({ numero_mesa: '', capacidade: '', status: 'disponivel' });
  }

  function abrirEdicao(mesa) {
    setEditando(mesa);
    setForm({
      numero_mesa: String(mesa.numero_mesa),
      capacidade: String(mesa.capacidade),
      status: mesa.status,
    });
  }

  async function salvar() {
    setProcessando(true);
    try {
      const payload = {
        numero_mesa: Number(form.numero_mesa),
        capacidade: Number(form.capacidade),
        status: form.status,
      };
      if (editando?.id) await adminService.atualizarMesa(editando.id, payload);
      else await adminService.criarMesa(payload);
      toast.success(editando?.id ? 'Mesa atualizada.' : 'Mesa cadastrada.');
      setEditando(null);
      recarregar();
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarExclusao() {
    setProcessando(true);
    try {
      await adminService.excluirMesa(excluindo.id);
      toast.success('Mesa excluída.');
      setExcluindo(null);
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
        titulo="Configuração de mesas"
        descricao="Defina número, capacidade e status operacional de cada mesa do salão."
        acoes={<Button icon={Plus} onClick={abrirNovo}>Nova mesa</Button>}
      />

      {carregando ? (
        <div className="flex justify-center py-24"><Spinner size={28} className="text-gold" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mesas?.map((mesa) => (
            <div key={mesa.id} className="card-dark p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Armchair size={21} />
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_MESA[mesa.status]}`}>
                  {mesa.status}
                </span>
              </div>
              <p className="mt-5 font-serif text-2xl text-ivory">Mesa {String(mesa.numero_mesa).padStart(2, '0')}</p>
              <p className="mt-1 text-xs text-ivory/45">Capacidade para {mesa.capacidade} pessoas</p>
              <div className="mt-5 flex gap-2 border-t border-gold/10 pt-4">
                <Button size="sm" variant="secondary" icon={PencilLine} onClick={() => abrirEdicao(mesa)}>Editar</Button>
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => setExcluindo(mesa)}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        aberto={Boolean(editando)}
        onClose={() => setEditando(null)}
        titulo={editando?.id ? 'Editar mesa' : 'Nova mesa'}
        rodape={
          <>
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button loading={processando} onClick={salvar}>Salvar mesa</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-ivory p-4">
            <Input label="Número da mesa" type="number" min="1" value={form.numero_mesa} onChange={(e) => setForm({ ...form, numero_mesa: e.target.value })} />
          </div>
          <div className="rounded-xl bg-ivory p-4">
            <Input label="Capacidade" type="number" min="1" max="20" value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: e.target.value })} />
          </div>
          <div className="rounded-xl bg-ivory p-4 sm:col-span-2">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="disponivel">Disponível</option>
              <option value="ocupada">Ocupada</option>
              <option value="reservada">Reservada</option>
            </Select>
          </div>
        </div>
      </Modal>

      {excluindo && (
        <Modal
          aberto
          onClose={() => setExcluindo(null)}
          titulo="Excluir mesa"
          rodape={
            <>
              <Button variant="ghost" onClick={() => setExcluindo(null)}>Cancelar</Button>
              <Button variant="danger" loading={processando} onClick={confirmarExclusao}>Excluir</Button>
            </>
          }
        >
          <p className="text-sm text-ivory/65">
            Tem certeza de que deseja excluir a mesa {excluindo.numero_mesa}? Reservas ou comandas
            vinculadas impedirão a exclusão.
          </p>
        </Modal>
      )}
    </>
  );
}
