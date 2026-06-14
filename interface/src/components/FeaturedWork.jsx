import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import realtimeImg from '../assets/work/realtime-trade.jpg';
import qualityImg from '../assets/work/data-quality.jpg';
import azureImg from '../assets/work/azure-warehouse.jpg';

const items = [
  {
    title: 'Real-Time Trade & Risk Analytics Platform',
    tags: ['Event Hub', 'Stream Analytics', 'Power BI'],
    image: realtimeImg,
  },
  {
    title: 'Data Quality & Governance Framework Implementation',
    tags: ['Data Factory', 'SQL', 'Python'],
    image: qualityImg,
  },
  {
    title: 'Modernizing a Legacy Data Warehouse into a Scalable Azure Data Platform',
    tags: ['Azure Data Lake', 'Synapse', 'ETL'],
    image: azureImg,
  },
];

const useInView = (options = { threshold: 0.15 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(entry.target);
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
};

const WorkCard = ({ item, index, isFeature }) => {
  const [ref, inView] = useInView();
  return (
    <Link
      ref={ref}
      to="/work"
      className={`group relative block overflow-hidden rounded-xl shadow-lg h-[420px] ${
        isFeature ? 'sm:h-auto sm:row-span-2 sm:order-first lg:order-none lg:row-span-1' : ''
      } transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Persistent gradient for static title/tags */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />

      {/* Static title + tags */}
      <div className="absolute inset-x-0 bottom-0 p-6 z-10">
        <h3 className="text-white font-bold text-lg leading-snug mb-3 line-clamp-3">
          {item.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((t, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Hover overlay with Learn More */}
      <div className="absolute inset-0 bg-neatgreen/85 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
        <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold uppercase tracking-wider text-xs rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          Learn More <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
};

const FeaturedWork = () => {
  return (
    <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-neatgreen font-bold tracking-wider uppercase text-sm mb-2 block">Selected Projects</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Featured Work
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:auto-rows-fr lg:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const isOdd = items.length % 2 === 1;
            const isLast = idx === items.length - 1;
            return (
              <WorkCard key={idx} item={item} index={idx} isFeature={isOdd && isLast} />
            );
          })}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/work"
            className="inline-flex items-center gap-2 text-neatgreen font-bold uppercase tracking-wider text-sm border-b-2 border-neatgreen pb-1 hover:opacity-80 transition-opacity"
          >
            View All Work <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWork;
