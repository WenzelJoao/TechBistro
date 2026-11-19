import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck2,
  Clock3,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { menuService } from '../../services/menuService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { CONTATO, formatarMoeda } from '../../utils/formatters.js';

const DESTAQUES_FALLBACK = [
  {
    id: 1,
    nome: 'Menu Degustação do Chef',
    categoria: 'sugestao_chef',
    descricao: 'Sete etapas que contam a história do TechBistro.',
    preco: 168,
    imagem_url:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    nome: 'Bife Ancho Grelhado',
    categoria: 'principais',
    descricao: 'Corte maturado, purê de mandioquinha e molho ao vinho.',
    preco: 98,
    imagem_url:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    nome: 'Petit Gâteau',
    categoria: 'sobremesas',
    descricao: 'Chocolate quente, recheio cremoso e sorvete de baunilha.',
    preco: 36,
    imagem_url:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Home() {
  const { dados, carregando } = useAsync(async () => {
    const itens = await menuService.listarPublico();
    const prioridade = ['sugestao_chef', 'principais', 'sobremesas'];
    return prioridade
      .map((categoria) => itens.find((item) => item.categoria === categoria))
      .filter(Boolean)
      .slice(0, 3);
  });

  const destaques = dados?.length ? dados : DESTAQUES_FALLBACK;

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-graphite-deep lg:min-h-[760px]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=85)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite via-graphite/90 to-graphite/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />

        <div className="container-tech relative z-10 grid gap-10 py-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:py-32">
          <div className="animate-fade-up">
            <p className="eyebrow mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-gold/70" /> Bistrô contemporâneo · Florianópolis - SC
            </p>
            <h1 className="heading-serif max-w-3xl text-5xl text-gradient sm:text-6xl lg:text-7xl">
              Onde cada encontro se torna um <span className="italic text-gold">banquete.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-ivory/65 sm:text-lg">
              Culinária autoral, ingredientes selecionados e um ambiente feito para celebrar.
              Reserve sua mesa e deixe que a gente cuide de cada detalhe da noite.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/reservar">
                <Button size="lg" icon={CalendarCheck2}>
                  Reservar minha mesa
                </Button>
              </Link>
              <Link to="/cardapio">
                <Button size="lg" variant="outline" icon={UtensilsCrossed}>
                  Explorar cardápio
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 border-t border-gold/20 pt-7">
              {[
                { numero: '12', texto: 'anos de cozinha' },
                { numero: '4.9', texto: 'avaliação dos convidados' },
                { numero: '8', texto: 'mesas com curadoria' },
              ].map((item) => (
                <div key={item.texto}>
                  <p className="font-serif text-3xl text-gold">{item.numero}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-ivory/45">{item.texto}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden rounded-2xl border border-gold/25 bg-graphite/80 p-7 backdrop-blur-md lg:block">
            <p className="eyebrow mb-4">Hoje no TechBistro</p>
            <p className="font-serif text-2xl leading-snug text-ivory">
              “Uma cozinha que acolhe, surpreende e permanece na memória.”
            </p>
            <div className="mt-6 flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={14} fill="currentColor" />
              ))}
              <span className="ml-2 text-xs text-ivory/50">Escolha de quem ama bem comer</span>
            </div>
            <div className="divider-gold my-6" />
            <div className="flex items-start gap-3 text-sm text-ivory/65">
              <MapPin size={17} className="mt-0.5 shrink-0 text-gold" />
              <span>{CONTATO.endereco}</span>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="container-tech -mt-1 grid gap-4 pb-20 sm:grid-cols-3">
        {[
          {
            icone: Sparkles,
            titulo: 'Culinária autoral',
            texto: 'Pratos pensados para surpreender sem perder a alma do bistrô.',
          },
          {
            icone: Clock3,
            titulo: 'Reserva em minutos',
            texto: 'Escolha data, pessoas e horário. A confirmação chega no WhatsApp.',
          },
          {
            icone: MessageCircle,
            titulo: 'Atendimento próximo',
            texto: 'Uma equipe atenta a cada detalhe da sua experiência.',
          },
        ].map((item) => (
          <div key={item.titulo} className="card-dark p-6">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
              <item.icone size={19} />
            </span>
            <h3 className="font-serif text-lg text-ivory">{item.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory/50">{item.texto}</p>
          </div>
        ))}
      </section>

      {/* DESTAQUES */}
      <section className="container-tech pb-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Destaques da casa"
            titulo="Sabores que contam histórias"
            descricao="Uma seleção do que nossa cozinha está servindo com mais carinho nesta temporada."
          />
          <Link to="/cardapio" className="shrink-0 pb-1">
            <Button variant="ghost" icon={ArrowRight}>
              Ver cardápio completo
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {carregando
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card-dark flex h-96 items-center justify-center">
                  <Spinner className="text-gold" />
                </div>
              ))
            : destaques.map((produto) => (
                <article
                  key={produto.id}
                  className="group overflow-hidden rounded-2xl border border-gold/15 bg-graphite-light transition duration-300 hover:-translate-y-1 hover:border-gold/45"
                >
                  <div className="relative h-56 overflow-hidden bg-graphite-deep">
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-graphite/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur">
                      Destaque
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-ivory">{produto.nome}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ivory/50">
                      {produto.descricao}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-gold/15 pt-4">
                      <span className="font-serif text-xl text-gold">{formatarMoeda(produto.preco)}</span>
                      <Link to="/reservar" className="text-xs font-semibold text-ivory/60 hover:text-gold">
                        Reservar e provar →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </section>

      {/* EXPERIÊNCIA */}
      <section className="border-y border-gold/10 bg-graphite-dark py-20">
        <div className="container-tech grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85"
              alt="Salão do TechBistro"
              loading="lazy"
              className="h-[420px] w-full rounded-2xl object-cover opacity-90"
            />
            <div className="absolute -bottom-6 -right-3 w-52 rounded-xl border border-gold/30 bg-graphite p-5 shadow-elegante sm:-right-6">
              <Clock3 className="mb-2 text-gold" size={20} />
              <p className="text-[10px] uppercase tracking-luxo text-ivory/40">Funcionamento</p>
              <p className="mt-2 text-sm text-ivory">Ter–Sáb · 18h às 23h</p>
              <p className="text-sm text-ivory">Dom · 11h30 às 15h</p>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="A experiência"
              titulo="Mais do que uma refeição, um momento seu"
              descricao="Do primeiro gole à última colherada, cada detalhe do serviço é pensado para que você apenas aproveite. Traga quem você gosta — nós preparamos o resto."
            />
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/reservar">
                <Button icon={CalendarCheck2}>Garantir minha mesa</Button>
              </Link>
              <a
                href={`https://wa.me/55${CONTATO.telefone}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" icon={MessageCircle}>
                  Falar com a equipe
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-tech py-24">
        <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/15 via-graphite-light to-graphite px-8 py-14 text-center sm:px-16">
          <p className="eyebrow mb-4">Sua mesa espera por você</p>
          <h2 className="heading-serif mx-auto max-w-2xl text-3xl text-ivory sm:text-5xl">
            A melhor noite começa com uma <span className="italic text-gold">reserva.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm text-ivory/55">
            Escolha o horário ideal para você. Se estiver lotado, mostramos as opções mais próximas.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/reservar">
              <Button size="lg" icon={CalendarCheck2}>
                Reservar agora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
