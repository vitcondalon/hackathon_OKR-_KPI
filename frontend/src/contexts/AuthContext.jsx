import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { clearToken, getStoredUser, getToken, setStoredUser, setToken } from '../lib/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    async function loadMe() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        setUser(me);
        setStoredUser(me);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && getToken()),
      async login(identifier, password) {
        const result = await authApi.login({ identifier, password });
        setToken(result.access_token);
        setUser(result.user);
        setStoredUser(result.user);
        return result.user;
      },
      logout() {
        clearToken();
        setUser(null);
      },
      async refreshMe() {
        const me = await authApi.me();
        setUser(me);
        setStoredUser(me);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
