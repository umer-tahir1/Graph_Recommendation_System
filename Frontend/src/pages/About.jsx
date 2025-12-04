import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  const gridHighlights = [
    {
      title: 'Quality Products',
      description: 'All our products are carefully selected and verified',
      accent: 'text-cyan-300'
    },
    {
      title: 'Smart Recommendations',
      description: 'Personalized suggestions from our graph intelligence',
      accent: 'text-indigo-300'
    },
    {
      title: 'Great Customer Service',
      description: 'Dedicated support specialists ready to help',
      accent: 'text-emerald-300'
    },
    {
      title: 'Competitive Prices',
      description: 'Better pricing without compromising on quality',
      accent: 'text-amber-300'
    },
    {
      title: 'Fast Shipping',
      description: 'Quick fulfillment with transparent tracking',
      accent: 'text-rose-300'
    },
    {
      title: 'Easy Returns',
      description: 'Hassle-free exchanges handled in-app',
      accent: 'text-purple-300'
    }
  ]

  return (
    <section className="relative min-h-screen bg-[#030712] text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05091f] via-[#0f172a] to-[#1f2937]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.4),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_40%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-indigo-900/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">About</p>
          <h1 className="text-4xl font-bold">The story behind GRS</h1>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Graph Recommendation System pairs curated catalogs with interaction intelligence so shoppers see what matters faster.
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Mission</p>
            <h2 className="text-3xl font-bold mt-3 mb-4">◈ Our mission</h2>
            <p className="text-slate-200 leading-relaxed text-lg">
              Build a premium shopping surface powered by graph signals so every customer can discover, evaluate, and act on the right product with confidence.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Team</p>
            <h2 className="text-3xl font-bold mt-3 mb-4">◎ Who we are</h2>
            <p className="text-slate-200 leading-relaxed text-lg mb-4">
              A cross-functional crew of merchandisers, graph engineers, and storytellers who obsess over translating catalog data into memorable experiences.
            </p>
            <p className="text-slate-200 leading-relaxed text-lg">
              Every release blends human taste with telemetry, ensuring recommendations feel curated rather than automated.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Why choose us</p>
            <h2 className="text-3xl font-bold mt-3 mb-6">✦ Product promises</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gridHighlights.map(({ title, description, accent }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h4 className={`font-semibold ${accent} mb-2`}>{title}</h4>
                  <p className="text-sm text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Story</p>
            <h2 className="text-3xl font-bold mt-3 mb-4">◫ How we started</h2>
            <p className="text-slate-200 leading-relaxed text-lg mb-4">
              What began as a prototype to visualize product relationships is now a full-stack marketplace experience trusted by thousands of shoppers.
            </p>
            <p className="text-slate-200 leading-relaxed text-lg">
              We continue to iterate on graph modeling, interaction tracking, and storytelling so every session feels personal.
            </p>
          </section>

          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-center shadow-2xl shadow-indigo-500/30">
            <h2 className="text-3xl font-bold mb-3">Have questions?</h2>
            <p className="text-lg text-white/80 mb-6">Partner with us or explore the graph demo—our team answers within a day.</p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-indigo-700 font-semibold rounded-2xl hover:bg-indigo-50 transition"
            >
              Contact us
            </Link>
          </section>

          <div className="text-center py-8">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 rounded-2xl text-white font-semibold transition shadow-lg shadow-indigo-500/30"
            >
              Start shopping now →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
