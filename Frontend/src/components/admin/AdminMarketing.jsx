import React, { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminSendMarketingEmail, adminSendRecommendationEmails } from '@/api'

const parseIdList = (value = '') =>
  value
    .split(',')
    .map((entry) => parseInt(entry.trim(), 10))
    .filter((entry) => Number.isFinite(entry))

export default function AdminMarketing() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [userIdsInput, setUserIdsInput] = useState('')
  const [lastSummary, setLastSummary] = useState(null)
  const [recommendUserIdsInput, setRecommendUserIdsInput] = useState('')
  const [recommendLimit, setRecommendLimit] = useState(3)
  const [lastRecommendationSummary, setLastRecommendationSummary] = useState(null)

  const parsedUserIds = useMemo(() => parseIdList(userIdsInput), [userIdsInput])
  const parsedRecommendationUserIds = useMemo(
    () => parseIdList(recommendUserIdsInput),
    [recommendUserIdsInput],
  )

  const mutation = useMutation({
    mutationFn: () =>
      adminSendMarketingEmail({
        subject: subject.trim(),
        content: content.trim(),
        user_ids: parsedUserIds.length ? parsedUserIds : undefined,
      }),
    onSuccess: (data) => {
      setLastSummary(data.summary || null)
      toast.success('Marketing email dispatched')
    },
    onError: () => {
      toast.error('Unable to send marketing email')
    },
  })

  const recommendationMutation = useMutation({
    mutationFn: () =>
      adminSendRecommendationEmails({
        user_ids: parsedRecommendationUserIds.length ? parsedRecommendationUserIds : undefined,
        limit: recommendLimit,
      }),
    onSuccess: (data) => {
      setLastRecommendationSummary(data.summary || null)
      toast.success('Graph recommendations dispatched')
    },
    onError: () => {
      toast.error('Unable to send recommendation emails')
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!subject.trim() || !content.trim()) {
      toast.error('Subject and content are required')
      return
    }
    mutation.mutate()
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">Campaigns</p>
        <h2 className="text-3xl font-bold text-white">Marketing Email Broadcast</h2>
        <p className="text-slate-300 max-w-3xl">
          Send curated announcements to opted-in customers. Leave the target list blank to reach every subscriber or
          provide a comma-separated list of internal user ids for a focused rollout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-indigo-200">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Winter drops + graph bundles"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-indigo-200">Content</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Hey there! Explore these graph-picked pairings..."
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 focus:border-indigo-400 focus:outline-none"
            />
          </label>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-indigo-200">Target user ids (optional)</span>
            <input
              type="text"
              value={userIdsInput}
              onChange={(e) => setUserIdsInput(e.target.value)}
              placeholder="101, 102, 103"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 focus:border-indigo-400 focus:outline-none"
            />
            <p className="text-xs text-indigo-100">
              Leave blank to message every opted-in user. Separate ids with commas for pilot cohorts.
            </p>
          </label>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Dispatch preview</p>
            <ul className="mt-2 space-y-1 text-xs text-indigo-100">
              <li>Subject length: {subject.trim().length} chars</li>
              <li>Content length: {content.trim().length} chars</li>
              <li>Targeting: {parsedUserIds.length ? `${parsedUserIds.length} ids` : 'All opted-in users'}</li>
            </ul>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-5 py-3 disabled:opacity-60"
          >
            {mutation.isPending ? 'Sending…' : 'Send campaign'}
          </button>
        </div>
      </form>

      {lastSummary && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Last general broadcast</p>
          <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(lastSummary).map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-900/60 border border-white/10 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">Personalized sends</p>
          <h3 className="text-2xl font-bold text-white">Graph-powered recommendation emails</h3>
          <p className="text-slate-300 max-w-3xl">
            Automatically generate subject lines and copy straight from the weighted graph so every opted-in shopper
            receives a unique set of picks.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-indigo-200">Target user ids (optional)</span>
            <input
              type="text"
              value={recommendUserIdsInput}
              onChange={(e) => setRecommendUserIdsInput(e.target.value)}
              placeholder="201, 305, 982"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 focus:border-indigo-400 focus:outline-none"
            />
            <p className="text-xs text-indigo-100">Leave blank to send to every subscribed user.</p>
          </label>
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-indigo-200">Recommendations per user</span>
            <input
              type="number"
              min={1}
              max={10}
              value={recommendLimit}
              onChange={(e) => {
                const next = Number(e.target.value) || 1
                setRecommendLimit(Math.min(10, Math.max(1, next)))
              }}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 focus:border-indigo-400 focus:outline-none"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <button
            type="button"
            onClick={() => recommendationMutation.mutate()}
            disabled={recommendationMutation.isPending}
            className="rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 py-3 disabled:opacity-60"
          >
            {recommendationMutation.isPending ? 'Generating…' : 'Send personalized emails'}
          </button>
          <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-indigo-100">
            Targeting {parsedRecommendationUserIds.length ? `${parsedRecommendationUserIds.length} ids` : 'all subscribers'} ·
            {` ${recommendLimit} recs each`}
          </div>
        </div>
      </section>

      {lastRecommendationSummary && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Last personalized send</p>
          <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(lastRecommendationSummary).map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-900/60 border border-white/10 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
