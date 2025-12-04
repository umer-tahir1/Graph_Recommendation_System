import React from 'react';

export default function CategoryCard({ title, image, onClick }) {
  return (
    <div
      className="cursor-pointer bg-slate-800 rounded-2xl shadow-lg hover:scale-105 hover:z-10 transition-all duration-300 flex flex-col justify-end p-0 text-white"
      style={{ minHeight: 180, minWidth: 220, height: 180, width: '100%', position: 'relative', overflow: 'hidden' }}
      onClick={onClick}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1, borderRadius: '1rem', filter: 'brightness(0.7)' }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-5xl" style={{ zIndex: 1 }}>
          <span>◆</span>
        </div>
      )}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <h3 className="text-xl font-bold text-indigo-200 drop-shadow-lg bg-slate-900/60 px-4 py-2 rounded-xl">
          {title}
        </h3>
      </div>
    </div>
  );
}
