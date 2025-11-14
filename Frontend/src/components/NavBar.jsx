import React from 'react'

export default function NavBar(){
  return (
    <header className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
      <div className="text-lg font-bold">Graph Recommendation Store</div>
      <nav className="space-x-4 text-sm text-gray-600">
        <a href="#" className="hover:text-gray-900">Home</a>
        <a href="#" className="hover:text-gray-900">Products</a>
        <a href="#" className="hover:text-gray-900">About</a>
      </nav>
    </header>
  )
}
