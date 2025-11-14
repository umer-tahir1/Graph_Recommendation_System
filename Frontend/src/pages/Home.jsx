import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center text-white mb-12">
          <h1 className="text-6xl font-bold mb-6">Welcome to Our Store</h1>
          <p className="text-2xl mb-8 text-indigo-100">
            Find the best products for your needs with personalized recommendations
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/products" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition transform hover:scale-105">
              Shop Now
            </Link>
            <Link to="/about" className="px-8 py-4 bg-indigo-700 text-white font-bold rounded-lg hover:bg-indigo-800 transition border-2 border-white">
              About Us
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 text-white border border-white border-opacity-30">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold mb-3">Wide Selection</h3>
            <p>Choose from thousands of quality products across multiple categories</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 text-white border border-white border-opacity-30">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-3">Personalized Experience</h3>
            <p>Get recommendations tailored just for you based on your preferences</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 text-white border border-white border-opacity-30">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-bold mb-3">Fast Delivery</h3>
            <p>Quick and reliable shipping straight to your doorstep</p>
          </div>
        </div>
      </div>
    </div>
  )
}
