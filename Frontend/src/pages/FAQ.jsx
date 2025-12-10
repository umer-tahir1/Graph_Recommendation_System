import React, { useState } from 'react'

const FAQ_DATA = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click the "Sign Up" button in the navigation bar. Enter your email and password, then verify your email address to complete registration.',
      },
      {
        q: 'How do I log in?',
        a: 'Click "Login" in the navigation bar and enter your email and password. If you forgot your password, use the "Reset Password" link.',
      },
    ],
  },
  {
    category: 'Shopping',
    questions: [
      {
        q: 'How do I add items to my cart?',
        a: 'Browse products in any category and click "Add to Cart" on any product card. You can view your cart by clicking the cart icon in the header.',
      },
      {
        q: 'Can I save items for later?',
        a: 'Yes! Click the heart icon on any product to add it to your favorites. Access your favorites from your user portal.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards, debit cards, PayPal, and Apple Pay for your convenience.',
      },
    ],
  },
  {
    category: 'Graph Recommendations',
    questions: [
      {
        q: 'What are graph-based recommendations?',
        a: 'Our system uses advanced graph algorithms to analyze relationships between products, users, and interactions to provide highly personalized recommendations.',
      },
      {
        q: 'How do recommendations improve over time?',
        a: 'As you interact with products (view, like, purchase), our graph system learns your preferences and refines recommendations to match your interests better.',
      },
    ],
  },
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How can I track my order?',
        a: 'After placing an order, you\'ll receive a tracking number via email. You can also view order status in your account dashboard.',
      },
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Contact support to initiate a return.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    questions: [
      {
        q: 'How is my data protected?',
        a: 'We use industry-standard encryption and security measures to protect your personal information. Read our Privacy Policy for more details.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, you can delete your account from Settings. Note that this action is permanent and will remove all your data.',
      },
    ],
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === key ? null : key)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05091f] via-[#0f172a] to-[#1f2937]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.4),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_40%)]" />
      </div>
      
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-400">Find answers to common questions about our platform</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 text-xl">◉</span>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {FAQ_DATA.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-indigo-400">▫</span>
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`
                  const isOpen = openIndex === key

                  return (
                    <div
                      key={questionIndex}
                      className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/80 transition"
                      >
                        <span className="text-white font-semibold pr-4">{item.q}</span>
                        <span className={`text-indigo-400 text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 pt-2 text-slate-300 leading-relaxed border-t border-slate-700">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Still need help?</h3>
          <p className="text-slate-300 mb-6">Our support team is here to assist you</p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
    </div>
  )
}
