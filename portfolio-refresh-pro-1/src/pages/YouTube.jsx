import React, { useState } from 'react';
import { Users, Video, Eye, Loader2 } from 'lucide-react';
import { CountUp, useInView } from '../components/CountUp';
import { apiUrl } from '../config/api';
import { useCachedFetch } from '../hooks/useCachedFetch';
import youtubeHero from '../assets/youtube-hero.jpg';

const YouTube = () => {
  const [heroRef, heroInView] = useInView(0.2);

  const { data, loading, error } = useCachedFetch(apiUrl('/youtube/playlists'), {
    cacheKey: 'youtube_playlists',
    ttl: 600, // 10 minutes — YouTube data changes rarely
  });

  const playlists = data?.playlists || [];
  const channelStats = data?.channel_stats || null;


  const openPlaylist = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  // Build hero stats from API data (with fallbacks)
  const heroStats = [
    {
      icon: Users,
      value: channelStats?.subscriber_count || 0,
      suffix: '+',
      label: 'Subscribers',
    },
    {
      icon: Video,
      value: channelStats?.total_video_count || 0,
      suffix: '+',
      label: 'Videos Published',
    },
    {
      icon: Eye,
      value: channelStats ? Math.round(channelStats.total_view_count / 1000) : 0,
      suffix: 'k+',
      label: 'Total Views',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div
        ref={heroRef}
        className="relative pt-32 pb-16 min-h-[420px] flex items-center justify-center bg-cover bg-center text-center"
        style={{ backgroundImage: `url(${youtubeHero})` }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} />

        <div className="relative z-10 px-8 py-8 mt-12 w-full max-w-6xl mx-auto">
          <h1 className="font-source text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider uppercase">
            YouTube Content
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-light max-w-2xl mx-auto mb-12">
            {channelStats
              ? `${channelStats.total_video_count}+ tutorials on Power BI, SQL, Azure, and data engineering.`
              : 'Tutorials on Power BI, SQL, Azure, and data engineering.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
            {heroStats.map(({ icon: Icon, value, suffix, label }) => (
              <div
                key={label}
                className="flex items-center justify-center gap-4 text-white transform hover:scale-105 transition-transform duration-300"
              >
                <Icon size={40} strokeWidth={1.5} className="opacity-90" />
                <div className="text-left">
                  <div className="text-3xl md:text-4xl font-bold leading-none text-neatgreen">
                    <CountUp target={value} suffix={suffix} start={heroInView} />
                  </div>
                  <div className="text-xs tracking-widest uppercase opacity-90 mt-1">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-24">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-neatgreen animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading playlists...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-neatgreen text-white rounded-md font-semibold hover:opacity-90 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Playlist grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {playlists.map((item) => (
              <article
                key={item.playlist_id}
                role="link"
                tabIndex={0}
                onClick={() => openPlaylist(item.playlist_url)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openPlaylist(item.playlist_url);
                  }
                }}
                className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block cursor-pointer focus:outline-none focus:ring-2 focus:ring-neatgreen/40"
              >
                {/* Folder/playlist stack effect */}
                <div className="absolute -top-2 left-2 right-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-t-lg opacity-70"></div>
                <div className="absolute -top-1 left-1 right-1 h-2 bg-gray-400 dark:bg-gray-500 rounded-t-lg opacity-90"></div>

                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full object-cover"
                  />
                  {/* Video count badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h7a1 1 0 110 2H4a1 1 0 01-1-1z" />
                      <path d="M14 12l5 3-5 3v-6z" />
                    </svg>
                    {item.video_count} videos
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-3">
                    <span className="text-neatgreen font-medium uppercase">{item.category}</span>
                  </div>
                  <h3 className="text-lg font-bold font-source text-gray-900 dark:text-white mb-4 hover:text-neatgreen cursor-pointer transition-colors leading-tight line-clamp-2">
                    {item.title}
                  </h3>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openPlaylist(item.playlist_url);
                    }}
                    className="text-neatgreen font-bold uppercase text-xs tracking-wider hover:opacity-80 flex items-center"
                  >
                    View Full Playlist
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <a
            href="https://www.youtube.com/@reskillit1502"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 bg-red-600 text-white rounded-full font-bold uppercase tracking-wider hover:bg-red-700 transition shadow-lg"
          >
            Subscribe to Channel{channelStats ? ` (${channelStats.subscriber_count}+)` : ''}
          </a>
        </div>
      </div>
    </div>
  );
};

export default YouTube;
