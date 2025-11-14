import React, {useEffect, useState} from 'react'
import { fetchProducts, fetchUsers, fetchRecommendations, createInteraction } from './api'
import ProductList from './components/ProductList'
import NavBar from './components/NavBar'

export default function App(){
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [recs, setRecs] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

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

  return (
    <div className="container">
      <NavBar />
      <main>
        <section className="left">
          <h2>Products</h2>
          <ProductList products={products} onInteract={onInteract} />
        </section>

        <section className="center">
          <h2>Users</h2>
          <div className="users">
            {users.map(u => (
              <div key={u.id} className="user-row">
                <span>{u.name}</span>
                <button onClick={()=>onRecommend(u.id)}>Recommend</button>
              </div>
            ))}
          </div>
        </section>

        <section className="right">
          <h2>Recommendations {selectedUser?`for user ${selectedUser}`:''}</h2>
          <div className="recs">
            {recs.length === 0 && <div className="muted">No recommendations yet — select a user</div>}
            {recs.map(r => (
              <div key={r.product_id} className="rec-item">
                <div>Product {r.product_id}</div>
                <div>Score: {r.score.toFixed(3)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
