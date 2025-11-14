import React from 'react'

export default function ProductList({products, onInteract}){
  return (
    <div className="product-list">
      {products.map(p => (
        <div key={p.id} className="product-card">
          <div className="product-name">{p.name}</div>
          <div className="product-category">{p.category}</div>
          <div className="product-actions">
            <button onClick={()=>onInteract(1, p.id)}>Quick Buy (as user 1)</button>
          </div>
        </div>
      ))}
    </div>
  )
}
