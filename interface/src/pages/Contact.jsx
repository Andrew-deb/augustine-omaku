import React, { useState } from 'react';
import PageHero from '../components/PageHero';
import { apiUrl } from '../config/api';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch(apiUrl('/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <PageHero
        title="Contact Me"
        subtitle="Let's build something phenomenal together."
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 max-w-6xl py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-8">
            <div className="flex items-start bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-neatgreen/10 text-neatgreen rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="ml-6">
                <h4 className="text-lg font-bold font-source text-gray-900 dark:text-white uppercase tracking-wider">Email</h4>
                <a href="mailto:reachout@augustineomaku.com" className="text-gray-600 dark:text-gray-400 mt-1 inline-block hover:text-neatgreen transition-colors break-all">reachout@augustineomaku.com</a>
              </div>
            </div>

            <div className="flex items-start bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-neatgreen/10 text-neatgreen rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="ml-6">
                <h4 className="text-lg font-bold font-source text-gray-900 dark:text-white uppercase tracking-wider">Location</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Available Globally</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'success' && <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 border border-green-200">Your message has been sent successfully!</div>}
                {status === 'error' && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">Failed to send message. Is the backend running?</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-neatgreen focus:border-neatgreen bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-neatgreen focus:border-neatgreen bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors" placeholder="john@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Subject</label>
                  <input required type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-neatgreen focus:border-neatgreen bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors" placeholder="Project Inquiry" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Message</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange} rows="5" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-neatgreen focus:border-neatgreen bg-gray-50 dark:bg-gray-700 dark:text-white transition-colors" placeholder="Tell me about your project..."></textarea>
                </div>

                <button disabled={status === 'loading'} type="submit" className="w-full bg-neatgreen text-white font-bold py-4 px-8 rounded-md hover:opacity-80 transition-opacity uppercase tracking-wider shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
