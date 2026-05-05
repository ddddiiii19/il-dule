import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const AIIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/calendario', label: 'Calendario', icon: <CalendarIcon /> },
    { path: '/ia', label: 'IA', icon: <AIIcon /> },
  ];

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <div className="logo-badge">
          <span>ID</span>
        </div>
      </Link>

      {/* Nav tabs */}
      <div className="navbar-tabs">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-tab-icon">{item.icon}</span>
            <span className="nav-tab-label">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Avatar */}
      <div className="navbar-right" ref={menuRef}>
        <button
          className="avatar-btn"
          onClick={() => setShowMenu((v) => !v)}
          aria-label="Menú de usuario"
        >
          <span className="avatar-initial">
            {usuario?.avatar_inicial || usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
          </span>
        </button>

        {showMenu && (
          <div className="user-dropdown animate-fadeInScale">
            <div className="dropdown-user-info">
              <p className="dropdown-name">{usuario?.nombre}</p>
              <p className="dropdown-email">{usuario?.email}</p>
            </div>
            <div className="dropdown-divider" />
            <button
              className="dropdown-item"
              onClick={() => { setShowMenu(false); navigate('/'); }}
            >
              🏠 Inicio
            </button>
            <button
              className="dropdown-item"
              onClick={() => { setShowMenu(false); navigate('/encuesta'); }}
            >
              📋 Mi perfil de aprendizaje
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item logout" onClick={handleLogout}>
              🚪 Cerrar sesión
            </button>
            <button
              className="dropdown-item"
              onClick={() => { setShowMenu(false); navigate('/login'); }}
            >
              🔄 Cambiar cuenta
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
