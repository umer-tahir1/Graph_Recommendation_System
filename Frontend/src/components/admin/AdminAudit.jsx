import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { fetchAdminAuditLogs } from '@/api'

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'product.create', label: 'Product created' },
  { value: 'product.update', label: 'Product updated' },
  { value: 'product.delete', label: 'Product deleted' },
  { value: 'category.create', label: 'Category created' },
  { value: 'category.delete', label: 'Category deleted' },
  { value: 'category.reorder', label: 'Category reorder' },
  { value: 'user.update', label: 'User updated' },
  { value: 'user.delete', label: 'User deleted' },
  { value: 'graph.export', label: 'Graph export' },
  { value: 'interaction.list', label: 'Interaction export' },
]

const TARGET_OPTIONS = [
  { value: '', label: 'All resources' },
  { value: 'product', label: 'Products' },
  { value: 'category', label: 'Categories' },
  { value: 'user', label: 'Supabase users' },
  { value: 'graph', label: 'Graph analytics' },
  { value: 'interaction', label: 'Interactions' },
]

const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

const PAGE_SIZES = [25, 50, 100]

const formatTimestamp = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

const JsonPreview = ({ title, payload }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">{title}</p>
    {payload ? (
      <pre className="text-xs text-slate-700 whitespace-pre-wrap">
        {JSON.stringify(payload, null, 2)}
      </pre>
    ) : (
      <p className="text-sm text-slate-400">No data</p>
    )}
  </div>
)

const MetadataGrid = ({ metadata }) => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return <p className="text-sm text-slate-400">No metadata captured.</p>
  }
  const renderValue = (value) => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} className="rounded-2xl border border-slate-200 p-3 bg-white">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{key}</p>
          <p className="text-sm font-semibold text-slate-800 break-words">{renderValue(value)}</p>
        </div>
      ))}
    </div>
  )
}

export default function AdminAudit() {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('desc')
  const [filters, setFilters] = useState({ action: '', targetType: '', adminId: '', start: '', end: '' })
  const [loading, setLoading] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage])
  const displayRows = useMemo(() => {
    return sort === 'asc' ? [...logs].reverse() : logs
  }, [logs, sort])

  const buildParams = () => ({
    page,
    per_page: perPage,
    action: filters.action || undefined,
    target_type: filters.targetType || undefined,
    admin_id: filters.adminId || undefined,
    start: filters.start ? `${filters.start}T00:00:00Z` : undefined,
    end: filters.end ? `${filters.end}T23:59:59Z` : undefined,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminAuditLogs(buildParams())
      setLogs(data.items || [])
      setTotal(data.total || 0)
    } catch (error) {
      toast.error('Unable to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [filters, page, perPage])

  useEffect(() => {
    load()
  }, [load])

  const resetFilters = () => {
    setFilters({ action: '', targetType: '', adminId: '', start: '', end: '' })
    setPage(1)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Audit logs</p>
        <h2 className="text-3xl font-bold text-white">Monitor privileged activity</h2>
        <p className="text-slate-300">Every high-impact action is recorded for compliance and observability.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="text-sm font-semibold text-slate-600">Action
            <select value={filters.action} onChange={(e) => handleFilterChange('action', e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2">
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">Target
            <select value={filters.targetType} onChange={(e) => handleFilterChange('targetType', e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2">
              {TARGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">Admin ID / Email
            <input value={filters.adminId} onChange={(e) => handleFilterChange('adminId', e.target.value)} placeholder="supabase uid or email" className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="text-sm font-semibold text-slate-600">Sort order
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2">
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-sm font-semibold text-slate-600">Start date
            <input type="date" value={filters.start} onChange={(e) => handleFilterChange('start', e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="text-sm font-semibold text-slate-600">End date
            <input type="date" value={filters.end} onChange={(e) => handleFilterChange('end', e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2" />
          </label>
          <div className="flex items-end gap-2">
            <button onClick={load} className="flex-1 rounded-2xl bg-slate-900 text-white font-semibold px-4 py-2">Refresh</button>
            <button onClick={resetFilters} className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-600">Reset</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <p className="text-sm text-slate-500">Page {page} of {pageCount} · {total} events</p>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-500">Rows per page</span>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }} className="rounded-2xl border border-slate-200 px-3 py-1 text-sm">
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-3 pr-4">Action</th>
                <th className="py-3 pr-4">Target</th>
                <th className="py-3 pr-4">Admin</th>
                <th className="py-3 pr-4">Timestamp</th>
                <th className="py-3 pr-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading audit trail…</td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">No audit events match this filter.</td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className="border-t border-slate-100">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-900">{row.action}</p>
                        <p className="text-xs text-slate-400">#{row.id}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-800">{row.target_display || '—'}</p>
                        <p className="text-xs text-slate-400">{row.target_type || 'n/a'} {row.target_id ? `• ${row.target_id}` : ''}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-800">{row.admin_email || 'Unknown admin'}</p>
                        <p className="text-xs text-slate-400">{row.admin_id}</p>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{formatTimestamp(row.created_at)}</td>
                      <td className="py-3 pr-4 text-right">
                        <button onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)} className="px-3 py-1 rounded-xl bg-slate-900 text-white text-sm font-semibold">
                          {expandedRow === row.id ? 'Hide' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === row.id && (
                      <tr className="border-t border-slate-100 bg-slate-50/50">
                        <td colSpan={5} className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <JsonPreview title="Before" payload={row.before_state} />
                            <JsonPreview title="After" payload={row.after_state} />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Metadata</p>
                            <MetadataGrid metadata={row.metadata} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className={`px-4 py-2 rounded-2xl border font-semibold ${page <= 1 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-800 text-slate-900'}`}
          >
            Previous
          </button>
          <div className="text-sm text-slate-500">Page {page} / {pageCount}</div>
          <button
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={page >= pageCount}
            className={`px-4 py-2 rounded-2xl border font-semibold ${page >= pageCount ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-800 text-slate-900'}`}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
