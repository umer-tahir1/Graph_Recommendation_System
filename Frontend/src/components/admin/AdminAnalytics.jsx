import React, { useEffect, useState } from 'react'
import { fetchAdminGraphExport } from '@/api'
import RecommendationGraph from '../RecommendationGraph'
import { useAuditEmitter } from '../../hooks/useAuditEmitter'

export default function AdminAnalytics() {
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const { emitAudit } = useAuditEmitter()

  const load = async () => {
    setLoading(true)
    const data = await fetchAdminGraphExport()
    setSnapshot(data)
    setLoading(false)
    emitAudit({
      action: 'graph.export',
      targetType: 'graph',
      metadata: { nodes: data?.nodes?.length || 0, edges: data?.edges?.length || 0 },
      after: data,
      targetDisplay: 'Graph snapshot',
    })
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Graph analytics</p>
        <h2 className="text-3xl font-bold text-white">Graph-native telemetry</h2>
        <p className="text-slate-300">See top products, interaction counts, and the latest bipartite snapshot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['users', 'products', 'interactions'].map((key) => (
          <div key={key} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{key}</p>
            <p className="text-3xl font-bold text-slate-900">{snapshot?.totals?.[key] ?? '—'}</p>
          </div>
        ))}
        <button onClick={load} className="rounded-3xl border border-slate-200 text-slate-600 font-semibold px-4 py-3">
          Refresh data
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Top products by interactions</h3>
        {loading ? (
          <p className="text-slate-400">Loading analytics…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Interactions</th>
                  <th className="py-3 pr-4">Weight sum</th>
                </tr>
              </thead>
              <tbody>
                {(snapshot?.top_products || []).map((item) => (
                  <tr key={item.product_id} className="border-t border-slate-100">
                    <td className="py-3 pr-4 font-semibold text-slate-800">{item.product_name}</td>
                    <td className="py-3 pr-4 text-slate-500">{item.category}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{item.interactions}</td>
                    <td className="py-3 pr-4 text-slate-500">{item.weight_sum.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Graph snapshot</h3>
        {snapshot ? (
          <RecommendationGraph data={{ nodes: snapshot.nodes, edges: snapshot.edges }} />
        ) : (
          <p className="text-slate-400">Graph data not available.</p>
        )}
        {snapshot && (
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Key nodes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {snapshot.nodes.slice(0, 8).map((node) => (
                <div key={node.id} className="rounded-2xl border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">{node.label}</p>
                  <p className="text-xs text-slate-400">{node.group}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
