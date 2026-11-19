import Spinner from './Spinner.jsx';

export default function LoadingScreen({ mensagem = 'Preparando sua experiência...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-graphite">
      <span className="font-serif text-2xl tracking-wide text-ivory">
        Tech<span className="text-gold">Bistro</span>
      </span>
      <Spinner size={26} className="text-gold" />
      <p className="text-xs uppercase tracking-luxo text-ivory/40">{mensagem}</p>
    </div>
  );
}
