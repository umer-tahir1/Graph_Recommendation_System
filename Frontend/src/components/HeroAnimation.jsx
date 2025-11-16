import React from 'react'
import { motion } from 'framer-motion'
import Truck from '../assets/truck.svg?react'
import Box from '../assets/box.svg?react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

const truckVariants = {
  hidden: { x: '-80%', rotate: -4 },
  visible: {
    x: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 60, damping: 12, delay: 0.2 }
  }
}

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 }
  }
}

const badgeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, type: 'spring', stiffness: 200, damping: 25 }
  })
}

const boxVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 14 }
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
          LogiCommerce
        </motion.span>
        <motion.h1 variants={textVariants} className="text-4xl lg:text-6xl font-extrabold leading-tight">
          Your store. Your goods.
        </motion.h1>
        <motion.p variants={textVariants} className="text-lg text-slate-300 leading-relaxed max-w-xl">
          Wrap your catalog in a premium story, highlight curated drops, and greet visitors with a
          cinematic welcome the moment they land.
        </motion.p>

        <motion.div variants={textVariants} className="flex flex-wrap gap-4">
          <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 transition rounded-xl font-semibold shadow-lg shadow-indigo-500/30">
            Launch Storefront
          </button>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 transition rounded-xl font-semibold">
            Watch Demo
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          {["45% faster dispatch", "Live inventory lanes", "AI route insights", "Zero-touch tracking"].map((item, idx) => (
            <motion.div key={item} custom={0.2 * idx} variants={badgeVariants} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-sm text-slate-300">{item}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Animated truck scene */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center gap-6"
      >
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-10 shadow-[0_35px_120px_rgba(15,23,42,0.9)]">
          <motion.div
            variants={truckVariants}
            className="relative"
          >
            <div className="absolute -top-8 -right-10 w-40 h-40 bg-indigo-500/30 blur-3xl" />
            <Truck className="w-full h-56 drop-shadow-[0_20px_80px_rgba(99,102,241,0.45)]" />

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

          <motion.div
            custom={0.4}
            variants={badgeVariants}
            className="mt-10 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live Fleet</p>
              <p className="text-2xl font-bold">128 vehicles</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Avg. arrival</p>
              <p className="text-xl text-emerald-300 font-semibold">23 min</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          custom={0.6}
          variants={badgeVariants}
          className="bg-indigo-500 text-white px-8 py-3 rounded-full shadow-2xl shadow-indigo-500/40"
        >
          Delivering premium goods now
        </motion.div>
      </motion.div>
    </div>
  </section>
)

export default HeroAnimation
