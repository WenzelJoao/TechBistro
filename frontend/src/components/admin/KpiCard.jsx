export default function KpiCard({ titulo, valor, descricao, icone: Icone, destaque = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-elegante ${
        destaque ? 'border-gold/50 bg-gradient-to-br from-gold/20 to-graphite-light' : 'border-gold/15 bg-graphite-light'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-luxo text-ivory/45">{titulo}</p>
          <p className="mt-3 font-serif text-3xl text-ivory">{valor}</p>
        </div>
        {Icone && (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <Icone size={19} />
          </span>
        )}
      </div>
      <p className="mt-3 text-xs text-ivory/40">{descricao}</p>
      <span className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-gold/5" />
    </div>
  );
}
