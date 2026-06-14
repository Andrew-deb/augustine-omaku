import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/expertise', label: 'Expertise' },
  { to: '/work', label: 'My Work' },
  { to: '/youtube', label: 'YouTube' },
  { to: '/livesessions', label: 'Live Sessions' },
];

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="py-6 px-4 md:px-12 flex justify-between items-center top-0 z-50 absolute w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-300">
        {/* Mobile/Tablet hamburger (left) */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="text-2xl font-bold tracking-wider uppercase text-gray-900 dark:text-white lg:order-none order-2">
          <Link to="/">Portfolio<span className="text-neatgreen">.</span></Link>
        </div>

        {/* Desktop nav */}
        <ul className="hidden lg:flex space-x-6 xl:space-x-8 text-gray-600 dark:text-gray-300 font-medium items-center whitespace-nowrap">
          {navLinks.map((l) => (
            <li key={l.to}><Link to={l.to} className="hover:text-neatgreen transition-colors">{l.label}</Link></li>
          ))}
          <li>
            <Link to="/contact" className="px-5 py-2 bg-neatgreen text-white rounded-full hover:opacity-80 transition-opacity flex items-center shadow-lg">
              Contact
            </Link>
          </li>
          <li>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>
          </li>
        </ul>

        {/* Mobile/Tablet theme toggle (right) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="lg:hidden p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors order-3"
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
        </button>
      </nav>

      {/* Mobile/Tablet sidebar overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      />

      {/* Mobile/Tablet slide-in sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 max-w-[80vw] z-[70] bg-white dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700/40 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-6 border-b border-gray-200 dark:border-gray-700/40">
          <span className="text-xl font-bold tracking-wider uppercase text-gray-900 dark:text-white">
            Portfolio<span className="text-neatgreen">.</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <ul className="flex flex-col px-5 py-6 space-y-1 text-gray-800 dark:text-gray-200 font-medium">
          {navLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`block py-3 px-3 rounded-md transition-colors ${
                    active
                      ? 'text-neatgreen bg-neatgreen/10'
                      : 'text-gray-800 dark:text-gray-200 hover:text-neatgreen hover:bg-gray-100 dark:hover:bg-gray-800/40'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          <li className="pt-4">
            <Link
              to="/contact"
              className="block text-center px-5 py-3 bg-neatgreen text-white rounded-full hover:opacity-80 transition-opacity shadow-lg"
            >
              Contact
            </Link>
          </li>
        </ul>
      </aside>
    </>
  );
};
export default Navbar;
