import { useEffect, useCallback } from 'react';
import { eventosService } from '../services/api';

const CHECKED_KEY = 'il_dule_notified';

export function useNotifications() {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }, []);

  const showNotification = useCallback((title, options = {}) => {
    if (Notification.permission !== 'granted') return;
    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  const checkUpcomingEvents = useCallback(async () => {
    if (Notification.permission !== 'granted') return;
    try {
      const now = new Date();
      const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const res = await eventosService.getAll({
        start: now.toISOString(),
        end: in2h.toISOString(),
        completado: false,
      });

      const notified = JSON.parse(localStorage.getItem(CHECKED_KEY) || '[]');
      const eventos = res.data.data.eventos;

      eventos.forEach((ev) => {
        if (notified.includes(ev.id)) return;

        const fecha = new Date(ev.fecha_inicio);
        const diffMin = Math.round((fecha - now) / 60000);

        if (diffMin <= (ev.recordatorio_minutos || 30) && diffMin >= 0) {
          showNotification(`📚 ${ev.titulo}`, {
            body: `${ev.tipo.charAt(0).toUpperCase() + ev.tipo.slice(1)} en ${diffMin} min · Prioridad ${ev.prioridad}`,
            tag: ev.id,
          });
          notified.push(ev.id);
          localStorage.setItem(CHECKED_KEY, JSON.stringify(notified.slice(-20)));
        }
      });
    } catch {}
  }, [showNotification]);

  useEffect(() => {
    requestPermission();
    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(interval);
  }, [checkUpcomingEvents, requestPermission]);

  return { requestPermission, showNotification };
}
