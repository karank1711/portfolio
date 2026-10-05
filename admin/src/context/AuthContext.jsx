import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '@/services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setStatus('anonymous');
    };
    window.addEventListener('admin:unauthorized', onUnauthorized);
    return () => window.removeEventListener('admin:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setStatus('anonymous');
      return undefined;
    }
    let active = true;
    api('/auth/me')
      .then((admin) => {
        if (!active) return;
        setUser(admin);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        setToken(null);
        setStatus('anonymous');
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    async login(email, password) {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      setUser(data.admin);
      setStatus('authenticated');
    },
    logout() {
      setToken(null);
      setUser(null);
      setStatus('anonymous');
      api('/auth/logout', { method: 'POST' }).catch(() => {});
    },
    setUser,
  }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
