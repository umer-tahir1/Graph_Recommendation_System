import React from 'react'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function CategoryProductCard({
  product,
  isActive = false,
  onSelect,
  onQuickAdd,
  onLike,
  pendingCart = false,
  pendingLike = false,
}) {
  if (!product) return null

  const image = product.image_url || product.imageUrl
  const ratingLabel = product.average_rating ? product.average_rating.toFixed(1) : '—'
  const inventoryLabel = product.inventory != null ? `${product.inventory} in stock` : 'Inventory unknown'

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition-all duration-300 ${
        isActive ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : 'hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10'
      }`}
    >
      {/* Fixed height image container for perfect symmetry */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
        {image ? (
          <img 
            src={image} 
            alt={product.name} 
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 block" 
          />
        ) : (
           <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-600">
             <span className="text-4xl">📦</span>
           </div>
        )}
        
        {/* Overlay gradient for text readability if needed, or just aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 text-white">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.35em] text-indigo-400 font-bold">{product.category}</p>
            {product.average_rating && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                <span>★</span>
                <span>{product.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h3 className="mt-2 text-lg font-bold leading-tight line-clamp-1 text-slate-100 group-hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xl font-bold text-white">{currency.format(product.price || 0)}</p>
        </div>

        {product.description && (
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-slate-800/50">
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-800">{product.total_reviews || 0} reviews</span>
            <span className="px-2 py-1 rounded bg-slate-800">{inventoryLabel}</span>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSelect?.(product)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all ${
                isActive 
                  ? 'bg-indigo-600 shadow-lg shadow-indigo-500/25' 
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
              }`}
            >
              {isActive ? 'Viewing Details' : 'View Details'}
            </button>
            
            {onQuickAdd && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickAdd(product)
                }}
                disabled={pendingCart}
                className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-3 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
                title="Quick Add to Cart"
              >
                {pendingCart ? '...' : '🛒'}
              </button>
            )}
            
            {onLike && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onLike(product)
                }}
                disabled={pendingLike}
                className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-3 text-slate-300 hover:bg-slate-700 hover:text-pink-400 hover:border-pink-500/30 transition-colors disabled:opacity-50"
                title="Like Product"
              >
                {pendingLike ? '...' : '♥'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ label }) {
  return <span className="rounded-full bg-slate-800/70 px-2.5 py-1 text-[10px] text-slate-200">{label}</span>
}

function Placeholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-2xl text-slate-600" aria-hidden>
      🛍️
    </div>
  )
}
