import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={props.size || 18} height={props.size || 18} aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.86 3.38-1.86 3.61 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.23 0z"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={props.size || 18} height={props.size || 18} aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={props.size || 18} height={props.size || 18} aria-hidden="true">
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.38 2.13a5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
  </svg>
);

const socials = [
  { href: 'https://www.linkedin.com/in/augustine-omaku-25236993', label: 'LinkedIn', Icon: LinkedinIcon },
  { href: 'https://github.com/Slinaustine', label: 'GitHub', Icon: GithubIcon },
  { href: 'https://www.instagram.com/austineslim/', label: 'Instagram', Icon: InstagramIcon },
  { href: 'mailto:reachout@augustineomaku.com', label: 'Email', Icon: Mail },
];

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-16 text-gray-600 dark:text-gray-400 text-sm mt-auto border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h4 className="text-lg font-source font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">About Me</h4>
          <p>Passionate developer and designer sharing knowledge and building scalable solutions. Crafting seamless user experiences natively.</p>
          <Link to="/about" className="text-neatgreen font-bold uppercase tracking-wider text-xs block mt-4 hover:opacity-80">Read Full Bio &rarr;</Link>
        </div>
        <div>
          <h4 className="text-lg font-source font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-neatgreen">Home</Link></li>
            <li><Link to="/work" className="hover:text-neatgreen">My Work</Link></li>
            <li><Link to="/expertise" className="hover:text-neatgreen">Expertise</Link></li>
            <li><Link to="/contact" className="hover:text-neatgreen">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-source font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2">
            <li><a href="mailto:reachout@augustineomaku.com" className="hover:text-neatgreen break-all">reachout@augustineomaku.com</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-source font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Social</h4>
          <ul className="flex flex-wrap gap-3">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-neatgreen hover:text-white transition-colors"
                >
                  <Icon size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="text-center mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
        <p>&copy; {new Date().getFullYear()} Augustine Omaku. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
