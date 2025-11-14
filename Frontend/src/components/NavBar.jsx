import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdminUser, signOut } = useAuth()

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await signOut()
    navigate('/auth/login')
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold text-white">GRS</h1>
              <p className="text-xs text-indigo-100">Graph Recommendation</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-1 items-center">
            <Link
              to="/"
              className={`px-6 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                isActive('/')
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-6 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                isActive('/products')
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={`px-6 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                isActive('/about')
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              About
            </Link>

            {isAdminUser && (
              <Link
                to="/admin"
                className={`px-6 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                  isActive('/admin')
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                👑 Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-white text-sm">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="ml-4 px-6 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
