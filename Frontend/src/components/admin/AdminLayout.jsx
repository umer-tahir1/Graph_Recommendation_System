import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      <div className="grid lg:grid-cols-[250px_1fr] min-h-screen">
        <AdminSidebar />
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#05091f] via-[#0f172a] to-[#1f2937]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.4),transparent_45%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_40%)]" />
          </div>
          <div className="relative p-6 lg:p-10 space-y-8">
            <header className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-[0.3em] text-indigo-300">Graph Commerce OS</span>
              <h1 className="text-4xl font-bold text-white">Admin Workspace</h1>
              <p className="text-slate-300">Orchestrating experiences for {user?.email}</p>
            </header>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
