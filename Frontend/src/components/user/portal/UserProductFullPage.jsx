import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchUserProductDetail, fetchProductGraph, createInteraction } from '@/api'
import { useCart } from '@/contexts/CartContext'
import RecommendationGraph from '@/components/RecommendationGraph'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
]

function getMockProduct(id, categorySlug = 'laptops') {
  const i = id - 90000
  return {
    id: id,
    name: `${categorySlug.replace(/-/g, ' ')} Series ${String.fromCharCode(65 + (i % 26))}`,
    price: 199.99 + (i * 50),
    description: `Premium ${categorySlug} featuring next-gen graph optimization and adaptive materials. This is a high-performance unit designed for the modern workflow.`,
    category: categorySlug,
    image_url: MOCK_IMAGES[i % MOCK_IMAGES.length],
    inventory: 10 + i,
    average_rating: 4.0 + ((i % 10) * 0.1),
    total_reviews: 5 + i * 2,
    total_interactions: 100 + i * 10
  }
}

export default function UserProductFullPage() {
  const { categorySlug, productId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [pendingCart, setPendingCart] = useState(false)
  const [pendingLike, setPendingLike] = useState(false)

  const numericId = Number(productId)
  const isMock = !isNaN(numericId) && numericId >= 90000

  const productQuery = useQuery({
    queryKey: ['user-product-detail', productId],
    queryFn: () => fetchUserProductDetail(productId),
    enabled: Boolean(productId) && !isMock,
    retry: false,
    refetchOnMount: true,
    staleTime: 0,
  })

  const graphQuery = useQuery({
    queryKey: ['product-graph', productId],
    queryFn: () => fetchProductGraph(productId),
    enabled: Boolean(productId) && !isMock,
    retry: false,
    refetchOnMount: true,
    staleTime: 0,
  })

  // Resolve product data: either from API or generate mock
  let product = null
  let reviews = []
  
  if (isMock) {
    product = getMockProduct(numericId, categorySlug)
    reviews = [
      { id: 1, user_id: 'User123', rating: 5, comment: 'Absolutely amazing! Exceeded my expectations.', created_at: new Date().toISOString() },
      { id: 2, user_id: 'User456', rating: 4, comment: 'Great value for the price.', created_at: new Date().toISOString() }
    ]
  } else if (productQuery.data) {
    product = productQuery.data.product
    reviews = productQuery.data.reviews || []
  }

  const handleAddToCart = async () => {
    if (!product) return
    try {
      setPendingCart(true)
      await addItem(product, 1)
      toast.success('Added to cart')
    } catch (err) {
      toast.error('Failed to add to cart')
    } finally {
      setPendingCart(false)
    }
  }

  const handleLike = async () => {
    if (!product) return
    try {
      setPendingLike(true)
      await createInteraction({ productId: product.id, action: 'like' })
      toast.success('Liked!')
    } catch (err) {
      console.error(err)
    } finally {
      setPendingLike(false)
    }
  }

  if (productQuery.isLoading && !isMock) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading product details...</p>
        </div>
      </div>
    )
  }

  if ((!isMock && productQuery.isError) || !product) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p>Product not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-indigo-400 hover:text-indigo-300">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* BACK BUTTON */}
      <div>
        <Link
          to={`/portal/category/${categorySlug || product.category}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
        >
          <span>←</span>
          <span>Back to Products</span>
        </Link>
      </div>

      {/* TOP SECTION: IMAGE & INFO */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* IMAGE */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-2 overflow-hidden">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-800">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl">📦</div>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-400 font-bold mb-4">
              {product.category}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              {product.name}
            </h1>
            <div className="mt-6 flex items-center gap-4">
              <p className="text-3xl font-bold text-white">{currency.format(product.price || 0)}</p>
              {product.average_rating && (
                <div className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-400">
                  <span>★</span>
                  <span>{product.average_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-lg text-slate-300 leading-relaxed">
            {product.description || 'No description available for this product.'}
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/50">
            <button
              onClick={handleAddToCart}
              disabled={pendingCart}
              className="flex-1 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
            >
              {pendingCart ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleLike}
              disabled={pendingLike}
              className="rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4 text-2xl text-slate-300 hover:bg-slate-700 hover:text-pink-400 hover:border-pink-500/30 transition-all disabled:opacity-50"
              title="Like"
            >
              {pendingLike ? '...' : '♥'}
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: GRAPH */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Product Graph</h2>
          <p className="text-slate-400">Visualizing relationships and interactions.</p>
        </div>
        <div className="h-[500px] w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative">
          {graphQuery.isLoading && !isMock ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              Loading graph data...
            </div>
          ) : (graphQuery.data || isMock) ? (
            <RecommendationGraph data={isMock ? { nodes: [{id: 1, label: 'Product'}, {id: 2, label: 'User'}], edges: [{from: 1, to: 2}] } : graphQuery.data} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              No graph data available.
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: REVIEWS */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">User Reviews</h2>
            <p className="text-slate-400">See what others are saying.</p>
          </div>
          <div className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300">
            {reviews.length} Reviews
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {review.user_id ? review.user_id.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-semibold text-slate-300">User {review.user_id?.substring(0, 8)}</span>
                  </div>
                  <div className="flex text-amber-400 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                <p className="mt-4 text-xs text-slate-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              No reviews yet. Be the first to review!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
