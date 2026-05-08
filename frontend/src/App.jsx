import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import { useNotifications } from './hooks/useNotifications';
import { requestFCMPermission } from './services/firebase';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Tareas from './pages/Tareas';
import Calendario from './pages/Calendario';
import IA from './pages/IA';
import Encuesta from './pages/Encuesta';

import './styles/global.css';

function AppInner() {
  useNotifications();

  useEffect(() => {
    requestFCMPermission();
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tareas"
            element={
              <ProtectedRoute>
                <Tareas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendario"
            element={
              <ProtectedRoute>
                <Calendario />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ia"
            element={
              <ProtectedRoute>
                <IA />
              </ProtectedRoute>
            }
          />

          <Route
            path="/encuesta"
            element={
              <ProtectedRoute>
                <Encuesta />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}