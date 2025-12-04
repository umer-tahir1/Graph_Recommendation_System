import React from 'react';

export default function ProductPreviewCard({ product, type }) {
  if (!product) return null;
  return (
    <div className="bg-slate-900 rounded-xl shadow-md p-4 flex flex-col items-center hover:scale-105 transition-all duration-300">
      <img
        src={product.image_url || product.imageUrl}
        alt={product.name}
        className="h-24 w-24 object-cover rounded-lg mb-2"
      />
      <h4 className="text-lg font-semibold text-white mb-1 text-center">{product.name}</h4>
      <p className="text-indigo-300 text-xs mb-1">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
      <p className="text-slate-400 text-sm">${product.price}</p>
    </div>
  );
}
