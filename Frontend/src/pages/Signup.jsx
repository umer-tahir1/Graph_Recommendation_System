// React hooks and routing imports
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Authentication context hook
import { useAuth } from '../contexts/AuthContext'

// Signup page component - allows new users to create accounts
// Validates email format, password strength, and confirmation match
export default function Signup() {
  // Navigation hook for redirecting
  const navigate = useNavigate()
  // Get signup function from auth context
  const { signUp } = useAuth()
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Status and error states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Handle signup form submission
  const handleSubmit = async (e) => {
    // Prevent form default submission
    e.preventDefault()
    // Clear any previous errors
    setError('')

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate minimum password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Set loading state
    setLoading(true)

    // Attempt to sign up with email and password
    const { error: signUpError } = await signUp(email, password)

    // Handle signup error
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      // Set success state to show confirmation message
      setSuccess(true)
      setLoading(false)
    }
  }

  // Show success message if signup was successful
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Check Your Email!</h1>
          {/* Email verification instructions */}
          <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>
            <Link
              to="/auth/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Signup form header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Sign up to get started</p>
          </div>

          {/* Display error message if signup fails */}
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

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Repeat your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
