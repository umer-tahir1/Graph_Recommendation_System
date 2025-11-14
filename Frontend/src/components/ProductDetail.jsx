import React from 'react'

export default function ProductDetail({product, selectedUser, onInteract, onClose}){
  return (
    <div className="product-detail">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>{product.name}</h3>
        <button onClick={onClose} style={{background:'#ddd',color:'#000'}}>Close</button>
      </div>
      <div style={{color:'#6b7280',marginBottom:12}}>{product.category}</div>
      <div style={{marginBottom:12}}>Detailed description placeholder — add product description here.</div>
      <div>
        {selectedUser ? (
          <button onClick={()=>onInteract(selectedUser, product.id)}>Buy as User {selectedUser}</button>
        ) : (
          <div className="muted">Select a user to enable purchase</div>
        )}
      </div>
    </div>
  )
}
