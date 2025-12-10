// React and routing imports
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
// Custom hook for authentication state
import { useAuth } from '../contexts/AuthContext'

// Sidebar component - provides collapsible navigation menu on the left side
export default function Sidebar() {
  // Get current location and navigation functionality
  const location = useLocation()
  const navigate = useNavigate()
  // Get authentication state and user role
  const { user, isAdminUser, signOut } = useAuth()
  // State to track if sidebar is open
  const [isOpen, setIsOpen] = useState(false)

  // Check if current route is active
  const isActive = (path) => location.pathname === path

  // Handle user logout and redirect to login
  const handleLogout = async () => {
    await signOut()
    navigate('/auth/login')
  }

  // Define menu items with icons and routes
  const menuItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/products', icon: '🛍️', label: 'Products' },
    { path: '/about', icon: 'ℹ️', label: 'About' },
    { path: '/contact', icon: '📧', label: 'Contact Us' },
  ]

  // Add admin portal to menu only if user is admin
  if (isAdminUser) {
    menuItems.push({ path: '/admin', icon: '👑', label: 'Admin Portal' })
  }

  return (
    <>
      {/* Toggle button to open/close sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-100 focus:outline-none"
      >
        <div className="flex flex-col justify-center items-center space-y-1">
          <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>
        </div>
      </button>

      {/* Semi-transparent overlay that closes sidebar when clicked */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30"
        />
      )}

      {/* Sidebar navigation panel with sliding animation */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full py-4">
          {/* Navigation menu items */}
          <nav className="flex-1 px-3 overflow-y-auto">
            <div className="space-y-1 mt-2">
              {/* Render each menu item as a navigation link */}
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 pl-2'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            {/* Show signup and login buttons if user is not authenticated */}
            {!user && (
              <div className="mt-5 pt-5 border-t border-gray-200 space-y-2">
                <Link
                  to="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-3 py-2 bg-indigo-600 text-white text-center rounded-md font-semibold hover:bg-indigo-700 transition text-sm"
                >
                  Sign Up
                </Link>
                <Link
                  to="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-3 py-2 bg-gray-100 text-gray-800 text-center rounded-md font-semibold hover:bg-gray-200 transition text-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </nav>

          {/* User information and logout section */}
          {user && (
            <div className="px-3 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Logged in as</p>
              <p className="text-sm font-medium text-gray-800 truncate mb-2">{user.email}</p>
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-800 rounded-md font-semibold hover:bg-gray-200 transition text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
