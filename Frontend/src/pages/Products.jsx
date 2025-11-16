import React, { useEffect, useMemo, useState } from 'react'
import {
  fetchProducts,
  fetchCategories,
  fetchUsers,
  fetchRecommendations,
  fetchProductGraph,
  fetchProductReviews,
  createReview,
  addToCart,
  fetchCart,
  createInteraction,
} from '@/api'
import RecommendationGraph from '../components/RecommendationGraph'

const CATEGORY_ORDER = ['Headphones', 'Mobiles', 'Computers', 'Laptops', 'Bikes', 'Cars']

export default function Products() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Headphones')
  const [products, setProducts] = useState([])
  const [productLookup, setProductLookup] = useState({})
  const [users, setUsers] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [reviews, setReviews] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [recs, setRecs] = useState([])
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' })
  const [loadingGraph, setLoadingGraph] = useState(false)

  useEffect(() => {
    const bootstrap = async () => {
      const [catsResp, userResp] = await Promise.all([
        fetchCategories(),
        fetchUsers()
      ])
      const orderedCats = CATEGORY_ORDER.filter(c => catsResp.find(cat => cat.name === c))
      setCategories(orderedCats.length ? orderedCats : catsResp.map(cat => cat.name))
      setSelectedCategory(orderedCats[0] || catsResp[0]?.name || null)
      setUsers(userResp)
      setActiveUser(userResp[0] || null)
    }
    bootstrap()
  }, [])

  useEffect(() => {
    if (!selectedCategory) return
    fetchProducts(selectedCategory).then(list => {
      setProducts(list)
      setProductLookup(prev => ({
        ...prev,
        ...Object.fromEntries(list.map(item => [item.id, item]))
      }))
    })
  }, [selectedCategory])

  useEffect(() => {
    if (!activeUser) return
    fetchCart(activeUser.id).then(setCartItems)
    fetchRecommendations(activeUser.id, 6).then(setRecs)
  }, [activeUser])

  const selectProduct = async (product) => {
    const enrichedProduct = productLookup[product.id] || product
    setSelectedProduct(enrichedProduct)
    setLoadingGraph(true)
    const [graph, productReviews] = await Promise.all([
      fetchProductGraph(product.id),
      fetchProductReviews(product.id)
    ])
    setGraphData(graph)
    setReviews(productReviews)
    setLoadingGraph(false)
    if (activeUser) {
      createInteraction({ user_id: activeUser.id, product_id: product.id, interaction_type: 'view', weight: 1 }).catch(() => null)
    }
  }

  const handleAddToCart = async (product) => {
    if (!activeUser) return
    await addToCart({ user_id: activeUser.id, product_id: product.id, quantity: 1 })
    const updated = await fetchCart(activeUser.id)
    setCartItems(updated)
    await createInteraction({ user_id: activeUser.id, product_id: product.id, interaction_type: 'add_to_cart', weight: 1.5 })
  }

  const handleReviewSubmit = async () => {
    if (!activeUser || !selectedProduct || !reviewInput.comment) return
    await createReview({
      user_id: activeUser.id,
      product_id: selectedProduct.id,
      rating: reviewInput.rating,
      comment: reviewInput.comment,
    })
    setReviewInput({ rating: 5, comment: '' })
    const refreshed = await fetchProductReviews(selectedProduct.id)
    setReviews(refreshed)
    await createInteraction({ user_id: activeUser.id, product_id: selectedProduct.id, interaction_type: 'review', weight: 1.3 })
  }

  const totalCart = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0), [cartItems])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-rose-500/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <span className="text-sm uppercase tracking-[0.3em] text-indigo-200">Graph Native Commerce</span>
          <h1 className="text-white text-4xl lg:text-6xl font-bold mt-4 mb-4">Products tailored to your graph.</h1>
          <p className="text-indigo-100 max-w-2xl text-lg">Browse six curated categories, inspect interaction graphs, and let the recommendation engine surface what to buy next.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20 -mt-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <h2 className="text-slate-100 font-semibold text-lg mb-3">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedCategory === cat ? 'bg-gradient-to-r from-indigo-500 to-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-slate-100 font-semibold text-lg mb-3">User Portal</h2>
              <div className="space-y-2">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setActiveUser(u)}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition ${activeUser?.id === u.id ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                  >
                    <div className="font-semibold">{u.name}</div>
                    <p className="text-xs text-slate-300">Graph Edge Count · {Math.floor(Math.random()*25)+5}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-slate-100 font-semibold text-lg mb-3">Cart</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.length === 0 && <p className="text-slate-400 text-sm">Your cart is empty</p>}
                {cartItems.map(item => (
                  <div key={item.id} className="bg-slate-800 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-slate-100 text-sm font-semibold">{item.product_name}</p>
                      <p className="text-slate-400 text-xs">Qty {item.quantity}</p>
                    </div>
                    <span className="text-slate-100 font-semibold">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-800 mt-3 flex justify-between text-slate-200">
                <span>Total</span>
                <span className="font-semibold">${totalCart.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-3xl shadow-lg p-5 flex flex-col justify-between border border-slate-100">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{product.category}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">{product.name}</h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-3">{product.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">from</p>
                      <p className="text-xl font-extrabold text-slate-900">${product.price?.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-sm font-semibold hover:bg-slate-800"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => selectProduct(product)}
                        className="px-4 py-2 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-700 hover:border-slate-400"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeUser && recs.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Recommended for {activeUser.name}</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Graph intuition picks</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {recs.map(rec => {
                    const product = productLookup[rec.product_id]
                    if (!product) return null
                    return (
                      <div key={rec.product_id} className="border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer" onClick={() => selectProduct(product)}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-slate-400">{product.category}</p>
                            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                          </div>
                          <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-semibold">{(rec.score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedProduct && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs tracking-[0.3em] text-slate-400 uppercase">{selectedProduct.category}</p>
                        <h2 className="text-3xl font-bold text-slate-900 mt-2">{selectedProduct.name}</h2>
                      </div>
                      <button className="text-slate-400 hover:text-slate-800" onClick={() => setSelectedProduct(null)}>✕</button>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs uppercase text-slate-400">Price</p>
                        <p className="text-2xl font-bold text-slate-900">${selectedProduct.price?.toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs uppercase text-slate-400">Inventory</p>
                        <p className="text-2xl font-bold text-slate-900">{selectedProduct.inventory ?? '∞'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleAddToCart(selectedProduct)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-semibold">Add to Cart</button>
                      <button onClick={() => createInteraction({ user_id: activeUser?.id, product_id: selectedProduct.id, interaction_type: 'click', weight: 1.1 })} className="px-6 py-3 border border-slate-300 rounded-2xl font-semibold text-slate-700">Track Click</button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Graph View</h3>
                      {loadingGraph ? (
                        <p className="text-slate-500 text-sm">Loading graph...</p>
                      ) : graphData ? (
                        <RecommendationGraph data={graphData} />
                      ) : (
                        <p className="text-slate-500 text-sm">Graph data unavailable.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Customer Reviews</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {reviews.length === 0 && <p className="text-slate-500 text-sm">No reviews yet.</p>}
                      {reviews.map(review => (
                        <div key={review.id} className="bg-white rounded-2xl p-3 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">User {review.user_id}</span>
                            <span className="text-sm text-amber-500 font-semibold">{review.rating}★</span>
                          </div>
                          <p className="text-slate-600 text-sm mt-2">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Add Review</h3>
                    <div className="space-y-3">
                      <select value={reviewInput.rating} onChange={(e) => setReviewInput(prev => ({ ...prev, rating: Number(e.target.value) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2">
                        {[5,4,3,2,1].map(r => (<option key={r} value={r}>{r} Stars</option>))}
                      </select>
                      <textarea value={reviewInput.comment} onChange={(e) => setReviewInput(prev => ({ ...prev, comment: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2" rows={3} placeholder="Share your thoughts" />
                      <button onClick={handleReviewSubmit} className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold py-3 rounded-2xl">Submit Review</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
