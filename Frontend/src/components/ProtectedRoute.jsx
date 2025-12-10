// React and routing imports
import React from 'react'
import { Navigate } from 'react-router-dom'
// Custom authentication hook
import { useAuth } from '../contexts/AuthContext'

// ProtectedRoute component - wraps routes that require authentication
// Redirects unauthenticated users to login page
export default function ProtectedRoute({ children }) {
  // Get authentication state and loading status
  const { user, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    )
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/auth/login" />
  }

  // If authenticated, render the protected component
  return children
}
