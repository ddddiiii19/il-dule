import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--color-bg)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid #E8E4F0',
            borderTopColor: '#7C6BAE',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        <p style={{ color: '#6B6480', fontSize: '0.875rem' }}>Cargando IL-DULE...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
