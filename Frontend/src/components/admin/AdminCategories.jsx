import React, { useEffect, useState } from 'react'
import { fetchCategories, adminCreateCategory, adminDeleteCategory, adminReorderCategories } from '@/api'
import { useAuditEmitter } from '../../hooks/useAuditEmitter'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const { emitAudit } = useAuditEmitter()

  const load = async () => {
    setLoading(true)
    const list = await fetchCategories()
    setCategories(list)
    setLoading(false)
    setDirty(false)
  }

  useEffect(() => {
    load()
  }, [])

  const move = (index, dir) => {
    const nextIndex = index + dir
    if (nextIndex < 0 || nextIndex >= categories.length) return
    const updated = [...categories]
    const [item] = updated.splice(index, 1)
    updated.splice(nextIndex, 0, item)
    setCategories(updated)
    setDirty(true)
  }

  const persistOrder = async () => {
    const before = categories
    const ids = categories.map((c) => c.id)
    const updated = await adminReorderCategories(ids)
    emitAudit({
      action: 'category.reorder',
      targetType: 'category',
      metadata: { newOrder: ids },
      before,
      after: updated,
    })
    await load()
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    const created = await adminCreateCategory({ name: newName.trim() })
    emitAudit({
      action: 'category.create',
      targetType: 'category',
      targetId: String(created.id),
      targetDisplay: created.name,
      after: created,
    })
    setNewName('')
    await load()
  }

  const handleDelete = async (id) => {
    const beforeItem = categories.find((cat) => cat.id === id)
    await adminDeleteCategory(id)
    emitAudit({
      action: 'category.delete',
      targetType: 'category',
      targetId: String(id),
      targetDisplay: beforeItem?.name,
      before: beforeItem,
    })
    await load()
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Categories</p>
        <h2 className="text-3xl font-bold text-white">Curate taxonomy</h2>
        <p className="text-slate-300">Drag order controls which lanes appear in storefront</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add new category"
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2"
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2 rounded-2xl bg-slate-900 text-white font-semibold"
          >
            Create
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-slate-400 py-10">Loading categories…</div>
          ) : (
            categories.map((cat, index) => (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-800">{cat.name}</p>
                  <p className="text-xs text-slate-400">Position {index + 1}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => move(index, -1)} className="px-3 py-2 rounded-xl bg-white border border-slate-200">↑</button>
                  <button onClick={() => move(index, 1)} className="px-3 py-2 rounded-xl bg-white border border-slate-200">↓</button>
                  <button onClick={() => handleDelete(cat.id)} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <button
            disabled={!dirty}
            onClick={persistOrder}
            className={`px-5 py-2 rounded-2xl font-semibold ${dirty ? 'bg-gradient-to-r from-indigo-500 to-rose-500 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
          >
            Save order
          </button>
        </div>
      </div>
    </section>
  )
}
