import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const LotusIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 8C26 8 18 14 18 24C18 28.4 20.4 32.2 24 34.4" stroke="#E8A8A8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 8C26 8 34 14 34 24C34 28.4 31.6 32.2 28 34.4" stroke="#E8A8A8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 10C26 10 26 20 26 36" stroke="#D4888A" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 22C12 22 16 18 22 20C24.4 20.8 26 22.4 26 24" stroke="#F0C0C0" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M40 22C40 22 36 18 30 20C27.6 20.8 26 22.4 26 24" stroke="#F0C0C0" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 28C8 28 14 22 20 26C22.8 27.6 24 30 24 32" stroke="#F4D0D0" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M44 28C44 28 38 22 32 26C29.2 27.6 28 30 28 32" stroke="#F4D0D0" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="26" cy="40" rx="8" ry="3" fill="#F8E8E8"/>
  </svg>
);

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const user = await login(form.email, form.password);
        navigate(user.tiene_perfil ? '/' : '/encuesta');
      } else {
        if (!form.nombre.trim()) {
          setError('El nombre es requerido.');
          return;
        }
        const user = await register(form.nombre, form.email, form.password);
        navigate(user.tiene_perfil ? '/' : '/encuesta');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isLogin ? 'Credenciales incorrectas.' : 'Error al registrar. Intenta nuevamente.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fadeInScale">
        <div className="login-logo">
          <LotusIcon />
          <h1 className="login-brand">IL-DULE</h1>
          <p className="login-tagline">
            {isLogin
              ? 'Crea tu cuenta o accede a tu calendario personal'
              : 'Crea tu cuenta gratuita'}
          </p>
        </div>

        {error && (
          <div className="login-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="form-group animate-fadeIn">
              <label className="form-label">Nombre completo</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="form-input"
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="form-input"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </div>
          </div>

          {isLogin && (
            <div className="forgot-link">
              <a href="/recuperar">¿Olvidaste tu contraseña?</a>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <span className="loading-spinner" />
            ) : isLogin ? (
              'Iniciar sesión'
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>o</span>
        </div>

        <p className="login-switch">
          {isLogin ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                className="switch-btn"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Regístrate gratis
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                className="switch-btn"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
