import React, { useState, useEffect, useRef } from 'react';

const TestimonialSlider = ({ testimonials }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPaused || !testimonials?.length) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, testimonials]);

  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white capitalize">Testimonials</h2>
          <div className="w-16 h-1 bg-neatgreen mx-auto mt-4"></div>
        </div>

        <div
          className="relative overflow-hidden w-full min-h-[280px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out" 
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4 md:px-16 text-center">
                <div className="flex flex-col items-center mb-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 mb-4 overflow-hidden shadow-sm">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.author)}&background=random&size=80`} alt={testimonial.author} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{testimonial.author}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{testimonial.title}</span>
                  </div>
                </div>
                
                <div className="relative text-lg text-gray-600 dark:text-gray-300 italic max-w-2xl mx-auto leading-relaxed">
                   <span className="absolute -left-6 -top-4 text-4xl text-gray-300 dark:text-gray-600 font-serif">"</span>
                   {testimonial.quote}
                   <span className="absolute -right-6 bottom-0 text-4xl text-gray-300 dark:text-gray-600 font-serif">"</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center mt-12 space-x-2">
          {testimonials.map((_, index) => (
             <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === current ? 'bg-neatgreen scale-125' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
             />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;
