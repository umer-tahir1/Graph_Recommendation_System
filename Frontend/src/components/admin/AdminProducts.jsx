import React, { useEffect, useMemo, useState } from 'react'
import {
  fetchProducts,
  fetchCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '@/api'
import AdminProductForm from './AdminProductForm'
import { useAuditEmitter } from '../../hooks/useAuditEmitter'

function InlineEditable({ value, onSave, type = 'number', unit = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? 0)

  useEffect(() => {
    setDraft(value ?? 0)
  }, [value])

  const commit = async () => {
    await onSave(draft)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-left w-full">
        <span className="font-semibold text-slate-800">{value ?? 0}</span>
        {unit && <span className="text-slate-400 ml-1 text-sm">{unit}</span>}
      </button>
    )
  }

  return (
    <input
      autoFocus
      type={type}
      value={draft}
      onChange={(e) => setDraft(type === 'number' ? Number(e.target.value) : e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
      }}
      className="w-full rounded-xl border border-slate-300 px-2 py-1"
    />
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const { emitAudit } = useAuditEmitter()

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    fetchCategories().then((data) => setCategories(data))
  }, [])

  useEffect(() => {
    loadProducts()
  }, [filter, debouncedSearch])

  const loadProducts = async () => {
    setLoading(true)
    const category = filter === 'all' ? undefined : filter
    const list = await fetchProducts(category, debouncedSearch || undefined)
    setProducts(list)
    setLoading(false)
  }

  const handleSaveProduct = async (payload) => {
    if (payload.id) {
      const before = products.find((p) => p.id === payload.id)
      const updated = await adminUpdateProduct(payload.id, payload)
      emitAudit({
        action: 'product.update',
        targetType: 'product',
        targetId: String(payload.id),
        targetDisplay: updated.name,
        before,
        after: updated,
      })
    } else {
      const created = await adminCreateProduct(payload)
      emitAudit({
        action: 'product.create',
        targetType: 'product',
        targetId: String(created.id),
        targetDisplay: created.name,
        after: created,
      })
    }
    setModalOpen(false)
    setEditingProduct(null)
    await loadProducts()
  }

  const handleDelete = async (id) => {
    const before = products.find((p) => p.id === id)
    await adminDeleteProduct(id)
    emitAudit({
      action: 'product.delete',
      targetType: 'product',
      targetId: String(id),
      targetDisplay: before?.name,
      before,
    })
    await loadProducts()
  }

  const handleInline = async (id, patch) => {
    const current = products.find((p) => p.id === id)
    if (!current) return
    const updated = await adminUpdateProduct(id, { ...current, ...patch })
    emitAudit({
      action: 'product.update',
      targetType: 'product',
      targetId: String(id),
      targetDisplay: updated.name,
      before: current,
      after: updated,
      metadata: { inline: true, patch },
    })
    await loadProducts()
  }

  const filteredCount = useMemo(() => products.length, [products])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Products</p>
          <h2 className="text-3xl font-bold text-white">Manage catalog</h2>
          <p className="text-slate-300">{filteredCount} items live in the store</p>
        </div>
        <button
          onClick={() => { setModalOpen(true); setEditingProduct(null) }}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold"
        >
          + New product
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3 flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-600">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Inventory</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading products…</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-2xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">◇</div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">{product.category}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <InlineEditable
                        value={product.price?.toFixed(2)}
                        onSave={(value) => handleInline(product.id, { price: Number(value) })}
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <InlineEditable
                        value={product.inventory}
                        onSave={(value) => handleInline(product.id, { inventory: Number(value) })}
                        unit="units"
                      />
                    </td>
                    <td className="py-4 pr-4 space-x-3">
                      <button
                        onClick={() => { setEditingProduct(product); setModalOpen(true) }}
                        className="text-indigo-600 font-semibold"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-rose-500 font-semibold">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900">
                {editingProduct ? 'Edit product' : 'Add product'}
              </h3>
              <button onClick={() => { setModalOpen(false); setEditingProduct(null) }} className="text-slate-500">✕</button>
            </div>
            <AdminProductForm
              initialData={editingProduct}
              categories={categories}
              onCancel={() => { setModalOpen(false); setEditingProduct(null) }}
              onSubmit={handleSaveProduct}
            />
          </div>
        </div>
      )}
    </section>
  )
}
