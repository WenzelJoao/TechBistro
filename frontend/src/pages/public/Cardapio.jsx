import { useState } from 'react';
import { ChefHat, Info, Leaf, Sparkles, UtensilsCrossed } from 'lucide-react';
import { menuService } from '../../services/menuService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { CATEGORIAS, categoriaLabel, formatarMoeda } from '../../utils/formatters.js';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const TAGS_DESTAQUE = ['Vegano', 'Sem Glúten', 'Vegetariano', 'Sugestão do Chef'];

function ProductCard({ produto }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-graphite-light transition duration-300 hover:-translate-y-1 hover:border-gold/45">
      <div className="relative h-52 overflow-hidden bg-graphite-deep">
        {produto.imagem_url ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            loading="lazy"
            onError={(evento) => {
              evento.currentTarget.style.display = 'none';
            }}
            className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-graphite/70 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-4 rounded-full border border-gold/30 bg-graphite/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur">
          {categoriaLabel(produto.categoria)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg leading-snug text-ivory">{produto.nome}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ivory/50">{produto.descricao}</p>
        {produto.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {produto.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${
                  TAGS_DESTAQUE.includes(tag)
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-gold/25 bg-gold/10 text-gold-light'
                }`}
              >
                <Leaf size={10} /> {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 flex items-center justify-between border-t border-gold/15 pt-4">
          <span className="font-serif text-xl text-gold">{formatarMoeda(produto.preco)}</span>
          <span className="text-[10px] uppercase tracking-wider text-ivory/30">Preço informativo</span>
        </div>
      </div>
    </article>
  );
}

export default function Cardapio() {
  const [categoria, setCategoria] = useState('todas');
  const { dados: produtos, carregando, erro } = useAsync(() => menuService.listarPublico());

  const visiveis = (produtos || []).filter(
    (produto) => categoria === 'todas' || produto.categoria === categoria,
  );

  return (
    <div className="container-tech py-16 sm:py-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <SectionHeading
          eyebrow="Cardápio digital"
          titulo="Feito para todos os paladares"
          descricao="Navegue pelas nossas categorias e descubra o que está sendo servido no TechBistro. O cardápio é informativo — seu pedido é feito no salão."
        />
        <div className="flex max-w-full items-center gap-3 rounded-xl border border-gold/20 bg-graphite-light/70 px-4 py-3 text-xs text-ivory/50">
          <Info size={16} className="shrink-0 text-gold" />
          <span>Sem checkout online. Peça à sua mesa após a reserva.</span>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-2 border-b border-gold/15 pb-5">
        <button
          type="button"
          onClick={() => setCategoria('todas')}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            categoria === 'todas'
              ? 'border-gold bg-gold text-graphite'
              : 'border-gold/25 text-ivory/60 hover:border-gold/60 hover:text-gold'
          }`}
        >
          Todos os itens
        </button>
        {CATEGORIAS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategoria(item.value)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
              categoria === item.value
                ? 'border-gold bg-gold text-graphite'
                : 'border-gold/25 text-ivory/60 hover:border-gold/60 hover:text-gold'
            }`}
          >
            {item.value === 'sugestao_chef' && <ChefHat size={13} />}
            {item.label}
          </button>
        ))}
      </div>

      {categoria !== 'todas' && (
        <div className="mt-8 flex items-center gap-3">
          <Sparkles size={18} className="text-gold" />
          <div>
            <p className="font-serif text-2xl text-ivory">
              {CATEGORIAS.find((item) => item.value === categoria)?.label}
            </p>
            <p className="text-xs text-ivory/40">
              {CATEGORIAS.find((item) => item.value === categoria)?.descricao}
            </p>
          </div>
        </div>
      )}

      {carregando ? (
        <div className="mt-10 flex flex-col items-center gap-4 py-24 text-ivory/50">
          <Spinner size={28} className="text-gold" />
          <p className="text-xs uppercase tracking-luxo">Montando o cardápio...</p>
        </div>
      ) : erro || visiveis.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icone={UtensilsCrossed}
            titulo="Nenhum item encontrado"
            descricao={
              erro
                ? 'Não foi possível carregar o cardápio. Verifique se a API está rodando.'
                : 'Experimente selecionar outra categoria.'
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </div>
  );
}
