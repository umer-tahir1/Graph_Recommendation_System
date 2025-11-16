import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAdminInteractions } from '@/api'
import { useAuditEmitter } from '../../hooks/useAuditEmitter'

const FILTERS = ['all', 'view', 'click', 'add_to_cart', 'review']

export default function AdminInteractions() {
  const [interactions, setInteractions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const { emitAudit } = useAuditEmitter()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchAdminInteractions(200)
      setInteractions(list)
      emitAudit({
        action: 'interaction.list',
        targetType: 'interaction',
        metadata: { count: list.length },
        after: list.slice(0, 5),
      })
    } catch (error) {
      console.error('Failed to load interactions', error)
    } finally {
      setLoading(false)
    }
  }, [emitAudit])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (filter === 'all') return interactions
    return interactions.filter((item) => item.interaction_type === filter)
  }, [filter, interactions])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Interactions</p>
        <h2 className="text-3xl font-bold text-white">Live edge stream</h2>
        <p className="text-slate-300">Inspect graph events in reverse chronological order</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                filter === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {item === 'all' ? 'All events' : item.replace(/_/g, ' ')}
            </button>
          ))}
          <button onClick={load} className="ml-auto px-4 py-2 rounded-2xl border border-slate-200 text-slate-600">
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Event</th>
                <th className="py-3 pr-4">Weight</th>
                <th className="py-3 pr-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading interactions…</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-800">{row.user_name || `User ${row.user_id}`}</p>
                      <p className="text-xs text-slate-400">ID {row.user_id}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-800">{row.product_name || `Product ${row.product_id}`}</p>
                      <p className="text-xs text-slate-400">{row.category}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">{row.interaction_type}</span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-700">{row.weight.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-sm text-slate-500">{new Date(row.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
