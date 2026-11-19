export default function PageHeader({ titulo, descricao, acoes }) {
  return (
    <div className="mb-6 flex min-w-0 flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h2 className="font-serif text-2xl text-ivory sm:text-3xl">{titulo}</h2>
        {descricao && <p className="mt-2 max-w-2xl text-sm text-ivory/50">{descricao}</p>}
      </div>
      {acoes && <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:gap-3">{acoes}</div>}
    </div>
  );
}
