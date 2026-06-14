import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import featuredImg from '../assets/training-featured.jpg';

const popularSessions = [
  {
    title: 'Microsoft Fabric Deep Dive: Unified Analytics at Scale',
    description: 'Explore Fabric\'s lakehouse architecture, OneLake, Data Factory, and Power BI working together.',
    date: 'Jun 10, 2026',
    slots: '31 seats available',
    bookingUrl: '/livesessions?register=fabric-deepdive',
  },
  {
    title: 'Power BI & Fabric: Building Self-Service Analytics',
    description: 'Design semantic models, dataflows, and governed self-service experiences across Power BI and Fabric.',
    date: 'Apr 22, 2026',
    slots: '8 seats left',
    bookingUrl: '/livesessions?register=powerbi-fabric',
  },
  {
    title: 'Data Quality & Governance Frameworks That Actually Work',
    description: 'Operationalize data quality with Great Expectations, dbt tests, and contract-driven pipelines.',
    date: 'May 20, 2026',
    slots: '12 seats available',
    bookingUrl: '/livesessions?register=data-quality',
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

const TrainingServices = () => {
  const [featuredRef, featuredInView] = useInView();
  const [listRef, listInView] = useInView();

  return (
    <section className="relative bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300 overflow-hidden pb-6 lg:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
        {/* Featured / CTA card — flush to top, bottom and left of the section */}
        <div
          ref={featuredRef}
          className={`relative overflow-hidden min-h-[480px] lg:min-h-[640px] bg-cover bg-center group transition-all duration-700 ease-out ${
            featuredInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
          style={{ backgroundImage: `url(${featuredImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-gray-900/30" />
          <div className="absolute inset-4 border border-white/30 pointer-events-none" />
          <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:pl-[max(2rem,calc((100vw-72rem)/2+1rem))]">
            <span className="text-white/80 text-sm uppercase tracking-widest mb-3">Training & Services</span>
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4 max-w-lg">
              Hands-On Data Engineering Mentorship & Live Sessions
            </h3>
            <p className="text-white/85 text-base mb-6 max-w-md leading-relaxed">
              Practical, project-driven training across Azure, Microsoft Fabric, SQL, and Power BI — delivered live or on-demand through ReSkillIT.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/livesessions"
                className="inline-block px-6 py-3 bg-neatgreen text-white font-bold uppercase tracking-wider text-xs rounded-md hover:opacity-90 transition-opacity text-center"
              >
                Book a Session
              </Link>
              <a
                href="https://www.youtube.com/@reskillit1502"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-3 border-2 border-white text-white font-bold uppercase tracking-wider text-xs rounded-md hover:bg-white hover:text-gray-900 transition-colors text-center"
              >
                Visit ReSkillIT on YouTube
              </a>
            </div>
          </div>
        </div>

        {/* Popular Sessions list */}
        <div
          ref={listRef}
          className={`flex flex-col py-16 lg:py-24 px-4 md:px-8 lg:pl-12 lg:pr-[max(1rem,calc((100vw-72rem)/2+1rem))] transition-all duration-700 ease-out ${
            listInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
        >
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500 dark:text-gray-400 mb-8">
            Popular Sessions
          </span>
          <div className="space-y-8">
            {popularSessions.map((s, idx) => (
              <div
                key={idx}
                className={`group flex gap-5 items-start pb-8 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:pb-0 transition-all duration-700 ease-out ${
                  listInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${150 + idx * 120}ms` }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-neatgreen/10 border border-neatgreen/20 flex items-center justify-center group-hover:bg-neatgreen/20 transition-colors">
                  <Users className="text-neatgreen" size={26} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-neatgreen transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    {s.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Calendar size={13} /> {s.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-neatgreen font-semibold uppercase tracking-wider">
                      {s.slots}
                    </span>
                  </div>
                  <Link
                    to={s.bookingUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neatgreen text-white font-bold uppercase tracking-wider text-[11px] rounded-md hover:opacity-90 transition-opacity"
                  >
                    Book Now <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/livesessions"
            className="mt-8 inline-flex items-center gap-2 text-neatgreen font-bold uppercase tracking-wider text-xs hover:opacity-70 transition-opacity self-start"
          >
            View All Sessions <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrainingServices;
