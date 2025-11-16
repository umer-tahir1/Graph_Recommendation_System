import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchProducts, fetchGraphRecommendations } from '@/api'

/** @typedef {import('@/types/api').Product} Product */
/** @typedef {import('@/types/api').GraphRecommendationResponse} GraphRecommendationResponse */

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

export default function AdminGraphDebug() {
  const [productId, setProductId] = useState(null)

    const catalogQuery = useQuery({
      queryKey: ['catalog'],
      queryFn: () => fetchProducts(),
    })

    useEffect(() => {
      if (catalogQuery.error) {
        toast.error('Unable to load products for debug view')
      }
    }, [catalogQuery.error])

    /** @type {Product[]} */
    const products = catalogQuery.data ?? []
    const loadingProducts = catalogQuery.isLoading

  useEffect(() => {
    if (!products.length) {
      setProductId(null)
      return
    }
    if (!productId || !products.find((product) => product.id === productId)) {
      setProductId(products[0].id)
    }
  }, [products, productId])

    const debugQuery = useQuery({
      queryKey: ['graph-debug', productId],
      queryFn: () => fetchGraphRecommendations({ productId, debug: true }),
      enabled: Boolean(productId),
    })

    useEffect(() => {
      if (debugQuery.error) {
        toast.error('Unable to load graph diagnostics')
      }
    }, [debugQuery.error])

    /** @type {GraphRecommendationResponse | undefined} */
    const debugData = debugQuery.data
    const { isFetching, refetch } = debugQuery

  const recommendationRows = debugData?.recommendations || []
  const pathEntries = useMemo(() => {
    const entries = debugData?.context?.paths || {}
    return Object.entries(entries).map(([id, payload]) => ({
      id,
      distance: payload?.distance ?? null,
      path: payload?.path || [],
    }))
  }, [debugData])

  const totals = debugData?.context?.totals || {}
  const leaders = debugData?.context?.popularity_leaders || []

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Graph Debugger</p>
          <h2 className="text-3xl font-bold text-white">Weighted-path inspector</h2>
          <p className="text-slate-300">Diagnose Dijkstra paths, edge weights, and recommendation order for any product.</p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <select
            className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100"
            value={productId ?? ''}
            onChange={(event) => {
              const value = event.target.value
              setProductId(value ? Number(value) : null)
            }}
            disabled={loadingProducts}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={!productId || isFetching}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white disabled:opacity-50"
          >
            {isFetching ? 'Refreshing…' : 'Refresh Graph'}
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Products</p>
          <p className="text-3xl font-bold text-white">{totals.products ?? '—'}</p>
          <p className="text-slate-400 text-sm">Tracked nodes in weighted graph</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Edges</p>
          <p className="text-3xl font-bold text-white">{totals.edges ?? '—'}</p>
          <p className="text-slate-400 text-sm">Bidirectional similarity edges</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Interactions</p>
          <p className="text-3xl font-bold text-white">{totals.interactions ?? '—'}</p>
          <p className="text-slate-400 text-sm">Records powering weights</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Top recommendations</p>
              <h3 className="text-2xl font-semibold text-white">Edge-weighted ranking</h3>
            </div>
            {isFetching && <span className="text-xs text-slate-400">Refreshing…</span>}
          </div>
          <div className="space-y-3">
            {recommendationRows.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">#{item.id}</p>
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-indigo-200 uppercase tracking-[0.3em]">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-sm">Score</p>
                    <p className="text-2xl font-bold text-white">{numberFormatter.format(item.score ?? 0)}</p>
                    <p className="text-xs text-slate-400">Distance {numberFormatter.format(item.distance ?? 0)}</p>
                  </div>
                </div>
                {item.edges?.length ? (
                  <div className="mt-3 text-xs text-slate-300 space-y-1">
                    {item.edges.map((edge) => (
                      <div key={`${edge.source}-${edge.target}`} className="flex justify-between">
                        <span>
                          {edge.source} → {edge.target}
                        </span>
                        <span className="text-indigo-300">w={numberFormatter.format(edge.weight)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {!recommendationRows.length && (
              <p className="text-slate-400 text-sm">No recommendations returned for this product.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Shortest paths</p>
              <h3 className="text-2xl font-semibold text-white">Dijkstra results</h3>
            </div>
          </div>
          <table className="w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">Product</th>
                <th className="py-2">Distance</th>
                <th className="py-2">Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pathEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-3 font-semibold">{entry.id}</td>
                  <td className="py-3">{entry.distance != null ? numberFormatter.format(entry.distance) : '—'}</td>
                  <td className="py-3 text-slate-400">{entry.path.join(' → ') || '—'}</td>
                </tr>
              ))}
              {!pathEntries.length && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    No path data yet. Trigger interactions to seed the graph.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Popularity leaders</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {leaders.map((leader) => (
            <div key={leader.id} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">#{leader.id}</p>
              <p className="text-white font-semibold">{leader.name}</p>
              <p className="text-xs text-slate-400">Score {numberFormatter.format(leader.score ?? 0)}</p>
            </div>
          ))}
          {!leaders.length && <p className="text-slate-400">No popularity data yet.</p>}
        </div>
      </section>
    </div>
  )
}
