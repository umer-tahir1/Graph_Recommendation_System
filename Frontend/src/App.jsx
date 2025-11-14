import React, {useEffect, useState} from 'react'
import { fetchProducts, fetchUsers, fetchRecommendations, createInteraction } from './api'
import ProductList from './components/ProductList'
import NavBar from './components/NavBar'
import ProductDetail from './components/ProductDetail'

export default function App(){
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [recs, setRecs] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(()=>{
    fetchProducts().then(setProducts)
    fetchUsers().then(setUsers)
  },[])

  const onRecommend = async (userId)=>{
    setSelectedUser(userId)
    const r = await fetchRecommendations(userId, 8)
    setRecs(r)
  }

  const onInteract = async (userId, productId)=>{
    await createInteraction(userId, productId)
    // refresh recs
    if(selectedUser) onRecommend(selectedUser)
  }

  const onShowProduct = (product) => {
    setSelectedProduct(product)
  }

  const onCloseDetail = () => setSelectedProduct(null)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <NavBar />
      <main className="grid grid-cols-1 lg:grid-cols-[1fr,360px,360px] gap-6 mt-6">
        <section className="left bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <ProductList products={products} onInteract={onInteract} selectedUser={selectedUser} onShowProduct={onShowProduct} />
        </section>

        <section className="center bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="flex flex-col gap-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{u.name}</span>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={()=>onRecommend(u.id)}>Recommend</button>
              </div>
            ))}
          </div>
        </section>

        <section className="right bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Recommendations {selectedUser?`for user ${selectedUser}`:''}</h2>
          <div className="flex flex-col gap-2">
            {recs.length === 0 && <div className="text-gray-500">No recommendations yet — select a user</div>}
            {recs.map(r => (
              <div key={r.product_id} className="p-2 bg-gray-50 rounded flex justify-between">
                <div>Product {r.product_id}</div>
                <div className="text-sm text-gray-600">{r.score.toFixed(3)}</div>
              </div>
            ))}
          </div>
        </section>

        {selectedProduct && (
          <div className="fixed right-6 top-24 w-80 z-50">
            <ProductDetail product={selectedProduct} selectedUser={selectedUser} onInteract={onInteract} onClose={onCloseDetail} />
          </div>
        )}
      </main>
    </div>
  )
}
