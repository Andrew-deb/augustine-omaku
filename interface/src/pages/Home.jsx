import React from 'react';
import HeroSlider from '../components/HeroSlider';
import TestimonialSlider from '../components/TestimonialSlider';
import StatsCounter from '../components/StatsCounter';
import CredentialsTimeline from '../components/CredentialsTimeline';
import TrainingServices from '../components/TrainingServices';
import FeaturedWork from '../components/FeaturedWork';
import CompanyLogos from '../components/CompanyLogos';
import { Link } from 'react-router-dom';
import { Database, BarChart3, GraduationCap, ArrowRight } from 'lucide-react';

const expertise = [
  {
    icon: Database,
    title: 'Data Engineering & Architecture',
    description: 'ETL/ELT pipeline design, data lake strategy, cloud-native architectures, and dimensional modeling that scales.',
  },
  {
    icon: BarChart3,
    title: 'BI & Analytics Enablement',
    description: 'Power BI development, semantic model design, enterprise reporting, and analytics governance.',
  },
  {
    icon: GraduationCap,
    title: 'Technical Education & Community',
    description: 'Tutorial production, technical content creation, mentoring, and knowledge sharing at scale.',
  },
];

const testimonials = [
  {
    quote: 'Working with Augustine completely changed how we approached data engineering. He doesn\'t just build pipelines—he designs systems that scale and actually solve business problems. The platform he built for us dramatically improved performance and gave us real-time visibility into our data. He\'s a rare mix of technical excellence and strategic thinking.',
    author: 'Faisal',
    title: 'Finance & Data Leadership',
  },
  {
    quote: 'We used to struggle with slow, unreliable reports—but Augustine transformed everything. Our data is now faster, cleaner, and far more accessible. It\'s had a direct impact on how confidently we make decisions as a business.',
    author: 'Akinyemi',
    title: 'Business Intelligence Leader',
  },
  {
    quote: 'Augustine explains data engineering in a way that finally clicks. His teaching is practical, clear, and based on real experience—not just theory. Thanks to his content, I\'ve built real projects and feel confident stepping into the data field.',
    author: 'Faruk',
    title: 'Data Engineering Learner',
  },
];

const Home = () => {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero */}
      <HeroSlider />

      {/* About Me */}
      <div className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="text-neatgreen font-bold tracking-wider uppercase text-sm mb-2 block">Quick Intro</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">About Me</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            I am a Senior Data Engineer with proven expertise in Microsoft data platforms and deep practical knowledge of building systems that scale. I design scalable cloud-native architectures on Azure and Microsoft Fabric, bridging engineering rigor with business impact.
          </p>
          <Link to="/about" className="inline-block border-b-2 border-neatgreen text-neatgreen font-bold uppercase tracking-wider hover:opacity-80 pb-1 transition-opacity">
            Read Full Biography
          </Link>
          <CompanyLogos />
        </div>
      </div>

      {/* Core Expertise */}
      <div className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white uppercase tracking-wider">
            Core Expertise
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {expertise.map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <div
                  key={idx}
                  className="group p-8 border border-gray-100 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-neatgreen transition-all duration-500"
                >
                  <div className="mb-5">
                    <Icon
                      size={44}
                      strokeWidth={1.25}
                      className="text-gray-400 dark:text-gray-500 group-hover:text-neatgreen transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(102,211,126,0.7)]"
                    />
                  </div>
                  <h4 className="font-bold text-lg mb-3 text-gray-900 dark:text-white uppercase tracking-wider">{exp.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{exp.description}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/expertise"
              className="inline-flex items-center gap-2 text-neatgreen font-bold uppercase tracking-wider text-sm border-b-2 border-neatgreen pb-1 hover:opacity-80 transition-opacity"
            >
              See More <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Work */}
      <FeaturedWork />

      {/* Credentials & Certifications */}
      <CredentialsTimeline />

      {/* Stats */}
      <StatsCounter />

      {/* Testimonials */}
      <TestimonialSlider testimonials={testimonials} />

      {/* Training & Services */}
      <TrainingServices />

      {/* Let Us Work Together CTA */}
      <div className="py-32 bg-neatgreen text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-widest">Let Us Work Together</h2>
          <p className="text-xl text-white/90 mb-10 font-light">Open to senior data engineering roles, consulting engagements, speaking opportunities, and technical partnerships.</p>
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

export default Home;
