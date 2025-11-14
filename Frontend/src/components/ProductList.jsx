import React from 'react'

export default function ProductList({products, onInteract, selectedUser, onShowProduct}){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(p => (
        <div key={p.id} className="bg-white p-4 rounded shadow-sm">
          <div className="text-lg font-semibold cursor-pointer" onClick={()=>onShowProduct && onShowProduct(p)}>{p.name}</div>
          <div className="text-sm text-gray-500 mt-1">{p.category}</div>
          <div className="mt-3">
            {selectedUser ? (
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={()=>onInteract(selectedUser, p.id)}>Buy as {selectedUser}</button>
            ) : (
              <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm" disabled title="Select a user to interact">Select a user</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
