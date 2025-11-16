import React from 'react'
import ProductCard from './ProductCard'

/**
 * @param {{
 *  title?: string,
 *  items: Array<{ product: any, score?: number }> ,
 *  loading?: boolean,
 *  activeProductId?: number | string | null,
 *  onSelect?: (product: any) => void,
 *  onLike?: (product: any) => void,
 *  onAddToCart?: (product: any) => void,
 *  pendingProductId?: number | string | null,
 *  emptyMessage?: string,
 * }} props
 */
export default function RecommendationCarousel({
  title = 'Recommended for you',
  items = [],
  loading = false,
  activeProductId = null,
  onSelect,
  onLike,
  onAddToCart,
  pendingProductId = null,
  emptyMessage = 'No recommendations yet.',
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Graph signal</p>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        {loading && <span className="text-sm text-indigo-100 animate-pulse">Loading…</span>}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {items.length === 0 && !loading ? (
          <div className="text-slate-300 bg-white/5 border border-white/10 rounded-3xl px-6 py-8">
            {emptyMessage}
          </div>
        ) : (
          items.map(({ product, score }) => (
            product ? (
              <ProductCard
                key={product.id}
                product={product}
                score={score}
                isActive={activeProductId === product.id}
                onSelect={onSelect}
                onLike={onLike}
                onAddToCart={onAddToCart}
                pendingAction={pendingProductId === product.id}
              />
            ) : null
          ))
        )}
      </div>
    </div>
  )
}
