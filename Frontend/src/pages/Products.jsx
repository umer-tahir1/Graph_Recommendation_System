import React, { useEffect, useState } from 'react'
import { fetchProducts, fetchUsers, fetchRecommendations, createInteraction } from '../api'
import RecommendationGraph from '../components/RecommendationGraph'

export default function Products() {
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [recs, setRecs] = useState([])
  const [graphData, setGraphData] = useState(null)

  useEffect(() => {
    fetchProducts().then(setProducts)
    fetchUsers().then(setUsers)
  }, [])

  const onRecommend = async (userId) => {
    setSelectedUser(userId)
    const r = await fetchRecommendations(userId, 10)
    setRecs(r)
    
    // Build graph data
    const graphNodes = [
      { id: `user_${userId}`, label: `User ${userId}`, color: '#6366f1', title: 'Current User' }
    ]
    const graphEdges = []
    
    products.forEach(p => {
      graphNodes.push({ 
        id: `product_${p.id}`, 
        label: p.name, 
        color: '#8b5cf6',
        title: p.name
      })
    })

    r.forEach((rec, idx) => {
      graphEdges.push({
        from: `user_${userId}`,
        to: `product_${rec.product_id}`,
        weight: rec.score,
        label: rec.score.toFixed(2),
        color: { color: 'rgba(99, 102, 241, 0.3)', highlight: 'rgba(99, 102, 241, 0.8)' }
      })
    })

    setGraphData({ nodes: graphNodes, edges: graphEdges })
  }

  const onInteract = async (userId, productId) => {
    await createInteraction(userId, productId)
    if (selectedUser) onRecommend(selectedUser)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Shop Our Collection</h1>
        <p className="text-gray-600 mb-8">Browse our products and get personalized recommendations</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 Products</h2>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-3 rounded-lg font-semibold transition transform hover:scale-105 ${
                      selectedProduct?.id === p.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users & Recommendations Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Users */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Select Your Profile</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => onRecommend(u.id)}
                    className={`p-4 rounded-lg font-bold text-white transition transform hover:scale-105 ${
                      selectedUser === u.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
                    }`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations with Graph */}
            {selectedUser && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">💝 Recommended For You</h2>
                  {recs.length === 0 ? (
                    <p className="text-gray-500 text-lg">No recommendations available yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recs.map(r => {
                        const prod = products.find(p => p.id === r.product_id)
                        return (
                          <div
                            key={r.product_id}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                            onClick={() => setSelectedProduct(prod)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg text-gray-800">{prod?.name}</h3>
                                <p className="text-sm text-gray-600">{prod?.category}</p>
                              </div>
                              <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold">
                                {(r.score * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Graph Visualization */}
                {graphData && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Your Recommendation Graph</h2>
                    <RecommendationGraph data={graphData} />
                  </div>
                )}
              </>
            )}

            {/* Selected Product Detail */}
            {selectedProduct && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800">{selectedProduct.name}</h3>
                    <p className="text-gray-600 text-lg">{selectedProduct.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-2xl text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-700 mb-6">Premium quality product in the {selectedProduct.category} category</p>
                {selectedUser && (
                  <button
                    onClick={() => {
                      onInteract(selectedUser, selectedProduct.id)
                      alert(`Added ${selectedProduct.name} to your cart!`)
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105"
                  >
                    🛒 Add to Cart
                  </button>
                )}
                {!selectedUser && (
                  <p className="text-orange-600 font-semibold">Please select a profile first to add items</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
