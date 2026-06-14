import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

const credentials = [
  {
    date: 'Jan 2026 - Jan 2027',
    title: 'Microsoft Certified: Fabric Data Engineer Associate',
    issuer: 'Microsoft',
    description:
      'Validates expertise in designing, implementing, and managing data engineering solutions using Microsoft Fabric — including lakehouses, data warehouses, and Spark-based pipelines.',
    image: '/assets/microsoft.png',
    link: 'https://learn.microsoft.com/api/credentials/share/en-us/AugustineOmaku-7703/A4BB07C76298F1A5?sharingId=1B85908EF28E3B3A',
  },
  {
    date: 'Jan 2026',
    title: 'Microsoft Certified: Power BI Data Analyst Associate',
    issuer: 'Microsoft',
    description:
      'Demonstrates proficiency in preparing, modeling, visualizing, and analyzing data with Power BI to deliver actionable business insights.',
    image: '/assets/microsoft.png',
    link: 'https://learn.microsoft.com/api/credentials/share/en-us/AugustineOmaku-7703/85D6700B62312BC9?sharingId=1B85908EF28E3B3A',
  },
  {
    date: 'Nov 2016 - Nov 2023',
    title: 'Project Management Professional (PMP)',
    issuer: 'Institute of Project Management',
    description:
      'Project Management across the 10 knowledge areas of Scope, Schedule, Cost, Quality, Risk, Human Resources, Procurement, Stakeholder, Communication and Integration — across the five Process Groups: Initiation, Planning, Execution, Monitoring & Controlling, and Closing.',
    image: '/assets/institution.png',
    link: null,
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

const TimelineItem = ({ cred, index }) => {
  const [ref, inView] = useInView();
  const isLeft = index % 2 === 0;

  return (
    <div ref={ref} className="relative md:grid md:grid-cols-2 md:gap-12 mb-16">
      <div className="hidden md:block absolute left-1/2 top-8 -translate-x-1/2 z-10">
        <div
          className={`w-5 h-5 rotate-45 border-2 border-neatgreen bg-white dark:bg-gray-900 transition-all duration-700 ${
            inView ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
      </div>

      <div
        className={`${
          isLeft ? 'md:col-start-1 md:pr-12 md:text-right' : 'md:col-start-2 md:pl-12'
        } transition-all duration-700 ${
          inView ? 'opacity-100 translate-x-0' : `opacity-0 ${isLeft ? '-translate-x-8' : 'translate-x-8'}`
        }`}
      >
        <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-neatgreen transition-all duration-300 hover:-translate-y-1">
          <div className={`flex items-start gap-4 mb-3 ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}>
            {cred.image && (
              <img
                src={cred.image}
                alt={cred.issuer}
                loading="lazy"
                decoding="async"
                className="w-12 h-12 object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
            )}
            <div className="flex-1">
              <span className="text-neatgreen text-sm font-bold uppercase tracking-wider">{cred.date}</span>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1 leading-snug">{cred.title}</h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">{cred.issuer}</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{cred.description}</p>
          {cred.link && (
            <a
              href={cred.link}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 text-neatgreen font-semibold uppercase tracking-wider text-xs hover:opacity-70 transition-opacity ${
                isLeft ? 'md:flex-row-reverse' : ''
              }`}
            >
              View Credential <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const CredentialsTimeline = () => {
  return (
    <div className="bg-white dark:bg-gray-800 py-24 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Credentials & Certifications
          </h2>
          <div className="w-16 h-1 bg-neatgreen mx-auto mt-4" />
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />
          {credentials.map((cred, idx) => (
            <TimelineItem key={idx} cred={cred} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CredentialsTimeline;
