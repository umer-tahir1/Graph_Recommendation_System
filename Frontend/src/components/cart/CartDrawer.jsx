import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function CartDrawer() {
  const {
    items,
    cartCount,
    cartTotal,
    isOpen,
    closeCart,
    removeItem,
    loading,
    syncing,
  } = useCart()

  if (!isOpen) {
    return null
  }

  const canCheckout = items.length > 0 && !syncing

  const handleCheckoutClick = (event) => {
    if (!canCheckout) {
      event.preventDefault()
      return
    }
    closeCart()
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={closeCart}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-950 text-white shadow-2xl flex flex-col">
        <header className="p-6 flex items-start justify-between border-b border-white/10">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Your cart</p>
            <h2 className="text-2xl font-semibold">{cartCount} {cartCount === 1 ? 'item' : 'items'}</h2>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-white transition"
            onClick={closeCart}
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <p className="text-slate-300">Loading your cart…</p>
          ) : items.length === 0 ? (
            <div className="text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-6">
              Your cart is empty. Keep browsing and add something you love.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex-1">
                  <p className="text-sm text-indigo-200 uppercase tracking-wide">{item.product_name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {currency.format(item.price || 0)} × {item.quantity}
                  </p>
                  <p className="text-base font-semibold mt-2">{currency.format((item.price || 0) * item.quantity)}</p>
                </div>
                <button
                  type="button"
                  className="text-sm text-rose-300 hover:text-rose-200"
                  onClick={() => removeItem(item.id)}
                  disabled={syncing}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <footer className="p-6 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Total</span>
            <span className="text-2xl font-bold text-white">{currency.format(cartTotal)}</span>
          </div>
          <Link
            to={canCheckout ? '/checkout' : '#'}
            onClick={handleCheckoutClick}
            tabIndex={canCheckout ? 0 : -1}
            aria-disabled={!canCheckout}
            className={`block text-center w-full rounded-2xl py-3 font-semibold transition ${
              canCheckout
                ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            Continue to payment
          </Link>
          {syncing && <p className="text-xs text-slate-500">Updating cart…</p>}
        </footer>
      </aside>
    </div>
  )
}
