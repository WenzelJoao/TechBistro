import { useState } from 'react';
import { PencilLine, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Input, Select, TextArea } from '../../components/ui/Field.jsx';
import { menuService } from '../../services/menuService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { CATEGORIAS, categoriaLabel, formatarMoeda } from '../../utils/formatters.js';

const FORM_VAZIO = {
  nome: '',
  descricao: '',
  categoria: 'principais',
  preco: '',
  imagem_url: '',
  tags: '',
  ativo: true,
};

export default function CardapioAdmin() {
  const { toast } = useToast();
  const { dados: produtos, carregando, recarregar } = useAsync(() => menuService.listarAdministrativo(), []);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [excluindo, setExcluindo] = useState(null);
  const [processando, setProcessando] = useState(false);

  function abrirNovo() {
    setEditando({ id: null });
    setForm(FORM_VAZIO);
  }

  function abrirEdicao(produto) {
    setEditando(produto);
    setForm({
      nome: produto.nome,
      descricao: produto.descricao,
      categoria: produto.categoria,
      preco: String(produto.preco),
      imagem_url: produto.imagem_url || '',
      tags: (produto.tags || []).join(', '),
      ativo: produto.ativo,
    });
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar() {
    setProcessando(true);
    try {
      const payload = {
        ...form,
        preco: Number(form.preco),
        imagem_url: form.imagem_url || null,
        tags: form.tags || null,
      };
      if (editando?.id) {
        await menuService.atualizar(editando.id, payload);
        toast.success('Item atualizado.');
      } else {
        await menuService.criar(payload);
        toast.success('Item cadastrado no cardápio.');
      }
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
      await menuService.excluir(excluindo.id);
      toast.success('Item removido do cardápio.');
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
        titulo="Gestão do cardápio"
        descricao="Cadastre, edite e desative itens. Alterações aparecem imediatamente no cardápio público."
        acoes={<Button icon={Plus} onClick={abrirNovo}>Novo item</Button>}
      />

      {carregando ? (
        <div className="flex justify-center py-24"><Spinner size={28} className="text-gold" /></div>
      ) : !produtos?.length ? (
        <EmptyState icone={UtensilsCrossed} titulo="Cardápio vazio" descricao="Cadastre o primeiro item para começar." />
      ) : (
        <div className="card-dark overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 text-[10px] uppercase tracking-wider text-ivory/40">
                <th className="px-5 py-4 font-semibold">Item</th>
                <th className="px-5 py-4 font-semibold">Categoria</th>
                <th className="px-5 py-4 font-semibold">Preço</th>
                <th className="px-5 py-4 font-semibold">Tags</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-14 shrink-0 overflow-hidden rounded bg-graphite-deep">
                        {produto.imagem_url && <img src={produto.imagem_url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-ivory/85">{produto.nome}</p>
                        <p className="max-w-[260px] truncate text-xs text-ivory/40">{produto.descricao}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ivory/60">{categoriaLabel(produto.categoria)}</td>
                  <td className="px-5 py-3 font-semibold text-gold">{formatarMoeda(produto.preco)}</td>
                  <td className="px-5 py-3 text-xs text-ivory/50">{produto.tags?.join(', ') || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${produto.ativo ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-ivory/15 text-ivory/40'}`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" icon={PencilLine} onClick={() => abrirEdicao(produto)}>Editar</Button>
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setExcluindo(produto)}>Excluir</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        aberto={Boolean(editando)}
        onClose={() => setEditando(null)}
        titulo={editando?.id ? 'Editar item' : 'Novo item do cardápio'}
        tamanho="lg"
        rodape={
          <>
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button loading={processando} onClick={salvar}>Salvar item</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-ivory p-4 sm:col-span-2">
            <Input label="Nome" value={form.nome} onChange={(e) => atualizar('nome', e.target.value)} />
          </div>
          <div className="rounded-xl bg-ivory p-4 sm:col-span-2">
            <TextArea label="Descrição" value={form.descricao} onChange={(e) => atualizar('descricao', e.target.value)} />
          </div>
          <div className="rounded-xl bg-ivory p-4">
            <Select label="Categoria" value={form.categoria} onChange={(e) => atualizar('categoria', e.target.value)}>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria.value} value={categoria.value}>{categoria.label}</option>
              ))}
            </Select>
          </div>
          <div className="rounded-xl bg-ivory p-4">
            <Input label="Preço (R$)" type="number" step="0.01" min="0" value={form.preco} onChange={(e) => atualizar('preco', e.target.value)} />
          </div>
          <div className="rounded-xl bg-ivory p-4 sm:col-span-2">
            <Input label="URL da imagem (opcional)" value={form.imagem_url} onChange={(e) => atualizar('imagem_url', e.target.value)} />
          </div>
          <div className="rounded-xl bg-ivory p-4 sm:col-span-2">
            <Input label="Tags (separadas por vírgula)" placeholder="Vegano, Sem Glúten" value={form.tags} onChange={(e) => atualizar('tags', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ivory/70 sm:col-span-2">
            <input type="checkbox" checked={form.ativo} onChange={(e) => atualizar('ativo', e.target.checked)} className="h-4 w-4 accent-gold" />
            Item ativo no cardápio público
          </label>
        </div>
      </Modal>

      {excluindo && (
        <Modal
          aberto
          onClose={() => setExcluindo(null)}
          titulo="Excluir item"
          rodape={
            <>
              <Button variant="ghost" onClick={() => setExcluindo(null)}>Cancelar</Button>
              <Button variant="danger" loading={processando} onClick={confirmarExclusao}>Excluir item</Button>
            </>
          }
        >
          <p className="text-sm text-ivory/65">
            Excluir <strong className="text-ivory">{excluindo.nome}</strong>? Se o item já estiver em
            comandas, ele será apenas desativado para preservar o histórico.
          </p>
        </Modal>
      )}
    </>
  );
}
