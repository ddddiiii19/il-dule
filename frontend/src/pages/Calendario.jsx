import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { eventosService } from '../services/api';
import Navbar from '../components/layout/Navbar';
import EventoModal from '../components/tasks/EventoModal';
import './Calendario.css';

const TIPO_ICONS = {
  tarea: '📝',
  clase: '📚',
  proyecto: '🚀',
  examen: '📋',
  actividad: '⭐',
  otro: '📌',
};

export default function Calendario() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('dayGridMonth');
  const calendarRef = useRef(null);

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    setLoading(true);
    try {
      const res = await eventosService.getAll();
      const fcEvents = res.data.data.eventos.map(mapToFCEvent);
      setEventos(fcEvents);
    } catch {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const mapToFCEvent = (ev) => ({
    id: ev.id,
    title: ev.titulo,
    start: ev.fecha_inicio,
    end: ev.fecha_fin || ev.fecha_inicio,
    allDay: ev.todo_el_dia,
    backgroundColor: ev.color || '#8B7EC8',
    borderColor: ev.color || '#8B7EC8',
    textColor: '#fff',
    extendedProps: { ...ev },
  });

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setEditingEvento(null);
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    const ev = info.event.extendedProps;
    setEditingEvento({
      id: info.event.id,
      titulo: info.event.title,
      fecha_inicio: info.event.startStr,
      fecha_fin: info.event.endStr,
      ...ev,
    });
    setShowModal(true);
  };

  const handleSave = async (data, id) => {
    try {
      if (id) {
        const res = await eventosService.update(id, data);
        const updated = mapToFCEvent(res.data.data.evento);
        setEventos((prev) => prev.map((e) => (e.id === id ? updated : e)));
      } else {
        const res = await eventosService.create(data);
        setEventos((prev) => [...prev, mapToFCEvent(res.data.data.evento)]);
      }
      setShowModal(false);
      setEditingEvento(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await eventosService.delete(id);
      setEventos((prev) => prev.filter((e) => e.id !== id));
      setShowModal(false);
    } catch {}
  };

  // Today's events for sidebar
  const today = new Date().toDateString();
  const todayEvents = eventos.filter(
    (e) => new Date(e.start).toDateString() === today
  );

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowEvents = eventos.filter(
    (e) => new Date(e.start).toDateString() === tomorrowDate.toDateString()
  );

  return (
    <div className="calendario-page">
      <Navbar />

      <div className="calendario-layout">
        {/* Sidebar - matches Image 5 */}
        <aside className="calendario-sidebar">
          <div className="sidebar-month-header">
            <h3>{new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' })}</h3>
          </div>

          {/* Mini month grid */}
          <div className="mini-calendar">
            <MiniCalendar
              events={eventos}
              onDateClick={(d) => {
                setSelectedDate(d);
                if (calendarRef.current) {
                  calendarRef.current.getApi().gotoDate(d);
                }
              }}
            />
          </div>

          {/* Today's events */}
          {todayEvents.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-day-header">
                <span>📅</span> Hoy
              </div>
              {todayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="sidebar-event"
                  style={{ borderLeft: `3px solid ${ev.backgroundColor}` }}
                  onClick={() => handleEventClick({ event: { id: ev.id, title: ev.title, startStr: ev.start, endStr: ev.end, extendedProps: ev.extendedProps } })}
                >
                  <span className="sidebar-event-dot" style={{ background: ev.backgroundColor }} />
                  <div className="sidebar-event-info">
                    <span className="sidebar-event-title">{ev.title}</span>
                    <span className="sidebar-event-time">
                      {new Date(ev.start).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tomorrowEvents.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-day-header">
                <span>📅</span> Mañana
              </div>
              {tomorrowEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="sidebar-event"
                  style={{ borderLeft: `3px solid ${ev.backgroundColor}` }}
                >
                  <span className="sidebar-event-dot" style={{ background: ev.backgroundColor }} />
                  <div className="sidebar-event-info">
                    <span className="sidebar-event-title">{ev.title}</span>
                    <span className="sidebar-event-time">
                      {new Date(ev.start).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add button */}
          <button
            className="sidebar-add-btn"
            onClick={() => { setEditingEvento(null); setShowModal(true); }}
          >
            +
          </button>
        </aside>

        {/* Main calendar */}
        <main className="calendario-main">
          {/* View switcher */}
          <div className="view-switcher">
            {[
              { key: 'dayGridMonth', label: 'Mes' },
              { key: 'timeGridWeek', label: 'Semana' },
              { key: 'timeGridDay', label: 'Día' },
            ].map((v) => (
              <button
                key={v.key}
                className={`view-btn ${view === v.key ? 'active' : ''}`}
                onClick={() => {
                  setView(v.key);
                  calendarRef.current?.getApi().changeView(v.key);
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="calendar-loading">
              <div className="loading-spinner-lg" />
              <p>Cargando eventos...</p>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              locale={esLocale}
              events={eventos}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              height="auto"
              editable={false}
              selectable
              dayMaxEvents={3}
              eventDisplay="block"
              nowIndicator
              slotMinTime="06:00:00"
              slotMaxTime="23:00:00"
            />
          )}
        </main>
      </div>

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

/* ─── Mini Calendar Component ─────────────────────────────────────── */
function MiniCalendar({ events, onDateClick }) {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const hasEvent = (day) => {
    const d = new Date(year, month, day).toDateString();
    return events.some((e) => new Date(e.start).toDateString() === d);
  };

  const isToday = (day) => {
    return new Date(year, month, day).toDateString() === today.toDateString();
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="mini-cal">
      <div className="mini-cal-nav">
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))}>‹</button>
        <span>{current.toLocaleString('es-CO', { month: 'short', year: 'numeric' })}</span>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="mini-cal-grid">
        {dayNames.map((d, i) => (
          <div key={i} className="mini-cal-dayname">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`mini-cal-day ${day ? 'active' : ''} ${day && isToday(day) ? 'today' : ''}`}
            onClick={() => day && onDateClick(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
          >
            {day || ''}
            {day && hasEvent(day) && <span className="mini-event-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}
