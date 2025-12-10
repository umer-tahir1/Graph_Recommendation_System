// React hooks and routing imports
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Authentication context hook
import { useAuth } from '../contexts/AuthContext'

// Login page component - authenticates existing users
export default function Login() {
  // Navigation hook for redirecting after login
  const navigate = useNavigate()
  // Get signin function from auth context
  const { signIn } = useAuth()
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Error and loading states
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle login form submission
  const handleSubmit = async (e) => {
    // Prevent form from submitting normally
    e.preventDefault()
    // Clear any previous errors
    setError('')
    // Set loading state
    setLoading(true)

    // Attempt to sign in with email and password
    const { error: authError } = await signIn(email, password)

    // Handle login error
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      // Redirect to products page on successful login
      navigate('/products')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Login form header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Display error message if login fails */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password input field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember me checkbox and forgot password link */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
                Forgot password?
              </Link>
            </div>

            {/* Submit button - disabled while loading */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Link to sign up page */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-indigo-600 font-semibold hover:text-indigo-800">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
