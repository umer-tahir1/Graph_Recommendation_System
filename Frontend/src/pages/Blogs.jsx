import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const blogPosts = [
  {
    id: 1,
    title: 'Understanding Graph-Based Recommendation Systems',
    excerpt: 'Discover how graph algorithms revolutionize personalized shopping experiences by mapping relationships between products, users, and interactions.',
    author: 'Dr. Sarah Chen',
    date: 'November 28, 2025',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80',
    readTime: '8 min read',
    tags: ['Graph Theory', 'AI', 'Machine Learning']
  },
  {
    id: 2,
    title: 'The Future of E-Commerce: AI-Powered Personalization',
    excerpt: 'Explore how artificial intelligence and machine learning are transforming online shopping into a truly personalized experience for every customer.',
    author: 'Michael Rodriguez',
    date: 'November 25, 2025',
    category: 'E-Commerce',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    readTime: '6 min read',
    tags: ['AI', 'E-Commerce', 'Personalization']
  },
  {
    id: 3,
    title: 'Building Scalable Recommendation Engines with Python',
    excerpt: 'A technical deep-dive into creating production-ready recommendation systems using Python, FastAPI, and graph databases.',
    author: 'Alex Kumar',
    date: 'November 20, 2025',
    category: 'Development',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    readTime: '12 min read',
    tags: ['Python', 'FastAPI', 'Backend']
  },
  {
    id: 4,
    title: 'User Privacy in Personalized Shopping Platforms',
    excerpt: 'Learn about best practices for protecting user data while delivering personalized recommendations in modern e-commerce applications.',
    author: 'Emma Thompson',
    date: 'November 15, 2025',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    readTime: '7 min read',
    tags: ['Privacy', 'Security', 'GDPR']
  },
  {
    id: 5,
    title: 'React + Vite: Modern Frontend Architecture',
    excerpt: 'Why we chose React with Vite for building lightning-fast, interactive user interfaces with hot module replacement.',
    author: 'James Wilson',
    date: 'November 10, 2025',
    category: 'Development',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    readTime: '9 min read',
    tags: ['React', 'Vite', 'Frontend']
  },
  {
    id: 6,
    title: 'Optimizing Product Discovery with Graph Analytics',
    excerpt: 'How graph analytics help customers discover products they love by understanding complex relationships in shopping behavior.',
    author: 'Dr. Sarah Chen',
    date: 'November 5, 2025',
    category: 'Analytics',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    readTime: '10 min read',
    tags: ['Analytics', 'Data Science', 'UX']
  },
  {
    id: 7,
    title: 'Supabase: The Future of Backend-as-a-Service',
    excerpt: 'Discover why Supabase is becoming the go-to choice for modern applications with built-in authentication, database, and real-time features.',
    author: 'Michael Rodriguez',
    date: 'October 30, 2025',
    category: 'Development',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    readTime: '8 min read',
    tags: ['Supabase', 'BaaS', 'Database']
  },
  {
    id: 8,
    title: 'Mobile-First Design in Modern E-Commerce',
    excerpt: 'Why responsive design isn\'t enough anymore - creating truly mobile-first shopping experiences that convert.',
    author: 'Emma Thompson',
    date: 'October 25, 2025',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    readTime: '6 min read',
    tags: ['Mobile', 'UX', 'Design']
  },
  {
    id: 9,
    title: 'Graph Neural Networks: The Next Generation of AI',
    excerpt: 'Understanding how Graph Neural Networks (GNNs) process relational data to create smarter recommendation systems.',
    author: 'Alex Kumar',
    date: 'October 20, 2025',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    readTime: '11 min read',
    tags: ['GNN', 'Deep Learning', 'AI']
  },
  {
    id: 10,
    title: 'Building Trust in E-Commerce Platforms',
    excerpt: 'Key strategies for establishing customer trust through transparent policies, secure transactions, and authentic reviews.',
    author: 'James Wilson',
    date: 'October 15, 2025',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80',
    readTime: '7 min read',
    tags: ['Trust', 'Business', 'Customer Service']
  },
  {
    id: 11,
    title: 'A/B Testing in Recommendation Systems',
    excerpt: 'How to scientifically measure and improve recommendation algorithm performance through controlled experiments.',
    author: 'Dr. Sarah Chen',
    date: 'October 10, 2025',
    category: 'Analytics',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    readTime: '9 min read',
    tags: ['Testing', 'Analytics', 'Optimization']
  },
  {
    id: 12,
    title: 'The Role of Animation in User Experience',
    excerpt: 'Why thoughtful animations and transitions make interfaces feel more responsive, intuitive, and delightful to use.',
    author: 'Emma Thompson',
    date: 'October 5, 2025',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    tags: ['Animation', 'UX', 'Framer Motion']
  }
]

const categories = ['All', ...new Set(blogPosts.map(post => post.category))]

export default function Blogs() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#05091f] via-[#111827] to-[#1f2937] text-white py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-center mb-4"
          >
            Our Blog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-center text-slate-300 max-w-2xl mx-auto"
          >
            Insights, tutorials, and news about graph-based recommendations and modern e-commerce
          </motion.p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 mb-8">
          <input
            type="text"
            placeholder="◉ Search articles by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 text-lg bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-400 rounded-xl focus:border-indigo-500 focus:outline-none transition"
          />
          
          <div className="flex flex-wrap gap-3 mt-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-12 text-center">
              <p className="text-2xl text-slate-400">No articles found matching your search.</p>
            </div>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:border-indigo-500/50 transition transform hover:-translate-y-2 duration-300"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-indigo-500 px-3 py-1 rounded-full text-sm font-semibold text-white">
                    {post.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-3 line-clamp-2 hover:text-indigo-400 transition">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{post.author}</p>
                        <p className="text-xs text-slate-500">{post.date}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{post.readTime}</span>
                  </div>
                  
                  <button className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition transform hover:scale-105">
                    Read Article
                  </button>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-2xl p-8 md:p-12 text-white text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to get the latest articles, insights, and updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
            />
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:shadow-2xl transition transform hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
