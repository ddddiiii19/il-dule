import React, { useState, useEffect } from 'react';
import './EventoModal.css';

const TIPOS = ['tarea', 'clase', 'proyecto', 'examen', 'actividad', 'otro'];
const PRIORIDADES = [
  { value: 'alta', label: 'Alta', color: '#E57373' },
  { value: 'media', label: 'Media', color: '#8B7EC8' },
  { value: 'baja', label: 'Baja', color: '#81C784' },
];

const toLocalDatetime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EventoModal({ evento, onSave, onClose, onDelete }) {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'tarea',
    prioridad: 'media',
    fecha_inicio: toLocalDatetime(new Date().toISOString()),
    fecha_fin: '',
    fecha_limite: '',
    todo_el_dia: false,
    recordatorio_minutos: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (evento) {
      setForm({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        tipo: evento.tipo || 'tarea',
        prioridad: evento.prioridad || 'media',
        fecha_inicio: toLocalDatetime(evento.fecha_inicio),
        fecha_fin: toLocalDatetime(evento.fecha_fin),
        fecha_limite: toLocalDatetime(evento.fecha_limite),
        todo_el_dia: evento.todo_el_dia || false,
        recordatorio_minutos: evento.recordatorio_minutos || 30,
      });
    }
  }, [evento]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setError('El título es requerido.');
      return;
    }
    if (!form.fecha_inicio) {
      setError('La fecha de inicio es requerida.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : null,
        fecha_limite: form.fecha_limite ? new Date(form.fecha_limite).toISOString() : null,
      };
      await onSave(payload, evento?.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!evento?.id) return;
    setLoading(true);
    try {
      await onDelete(evento.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container animate-fadeInScale">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">{evento ? 'Editar evento' : 'Nuevo evento'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {error && <div className="modal-error">⚠ {error}</div>}

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="mform-group">
            <label className="mform-label">Título *</label>
            <input
              name="titulo"
              type="text"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ej: Entregar proyecto de cálculo"
              className="mform-input"
              maxLength={200}
              required
            />
          </div>

          {/* Type & Priority */}
          <div className="mform-row">
            <div className="mform-group">
              <label className="mform-label">Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className="mform-select">
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mform-group">
              <label className="mform-label">Prioridad</label>
              <div className="priority-selector">
                {PRIORIDADES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`priority-btn ${form.prioridad === p.value ? 'active' : ''}`}
                    style={{
                      '--p-color': p.color,
                      borderColor: form.prioridad === p.value ? p.color : 'var(--color-border)',
                      background: form.prioridad === p.value ? p.color + '18' : 'transparent',
                    }}
                    onClick={() => setForm((prev) => ({ ...prev, prioridad: p.value }))}
                  >
                    <span className="priority-dot" style={{ background: p.color }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* All day */}
          <div className="mform-group mform-inline">
            <label className="mform-label">Todo el día</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="todo_el_dia"
                checked={form.todo_el_dia}
                onChange={handleChange}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Dates */}
          <div className="mform-row">
            <div className="mform-group">
              <label className="mform-label">Fecha inicio *</label>
              <input
                name="fecha_inicio"
                type={form.todo_el_dia ? 'date' : 'datetime-local'}
                value={form.fecha_inicio}
                onChange={handleChange}
                className="mform-input"
                required
              />
            </div>
            <div className="mform-group">
              <label className="mform-label">Fecha fin</label>
              <input
                name="fecha_fin"
                type={form.todo_el_dia ? 'date' : 'datetime-local'}
                value={form.fecha_fin}
                onChange={handleChange}
                className="mform-input"
              />
            </div>
          </div>

          <div className="mform-group">
            <label className="mform-label">Fecha límite</label>
            <input
              name="fecha_limite"
              type={form.todo_el_dia ? 'date' : 'datetime-local'}
              value={form.fecha_limite}
              onChange={handleChange}
              className="mform-input"
            />
          </div>

          {/* Reminder */}
          <div className="mform-group">
            <label className="mform-label">Recordatorio</label>
            <select
              name="recordatorio_minutos"
              value={form.recordatorio_minutos}
              onChange={handleChange}
              className="mform-select"
            >
              <option value={5}>5 minutos antes</option>
              <option value={15}>15 minutos antes</option>
              <option value={30}>30 minutos antes</option>
              <option value={60}>1 hora antes</option>
              <option value={1440}>1 día antes</option>
            </select>
          </div>

          {/* Description */}
          <div className="mform-group">
            <label className="mform-label">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Detalles opcionales..."
              className="mform-textarea"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            {evento && (
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
                disabled={loading}
              >
                Eliminar
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? <span className="loading-spinner" /> : evento ? 'Guardar cambios' : 'Crear evento'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
