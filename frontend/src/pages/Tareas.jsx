import React, { useState, useEffect } from 'react';
import { eventosService } from '../services/api';
import Navbar from '../components/layout/Navbar';
import EventoModal from '../components/tasks/EventoModal';
import { useAuth } from '../context/AuthContext';
import './Tareas.css';

const PRIORITY_COLORS = {
  alta: 'var(--color-priority-alta)',
  media: 'var(--color-priority-media)',
  baja: 'var(--color-priority-baja)',
};

export default function Tareas() {
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [filter, setFilter] = useState('pendientes'); // 'pendientes' | 'completadas'

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    setLoading(true);
    try {
      const res = await eventosService.getAll();
      setEventos(res.data.data.eventos);
    } catch {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await eventosService.toggleComplete(id);
      setEventos((prev) =>
        prev.map((e) => (e.id === id ? { ...e, completado: !e.completado } : e))
      );
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      await eventosService.delete(id);
      setEventos((prev) => prev.filter((e) => e.id !== id));
    } catch {}
  };

  const handleSave = async (data, id) => {
    try {
      if (id) {
        const res = await eventosService.update(id, data);
        setEventos((prev) =>
          prev.map((e) => (e.id === id ? res.data.data.evento : e))
        );
      } else {
        const res = await eventosService.create(data);
        setEventos((prev) => [res.data.data.evento, ...prev]);
      }
      setShowModal(false);
      setEditingEvento(null);
    } catch (err) {
      console.error(err);
    }
  };

  const pendientes = eventos.filter((e) => !e.completado);
  const completadas = eventos.filter((e) => e.completado);
  const displayList = filter === 'pendientes' ? pendientes : completadas;

  return (
    <div className="tareas-page">
      <Navbar />

      <main className="tareas-main">
        {/* Filter tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'pendientes' ? 'active' : ''}`}
            onClick={() => setFilter('pendientes')}
          >
            Pendientes
            <span className="filter-badge">{pendientes.length}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'completadas' ? 'active' : ''}`}
            onClick={() => setFilter('completadas')}
          >
            Completadas
            <span className="filter-badge">{completadas.length}</span>
          </button>
        </div>

        {/* Task list */}
        <div className="tareas-list">
          {loading ? (
            <div className="tareas-loading">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="task-skeleton" />
              ))}
            </div>
          ) : displayList.length === 0 ? (
            <div className="tareas-empty">
              <p className="empty-icon">{filter === 'pendientes' ? '✨' : '🎉'}</p>
              <p className="empty-title">
                {filter === 'pendientes' ? '¡Sin tareas pendientes!' : 'Sin completadas aún'}
              </p>
              <p className="empty-desc">
                {filter === 'pendientes'
                  ? 'Agrega nuevas tareas con el botón +'
                  : 'Completa algunas tareas para verlas aquí'}
              </p>
            </div>
          ) : (
            displayList.map((evento, idx) => (
              <div
                key={evento.id}
                className={`task-row animate-fadeIn ${evento.completado ? 'completed' : ''}`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Avatar */}
                <div
                  className="task-avatar"
                  style={{ background: PRIORITY_COLORS[evento.prioridad] + '22' }}
                >
                  <span style={{ color: PRIORITY_COLORS[evento.prioridad] }}>
                    {usuario?.avatar_inicial || 'A'}
                  </span>
                </div>

                {/* Content */}
                <div className="task-content">
                  <span className="task-title">{evento.titulo}</span>
                  {evento.descripcion && (
                    <span className="task-desc">{evento.descripcion}</span>
                  )}
                  <div className="task-meta">
                    <span
                      className="task-type"
                      style={{ background: PRIORITY_COLORS[evento.prioridad] + '15', color: PRIORITY_COLORS[evento.prioridad] }}
                    >
                      {evento.tipo}
                    </span>
                    {evento.fecha_limite && (
                      <span className="task-date">
                        📅 {new Date(evento.fecha_limite).toLocaleDateString('es-CO')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="task-actions">
                  <button
                    className={`task-check ${evento.completado ? 'checked' : ''}`}
                    onClick={() => handleToggle(evento.id)}
                    aria-label={evento.completado ? 'Marcar pendiente' : 'Marcar completada'}
                  >
                    {evento.completado && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  <button
                    className="task-menu-btn"
                    onClick={() => {
                      setEditingEvento(evento);
                      setShowModal(true);
                    }}
                    aria-label="Opciones"
                  >
                    ⋮
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom action bar (matches Image 3) */}
        <div className="task-action-bar">
          <div className="action-bar-left">
            <span className="action-bar-overline">Tarea nueva</span>
            <span className="action-bar-label">
              {displayList.length} {filter === 'pendientes' ? 'pendientes' : 'completadas'}
            </span>
          </div>
          <button
            className="fab-btn"
            onClick={() => {
              setEditingEvento(null);
              setShowModal(true);
            }}
            aria-label="Nueva tarea"
          >
            +
          </button>
        </div>
      </main>

      {showModal && (
        <EventoModal
          evento={editingEvento}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingEvento(null); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
