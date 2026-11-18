import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getPortfolio } from '@/services/portfolio.js';

const PortfolioContext = createContext(null);
const CACHE_KEY = 'portfolio_data_cache_v1';

function getCachedPortfolio() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCachedPortfolio(value) {
  try {
    const raw = JSON.stringify(value);
    sessionStorage.setItem(CACHE_KEY, raw);
    localStorage.setItem(CACHE_KEY, raw);
  } catch {}
}

export function PortfolioProvider({ children }) {
  const initialDataRef = useRef(getCachedPortfolio());
  const [data, setData] = useState(() => initialDataRef.current);
  const [status, setStatus] = useState(() => (initialDataRef.current ? 'ready' : 'loading'));
  const [error, setError] = useState('');
  const lastFetchedRef = useRef(0);
  const dataStringRef = useRef(initialDataRef.current ? JSON.stringify(initialDataRef.current) : '');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent && !dataStringRef.current) setStatus('loading');
    try {
      const next = await getPortfolio();
      const nextString = JSON.stringify(next);
      if (nextString !== dataStringRef.current) {
        dataStringRef.current = nextString;
        setData(next);
        saveCachedPortfolio(next);
      }
      setError('');
      setStatus('ready');
      lastFetchedRef.current = Date.now();
    } catch (err) {
      if (!dataStringRef.current && !silent) {
        setError(err.message || 'Unable to load portfolio');
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    load({ silent: Boolean(initialDataRef.current) });
  }, [load]);

  useEffect(() => {
    const onFocus = () => {
      // Refetch if tab regains focus and at least 5 seconds have elapsed
      if (Date.now() - lastFetchedRef.current > 5000) {
        load({ silent: true });
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
    };
  }, [load]);

  const value = useMemo(() => ({ status, data, error, reload: () => load() }), [status, data, error, load]);
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
