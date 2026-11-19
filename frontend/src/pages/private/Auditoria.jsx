import { useState } from 'react';
import { Search, ScrollText, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { adminService } from '../../services/adminService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { formatarDataHora } from '../../utils/formatters.js';

export default function Auditoria() {
  const [acao, setAcao] = useState('');
  const [termo, setTermo] = useState('');
  const { dados: logs, carregando, recarregar } = useAsync(() => adminService.logs({ acao, limite: 300 }), [acao]);

  function buscar(evento) {
    evento.preventDefault();
    setAcao(termo);
  }

  return (
    <>
      <PageHeader
        titulo="Log de auditoria"
        descricao="Rastreabilidade completa das operações realizadas no sistema, com usuário responsável e referência."
        acoes={
          <div className="flex items-center gap-2 rounded-lg border border-gold/20 bg-graphite-light px-3 py-2 text-xs text-ivory/55">
            <ShieldCheck size={15} className="text-gold" /> Somente administradores
          </div>
        }
      />

      <form onSubmit={buscar} className="card-dark mb-6 flex flex-wrap items-end gap-4 p-5">
        <div className="min-w-[240px] flex-1 rounded-xl bg-ivory p-3">
          <Input
            placeholder="Buscar operação (ex.: Reserva confirmada)"
            value={termo}
            onChange={(evento) => setTermo(evento.target.value)}
          />
        </div>
        <Button type="submit" icon={Search}>Buscar</Button>
        <Button type="button" variant="ghost" onClick={() => { setTermo(''); setAcao(''); }}>
          Limpar
        </Button>
      </form>

      {carregando ? (
        <div className="flex justify-center py-24"><Spinner size={28} className="text-gold" /></div>
      ) : !logs?.length ? (
        <EmptyState icone={ScrollText} titulo="Nenhum registro encontrado" descricao="As operações realizadas aparecerão aqui automaticamente." />
      ) : (
        <div className="card-dark overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 text-[10px] uppercase tracking-wider text-ivory/40">
                <th className="px-5 py-4 font-semibold">Data/Hora</th>
                <th className="px-5 py-4 font-semibold">Usuário responsável</th>
                <th className="px-5 py-4 font-semibold">Operação realizada</th>
                <th className="px-5 py-4 font-semibold">Referência</th>
                <th className="px-5 py-4 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-ivory/55">{formatarDataHora(log.data_hora)}</td>
                  <td className="px-5 py-4">
                    <p className="text-ivory/85">{log.usuario_nome || 'Sistema / Cliente'}</p>
                    <p className="text-[10px] uppercase tracking-wide text-gold/70">{log.usuario_cargo || 'público'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-xs text-gold-light">
                      {log.acao}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-ivory/60">{log.referencia}</td>
                  <td className="max-w-[300px] px-5 py-4 text-xs text-ivory/45">{log.detalhes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
