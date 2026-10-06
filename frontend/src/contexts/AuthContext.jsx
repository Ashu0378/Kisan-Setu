import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'kisanSetu_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true); // true on first load while we validate token

  // On mount, re-validate stored token with the backend
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getMe(token);
        setUser(data.user);
      } catch {
        // Token is invalid/expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authService.register(formData);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
