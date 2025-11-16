import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { addToCart as apiAddToCart, fetchCart as apiFetchCart, removeCartItem as apiRemoveCartItem } from '@/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const hydrate = useCallback(async () => {
    if (!userId) {
      setItems([])
      return []
    }
    setLoading(true)
    try {
      const next = await apiFetchCart()
      setItems(next)
      return next
    } catch (error) {
      toast.error('Unable to load your cart')
      return []
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setItems([])
      setIsOpen(false)
      return
    }
    hydrate()
  }, [userId, hydrate])

  const cartCount = useMemo(() => items.reduce((sum, item) => sum + (item.quantity || 0), 0), [items])
  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0),
    [items]
  )

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([])
      return []
    }
    try {
      const next = await apiFetchCart()
      setItems(next)
      return next
    } catch (error) {
      toast.error('Unable to refresh cart')
      throw error
    }
  }, [userId])

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (!userId) {
        toast.error('Sign in to add items to your cart')
        return
      }
      if (!product?.id) {
        toast.error('Product missing')
        return
      }
      setSyncing(true)
      try {
        await apiAddToCart({ product_id: product.id, quantity })
        return await refresh()
      } catch (error) {
        toast.error('Unable to add to cart')
        throw error
      } finally {
        setSyncing(false)
      }
    },
    [userId, refresh]
  )

  const removeItem = useCallback(
    async (itemId) => {
      if (!itemId) return
      setSyncing(true)
      try {
        await apiRemoveCartItem(itemId, { currentUser: true })
        await refresh()
      } catch (error) {
        toast.error('Unable to remove item')
      } finally {
        setSyncing(false)
      }
    },
    [refresh]
  )

  const clearCart = useCallback(async () => {
    if (!items.length) return
    setSyncing(true)
    try {
      await Promise.all(items.map((item) => apiRemoveCartItem(item.id, { currentUser: true })))
      await refresh()
    } catch (error) {
      toast.error('Unable to clear cart')
    } finally {
      setSyncing(false)
    }
  }, [items, refresh])

  const value = useMemo(
    () => ({
      items,
      loading,
      syncing,
      cartCount,
      cartTotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((prev) => !prev),
      refresh,
      addItem,
      removeItem,
      clearCart,
    }),
    [items, loading, syncing, cartCount, cartTotal, isOpen, refresh, addItem, removeItem, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}
