import { useState } from 'react';
import {
  ClipboardList,
  Plus,
  ReceiptText,
  RefreshCw,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { comandaService } from '../../services/comandaService.js';
import { adminService } from '../../services/adminService.js';
import { menuService } from '../../services/menuService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatarDataHora, formatarMoeda } from '../../utils/formatters.js';

export default function Comandas() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [selecionada, setSelecionada] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [modalAberta, setModalAberta] = useState(false);
  const [novaMesa, setNovaMesa] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [processando, setProcessando] = useState(false);
  const [confirmacao, setConfirmacao] = useState(null);

  const { dados: comandas, carregando, recarregar } = useAsync(() => comandaService.listar(), []);
  const { dados: mesas } = useAsync(() => adminService.mesas(), []);
  const { dados: produtos } = useAsync(() => menuService.listarPublico(), []);

  async function abrirDetalhe(id) {
    setProcessando(true);
    try {
      setDetalhe(await comandaService.buscar(id));
      setSelecionada(id);
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  async function atualizarPainel(id) {
    await Promise.all([recarregar(), abrirDetalhe(id)]);
  }

  async function abrirComanda() {
    if (!novaMesa) return;
    setProcessando(true);
    try {
      const criada = await comandaService.abrir(novaMesa);
      toast.success('Comanda aberta com sucesso.');
      setModalAberta(false);
      setNovaMesa('');
      await atualizarPainel(criada.id);
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  async function adicionarItem() {
    if (!produtoId || !detalhe) return;
    setProcessando(true);
    try {
      await comandaService.adicionarItem(detalhe.id, produtoId, quantidade);
      toast.success('Item adicionado à comanda.');
      setProdutoId('');
      setQuantidade(1);
      await atualizarPainel(detalhe.id);
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  async function fecharComanda() {
    if (!detalhe) return;
    setProcessando(true);
    try {
      await comandaService.fechar(detalhe.id);
      toast.success('Comanda fechada. Total registrado na operação.');
      await recarregar();
      setDetalhe(null);
      setSelecionada(null);
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  async function excluirComanda() {
    if (!confirmacao) return;
    setProcessando(true);
    try {
      await comandaService.excluir(confirmacao.id);
      toast.success('Comanda excluída.');
      setConfirmacao(null);
      setDetalhe(null);
      setSelecionada(null);
      recarregar();
    } catch (erro) {
      toast.error(erro.message);
    } finally {
      setProcessando(false);
    }
  }

  const abertas = (comandas || []).filter((item) => item.status === 'aberta');
  const fechadas = (comandas || []).filter((item) => item.status === 'fechada');

  return (
    <>
      <PageHeader
        titulo="Comandas do salão"
        descricao="Substitua o papel pela operação digital: abra comandas por mesa, adicione itens e encerre o atendimento."
        acoes={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => recarregar()}
              className="w-full sm:w-auto"
            >
              Atualizar
            </Button>
            <Button
              icon={Plus}
              onClick={() => setModalAberta(true)}
              className="w-full sm:w-auto"
            >
              Abrir comanda
            </Button>
          </>
        }
      />

      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="card-dark min-w-0 overflow-hidden p-4 sm:p-5">
          <h3 className="mb-4 font-serif text-base text-ivory sm:text-lg">
            Comandas abertas ({abertas.length})
          </h3>

          {carregando ? (
            <div className="flex justify-center py-8 sm:py-12">
              <Spinner className="text-gold" />
            </div>
          ) : abertas.length === 0 ? (
            <EmptyState
              icone={ClipboardList}
              titulo="Nenhuma comanda aberta"
              descricao="Abra uma comanda para começar o atendimento de uma mesa."
            />
          ) : (
            <div className="space-y-3">
              {abertas.map((comanda) => (
                <button
                  key={comanda.id}
                  type="button"
                  onClick={() => abrirDetalhe(comanda.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition sm:p-4 ${
                    selecionada === comanda.id
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/15 hover:border-gold/40 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-serif text-base text-ivory sm:text-lg">
                      Mesa {String(comanda.numero_mesa).padStart(2, '0')}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ivory/40">
                      #{String(comanda.id).padStart(4, '0')} · {comanda.funcionario_nome}
                    </p>
                    <p className="mt-1 text-[11px] text-ivory/35">
                      {formatarDataHora(comanda.criado_em)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="whitespace-nowrap font-semibold text-gold">
                      {formatarMoeda(comanda.total_calculado)}
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-[11px] text-ivory/40">
                      {comanda.total_itens} item(ns)
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {fechadas.length > 0 && (
            <>
              <h3 className="mb-3 mt-6 font-serif text-base text-ivory/70 sm:mb-4 sm:mt-8 sm:text-lg">
                Histórico recente
              </h3>
              <div className="space-y-2">
                {fechadas.slice(0, 5).map((comanda) => (
                  <div
                    key={comanda.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gold/10 px-3 py-2.5 text-xs sm:px-4"
                  >
                    <span className="min-w-0 truncate text-ivory/55">
                      Mesa {String(comanda.numero_mesa).padStart(2, '0')} · #
                      {String(comanda.id).padStart(4, '0')}
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-gold">
                      {formatarMoeda(comanda.valor_total)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card-dark min-w-0 overflow-hidden p-4 sm:p-6">
          {!detalhe ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center text-center sm:min-h-[420px]">
              <ReceiptText size={40} className="mb-4 text-gold/60" />
              <h3 className="font-serif text-xl text-ivory">Selecione uma comanda</h3>
              <p className="mt-2 max-w-xs text-sm text-ivory/45">
                Escolha uma comanda aberta ao lado para adicionar itens e encerrar o atendimento.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gold/15 pb-4 sm:gap-4 sm:pb-5">
                <div className="min-w-0">
                  <h3 className="font-serif text-xl text-ivory sm:text-2xl">
                    Comanda #{String(detalhe.id).padStart(4, '0')}
                  </h3>
                  <p className="mt-1 break-words text-xs text-ivory/45">
                    Mesa {String(detalhe.numero_mesa).padStart(2, '0')} · {detalhe.funcionario_nome} ·{' '}
                    {formatarDataHora(detalhe.criado_em)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      detalhe.status === 'aberta'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-gold/30 bg-gold/10 text-gold'
                    }`}
                  >
                    {detalhe.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDetalhe(null);
                      setSelecionada(null);
                    }}
                    className="rounded-lg p-1.5 text-ivory/40 transition hover:bg-white/5 hover:text-ivory"
                    aria-label="Fechar detalhe"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <h4 className="mb-3 text-[10px] font-bold uppercase tracking-luxo text-ivory/40">
                  Itens da comanda
                </h4>
                <div className="space-y-2">
                  {detalhe.itens?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-3 text-sm sm:px-4"
                    >
                      <span className="min-w-0 truncate text-ivory/80">
                        {item.quantidade}x {item.produto_nome}
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-gold">
                        {formatarMoeda(item.subtotal)}
                      </span>
                    </div>
                  ))}
                  {!detalhe.itens?.length && (
                    <p className="rounded-lg border border-dashed border-gold/20 px-3 py-6 text-center text-sm text-ivory/40">
                      Nenhum item adicionado ainda.
                    </p>
                  )}
                </div>
              </div>

              {detalhe.status === 'aberta' && (
                <div className="mt-6 rounded-xl border border-gold/15 bg-graphite-deep p-3.5 sm:p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ivory">
                    <UtensilsCrossed size={16} className="text-gold" /> Adicionar item
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_110px_auto]">
                    <div className="min-w-0 rounded-lg bg-ivory p-2">
                      <Select
                        className="min-w-0"
                        value={produtoId}
                        onChange={(evento) => setProdutoId(evento.target.value)}
                      >
                        <option value="">Selecione um produto</option>
                        {produtos?.map((produto) => (
                          <option key={produto.id} value={produto.id}>
                            {produto.nome} — {formatarMoeda(produto.preco)}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="min-w-0 rounded-lg bg-ivory p-2">
                      <Select
                        className="min-w-0"
                        value={quantidade}
                        onChange={(evento) => setQuantidade(Number(evento.target.value))}
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((qtd) => (
                          <option key={qtd} value={qtd}>
                            {qtd}x
                          </option>
                        ))}
                      </Select>
                    </div>
                    <Button
                      icon={Plus}
                      loading={processando}
                      disabled={!produtoId}
                      onClick={adicionarItem}
                      className="w-full sm:w-auto"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gold/15 pt-5">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-ivory/40">Total registrado</p>
                  <p className="font-serif text-2xl text-gold sm:text-3xl">
                    {formatarMoeda(detalhe.total_calculado)}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
                  {isAdmin && (
                    <Button
                      variant="danger"
                      icon={Trash2}
                      onClick={() => setConfirmacao({ id: detalhe.id })}
                      className="w-full sm:w-auto"
                    >
                      Excluir
                    </Button>
                  )}
                  {detalhe.status === 'aberta' && (
                    <Button
                      icon={ReceiptText}
                      loading={processando}
                      onClick={fecharComanda}
                      className="w-full sm:w-auto"
                    >
                      Encerrar comanda
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        aberto={modalAberta}
        onClose={() => setModalAberta(false)}
        titulo="Abrir nova comanda"
        subtitulo="Selecione a mesa que está sendo atendida"
        rodape={
          <>
            <Button
              variant="ghost"
              onClick={() => setModalAberta(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              loading={processando}
              disabled={!novaMesa}
              onClick={abrirComanda}
              className="w-full sm:w-auto"
            >
              Abrir comanda
            </Button>
          </>
        }
      >
        <div className="min-w-0 rounded-xl bg-ivory p-4">
          <Select
            className="min-w-0"
            label="Mesa"
            value={novaMesa}
            onChange={(evento) => setNovaMesa(evento.target.value)}
          >
            <option value="">Selecione uma mesa</option>
            {mesas?.map((mesa) => (
              <option key={mesa.id} value={mesa.id}>
                Mesa {String(mesa.numero_mesa).padStart(2, '0')} · capacidade {mesa.capacidade}
              </option>
            ))}
          </Select>
        </div>
      </Modal>

      {confirmacao && (
        <Modal
          aberto
          onClose={() => setConfirmacao(null)}
          titulo="Excluir comanda"
          rodape={
            <>
              <Button
                variant="ghost"
                onClick={() => setConfirmacao(null)}
                className="w-full sm:w-auto"
              >
                Voltar
              </Button>
              <Button
                variant="danger"
                loading={processando}
                onClick={excluirComanda}
                className="w-full sm:w-auto"
              >
                Excluir comanda
              </Button>
            </>
          }
        >
          <p className="text-sm text-ivory/65">A comanda e todos os seus itens serão removidos.</p>
        </Modal>
      )}
    </>
  );
}
