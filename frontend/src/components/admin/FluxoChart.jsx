import { formatarData } from '../../utils/formatters.js';

export default function FluxoChart({ dados = [] }) {
  const maximo = Math.max(1, ...dados.map((item) => item.total));
  const visiveis = dados.slice(-14);

  if (!visiveis.length) {
    return <p className="py-12 text-center text-sm text-ivory/40">Sem dados no período selecionado.</p>;
  }

  return (
    <div>
      <div className="flex h-52 items-end gap-2 overflow-x-auto pb-2">
        {visiveis.map((item) => (
          <div key={item.data} className="group flex min-w-[38px] flex-1 flex-col items-center gap-2">
            <span className="text-[10px] font-semibold text-ivory/50">{item.total}</span>
            <div className="relative flex h-36 w-full items-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-gold/30 to-gold transition-all duration-500 group-hover:from-gold/60 group-hover:to-gold-light"
                style={{ height: `${Math.max(4, (item.total / maximo) * 100)}%` }}
                title={`${item.total} reservas · ${item.pessoas} pessoas`}
              />
            </div>
            <span className="whitespace-nowrap text-[9px] text-ivory/40">{formatarData(item.data)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-gold/10 pt-4 text-[11px] text-ivory/45">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold" /> Reservas no período</span>
        <span className="ml-auto">Pico: {maximo} reservas em um dia</span>
      </div>
    </div>
  );
}
