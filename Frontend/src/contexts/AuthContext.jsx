import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, userIsAdmin } from '../lib/supabase'
import { setApiAuthToken, emitClientAuditLog, fetchAuthProfile } from '@/api'

/**
 * @typedef {Object} AuthContextValue
 * @property {import('@supabase/supabase-js').Session | null} session
 * @property {import('@supabase/supabase-js').User | null} user
 * @property {string | null} accessToken
 * @property {boolean} loading
 * @property {boolean} isAdminUser
 * @property {(email: string, password: string, username?: string) => Promise<any>} signUp
 * @property {(email: string, password: string) => Promise<any>} signIn
 * @property {() => Promise<{ error: import('@supabase/supabase-js').AuthError | null }>} signOut
 * @property {(email: string) => Promise<any>} resetPassword
 * @property {() => Promise<{ data: { session: import('@supabase/supabase-js').Session | null }; error: import('@supabase/supabase-js').AuthError | null }>} refreshSession
 */

/** @type {import('react').Context<AuthContextValue | null>} */
const AuthContext = createContext(null)

const resolveSiteUrl = () => {
  const fromEnv = `${import.meta.env.VITE_SITE_URL || ''}`.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)

  const updateStateFromSession = (nextSession) => {
    setSession(nextSession)
    setUser(nextSession?.user ?? null)
    setAccessToken(nextSession?.access_token ?? null)
    setIsAdminUser(nextSession?.user ? userIsAdmin(nextSession.user) : false)
    setApiAuthToken(nextSession?.access_token || null)
    setLoading(false)
  }

  useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        updateStateFromSession(session)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateStateFromSession(session)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!user || !accessToken) {
      setIsAdminUser(false)
      return undefined
    }

    const syncAdminFlag = async () => {
      try {
        const profile = await fetchAuthProfile()
        if (!cancelled) {
          setIsAdminUser(Boolean(profile?.is_admin))
        }
      } catch (_error) {
        if (!cancelled) {
          setIsAdminUser(userIsAdmin(user))
        }
      }
    }

    syncAdminFlag()

    return () => {
      cancelled = true
    }
  }, [user, accessToken])

  const signUp = async (email, password, username) => {
    const siteUrl = resolveSiteUrl() || (typeof window !== 'undefined' ? window.location.origin : '')
    const options = {
      emailRedirectTo: siteUrl ? `${siteUrl}/auth/callback` : undefined,
    }
    if (username && username.trim()) {
      options.data = {
        full_name: username.trim(),
        username: username.trim(),
      }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    })
    if (!error) {
      updateStateFromSession(data.session)
    }
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error) {
      updateStateFromSession(data.session)
    }
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      updateStateFromSession(null)
    }
    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  }

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (!error) {
      updateStateFromSession(data.session)
      const refreshedUser = data.session?.user
      emitClientAuditLog({
        action: 'session.refresh',
        target_type: 'session',
        target_id: refreshedUser?.id,
        target_display: refreshedUser?.email,
        metadata: { source: 'auth-context' },
      }).catch(() => {})
    }
    return { data, error }
  }

  const value = {
    session,
    user,
    accessToken,
    loading,
    isAdminUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
          <p className="text-xl tracking-wide uppercase text-gray-300">Booting storefront</p>
          <h2 className="text-4xl font-bold mt-4 animate-pulse">Loading experience...</h2>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
