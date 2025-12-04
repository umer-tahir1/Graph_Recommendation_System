import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchProducts } from '@/api';
import CategoryCard from '../components/user/portal/CategoryCard';

const CATEGORY_IMAGES = {
  'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  'Mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  'Apparel': 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=800&q=80',
  'Mugs': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80',
  'Home Goods': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80',
  'Kitchen & Utensils': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
  'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'Computers': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
  'Bikes': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
  'Cars': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?auto=format&fit=crop&w=800&q=80',
  'Gadgets': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=800&q=80',
};

export default function UserHome() {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const cats = await fetchCategories();
      setCategories(cats);
      setTimeout(() => setLoaded(true), 100);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-700 p-8">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
      <h1 className="text-4xl font-bold text-white mb-8 text-center animate-fade-in">Welcome to the Store</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
        {categories.map((cat, index) => (
          <div
            key={cat.name}
            className={`transform transition-all duration-700 ease-out ${
              loaded
                ? 'translate-y-0 opacity-100 scale-100'
                : index % 2 === 0
                ? 'translate-y-10 opacity-0 scale-95'
                : '-translate-y-10 opacity-0 scale-95'
            }`}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              willChange: 'transform, opacity'
            }}
          >
            <CategoryCard
              title={cat.name}
              image={CATEGORY_IMAGES[cat.name] || cat.image_url}
              onClick={() => navigate(`/portal/category/${cat.name.toLowerCase()}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
