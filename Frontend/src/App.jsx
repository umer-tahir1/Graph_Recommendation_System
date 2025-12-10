// React and routing imports
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// Authentication context provider
import { AuthProvider } from './contexts/AuthContext'
// Shared components
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
// Page components
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminPortal from './pages/AdminPortal'

// Main App component that sets up routing and authentication context
export default function App() {
  return (
    // Browser Router enables client-side navigation
    <Router>
      {/* AuthProvider wraps all routes to provide authentication state globally */}
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar navigation component */}
          <Sidebar />
          {/* Main content area with all route definitions */}
          <main className="w-full">
            <Routes>
              {/* Public routes - accessible to all users */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              {/* Protected routes - require authentication */}
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPortal />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  )
}
