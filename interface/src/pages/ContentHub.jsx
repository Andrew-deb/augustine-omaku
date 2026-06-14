import React from 'react';

const ContentHub = () => {
  const contentItems = [
    { type: 'Live Session', title: 'Building Scalable APIs with FastAPI', date: 'Oct 12, 2025', comments: 14, img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80' },
    { type: 'YouTube', title: 'React Performance Masterclass', date: 'Sep 28, 2025', comments: 42, img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80' },
    { type: 'Live Session', title: 'System Architecture Design', date: 'Aug 15, 2025', comments: 8, img: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
           <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Developer Content</span>
           <h2 className="text-4xl font-bold text-gray-900 mb-4">Videos & Live Sessions</h2>
           <p className="text-gray-600 max-w-2xl mx-auto">Catch up on recent tutorials, tech talks, and live coding streams.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {contentItems.map((item, idx) => (
             <div key={idx} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden">
               <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${item.img})` }}></div>
               <div className="p-8">
                 <div className="flex items-center text-sm text-gray-500 mb-4 divide-x divide-gray-300">
                    <span className="pr-3 text-blue-600 font-medium">{item.date}</span>
                    <span className="px-3">{item.type}</span>
                    <span className="pl-3 flex items-center">
                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                       {item.comments}
                    </span>
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 cursor-pointer transition-colors leading-tight">
                   {item.title}
                 </h3>
                 <p className="text-gray-600 mb-6">Detailed walkthrough and deep dive. Check out the resource links and source code below.</p>
                 <a href="#" className="text-blue-600 font-bold uppercase text-sm tracking-wider hover:text-blue-800 flex items-center">
                   Watch Now
                   <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                 </a>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ContentHub;
