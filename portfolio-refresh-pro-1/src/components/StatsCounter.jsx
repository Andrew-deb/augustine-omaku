import React from 'react';
import { CountUp, useInView } from './CountUp';
import { apiUrl } from '../config/api';
import { useCachedFetch } from '../hooks/useCachedFetch';

const StatsCounter = () => {
  const [sectionRef, inView] = useInView(0.3);

  const { data } = useCachedFetch(apiUrl('/youtube/channel-stats'), {
    cacheKey: 'channel_stats',
    ttl: 600, // 10 minutes
  });

  const subscriberCount = data?.subscriber_count || 360; // Fallback


  const statsData = [
    { value: 10, suffix: '+', label: 'YEARS EXPERIENCE' },
    { value: 50, suffix: '+', label: 'PROJECTS DELIVERED' },
    { value: subscriberCount, suffix: '+', label: 'YOUTUBE SUBSCRIBERS' },
    { value: 3, suffix: '', label: 'CERTIFICATIONS' },
  ];

  return (
    <div
      ref={sectionRef}
      className="relative py-24 bg-gray-900 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80)' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }} />

      <div className="relative container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, idx) => (
            <div key={idx} className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl md:text-6xl font-bold text-neatgreen mb-2">
                <CountUp target={stat.value} suffix={stat.suffix} start={inView} />
              </div>
              <div className="text-sm tracking-widest text-gray-300 uppercase font-semibold mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCounter;
