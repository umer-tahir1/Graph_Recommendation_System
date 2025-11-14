import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchProducts, fetchUsers } from '../api'
import { supabase } from '../lib/supabase'

export default function AdminPortal() {
  const { user, isAdminUser, loading } = useAuth()
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalInteractions: 0
  })
  const [allAdmins, setAllAdmins] = useState([])

  useEffect(() => {
    if (isAdminUser) {
      loadData()
      loadAdmins()
    }
  }, [isAdminUser])

  const loadData = async () => {
    const prods = await fetchProducts()
    const usrs = await fetchUsers()
    setProducts(prods)
    setUsers(usrs)
    setStats({
      totalProducts: prods.length,
      totalUsers: usrs.length,
      totalInteractions: 0 // You can add API endpoint for this
    })
  }

  const loadAdmins = async () => {
    // Fetch all users from Supabase Auth (admin only)
    try {
      const { data, error } = await supabase.auth.admin.listUsers()
      if (!error && data) {
        setAllAdmins(data.users || [])
      }
    } catch (err) {
      console.log('Admin list not available:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" />
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have admin privileges. This area is restricted to authorized administrators only.
          </p>
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition"
          >
            Go to Products
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Portal</h1>
          <p className="text-indigo-100">Welcome back, {user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Interactions</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalInteractions}</p>
              </div>
              <div className="text-4xl">🔗</div>
            </div>
          </div>
        </div>

        {/* Admin Team */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👑 Admin Team</h2>
          <p className="text-gray-600 mb-4">Authorized administrators with full access</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Admin 1', 'Admin 2', 'Admin 3', 'Admin 4'].map((name, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 text-center"
              >
                <div className="text-3xl mb-2">👤</div>
                <h3 className="font-bold text-gray-800">{name}</h3>
                <p className="text-sm text-gray-600">Administrator</p>
              </div>
            ))}
          </div>
        </div>

        {/* Products Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 Products Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{product.id}</td>
                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Users Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((usr) => (
                  <tr key={usr.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{usr.id}</td>
                    <td className="px-4 py-3 font-semibold">{usr.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                      <button className="text-orange-600 hover:text-orange-800">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
