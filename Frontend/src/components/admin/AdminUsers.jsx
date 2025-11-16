import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
} from '@/api'
import { useAuth } from '../../contexts/AuthContext'
import { useAuditEmitter } from '../../hooks/useAuditEmitter'

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]

const formatTimestamp = (value) => {
  if (!value) return 'Never'
  try {
    const date = new Date(value)
    return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } catch (err) {
    return value
  }
}

export default function AdminUsers() {
  const { user, refreshSession } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [busyUserId, setBusyUserId] = useState(null)
  const { emitAudit } = useAuditEmitter()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminUsers()
      setUsers(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load Supabase users')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => (u.role || '').toLowerCase() === 'admin').length
    const disabled = users.filter((u) => u.status === 'disabled').length
    return { total, admins, disabled }
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = search
        ? u.email?.toLowerCase().includes(search.toLowerCase()) || u.id?.includes(search)
        : true
      const matchesRole = roleFilter === 'all' ? true : (u.role || 'viewer') === roleFilter
      const matchesStatus = statusFilter === 'all' ? true : (u.status || 'active') === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const handleRoleChange = async (userId, role) => {
    setBusyUserId(userId)
    try {
      const promise = updateAdminUser(userId, { role })
      toast.promise(promise, {
        loading: 'Updating role…',
        success: `Role set to ${role}`,
        error: 'Failed to update role',
      })
      const updated = await promise
      emitAudit({
        action: 'user.update',
        targetType: 'user',
        targetId: userId,
        targetDisplay: updated.email,
        before: users.find((u) => u.id === userId),
        after: updated,
        metadata: { role },
      })
      await loadUsers()
    } finally {
      setBusyUserId(null)
    }
  }

  const handleToggleDisabled = async (record) => {
    setBusyUserId(record.id)
    const nextDisabled = record.status !== 'disabled'
    try {
      const promise = updateAdminUser(record.id, { disabled: nextDisabled })
      toast.promise(promise, {
        loading: nextDisabled ? 'Disabling user…' : 'Re-enabling user…',
        success: nextDisabled ? 'User disabled' : 'User activated',
        error: 'Failed to toggle status',
      })
      const updated = await promise
      emitAudit({
        action: 'user.update',
        targetType: 'user',
        targetId: record.id,
        targetDisplay: updated.email,
        before: record,
        after: updated,
        metadata: { disabled: nextDisabled },
      })
      await loadUsers()
    } finally {
      setBusyUserId(null)
    }
  }

  const handleDelete = async (record) => {
    if (record.id === user?.id) {
      toast.error('You cannot remove your own account')
      return
    }
    if (!window.confirm(`Remove ${record.email}? This cannot be undone.`)) {
      return
    }
    setBusyUserId(record.id)
    try {
      const promise = deleteAdminUser(record.id)
      toast.promise(promise, {
        loading: 'Deleting user…',
        success: 'User deleted',
        error: 'Failed to delete user',
      })
      await promise
      emitAudit({
        action: 'user.delete',
        targetType: 'user',
        targetId: record.id,
        targetDisplay: record.email,
        before: record,
      })
      await loadUsers()
    } finally {
      setBusyUserId(null)
    }
  }

  const handleRefreshSession = async () => {
    const { error } = await refreshSession()
    if (error) {
      toast.error('Unable to refresh Supabase session')
    } else {
      toast.success('Session refreshed')
      emitAudit({
        action: 'session.refresh',
        targetType: 'session',
        metadata: { source: 'admin-users' },
      })
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Supabase</p>
          <h2 className="text-3xl font-bold text-white">Admin users</h2>
          <p className="text-slate-300">Secure the workspace with least-privilege roles</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadUsers}
            className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur text-white font-semibold border border-white/10"
          >
            Refresh list
          </button>
          <button
            onClick={handleRefreshSession}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold"
          >
            Sync token
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total users" value={stats.total} subtitle="Connected to Supabase" />
        <StatCard label="Admins" value={stats.admins} subtitle="Privileged operators" />
        <StatCard label="Disabled" value={stats.disabled} subtitle="Throttled accounts" />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or id"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2"
            >
              <option value="all">All roles</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2"
            >
              <option value="all">All states</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <span className="text-sm text-slate-500">{filteredUsers.length} user(s) visible</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-600">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Identity</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Last sign in</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading Supabase users…</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">No users match this filter.</td>
                </tr>
              ) : (
                filteredUsers.map((record) => (
                  <tr key={record.id} className="border-t border-slate-100">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-slate-900">{record.email}</p>
                      <p className="text-xs text-slate-400 font-mono">{record.id}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        value={(record.role || 'viewer').toLowerCase()}
                        onChange={(e) => handleRoleChange(record.id, e.target.value)}
                        disabled={busyUserId === record.id}
                        className="rounded-xl border border-slate-200 px-3 py-1 text-sm"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'disabled'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {record.status === 'disabled' ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm text-slate-500">
                      {formatTimestamp(record.last_sign_in_at)}
                    </td>
                    <td className="py-4 pr-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleDisabled(record)}
                        disabled={busyUserId === record.id}
                        className="px-3 py-1 rounded-xl text-sm font-semibold bg-slate-900 text-white"
                      >
                        {record.status === 'disabled' ? 'Activate' : 'Disable'}
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        disabled={busyUserId === record.id || record.id === user?.id}
                        className="px-3 py-1 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="rounded-3xl bg-white/10 border border-white/10 backdrop-blur p-5 text-white">
      <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">{label}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
      <p className="text-sm text-slate-200 mt-1">{subtitle}</p>
    </div>
  )
}
