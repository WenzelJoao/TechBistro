import Spinner from './Spinner.jsx';

const VARIANTES = {
  primary:
    'bg-gold text-graphite shadow-gold hover:bg-gold-light hover:-translate-y-0.5 focus-visible:ring-gold/50',
  secondary:
    'bg-graphite-light text-ivory border border-gold/25 hover:border-gold/60 hover:bg-graphite-lighter',
  outline:
    'border border-gold/60 text-gold-light hover:bg-gold/10 hover:border-gold focus-visible:ring-gold/40',
  ghost: 'text-ivory/75 hover:bg-white/5 hover:text-ivory',
  light: 'bg-ivory text-graphite hover:bg-ivory-bright shadow-elegante',
  danger: 'border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20',
};

const TAMANHOS = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${VARIANTES[variant]} ${TAMANHOS[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <>
          <Spinner size={16} />
          Aguarde...
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 17} />}
          {children}
        </>
      )}
    </button>
  );
}
