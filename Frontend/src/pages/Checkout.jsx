import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '@/contexts/CartContext'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function Checkout() {
  const navigate = useNavigate()
  const { items, cartTotal, clearCart } = useCart()
  const [formState, setFormState] = useState({
    name: '',
    card: '',
    expiry: '',
    cvv: '',
  })
  const [processing, setProcessing] = useState(false)

  const subtotal = useMemo(() => cartTotal, [cartTotal])
  const taxEstimate = useMemo(() => subtotal * 0.07, [subtotal])
  const totalDue = useMemo(() => subtotal + taxEstimate, [subtotal, taxEstimate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!items.length) {
      toast.error('Your cart is empty')
      return
    }
    if (!formState.name || !formState.card || !formState.expiry || !formState.cvv) {
      toast.error('Fill out payment details to continue')
      return
    }
    setProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 900))
      await clearCart()
      toast.success('Payment processed successfully')
      navigate('/portal')
    } catch (_error) {
      toast.error('Unable to process payment right now')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Checkout</p>
          <h1 className="text-4xl font-bold">Payment method</h1>
          <p className="text-indigo-100">Review your cart and complete your purchase securely.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <form className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-indigo-200 uppercase tracking-[0.3em]">Name on card</label>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="text-sm text-indigo-200 uppercase tracking-[0.3em]">Card number</label>
              <input
                type="text"
                name="card"
                value={formState.card}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white"
                placeholder="4242 4242 4242 4242"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-indigo-200 uppercase tracking-[0.3em]">Expiry</label>
                <input
                  type="text"
                  name="expiry"
                  value={formState.expiry}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="text-sm text-indigo-200 uppercase tracking-[0.3em]">CVV</label>
                <input
                  type="password"
                  name="cvv"
                  value={formState.cvv}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white"
                  placeholder="123"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={processing || !items.length}
              className={`w-full rounded-2xl py-3 font-semibold transition ${
                processing || !items.length
                  ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white'
              }`}
            >
              {processing ? 'Processing…' : `Pay ${currency.format(totalDue)}`}
            </button>
            <Link to="/portal" className="inline-flex items-center gap-2 text-sm text-indigo-200">
              ← Keep shopping
            </Link>
          </form>

          <aside className="bg-white rounded-3xl text-slate-900 p-6 space-y-4 border border-slate-100">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="space-y-3">
              {items.length === 0 && <p className="text-slate-500">No items in cart.</p>}
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{currency.format((item.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{currency.format(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated tax</span>
                <span>{currency.format(taxEstimate)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total due</span>
                <span>{currency.format(totalDue)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
