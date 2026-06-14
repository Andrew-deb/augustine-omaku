import React from 'react';
import PageHero from '../components/PageHero';

const aboutBody = [
  'I specialize in designing scalable cloud-native data architectures on Azure and Microsoft Fabric, with a focus on ETL/ELT pipelines, data warehousing, and analytics enablement. My experience spans finance and tech, where I have led platform transformations that reduced data latency, improved quality, and empowered business teams. I understand the full stack—from infrastructure and engineering to the business problems data systems solve.',
  'Beyond engineering, I am committed to education. Through ReskillIT (131+ YouTube videos, 360+ subscribers), I create practical, real-world tutorials on Power BI, SQL, Azure, and data careers. This is not theoretical content—it is based on the actual challenges I solve daily. Teaching has made me a better engineer, and engineering keeps my teaching grounded in reality.',
  'My approach bridges two worlds: engineering rigor (proper architecture, scalability, reliability) and business impact (solving real problems, enabling decisions, creating value). Whether designing a data lake, optimizing pipelines, speaking at events, or mentoring engineers, I focus on solutions that work at scale and knowledge that actually helps people grow.',
];

const experience = [
  {
    title: 'Senior Data Engineer',
    company: 'Finance & Tech Sector',
    period: 'Current Role',
    description: 'Design and deliver scalable, enterprise-grade data platforms on Azure and Microsoft Fabric. Lead design of modern data architectures supporting real-time analytics, real-time decision-making, and self-service BI for teams spanning trading, risk, and business intelligence.',
    highlights: [
      'Architected cloud-native data platforms reducing latency from hours to minutes and enabling near real-time analytics',
      'Designed data quality and governance frameworks reducing data errors by 70% and improving stakeholder trust',
      'Built self-service BI platforms using Power BI, empowering 100+ business users with scalable analytics',
      'Led teams delivering ETL/ELT pipelines processing terabytes of daily data with 99.9% reliability',
    ],
  },
  {
    title: 'Azure Data Engineer',
    company: 'Enterprise Data Teams',
    period: 'Previous Experience',
    description: 'Modernized legacy on-premise data systems into scalable Azure-based platforms. Focused on cost optimization, performance, and enablement.',
    highlights: [
      'Migrated legacy data warehouse to Azure, reducing costs by 30% and improving query performance by 70%',
      'Implemented partitioning and incremental load strategies for petabyte-scale data processing',
      'Trained teams on Azure best practices, data modeling, and self-service analytics',
    ],
  },
];

const certifications = [
  {
    name: 'Microsoft Certified: Power BI Data Analyst Associate',
    issuer: 'Microsoft',
    earnedDate: '10 Jan 2026',
    link: 'https://learn.microsoft.com/api/credentials/share/en-us/AugustineOmaku-7703/85D6700B62312BC9?sharingId=1B85908EF28E3B3A',
  },
  {
    name: 'Microsoft Certified: Fabric Data Engineer Associate',
    issuer: 'Microsoft',
    earnedDate: '28 Mar 2026',
    link: 'https://learn.microsoft.com/api/credentials/share/en-us/AugustineOmaku-7703/A4BB07C76298F1A5?sharingId=1B85908EF28E3B3A',
  },
];

const techStack = {
  platforms: ['Azure', 'Microsoft Fabric', 'Power BI', 'SQL Server'],
  tools: ['Azure Data Factory', 'Synapse Analytics', 'Data Lake Storage', 'Stream Analytics'],
  languages: ['SQL (T-SQL)', 'Python', 'DAX', 'M (Power Query)'],
  concepts: ['ETL/ELT', 'Data Warehousing', 'Dimensional Modeling', 'Semantic Models', 'Analytics Architecture'],
};

const AboutMe = () => {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      <PageHero 
        title="About Augustine" 
        subtitle="Senior Data Engineer | Azure & Fabric Specialist | BI Developer | Technical Educator" 
        image="https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80" 
      />

      {/* Intro */}
      <div className="container mx-auto px-4 max-w-4xl py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-source text-gray-900 dark:text-white uppercase tracking-wider mb-4">My Journey</h2>
          <p className="text-lg text-neatgreen font-semibold">
            I am a Senior Data Engineer with proven expertise in Microsoft data platforms and deep practical knowledge of building systems that scale. I design platforms and teach the principles behind them.
          </p>
        </div>
        
        <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {aboutBody.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-gray-50 dark:bg-gray-800 py-20 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold font-source text-gray-900 dark:text-white uppercase tracking-wider mb-12 text-center">Experience</h2>
          <div className="space-y-12">
            {experience.map((role, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{role.title}</h3>
                    <p className="text-neatgreen font-semibold">{role.company}</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-2 md:mt-0">{role.period}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.highlights.map((point, i) => (
                    <li key={i} className="flex items-start text-gray-600 dark:text-gray-400 text-sm">
                      <span className="text-neatgreen mr-2 mt-1 flex-shrink-0">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold font-source text-gray-900 dark:text-white uppercase tracking-wider mb-12 text-center">Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert, idx) => (
              <a key={idx} href={cert.link} target="_blank" rel="noreferrer" className="block bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-neatgreen hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{cert.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cert.issuer} • {cert.earnedDate}</p>
                <span className="text-neatgreen text-sm font-bold uppercase tracking-wider mt-3 inline-block">View Credential →</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gray-50 dark:bg-gray-800 py-20 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold font-source text-gray-900 dark:text-white uppercase tracking-wider mb-12 text-center">Tech Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {techStack.platforms.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md text-sm border border-gray-200 dark:border-gray-700">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4">Tools</h3>
              <div className="flex flex-wrap gap-2">
                {techStack.tools.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md text-sm border border-gray-200 dark:border-gray-700">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {techStack.languages.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-neatgreen/10 text-neatgreen rounded-md text-sm border border-neatgreen/20 font-medium">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4">Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {techStack.concepts.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md text-sm border border-gray-200 dark:border-gray-700">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Let's Build Together CTA */}
      <div className="py-24 bg-neatgreen text-center">
        <div className="container mx-auto px-4 max-w-3xl">
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-widest">Let Us Work Together</h2>
           <p className="text-xl text-white/90 mb-10 font-light">
             Open to senior data engineering roles, consulting engagements, speaking opportunities, and technical partnerships. Reach out to discuss platform architecture, training, or collaboration.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="mailto:reachout@augustineomaku.com" className="px-10 py-4 bg-white text-gray-900 font-bold rounded-full uppercase tracking-wider hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                Email Me
              </a>
              <a href="https://www.linkedin.com/in/augustine-omaku-25236993/" target="_blank" rel="noreferrer" className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full uppercase tracking-wider hover:bg-white hover:text-gray-900 transition-all duration-300">
                View LinkedIn
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
