import React from 'react'
import { motion } from 'framer-motion'
import Truck from '../assets/truck.svg?react'
import Box from '../assets/box.svg?react'

/**
 * @typedef {import('framer-motion').Variants} Variants
 * @typedef {import('framer-motion').TargetAndTransition} TargetAndTransition
 * @typedef {import('framer-motion').Transition} MotionTransition
 */

const spring = (overrides = {}) => (/** @type {MotionTransition} */ ({ type: 'spring', ...overrides }))

/** @type {Variants} */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

/** @type {Variants} */
const truckVariants = {
  hidden: { x: '-80%', rotate: -4 },
  visible: {
    x: 0,
    rotate: 0,
    transition: spring({ stiffness: 60, damping: 12, delay: 0.2 })
  }
}

/** @type {Variants} */
const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 }
  }
}

/** @type {Variants} */
const badgeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => (/** @type {TargetAndTransition} */ ({
    opacity: 1,
    y: 0,
    transition: spring({ delay, stiffness: 200, damping: 25 })
  }))
}

/** @type {Variants} */
const boxVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring({ stiffness: 300, damping: 14 })
  }
}

const HeroAnimation = () => (
  <section className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
    {/* Background gradients */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05091f] via-[#111827] to-[#1f2937]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.35),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_45%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-purple-900/70 to-transparent" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(130deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:120px_120px]" />
    </div>

    <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-24 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
      {/* Copy block */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.span variants={textVariants} className="inline-block px-4 py-1 rounded-full border border-white/20 text-sm uppercase tracking-[0.3em] text-indigo-200">
          NovaMart
        </motion.span>
        <motion.h1 variants={textVariants} className="text-4xl lg:text-6xl font-extrabold leading-tight">
          Your store. Your goods.
        </motion.h1>
        <motion.p variants={textVariants} className="text-lg text-slate-300 leading-relaxed max-w-xl">
          Wrap your catalog in a premium story, highlight curated drops, and greet visitors with a
          cinematic welcome the moment they land.
        </motion.p>

        <motion.div variants={textVariants} className="flex flex-wrap gap-4">
          <button
            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 transition rounded-xl font-semibold shadow-lg shadow-indigo-500/30"
            onClick={() => window.location.href = '/portal'}
          >
            Launch Storefront
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <motion.a href="/contact" custom={0} variants={badgeVariants} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur hover:bg-white/10 transition cursor-pointer">
            <p className="text-sm text-slate-300">Contact Us</p>
          </motion.a>
          <motion.a href="/about" custom={0.2} variants={badgeVariants} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur hover:bg-white/10 transition cursor-pointer">
            <p className="text-sm text-slate-300">About</p>
          </motion.a>
          <motion.a href="/faq" custom={0.4} variants={badgeVariants} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur hover:bg-white/10 transition cursor-pointer">
            <p className="text-sm text-slate-300">FAQ</p>
          </motion.a>
          <motion.a href="/blogs" custom={0.6} variants={badgeVariants} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur hover:bg-white/10 transition cursor-pointer">
            <p className="text-sm text-slate-300">Blogs</p>
          </motion.a>
        </div>
      </motion.div>

      {/* Animated truck scene */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center justify-center gap-6"
      >
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-10 shadow-[0_35px_120px_rgba(15,23,42,0.9)] flex items-center justify-center" style={{ minHeight: '370px' }}>
          <motion.div
            variants={truckVariants}
            className="relative flex items-center justify-center"
          >
            <div className="absolute -top-8 -right-10 w-40 h-40 bg-indigo-500/30 blur-3xl" />
            <Truck className="w-full h-[320px] max-w-[480px] mx-auto drop-shadow-[0_20px_80px_rgba(99,102,241,0.45)]" />
            <motion.div
              variants={containerVariants}
              className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3"
            >
              {['text-amber-400', 'text-cyan-300', 'text-emerald-300'].map((color, index) => (
                <motion.div key={color} variants={boxVariants} className="bg-white/5 backdrop-blur rounded-xl p-2">
                  <Box className={`w-10 h-10 ${color}`} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
)

export default HeroAnimation
