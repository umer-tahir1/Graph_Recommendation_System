import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdminUser, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await signOut()
    navigate('/auth/login')
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Hamburger + Logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col justify-center items-center space-y-1.5 hover:opacity-80 transition"
              >
                <span className="block w-7 h-0.5 bg-white rounded"></span>
                <span className="block w-7 h-0.5 bg-white rounded"></span>
                <span className="block w-7 h-0.5 bg-white rounded"></span>
              </button>

              <Link to="/" className="flex items-center gap-2">
                <span className="text-3xl">◈</span>
                <div>
                  <h1 className="text-2xl font-bold text-white">GRS</h1>
                  <p className="text-xs text-indigo-100">Graph Recommendation</p>
                </div>
              </Link>
            </div>

            {/* Right side - Login/Logout */}
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-white text-sm hidden sm:flex sm:flex-col sm:items-end">
                    <span className="font-semibold">{user.email}</span>
                    {isAdminUser && (
                      <Link
                        to="/admin"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-white/10 border border-white/30"
                      >
                        ◈ Admin
                      </Link>
                    )}
                  </div>
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
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar that slides in */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-900 text-3xl leading-none"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-lg font-medium transition ${
                isActive('/') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              ◧ Home
            </Link>
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-lg font-medium transition ${
                isActive('/products') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              ◆ Products
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-lg font-medium transition ${
                isActive('/about') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              ◎ About
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-lg font-medium transition ${
                isActive('/contact') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              ◈ Contact Us
            </Link>
            <Link
              to="/faq"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-lg font-medium transition ${
                isActive('/faq') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              ◐ FAQ
            </Link>
            <Link
              to="/blogs"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-lg font-medium transition ${
                isActive('/blogs') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              ◫ Blogs
            </Link>
            
            {isAdminUser && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-lg font-medium transition ${
                  isActive('/admin') 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                ◈ Admin Portal
              </Link>
            )}

            {!user && (
              <>
                <hr className="my-4" />
                <Link
                  to="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="block bg-indigo-600 text-white px-4 py-3 rounded-lg text-center font-semibold hover:bg-indigo-700 transition"
                >
                  Sign Up
                </Link>
                <Link
                  to="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-center font-semibold hover:bg-gray-300 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dark overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        ></div>
      )}
    </>
  )
}
