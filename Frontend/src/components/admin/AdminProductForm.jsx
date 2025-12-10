import React, { useEffect, useState } from 'react'

const EMPTY_PRODUCT = {
  name: '',
  category: '',
  description: '',
  price: 0,
  image_url: '',
  inventory: 0,
}

export default function AdminProductForm({ initialData, onSubmit, onCancel, categories }) {
  const [form, setForm] = useState(EMPTY_PRODUCT)

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...initialData }))
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'price' || name === 'inventory' ? Number(value) : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.category) return
    onSubmit({ ...form })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Product name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2"
            placeholder="Aether Wave Pro"
            aria-label="Product name"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Category</span>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2"
            aria-label="Category"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Price</span>
          <input
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2"
            aria-label="Price"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-600">Inventory</span>
          <input
            type="number"
            name="inventory"
            value={form.inventory}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2"
            aria-label="Inventory"
          />
        </label>
      </div>
      <label className="space-y-2 block">
        <span className="text-sm font-semibold text-slate-600">Image URL</span>
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2"
          placeholder="https://"
          aria-label="Image URL"
        />
      </label>
      {form.image_url && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <img src={form.image_url} alt={form.name} className="w-full h-48 object-cover" />
        </div>
      )}
      <label className="space-y-2 block">
        <span className="text-sm font-semibold text-slate-600">Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2"
          aria-label="Description"
        />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-2xl border border-slate-300 text-slate-600">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 rounded-2xl bg-slate-900 text-white font-semibold">
          {initialData?.id ? 'Update product' : 'Add product'}
        </button>
      </div>
    </form>
  )
}
