import React, { useState } from 'react';
import PageHero from '../components/PageHero';

const featuredWork = [
  {
    title: 'Modernizing a Legacy Data Warehouse into a Scalable Azure Data Platform',
    category: 'Cloud Migration & Architecture',
    description: 'Led transformation of legacy on-premise SQL Server warehouse into modern cloud-native Azure platform. Built layered architecture (Bronze/Silver/Gold) with Azure Data Lake, optimized ETL via Data Factory, and reduced data processing time by 70%. Lowered infrastructure costs by 30% while enabling near real-time reporting.',
    platforms: ['Azure Data Lake', 'Data Factory', 'Synapse Analytics', 'SQL', 'Python'],
    details: {
      problem: 'The existing SQL Server-based system struggled with performance issues, high maintenance costs, and limited scalability.',
      solution: 'Designed and implemented a cloud-native data architecture using Azure services (Bronze, Silver, Gold in Data Lake). Built ETL with Data Factory.',
      impact: ['Reduced data processing time by 70%', 'Lowered infrastructure costs by over 30%', 'Enabled near real-time reporting capabilities'],
    },
  },
  {
    title: 'Real-Time Trade & Risk Analytics Platform',
    category: 'Streaming Analytics',
    description: 'Designed and built hybrid streaming/batch analytics system for trading and risk teams. Ingested real-time trade data via event streaming, processed using Stream Analytics and Spark, and delivered insights through Power BI dashboards.',
    platforms: ['Event Hub', 'Stream Analytics', 'Synapse', 'Power BI', 'Spark'],
    details: {
      problem: 'Trading and risk teams relied on batch-processed data, leading to delays in decision-making and increased exposure to market risks.',
      solution: 'Implemented hybrid streaming processing. Ingested data using event hubs, processed via Stream Analytics, stored in Synapse.',
      impact: ['Reduced data latency from hours to minutes', 'Improved responsiveness to market changes', 'Enhanced decision-making accuracy'],
    },
  },
  {
    title: 'Data Quality & Governance Framework Implementation',
    category: 'Data Quality & Reliability',
    description: 'Built scalable, reusable data quality and governance framework embedded in ETL pipelines. Implemented validation rules, logging, alerting, and data lineage tracking.',
    platforms: ['Data Factory', 'SQL', 'Python', 'Monitoring Tools'],
    details: {
      problem: 'Inconsistent data quality led to reporting errors, reduced stakeholder trust, and operational inefficiencies.',
      solution: 'Created a reusable framework embedded within data pipelines implementing validation rules and alerting mechanisms.',
      impact: ['Reduced data errors by over 70%', 'Increased confidence in reporting', 'Enabled audit-ready data processes'],
    },
  },
];

const Work = () => {
  const [selectedWork, setSelectedWork] = useState(null);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <PageHero 
        title="Featured Work" 
        subtitle="In-depth case studies of enterprise data platforms and optimizations." 
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80" 
      />
      <div className="container mx-auto px-4 max-w-6xl py-24">
        
        <div className="space-y-12">
          {featuredWork.map((project, idx) => (
             <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
               <div className="p-8 md:p-12">
                 <span className="text-neatgreen font-bold uppercase tracking-wider text-xs mb-3 block">{project.category}</span>
                 <h3 className="text-2xl md:text-3xl font-bold font-source text-gray-900 dark:text-white leading-tight mb-4">{project.title}</h3>
                 <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{project.description}</p>
                 
                 <div className="flex flex-wrap gap-2 mb-8">
                   {project.platforms.map((platform, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md">{platform}</span>
                   ))}
                 </div>

                 {selectedWork === idx ? (
                   <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 animate-fade-in text-gray-600 dark:text-gray-300 space-y-6">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">The Problem</h4>
                        <p>{project.details.problem}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">The Solution</h4>
                        <p>{project.details.solution}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Business Impact</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {project.details.impact.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                      </div>
                      <button onClick={() => setSelectedWork(null)} className="mt-4 text-neatgreen font-bold uppercase text-sm hover:opacity-80">Close Case Study</button>
                   </div>
                 ) : (
                   <button onClick={() => setSelectedWork(idx)} className="text-neatgreen font-bold uppercase text-sm tracking-wider hover:opacity-80 flex items-center">
                     Read Case Study
                     <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                   </button>
                 )}
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
