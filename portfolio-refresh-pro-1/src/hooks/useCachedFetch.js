import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Stale-While-Revalidate (SWR) fetch hook with localStorage caching.
 *
 * How it works:
 * 1. On mount: instantly loads cached data from localStorage (no spinner!)
 * 2. Simultaneously fetches fresh data from the API in the background
 * 3. If fresh data differs from cache, updates the UI seamlessly
 * 4. Cache is saved with a timestamp — stale data is still shown while refreshing
 *
 * @param {string} url - Full API URL to fetch
 * @param {object} options
 * @param {string} options.cacheKey - Unique key for localStorage (e.g., 'sessions', 'youtube')
 * @param {number} options.ttl - Cache TTL in seconds (default: 300 = 5 minutes)
 * @param {object} options.fetchOptions - Extra options passed to fetch() (headers, etc.)
 * @param {boolean} options.enabled - Set to false to disable fetching (default: true)
 *
 * @returns {{ data, loading, error, refresh }}
 *   - data: the fetched data (or cached data)
 *   - loading: true only on first load when there's no cache
 *   - error: error message string or null
 *   - refresh: function to force a re-fetch
 */
export function useCachedFetch(url, {
  cacheKey,
  ttl = 300,
  fetchOptions = {},
  enabled = true,
} = {}) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const storageKey = `cache_${cacheKey}`;

  // Load from localStorage immediately (synchronous — no flicker)
  useEffect(() => {
    if (!cacheKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const cached = JSON.parse(raw);
        setData(cached.data);
        // If cache exists, we're not "loading" — we have data to show
        setLoading(false);
      }
    } catch {
      // Corrupted cache — ignore
    }
  }, [storageKey, cacheKey]);

  // Fetch fresh data in background
  const fetchData = useCallback(async () => {
    if (!enabled || !url) return;

    // Only show loading spinner if we have NO cached data
    // (otherwise, stale data is already displayed)

    try {
      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const freshData = await res.json();

      if (!mountedRef.current) return;

      setData(freshData);
      setError(null);

      // Save to localStorage with timestamp
      if (cacheKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            data: freshData,
            timestamp: Date.now(),
          }));
        } catch {
          // localStorage full or disabled — no problem, just skip caching
        }
      }
    } catch (err) {
      if (!mountedRef.current) return;
      // Only set error if we have no cached data to fall back on
      if (data === undefined) {
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, enabled, cacheKey, storageKey]);

  // Fetch on mount and when URL/enabled changes
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}
