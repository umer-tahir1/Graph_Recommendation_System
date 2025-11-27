import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid lg:grid-cols-[250px_1fr] min-h-screen">
        <AdminSidebar />
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/60" />
          <div className="relative p-6 lg:p-10 space-y-8">
            <header className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-[0.3em] text-indigo-300">Graph Commerce OS</span>
              <h1 className="text-4xl font-bold text-white">Admin Workspace</h1>
              <p className="text-slate-300">Orchestrating experiences for {user?.email}</p>
            </header>
            <Outlet key={location.pathname} />
          </div>
        </div>
      </div>
    </div>
  )
}
