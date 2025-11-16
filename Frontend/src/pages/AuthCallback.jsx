import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const STATUS = {
  pending: 'pending',
  success: 'success',
  error: 'error',
}

const parseParams = (hash, search) => {
  const params = new URLSearchParams()
  const hashParams = new URLSearchParams((hash || '').replace(/^#/, ''))
  const searchParams = new URLSearchParams(search || '')

  hashParams.forEach((value, key) => {
    if (!params.has(key)) {
      params.set(key, value)
    }
  })

  searchParams.forEach((value, key) => {
    if (!params.has(key)) {
      params.set(key, value)
    }
  })

  return params
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useMemo(() => parseParams(location.hash, location.search), [location])
  const [status, setStatus] = useState(STATUS.pending)
  const [message, setMessage] = useState('Validating your session…')

  useEffect(() => {
    let redirectTimer
    const error = params.get('error_description') || params.get('error')
    if (error) {
      setStatus(STATUS.error)
      setMessage(error)
      return () => {}
    }

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const code = params.get('code')
    const intentType = params.get('type') || 'signup'

    const finalizeAuth = async () => {
      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (sessionError) throw sessionError
        } else {
          throw new Error('Verification link is missing session details. Please request a new email.')
        }

        setStatus(STATUS.success)
        setMessage('Email confirmed! Redirecting you to your dashboard…')
        const destination = intentType === 'recovery' ? '/auth/login' : '/portal'
        redirectTimer = setTimeout(() => navigate(destination, { replace: true }), 1500)
      } catch (err) {
        setStatus(STATUS.error)
        setMessage(err.message || 'Unable to complete verification. Please request a new link.')
      }
    }

    finalizeAuth()
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [navigate, params])

  const isError = status === STATUS.error
  const isSuccess = status === STATUS.success

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 w-full max-w-lg text-center space-y-4">
        <div className={`text-6xl ${isSuccess ? 'text-emerald-500' : isError ? 'text-rose-500' : 'text-indigo-500'}`}>
          {isSuccess ? '✅' : isError ? '⚠️' : '⌛'}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          {isSuccess ? 'Email verified' : isError ? 'Something went wrong' : 'Finishing sign in'}
        </h1>
        <p className="text-slate-600 leading-relaxed">{message}</p>
        {isError && (
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-indigo-500"
          >
            Back to login
          </button>
        )}
      </div>
    </div>
  )
}
