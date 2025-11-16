import React from 'react'

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/**
 * @param {{
 *  product: { id: number | string, name: string, category?: string, price?: number, image_url?: string, imageUrl?: string },
 *  score?: number,
 *  onSelect?: (product: any) => void,
 *  isActive?: boolean,
 *  onLike?: (product: any) => void,
 *  onAddToCart?: (product: any) => void,
 *  pendingAction?: boolean,
 * }} props
 */
export default function ProductCard({
  product,
  score,
  onSelect,
  isActive = false,
  onLike,
  onAddToCart,
  pendingAction = false,
}) {
  if (!product) return null

  const image = product.image_url || product.imageUrl
  const cardClasses = [
    'flex-1 basis-[180px] min-w-[160px] max-w-[220px] rounded-3xl border px-4 py-5 transition-all text-left',
    'bg-white/80 backdrop-blur shadow-sm hover:shadow-xl flex flex-col gap-4',
    isActive ? 'border-indigo-500 ring-2 ring-indigo-300' : 'border-slate-200'
  ].join(' ')

  const scoreDisplay = typeof score === 'number' ? score.toFixed(score > 10 ? 1 : 2) : null

  const handleCardKey = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && onSelect) {
      event.preventDefault()
      onSelect(product)
    }
  }

  const renderActionButton = (label, onClick, accentClasses) => (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(product)
      }}
      disabled={pendingAction}
      className={`flex-1 px-3 py-2 rounded-2xl text-sm font-semibold transition ${accentClasses} ${pendingAction ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {pendingAction ? 'Logging…' : label}
    </button>
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(product)}
      onKeyDown={handleCardKey}
      className={cardClasses}
    >
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
          {image ? (
            <img src={image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl" aria-hidden>🛒</span>
          )}
        </div>
        <div className="text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{product.category}</p>
          <p className="text-base font-semibold text-slate-900 line-clamp-1">{product.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{priceFormatter.format(product.price || 0)}</span>
        {scoreDisplay && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-xs">
            Score {scoreDisplay}
          </span>
        )}
      </div>

      {(onLike || onAddToCart) && (
        <div className="flex gap-2 pt-1">
          {onLike && renderActionButton('👍 Like', onLike, 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100')}
          {onAddToCart && renderActionButton('🛒 Add', onAddToCart, 'bg-indigo-600 text-white hover:bg-indigo-500')}
        </div>
      )}
    </div>
  )
}
