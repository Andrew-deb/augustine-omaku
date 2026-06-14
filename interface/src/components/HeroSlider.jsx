import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import austineHero from '../assets/austine-omaku-hero.jpg';
import slide2Bg from '../assets/hero-data-viz.png';

const slides = [
  {
    image: austineHero,
    bgPosition: 'center 20%',
    headline: 'Austine Omaku',
    typing: true,
    roles: [
      'Senior Data Engineer',
      'Azure & Fabrics Specialist',
      'BI Developer',
      'Technical Educator',
    ],
    primary: { label: 'About Me', to: '/about' },
    secondary: { label: 'Get In Touch', to: '/contact' },
  },
  {
    image: slide2Bg,
    headline: 'Deliver Data-Driven Solutions',
    subtext: 'Specializing in cloud migration, modern data platforms, and business analytics.',
    subAnimation: 'fade',
    primary: { label: 'Explore My Work', to: '/work' },
    secondary: { label: 'Get In Touch', to: '/contact' },
  },
  {
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1920',
    headline: 'Live Sessions And Hands-On Tutorials',
    subtext: 'Take advantage of live sessions and YouTube lessons forged from real-world applications.',
    subAnimation: 'slide-up',
    primary: { label: 'Book A Session', to: '/livesessions' },
    secondary: { label: 'Get In Touch', to: '/contact' },
  },
];

const SLIDE_DURATION = 12000;

// Typing effect hook for slide 1
const useTypewriter = (words, active) => {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!active) {
      setText('');
      setWordIdx(0);
      setDeleting(false);
      return;
    }
    const currentWord = words[wordIdx % words.length];
    const speed = deleting ? 50 : 110;

    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = currentWord.slice(0, text.length + 1);
        setText(next);
        if (next === currentWord) {
          setTimeout(() => setDeleting(true), 1400);
        }
      } else {
        const next = currentWord.slice(0, text.length - 1);
        setText(next);
        if (next === '') {
          setDeleting(false);
          setWordIdx((i) => (i + 1) % words.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words, active]);

  return text;
};

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const typedRole = useTypewriter(slides[0].roles, current === 0);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover transform transition-transform duration-[12000ms] ease-out"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundPosition: slide.bgPosition || 'center',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
              }}
            />
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }} />

            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 max-w-4xl mx-auto">
              <h1
                key={`h-${index}-${current}`}
                className="md:text-6xl text-white mb-6 uppercase tracking-wider animate-fade-in text-3xl font-semibold"
              >
                {slide.headline}
              </h1>

              {slide.typing && (
                <h2
                  className={`text-xl md:text-2xl text-gray-200 mb-10 font-light min-h-[2.5rem] ${
                    isActive ? 'animate-fade-in' : ''
                  }`}
                >
                  I am a{' '}
                  <span className="text-neatgreen font-medium">
                    {isActive ? typedRole : ''}
                    <span className="inline-block w-[2px] h-6 bg-neatgreen ml-1 align-middle animate-pulse" />
                  </span>
                </h2>
              )}

              {slide.subtext && (
                <h2
                  key={`s-${index}-${current}`}
                  className={`text-xl md:text-2xl text-gray-200 mb-10 font-light ${
                    isActive
                      ? slide.subAnimation === 'slide-up'
                        ? 'animate-slide-up-delayed'
                        : 'animate-fade-in-delayed'
                      : 'opacity-0'
                  }`}
                >
                  {slide.subtext}
                </h2>
              )}

              <div
                key={`b-${index}-${current}`}
                className={`flex flex-col sm:flex-row gap-4 ${
                  isActive ? 'animate-fade-in-late' : 'opacity-0'
                }`}
              >
                <Link
                  to={slide.primary.to}
                  className="px-8 py-4 bg-neatgreen text-white rounded-full font-semibold hover:opacity-80 transition-opacity uppercase text-sm tracking-widest"
                >
                  {slide.primary.label}
                </Link>
                <Link
                  to={slide.secondary.to}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-colors uppercase text-sm tracking-widest"
                >
                  {slide.secondary.label}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Dots */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all border-2 ${
              index === current ? 'bg-neatgreen border-neatgreen scale-125' : 'bg-white/50 border-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
