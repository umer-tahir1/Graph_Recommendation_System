import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/admin/products', icon: '📦', label: 'Products' },
  { to: '/admin/categories', icon: '🗂️', label: 'Categories' },
  { to: '/admin/interactions', icon: '🔗', label: 'Interactions' },
  { to: '/admin/analytics', icon: '📊', label: 'Graph Analytics' },
  { to: '/admin/graph-debug', icon: '🧠', label: 'Graph Debug' },
  { to: '/admin/users', icon: '🧑‍💻', label: 'Supabase Users' },
  { to: '/admin/audit', icon: '🧾', label: 'Audit Logs' },
]

export default function AdminSidebar() {
  const { user, accessToken, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  return (
    <aside className="bg-slate-900/80 border-r border-slate-800 text-slate-200 flex flex-col">
      <div className="px-6 py-8 border-b border-slate-800">
        <p className="text-sm uppercase tracking-[0.4em] text-indigo-400">Admin</p>
        <h1 className="text-2xl font-bold mt-2">Control Panel</h1>
        <p className="text-sm text-slate-400 mt-2">{user?.email}</p>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'hover:bg-slate-800 text-slate-300'
              }`
            }
            end
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-6 space-y-4 border-t border-slate-800 py-6">
        <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Session</p>
          <p className="mt-2 font-semibold text-white">{user?.email}</p>
          <p className="text-xs text-slate-400">Token fingerprint:</p>
          <p className="text-xs font-mono text-indigo-200 mt-1 break-all">
            {accessToken ? `${accessToken.slice(0, 6)}…${accessToken.slice(-6)}` : 'No active session'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
