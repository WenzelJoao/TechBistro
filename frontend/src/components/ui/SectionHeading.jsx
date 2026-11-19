export default function SectionHeading({ eyebrow, titulo, descricao, centralizado = false, className = '' }) {
  return (
    <div className={`${centralizado ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && (
        <p className={`eyebrow mb-3 ${centralizado ? 'flex items-center justify-center gap-3' : ''}`}>
          {centralizado && <span className="h-px w-8 bg-gold/60" />}
          {eyebrow}
          {centralizado && <span className="h-px w-8 bg-gold/60" />}
        </p>
      )}
      <h2 className="heading-serif text-3xl text-ivory sm:text-4xl">{titulo}</h2>
      {descricao && <p className="mt-4 text-sm leading-relaxed text-ivory/55 sm:text-base">{descricao}</p>}
      <div className={`divider-gold mt-6 ${centralizado ? 'mx-auto' : ''}`} />
    </div>
  );
}
