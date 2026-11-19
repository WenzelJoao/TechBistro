function Mensagem({ error, hint }) {
  if (error) return <p className="mt-1.5 text-xs text-red-400">{error}</p>;
  if (hint) return <p className="mt-1.5 text-xs text-graphite/50">{hint}</p>;
  return null;
}

export function Input({ label, error, hint, icon: Icon, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="label-tech">{label}</span>}
      <span className="relative block">
        <input
          {...props}
          className={`input-tech ${error ? 'input-tech-error' : ''} ${Icon ? 'pl-10' : ''} ${className}`}
        />
        {Icon && (
          <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite/40" />
        )}
      </span>
      <Mensagem error={error} hint={hint} />
    </label>
  );
}

export function TextArea({ label, error, hint, rows = 4, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="label-tech">{label}</span>}
      <textarea
        rows={rows}
        {...props}
        className={`input-tech resize-none ${error ? 'input-tech-error' : ''} ${className}`}
      />
      <Mensagem error={error} hint={hint} />
    </label>
  );
}

export function Select({ label, error, hint, children, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="label-tech">{label}</span>}
      <select {...props} className={`input-tech ${error ? 'input-tech-error' : ''} ${className}`}>
        {children}
      </select>
      <Mensagem error={error} hint={hint} />
    </label>
  );
}
