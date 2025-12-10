// React import
import React from 'react'

// ProductDetail component - displays detailed information about a selected product
// This component shows product name, category, description, and purchase options
// Props: product (product object), selectedUser (current user), onInteract (callback), onClose (callback)
export default function ProductDetail({product, selectedUser, onInteract, onClose}){
  return (
    <div className="bg-white p-4 rounded shadow-lg">
      {/* Product header with title and close button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <button className="text-sm px-2 py-1 bg-gray-200 rounded" onClick={onClose}>Close</button>
      </div>
      {/* Product category display */}
      <div className="text-sm text-gray-500 mt-2 mb-4">{product.category}</div>
      {/* Product description section */}
      <div className="mb-4 text-gray-700">Detailed description placeholder — add product description here.</div>
      {/* Purchase action - button shows if user is selected, otherwise shows prompt */}
      <div>
        {selectedUser ? (
          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>onInteract(selectedUser, product.id)}>Buy as User {selectedUser}</button>
        ) : (
          <div className="text-gray-500">Select a user to enable purchase</div>
        )}
      </div>
    </div>
  )
}
