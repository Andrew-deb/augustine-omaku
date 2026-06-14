import React, { useEffect, useRef, useState } from 'react';
import PageHero from '../components/PageHero';
import { Database, Cloud, Layers, BarChart3, Server, GraduationCap } from 'lucide-react';

const expertiseAreas = [
  {
    icon: Database,
    title: 'Data Engineering & Architecture',
    description: 'ETL/ELT pipeline design, data lake strategy, cloud-native architectures, dimensional modeling, data quality frameworks',
    tags: ['ETL/ELT', 'Data Lakes', 'Architecture', 'Modeling'],
  },
  {
    icon: Cloud,
    title: 'Azure Data Platform',
    description: 'Azure Data Factory, Synapse Analytics, Data Lake Storage, SQL Server, Stream Analytics, automation, monitoring',
    tags: ['Data Factory', 'Synapse', 'Azure SQL', 'ADLS'],
  },
  {
    icon: Layers,
    title: 'Microsoft Fabric',
    description: 'Data warehousing, lakehouses, Spark engineering, lakehouse automation, integrated analytics platform',
    tags: ['Fabric', 'Lakehouse', 'Spark', 'Data Warehouse'],
  },
  {
    icon: BarChart3,
    title: 'BI & Analytics Enablement',
    description: 'Power BI development, semantic model design, enterprise reporting, analytics governance, self-service BI',
    tags: ['Power BI', 'Semantic Models', 'DAX', 'Reporting'],
  },
  {
    icon: Server,
    title: 'SQL & Database Systems',
    description: 'Advanced SQL optimization, T-SQL development, query performance tuning, dimensional design, SSMS administration',
    tags: ['SQL Server', 'T-SQL', 'Performance', 'Design'],
  },
  {
    icon: GraduationCap,
    title: 'Technical Education & Community',
    description: 'Tutorial production, technical content creation, mentoring, community building, knowledge sharing at scale',
    tags: ['Content', 'Teaching', 'YouTube', 'Community'],
  },
];

const useInView = (options = { threshold: 0.15 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

const ExpertiseCard = ({ area, index }) => {
  const [ref, inView] = useInView();
  const Icon = area.icon;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 3) * 100}ms` }}
      className={`group bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:-translate-y-2 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="mb-6">
        <Icon
          size={48}
          strokeWidth={1.25}
          className="text-gray-400 dark:text-gray-500 group-hover:text-neatgreen transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(102,211,126,0.7)]"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">{area.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">{area.description}</p>
      <div className="flex flex-wrap gap-2">
        {area.tags.map((tag, i) => (
          <span key={i} className="px-3 py-1 text-xs font-medium bg-neatgreen/10 text-neatgreen rounded-full border border-neatgreen/20">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const Expertise = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <PageHero
        title="Expertise"
        subtitle="Deep technical knowledge across the full data engineering and analytics stack."
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 max-w-6xl py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expertiseAreas.map((area, idx) => (
            <ExpertiseCard key={idx} area={area} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Expertise;
