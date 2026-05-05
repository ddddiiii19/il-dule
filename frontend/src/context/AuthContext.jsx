import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('il_dule_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.me();
      setUsuario(res.data.data.usuario);
    } catch {
      localStorage.removeItem('il_dule_token');
      localStorage.removeItem('il_dule_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    setError(null);
    const res = await authService.login({ email, password });
    const { token, usuario: user } = res.data.data;
    localStorage.setItem('il_dule_token', token);
    localStorage.setItem('il_dule_user', JSON.stringify(user));
    setUsuario(user);
    return user;
  };

  const register = async (nombre, email, password) => {
    setError(null);
    const res = await authService.register({ nombre, email, password });
    const { token, usuario: user } = res.data.data;
    localStorage.setItem('il_dule_token', token);
    localStorage.setItem('il_dule_user', JSON.stringify(user));
    setUsuario(user);
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem('il_dule_token');
    localStorage.removeItem('il_dule_user');
    setUsuario(null);
  };

  const updateUsuario = (data) => {
    setUsuario((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{ usuario, loading, error, login, register, logout, updateUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export default AuthContext;
