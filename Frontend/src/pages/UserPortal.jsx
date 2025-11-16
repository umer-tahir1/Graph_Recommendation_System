import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProducts, fetchGraphRecommendations, createInteraction } from '@/api'
import { useAuth } from '@/contexts/AuthContext'
import RecommendationCarousel from '@/components/user/RecommendationCarousel'

/** @typedef {import('@/types/api').Product} Product */
/** @typedef {import('@/types/api').GraphRecommendationItem} GraphRecommendationItem */
/** @typedef {import('@/types/api').GraphRecommendationResponse} GraphRecommendationResponse */
/** @typedef {import('@/types/api').InteractionAck} InteractionAck */
/** @typedef {import('@/types/api').InteractionInput} InteractionInput */

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function UserPortal() {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)

  const catalogQuery = useQuery({
    queryKey: ['catalog'],
    queryFn: () => fetchProducts(),
  })

  useEffect(() => {
    if (catalogQuery.error) {
      toast.error('Unable to load catalog')
    }
  }, [catalogQuery.error])

  /** @type {Product[]} */
  const products = catalogQuery.data ?? []
  const loadingProducts = catalogQuery.isLoading

  useEffect(() => {
    if (!products.length) {
      setSelectedProductId(null)
      return
    }
    if (!selectedProductId || !products.find((item) => item.id === selectedProductId)) {
      setSelectedProductId(products[0].id)
    }
  }, [products, selectedProductId])

  const productLookup = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products])
  const selectedProduct = selectedProductId ? productLookup[selectedProductId] : null

  const graphQueryKey = useMemo(
    () => ['graph-recs', userId, selectedProductId, 5],
    [userId, selectedProductId],
  )

  const hydrateRecommendationProducts = useCallback(
    (items = []) =>
      items
        .map((item) => {
          if (!item) return null
          const candidate = productLookup[item.id]
          const baseProduct = candidate || {
            id: item.id,
            name: item.name || `Product ${item.id}`,
            category: item.category || 'Graph pick',
            price: item.price || 0,
          }
          return {
            product: baseProduct,
            score: item.score ?? 0,
            path: item.path,
          }
        })
        .filter(Boolean),
    [productLookup],
  )

  const graphQuery = useQuery({
    queryKey: graphQueryKey,
    queryFn: () => fetchGraphRecommendations({ productId: selectedProductId, userId, limit: 5 }),
    enabled: Boolean(userId && selectedProductId),
    placeholderData: (previousData) => previousData,
  })

  useEffect(() => {
    if (graphQuery.error) {
      toast.error('Unable to fetch recommendations')
    }
  }, [graphQuery.error])

  /** @type {GraphRecommendationResponse | undefined} */
  const graphResponse = graphQuery.data
  const loadingRecommendations = graphQuery.isFetching

  const recommendations = useMemo(
    () => hydrateRecommendationProducts(graphResponse?.recommendations || []),
    [graphResponse, hydrateRecommendationProducts],
  )

  const prefetchRecommendations = useCallback(
    (productId) => {
      if (!userId || !productId) return
      queryClient.prefetchQuery({
        queryKey: ['graph-recs', userId, productId, 5],
        queryFn: () => fetchGraphRecommendations({ productId, userId, limit: 5 }),
      })
    },
    [queryClient, userId],
  )

  const handleProductSelect = useCallback(
    (product) => {
      if (!product) return
      prefetchRecommendations(product.id)
      setSelectedProductId(product.id)
    },
    [prefetchRecommendations],
  )

  const interactionMutation = useMutation(
    /** @type {import('@tanstack/react-query').UseMutationOptions<InteractionAck, Error, InteractionInput>} */ ({
      mutationFn: (variables) => {
        if (!variables?.productId) {
          return Promise.reject(new Error('Product id is required'))
        }
        return createInteraction({
          productId: variables.productId,
          userId,
          action: variables.action,
          metadata: {
            seed_product_id: selectedProductId,
            surface: 'user-portal',
          },
        })
      },
      onMutate: async (variables) => {
        if (!variables?.productId) return undefined
        setPendingAction({ productId: variables.productId, action: variables.action })
        await queryClient.cancelQueries({ queryKey: graphQueryKey })
        const previous = /** @type {GraphRecommendationResponse | undefined} */ (
          queryClient.getQueryData(graphQueryKey)
        )
        if (!previous) {
          return { previous }
        }
        const optimistic = {
          ...previous,
          recommendations: (previous.recommendations || []).map((item) =>
            item.id === variables.productId
              ? { ...item, score: (item.score || 0) + (variables.action === 'add_to_cart' ? 0.2 : 0.1) }
              : item,
          ),
        }
        queryClient.setQueryData(graphQueryKey, optimistic)
        return { previous }
      },
      onError: (_error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(graphQueryKey, context.previous)
        }
        toast.error('Unable to record interaction')
      },
      onSuccess: (data) => {
        if (data?.next_recommendations?.length) {
          queryClient.setQueryData(graphQueryKey, (prev) => {
            const existing = /** @type {GraphRecommendationResponse | undefined} */ (prev)
            if (!existing) return existing
            return {
              ...existing,
              recommendations: data.next_recommendations || [],
            }
          })
        }
        toast.success('Interaction logged')
      },
      onSettled: () => {
        setPendingAction(null)
        queryClient.invalidateQueries({ queryKey: graphQueryKey })
      },
    })
  )

  const handleInteraction = useCallback(
    (action, product) => {
      if (!product || !userId) {
        toast.error('You need to be logged in to record actions')
        return
      }
      interactionMutation.mutate({ action, productId: product.id })
    },
    [interactionMutation, userId],
  )

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">User Portal</p>
          <h1 className="text-4xl font-bold">Welcome back{user ? `, ${user.email}` : ''}</h1>
          <p className="text-indigo-100 max-w-2xl">
            Explore the full catalog, pick a product you love, and see graph-powered recommendations
            tailored from your interactions.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
          <aside className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Catalog</p>
              <h2 className="text-2xl font-semibold">Your products</h2>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {loadingProducts && (
                <div className="text-slate-300">Loading catalog…</div>
              )}
              {!loadingProducts && products.length === 0 && (
                <div className="text-slate-300">No products found.</div>
              )}
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                    selectedProductId === product.id
                      ? 'border-indigo-400 bg-white/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">{product.category}</p>
                  <p className="text-base font-semibold text-white line-clamp-1">{product.name}</p>
                  <p className="text-sm text-indigo-100">{currency.format(product.price || 0)}</p>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            {selectedProduct ? (
              <div className="bg-white rounded-3xl text-slate-900 p-8 border border-slate-100 shadow-xl">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">{selectedProduct.category}</p>
                      <h2 className="text-3xl font-bold text-slate-900 mt-2">{selectedProduct.name}</h2>
                    </div>
                    <span className="text-2xl font-extrabold text-slate-900">{currency.format(selectedProduct.price || 0)}</span>
                  </div>
                  {selectedProduct.description && (
                    <p className="text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">Product ID {selectedProduct.id}</span>
                    {selectedProduct.inventory != null && (
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                        {selectedProduct.inventory} in stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/10 rounded-3xl p-8 text-slate-100">
                Select a product to see its recommendation graph.
              </div>
            )}

            <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6">
              <RecommendationCarousel
                title="Top 5 graph recommendations"
                items={recommendations}
                loading={loadingRecommendations}
                activeProductId={selectedProductId}
                onSelect={handleProductSelect}
                onLike={(product) => handleInteraction('like', product)}
                onAddToCart={(product) => handleInteraction('add_to_cart', product)}
                pendingProductId={pendingAction?.productId}
                emptyMessage="Graph recommendations will appear once you pick a product."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
