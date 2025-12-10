// React import
import React from 'react'

// ProductList component - displays a grid of products with purchase options
// Responsive design adapts from 1 column (mobile) to 3 columns (desktop)
// Props: products (array), onInteract (callback), selectedUser (current user), onShowProduct (callback)
export default function ProductList({products, onInteract, selectedUser, onShowProduct}){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Map through products and render each as a card */}
      {products.map(p => (
        <div key={p.id} className="bg-white p-4 rounded shadow-sm">
          {/* Product name - clickable to show details */}
          <div className="text-lg font-semibold cursor-pointer" onClick={()=>onShowProduct && onShowProduct(p)}>{p.name}</div>
          {/* Product category label */}
          <div className="text-sm text-gray-500 mt-1">{p.category}</div>
          {/* Purchase button - enabled only if user is selected */}
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
