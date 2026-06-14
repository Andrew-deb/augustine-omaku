import React from 'react';

const PageHero = ({ title, subtitle, image = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80' }) => {
  return (
    <div 
      className="relative pt-32 pb-16 min-h-[350px] flex items-center justify-center bg-cover bg-center text-center" 
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }} />
      
      <div className="relative z-10 px-8 py-8 mt-12">
        <h1 className="font-source text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-200 text-lg md:text-xl font-light max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHero;
