import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import CartDrawer from './components/cart/CartDrawer'
import ErrorBoundary from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const AdminPortal = lazy(() => import('./pages/AdminPortal'))
const UserPortal = lazy(() => import('./pages/UserPortal'))
const Checkout = lazy(() => import('./pages/Checkout'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <main className="w-full">
                  <Suspense fallback={<RouteLoading />}>
                    <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route 
                      path="/products" 
                      element={
                        <ProtectedRoute>
                          <Products />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                      <Route
                        path="/portal/*"
                        element={
                          <ProtectedRoute>
                            <UserPortal />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                    <Route 
                      path="/admin/*" 
                      element={
                        <AdminRoute>
                          <AdminPortal />
                        </AdminRoute>
                      } 
                    />
                    </Routes>
                  </Suspense>
                </main>
                <CartDrawer />
                <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
              </div>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  )
}

function RouteLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
      <div className="animate-pulse">
        <span className="text-xs uppercase tracking-[0.4em] text-indigo-400">Loading</span>
      </div>
      <p className="text-2xl font-semibold">Fetching experience…</p>
      <div className="flex gap-2 mt-4">
        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse delay-75"></div>
        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
      </div>
    </div>
  )
}
