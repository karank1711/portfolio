import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getPortfolio } from '@/services/portfolio.js';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setStatus('loading');
    try {
      const next = await getPortfolio();
      setData(next);
      setError('');
      setStatus('ready');
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Unable to load portfolio');
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => load({ silent: true });
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  const value = useMemo(() => ({ status, data, error, reload: () => load() }), [status, data, error, load]);
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
