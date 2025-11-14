import React, {useEffect, useState} from 'react';
import axios from 'axios';

export default function App(){
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [recs, setRecs] = useState([]);

  useEffect(()=>{
    // fetch products and users
    axios.get('http://localhost:8000/products').then(r=>setProducts(r.data)).catch(()=>{});
    axios.get('http://localhost:8000/users').then(r=>setUsers(r.data)).catch(()=>{});
  },[])

  const getRecs = (userId)=>{
    axios.get(`http://localhost:8000/recommend/${userId}?k=5`).then(r=>{
      setRecs(r.data.recommendations);
    }).catch(()=>{});
  }

  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h2>Graph Recommendation System — Demo Frontend</h2>
      <div style={{display:'flex',gap:40}}>
        <div>
          <h3>Users</h3>
          {users.map(u=> (
            <div key={u.id} style={{marginBottom:6}}>
              <strong>{u.name}</strong>
              <button style={{marginLeft:8}} onClick={()=>getRecs(u.id)}>Recommend</button>
            </div>
          ))}
        </div>
        <div>
          <h3>Products</h3>
          {products.map(p=> <div key={p.id}>{p.name} — {p.category}</div>)}
        </div>
        <div>
          <h3>Recommendations</h3>
          {recs.map(r=> <div key={r.product_id}>Product {r.product_id} (score: {r.score.toFixed(3)})</div>)}
        </div>
      </div>
    </div>
  )
}
