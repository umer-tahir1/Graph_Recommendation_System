import React, { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/contact_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok && data.status === 'sent') {
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setFormData({ name: '', email: '', subject: '', message: '' })
        }, 3000)
      } else {
        setError(data.errors ? data.errors.join(', ') : 'Failed to send message.')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
    }
    setSending(false)
  }

  return (
    <section className="relative min-h-screen bg-[#030712] text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05091f] via-[#0f172a] to-[#1f2937]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.4),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_40%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-indigo-900/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        <div className="text-center space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Contact</p>
          <h1 className="text-4xl font-bold">We're here to help</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Have a question about the graph recommender or need to collaborate? Send a note and our team will reach out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 pb-4">
          {[{
            title: 'Email Us',
            icon: '✦',
            subtitle: 'Our team replies within a day',
            action: (
              <a href="mailto:support@grs.com" className="text-indigo-300 font-semibold hover:text-white transition-colors">
                support@grs.com
              </a>
            )
          }, {
            title: 'Call Us',
            icon: '◈',
            subtitle: 'Mon–Fri · 8am - 5pm',
            action: (
              <a href="tel:+1234567890" className="text-indigo-300 font-semibold hover:text-white transition-colors">
                +1 (234) 567-890
              </a>
            )
          }, {
            title: 'Visit Us',
            icon: '◆',
            subtitle: 'Drop by our HQ',
            action: (
              <p className="text-slate-200 leading-relaxed">
                123 Business Street<br />
                City, State 12345
              </p>
            )
          }].map((card) => (
            <div key={card.title} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur shadow-lg shadow-black/30 h-full flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mb-6 shrink-0">
                <span aria-hidden>{card.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-slate-300 mb-4 flex-1">{card.subtitle}</p>
              <div>{card.action}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-8 md:p-12 mt-8">
          <div className="flex flex-col gap-3 mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Message</p>
            <h2 className="text-3xl font-bold">Send us a note</h2>
            <p className="text-slate-300 max-w-2xl">
              Share a bit about your use case and we’ll route it to the right teammate.
            </p>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-400/40 rounded-2xl text-emerald-200 font-semibold flex items-center gap-2">
              <span>✓</span>
              <span>Thanks! Your message is on its way.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-400/40 rounded-2xl text-red-200 font-semibold flex items-center gap-2">
              <span>✖</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-slate-200 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-slate-200 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Tell us more about your inquiry..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 font-semibold text-white transition shadow-lg shadow-indigo-500/30"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold">Follow us</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            {['f', 't', 'i', 'in'].map((network) => (
              <a
                key={network}
                href="#"
                className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-xl hover:bg-white/20 transition"
              >
                {network}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
