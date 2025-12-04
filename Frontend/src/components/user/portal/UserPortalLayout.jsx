import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchUserCategories, fetchEmailPreference, updateEmailPreference } from '@/api'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

const PAGE_ITEMS = [
  { path: '/about', label: 'About', icon: '◎' },
  { path: '/contact', label: 'Contact', icon: '✦' },
  { path: '/faq', label: 'FAQ & Help', icon: '◐' },
  { path: '/settings', label: 'Settings', icon: '◉' },
]

export default function UserPortalLayout() {
  const { user, signOut, isAdminUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const userId = user?.id
  const { cartCount, openCart } = useCart()
  const queryClient = useQueryClient()

  const [marketingEnabled, setMarketingEnabled] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const emailPreferenceQuery = useQuery({
    queryKey: ['email-preference', userId],
    queryFn: () => fetchEmailPreference(),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (emailPreferenceQuery.data?.email_opt_in) {
      setMarketingEnabled(true)
    }
  }, [emailPreferenceQuery.data])

  const emailPreferenceMutation = useMutation({
    mutationFn: () => updateEmailPreference({ email_opt_in: true }),
    onSuccess: (data) => {
      queryClient.setQueryData(['email-preference', userId], data)
      setMarketingEnabled(true)
      toast.success('Marketing updates enabled')
    },
    onError: () => {
      toast.error('Unable to update email preference')
    },
  })

  const handleLogout = async () => {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  const handleEnableMarketing = () => {
    if (!userId) {
      // Redirect non-logged-in users to login page
      navigate('/auth/login', { state: { from: location, needsEmailPreference: true } })
      return
    }
    emailPreferenceMutation.mutate()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-slate-100 font-sans">
      {/* OVERLAY FOR MOBILE/TABLET */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - SOLID THEME, COLLAPSIBLE */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform border-r border-slate-800 bg-[#030712] text-slate-200 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col min-h-screen">
          <div className="px-6 py-8 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.4em] text-indigo-400">Portal</p>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-white lg:hidden"
              >
                ✕
              </button>
            </div>
            <h1 className="text-2xl font-bold mt-2">User Console</h1>
            <p className="text-sm text-slate-400 mt-2">{user?.email}</p>
          </div>
          
          <nav className="flex-1 px-3 py-6 space-y-4 min-h-0">
            {/* ADMIN PORTAL LINK - Only for admins */}
            {isAdminUser && (
              <div>
                <p className="px-4 pb-2 text-xs uppercase tracking-[0.3em] text-slate-500">Admin Access</p>
                <Link
                  to="/admin/products"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-400 hover:to-orange-400"
                >
                  <span>◈</span>
                  <span>Admin Portal</span>
                </Link>
              </div>
            )}

            {/* PAGES */}
            <div>
              <p className="px-4 pb-2 text-xs uppercase tracking-[0.3em] text-slate-500">Pages</p>
              <div className="space-y-1">
                {PAGE_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="px-6 space-y-4 border-t border-slate-800 py-6 flex-shrink-0">
            <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Status</p>
              <p className="mt-2 font-semibold text-white">Online</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#05091f] via-[#0f172a] to-[#1f2937]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.4),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_40%)]" />
        </div>
        
        {/* HEADER */}
        <header className="relative z-10 border-b border-white/5 px-8 py-6 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm">Explore our graph-curated catalog</p>
            </div>
          </div>
          <button
            onClick={openCart}
            className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            <span>◆ Cart</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold">
              {cartCount}
            </span>
          </button>
        </header>

        {/* MARKETING BANNER - HIDES WHEN ENABLED */}
        {!marketingEnabled ? (
          <div className="relative z-10 px-8 pt-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-indigo-300 mb-2">Notifications</p>
                <h3 className="text-lg font-semibold text-white">Stay in the loop</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Enable updates to get personalized recommendations via email.
                </p>
              </div>
              <button
                onClick={handleEnableMarketing}
                disabled={emailPreferenceMutation.isPending}
                className="whitespace-nowrap rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
              >
                {emailPreferenceMutation.isPending ? 'Enabling...' : 'Enable updates'}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 px-8 pt-4">
             <p className="text-sm text-emerald-400 font-medium">✓ Marketing updates enabled.</p>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="relative z-10 flex-1 overflow-hidden p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function formatCategoryName(value = '') {
  if (!value) return 'Category'
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}
