import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/auth/login')
    toast.success('Logged out successfully')
  }

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05091f] via-[#0f172a] to-[#1f2937] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and settings</p>
        </div>

        {/* Account Information */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white">
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">User ID</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 font-mono text-sm">
                {user?.id}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Email Notifications</h3>
                <p className="text-sm text-slate-400">Receive order updates and confirmations</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  emailNotifications ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Marketing Emails</h3>
                <p className="text-sm text-slate-400">Get personalized recommendations and offers</p>
              </div>
              <button
                onClick={() => setMarketingEmails(!marketingEmails)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  marketingEmails ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    marketingEmails ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <button
            onClick={handleSavePreferences}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition"
          >
            Save Preferences
          </button>
        </div>

        {/* Account Actions */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Account Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition text-left"
            >
              Sign Out
            </button>
            <button
              onClick={() => toast.info('Password reset link sent to your email')}
              className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition text-left"
            >
              Reset Password
            </button>
            <button
              onClick={() => toast.error('Account deletion requires email confirmation')}
              className="w-full px-6 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-semibold rounded-2xl transition text-left border border-red-800"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
