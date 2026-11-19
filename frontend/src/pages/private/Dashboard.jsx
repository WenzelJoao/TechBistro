import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  CalendarRange,
  Download,
  FileBarChart2,
  RefreshCw,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader.jsx';
import KpiCard from '../../components/admin/KpiCard.jsx';
import FluxoChart from '../../components/admin/FluxoChart.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { adminService } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { exportarRelatorioPDF } from '../../utils/pdf.js';
import { dataRelativaISO, formatarMoeda } from '../../utils/formatters.js';

export default function Dashboard() {
  const { toast } = useToast();
  const [periodo, setPeriodo] = useState({
    inicio: dataRelativaISO(-30),
    fim: dataRelativaISO(30),
  });
  const { dados, carregando, erro, recarregar } = useAsync(
    () =>
      adminService.dashboard({
        dataInicio: periodo.inicio,
        dataFim: periodo.fim,
      }),
    [periodo.inicio, periodo.fim],
  );

  const indicadores = dados?.indicadores || {};

  async function exportar() {
    if (!dados) return;
    try {
      await exportarRelatorioPDF(dados);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (err) {
      toast.error(`Não foi possível gerar o PDF: ${err.message}`);
    }
  }

  return (
    <>
      <PageHeader
        titulo="Visão geral do negócio"
        descricao="Indicadores consolidados de reservas, clientes e serviços do salão."
        acoes={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={() => recarregar()} loading={carregando}>
              Atualizar
            </Button>
            <Button icon={Download} onClick={exportar} disabled={!dados}>
              Exportar PDF
            </Button>
          </>
        }
      />

      <div className="card-dark mb-8 flex flex-wrap items-end gap-4 p-5">
        <label className="min-w-[170px] flex-1">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ivory/45">De</span>
          <input
            type="date"
            value={periodo.inicio}
            onChange={(evento) => setPeriodo((atual) => ({ ...atual, inicio: evento.target.value }))}
            className="w-full rounded-lg border border-gold/20 bg-graphite px-3 py-2.5 text-sm text-ivory outline-none focus:border-gold"
          />
        </label>
        <label className="min-w-[170px] flex-1">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ivory/45">Até</span>
          <input
            type="date"
            value={periodo.fim}
            onChange={(evento) => setPeriodo((atual) => ({ ...atual, fim: evento.target.value }))}
            className="w-full rounded-lg border border-gold/20 bg-graphite px-3 py-2.5 text-sm text-ivory outline-none focus:border-gold"
          />
        </label>
        <div className="flex items-center gap-2 rounded-lg bg-gold/10 px-4 py-3 text-xs text-gold-light">
          <CalendarRange size={15} /> Filtro aplicado aos indicadores e ao PDF
        </div>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center gap-4 py-24 text-ivory/50">
          <Spinner size={28} className="text-gold" /> Carregando indicadores...
        </div>
      ) : erro ? (
        <div className="card-dark p-8 text-center text-sm text-red-300">
          {erro.message}. Verifique se a API e o MySQL estão rodando.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              titulo="Faturamento / Serviços"
              valor={formatarMoeda(indicadores.faturamento)}
              descricao={`${indicadores.comandasFechadas || 0} comandas fechadas no período`}
              icone={TrendingUp}
              destaque
            />
            <KpiCard
              titulo="Clientes cadastrados"
              valor={indicadores.totalClientes || 0}
              descricao="Base de contatos do bistrô"
              icone={Users}
            />
            <KpiCard
              titulo="Agendamentos pendentes"
              valor={indicadores.agendamentosPendentes || 0}
              descricao="Reservas aguardando confirmação"
              icone={CalendarClock}
            />
            <KpiCard
              titulo="Reservas para hoje"
              valor={indicadores.reservasHoje || 0}
              descricao={`${indicadores.pessoasHoje || 0} pessoas previstas`}
              icone={UtensilsCrossed}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="card-dark p-6 xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-ivory">Fluxo de salão</h3>
                  <p className="mt-1 text-xs text-ivory/40">Reservas agrupadas por data</p>
                </div>
                <FileBarChart2 size={20} className="text-gold" />
              </div>
              <FluxoChart dados={dados?.fluxo} />
            </div>

            <div className="card-dark p-6">
              <h3 className="font-serif text-xl text-ivory">Reservas por status</h3>
              <p className="mt-1 text-xs text-ivory/40">Distribuição no período</p>
              <div className="mt-6 space-y-5">
                {(dados?.reservas_por_status || []).map((item) => {
                  const total = dados?.reservas_por_status?.reduce((soma, atual) => soma + atual.total, 0) || 1;
                  return (
                    <div key={item.status}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <StatusBadge status={item.status} />
                        <span className="text-sm font-semibold text-ivory">{item.total}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gold"
                          style={{ width: `${(item.total / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!dados?.reservas_por_status?.length && (
                  <p className="text-sm text-ivory/40">Nenhuma reserva no período.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="card-dark p-6">
              <h3 className="font-serif text-xl text-ivory">Produtos mais pedidos</h3>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold/15 text-[10px] uppercase tracking-wider text-ivory/40">
                      <th className="pb-3 font-semibold">Produto</th>
                      <th className="pb-3 text-right font-semibold">Qtd.</th>
                      <th className="pb-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {dados?.produtos_mais_pedidos?.map((produto) => (
                      <tr key={produto.nome}>
                        <td className="py-3 text-ivory/75">{produto.nome}</td>
                        <td className="py-3 text-right text-ivory/60">{produto.quantidade}</td>
                        <td className="py-3 text-right text-gold">{formatarMoeda(produto.total)}</td>
                      </tr>
                    ))}
                    {!dados?.produtos_mais_pedidos?.length && (
                      <tr><td colSpan={3} className="py-6 text-center text-ivory/40">Sem registros.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-dark p-6">
              <h3 className="font-serif text-xl text-ivory">Acesso rápido</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link to="/admin/agendamentos" className="rounded-xl border border-gold/20 p-4 transition hover:border-gold/60 hover:bg-gold/5">
                  <CalendarClock className="mb-2 text-gold" size={20} />
                  <p className="text-sm font-semibold text-ivory">Agendamentos</p>
                  <p className="mt-1 text-xs text-ivory/40">Confirmar e organizar reservas</p>
                </Link>
                <Link to="/admin/comandas" className="rounded-xl border border-gold/20 p-4 transition hover:border-gold/60 hover:bg-gold/5">
                  <UtensilsCrossed className="mb-2 text-gold" size={20} />
                  <p className="text-sm font-semibold text-ivory">Comandas</p>
                  <p className="mt-1 text-xs text-ivory/40">Abrir e encerrar atendimentos</p>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
