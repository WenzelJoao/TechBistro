export default function EmptyState({ icone: Icone, titulo, descricao, acao }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gold/20 px-6 py-14 text-center">
      {Icone && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Icone size={22} />
        </span>
      )}
      <h3 className="font-serif text-lg text-ivory">{titulo}</h3>
      {descricao && <p className="mt-2 max-w-sm text-sm text-ivory/50">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
