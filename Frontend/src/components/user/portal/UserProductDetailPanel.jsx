import React, { useMemo } from 'react'
import RecommendationGraph from '@/components/RecommendationGraph'
import RecommendationCarousel from '@/components/user/RecommendationCarousel'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function UserProductDetailPanel({
  detail,
  isLoading,
  quantity,
  onQuantityChange,
  selectedSize,
  onSelectSize,
  onReserve,
  reservePending,
  onLike,
  onTrackView,
  recommendations,
  recommendationsLoading,
  onSelectRecommendation,
  onAddRecommendationToCart,
  pendingProductIds = [],
}) {
  const product = detail?.product
  const sizes = detail?.sizes || []

  const maxQuantity = useMemo(() => {
    if (!detail) return 0
    if (selectedSize) {
      const target = sizes.find((size) => size.size === selectedSize)
      return Math.max(target?.quantity || 0, 0)
    }
    return Math.max(detail.product?.inventory || 0, 0)
  }, [detail, selectedSize, sizes])

  const remainingLabel = selectedSize
    ? `${maxQuantity} left in size ${selectedSize}`
    : `${maxQuantity} units available`

  const interaction = detail.interaction_summary || {}
  const reviews = detail.reviews || []

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 p-10 text-slate-300">
        Loading product detail…
      </div>
    )
  }

  if (!detail || !product) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-300">
        Choose a product from the list to see its live details.
      </div>
    )
  }

  const disableIncrement = maxQuantity > 0 && quantity >= maxQuantity
  const disableDecrement = quantity <= 1
  return (
    <div className="flex h-full flex-col text-white">
      <div className="space-y-8 overflow-y-auto pr-1">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
            <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl bg-slate-900/60">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center text-5xl text-slate-500" aria-hidden>
                  📦
                </div>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">{product.category}</p>
              <h2 className="text-3xl font-bold">{product.name}</h2>
              {product.description && <p className="mt-3 text-base leading-relaxed text-slate-300">{product.description}</p>}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <Stat label="Rating" value={`${detail.review_summary?.average_rating?.toFixed(1) || '—'} / 5`} />
              <Stat label="Reviews" value={detail.review_summary?.total_reviews || 0} />
              <Stat label="Last interaction" value={interaction.last_interaction_at ? new Date(interaction.last_interaction_at).toLocaleString() : '—'} />
              <Stat label="Views" value={interaction.views || 0} />
              <Stat label="Likes" value={interaction.likes || 0} />
              <Stat label="Cart adds" value={interaction.adds || 0} />
            </div>
          </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live inventory</p>
              <p className="text-3xl font-bold text-white">{currency.format(product.price || 0)}</p>
              <p className="text-slate-300">{remainingLabel}</p>

              {sizes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-white">Select size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size.size}
                        type="button"
                        onClick={() => onSelectSize?.(size.size)}
                        className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                          selectedSize === size.size
                            ? 'border-indigo-400 bg-indigo-500/20 text-indigo-100'
                            : 'border-slate-700 bg-slate-900 text-slate-200'
                        }`}
                      >
                        {size.size} ({size.quantity})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm font-semibold text-white">Quantity</p>
                <div className="mt-2 inline-flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-2">
                  <button
                    type="button"
                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    disabled={disableDecrement}
                    className="text-xl font-bold text-white disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="text-2xl font-semibold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => onQuantityChange(disableIncrement ? quantity : quantity + 1)}
                    disabled={disableIncrement || maxQuantity === 0}
                    className="text-xl font-bold text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onReserve}
                  disabled={reservePending || maxQuantity === 0}
                  className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {reservePending ? 'Reserving…' : 'Reserve & add to cart'}
                </button>
                <button
                  type="button"
                  onClick={onLike}
                  className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-200"
                >
                  👍 Like
                </button>
                <button
                  type="button"
                  onClick={onTrackView}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white"
                >
                  👁️ Log view
                </button>
              </div>
            </div>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-white">Graph-powered picks</h3>
              <p className="text-sm text-slate-300">Tap any recommendation to jump to its detail page.</p>
              <div className="mt-4 rounded-3xl bg-slate-950/70 p-4">
                <RecommendationCarousel
                  title=""
                  items={recommendations}
                  loading={recommendationsLoading}
                  activeProductId={product.id}
                  onSelect={onSelectRecommendation}
                  onLike={onLike}
                  onAddToCart={onAddRecommendationToCart}
                  pendingProductIds={pendingProductIds}
                  emptyMessage="Graph recommendations populate once you start interacting with products."
                />
              </div>
              </section>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-white">Recommendation graph</h3>
            <p className="text-slate-300">Nodes show shoppers and related products based on interaction overlap.</p>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
            {detail.graph?.nodes?.length ? (
              <RecommendationGraph data={detail.graph} />
            ) : (
              <p className="p-6 text-center text-slate-400">Graph data will appear after this product receives interactions.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-white">User reviews</h3>
            <p className="text-slate-300">Live ratings sourced from recent shoppers.</p>
          </div>
          {reviews.length === 0 && <p className="mt-4 text-slate-400">No reviews yet.</p>}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.slice(0, 4).map((review) => (
              <article key={review.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">User {review.user_id}</p>
                  <span className="text-sm font-bold text-amber-400">{Array.from({ length: review.rating }, () => '⭐').join('')}</span>
                </div>
                <p className="mt-3 text-slate-300">{review.comment}</p>
                {review.created_at && (
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-300">
      <span className="text-slate-400">{label}: </span>
      <span className="text-white">{value}</span>
    </div>
  )
}
