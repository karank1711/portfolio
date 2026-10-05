import { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api.js';

export function useResource(path) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await api(path);
      setItems(Array.isArray(data) ? data : []);
      setError('');
      setStatus('ready');
      return data;
    } catch (err) {
      setError(err.message || 'Unable to load');
      setStatus('error');
      return null;
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, setItems, status, error, reload };
}
