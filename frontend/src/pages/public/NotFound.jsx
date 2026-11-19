import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="container-tech flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
        <Compass size={30} />
      </span>
      <p className="eyebrow mb-3">Erro 404</p>
      <h1 className="heading-serif text-4xl text-ivory sm:text-5xl">Página não encontrada</h1>
      <p className="mt-4 max-w-md text-sm text-ivory/50">
        O endereço que você procura não existe ou foi movido. Que tal voltar ao início e escolher
        outra experiência?
      </p>
      <div className="mt-8">
        <Link to="/"><Button size="lg">Voltar ao início</Button></Link>
      </div>
    </div>
  );
}
