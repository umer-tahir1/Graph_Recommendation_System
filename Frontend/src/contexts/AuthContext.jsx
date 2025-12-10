// React Context API imports
import React, { createContext, useContext, useEffect, useState } from 'react'
// Supabase authentication service and admin check utility
import { supabase, isAdmin } from '../lib/supabase'

// Create authentication context to share auth state globally
// Manages user session, admin status, and authentication methods
const AuthContext = createContext({})

// Custom hook to access authentication context
// Must be used within an AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext)
  // Throw error if hook is used outside of AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// AuthProvider component - wraps app to provide authentication state
export const AuthProvider = ({ children }) => {
  // State variables for authentication
  const [user, setUser] = useState(null) // Current authenticated user
  const [loading, setLoading] = useState(true) // Loading state during auth check
  const [isAdminUser, setIsAdminUser] = useState(false) // Admin role flag // Admin role flag

  // Initialize authentication on component mount
  useEffect(() => {
    // Check if there is an existing active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsAdminUser(session?.user ? isAdmin(session.user.email) : false)
      setLoading(false)
    })

    // Set up listener for auth state changes (login, logout, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAdminUser(session?.user ? isAdmin(session.user.email) : false)
      setLoading(false)
    })

    // Cleanup subscription when component unmounts
    return () => subscription.unsubscribe()
  }, [])

  // Register a new user with email and password
  const signUp = async (email, password) => {
    // Send signup request to Supabase with email callback URL
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    return { data, error }
  }

  // Login with email and password
  const signIn = async (email, password) => {
    // Authenticate user with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // Logout current user
  const signOut = async () => {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Send password reset link to user's email
  const resetPassword = async (email) => {
    // Send reset password email with callback URL
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  }

  // Prepare context value object with all auth functions and state
  const value = {
    user,
    loading,
    isAdminUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  // Provide auth context to all child components
  // Only render children after loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
