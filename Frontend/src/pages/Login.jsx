import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { userIsAdmin } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const returnPath = location.state?.from?.pathname
  const needsEmailPreference = location.state?.needsEmailPreference
  const showBackLink = needsEmailPreference && returnPath

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      const sessionUser = data?.session?.user
      const fallback = userIsAdmin(sessionUser) ? '/admin' : '/products'
      navigate(returnPath || fallback, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05091f] via-[#0f172a] to-[#1f2937]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.4),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_40%)]" />
      </div>
      <div className="max-w-md w-full relative z-10">
        {showBackLink && (
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-indigo-300 hover:text-indigo-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span className="font-semibold">Back to Portal</span>
            </button>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-slate-900 placeholder:text-gray-400 caret-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-slate-900 placeholder:text-gray-400 caret-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

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
