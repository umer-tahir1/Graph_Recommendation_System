// React and routing imports
import React from 'react'
import { Link } from 'react-router-dom'

// About page component - displays company information and mission
export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page header with title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">About Us</h1>
          <p className="text-xl text-gray-600">
            Your trusted online marketplace for quality products
          </p>
        </div>

        {/* Multiple content sections describing company */}
        <div className="space-y-8">
          {/* Mission Statement */}
          <section className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-indigo-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">🎯 Our Mission</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              We are dedicated to providing our customers with the best shopping experience possible. Our mission is to connect quality products with customers who need them through smart recommendations and exceptional service.
            </p>
          </section>

          {/* Team Background and Expertise */}
          <section className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">👥 Who We Are</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              We are a team of passionate individuals dedicated to bringing you the best products and service. With years of experience in e-commerce, we understand what customers need and how to deliver it.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Our platform uses intelligent recommendation technology to help you discover products that match your preferences perfectly.
            </p>
          </section>

          {/* Key Benefits and Differentiators */}
          <section className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-pink-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">✨ Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Benefit cards with descriptions */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">Quality Products</h4>
                <p className="text-sm text-blue-700">All our products are carefully selected and verified</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">Smart Recommendations</h4>
                <p className="text-sm text-green-700">Get personalized suggestions based on your preferences</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-2">Great Customer Service</h4>
                <p className="text-sm text-purple-700">Our team is always ready to help you</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-bold text-yellow-900 mb-2">Competitive Prices</h4>
                <p className="text-sm text-yellow-700">Best prices without compromising on quality</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-bold text-red-900 mb-2">Fast Shipping</h4>
                <p className="text-sm text-red-700">Quick delivery to your doorstep</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-2">Easy Returns</h4>
                <p className="text-sm text-indigo-700">Hassle-free returns and exchanges</p>
              </div>
            </div>
          </section>

          {/* Company History and Growth */}
          <section className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">📖 Our Story</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              Founded with a vision to revolutionize online shopping, our company started as a small project to help people find products they love. Over time, we've grown into a trusted platform serving thousands of happy customers.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Today, we continue to innovate and improve our services to make shopping easier, smarter, and more enjoyable for everyone.
            </p>
          </section>

          {/* Call to Action - encourages contacting company */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-lg mb-6">We'd love to hear from you! Feel free to reach out with any questions or feedback.</p>
            <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition transform hover:scale-105">
              Contact Us
            </button>
          </section>

          {/* Call to Action Button - directs to products */}
          <div className="text-center py-8">
            <Link
              to="/products"
              className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              Start Shopping Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
