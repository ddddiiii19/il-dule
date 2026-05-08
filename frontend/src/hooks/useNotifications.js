import { useEffect, useCallback } from 'react';
import { eventosService } from '../services/api';

const CHECKED_KEY = 'il_dule_notified';

export function useNotifications() {
  // ─────────────────────────────────────────────
  // Solicitar permisos
  // ─────────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('❌ Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permisos ya concedidos');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permisos bloqueados');
      return false;
    }

    const permission = await Notification.requestPermission();

    console.log('🔔 Resultado permisos:', permission);

    return permission === 'granted';
  }, []);

  // ─────────────────────────────────────────────
  // Mostrar notificación
  // ─────────────────────────────────────────────
  const showNotification = useCallback((title, options = {}) => {
    if (Notification.permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        silent: false,
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('✅ Notificación mostrada');
    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Revisar eventos próximos
  // ─────────────────────────────────────────────
  const checkUpcomingEvents = useCallback(async () => {
    try {
      if (Notification.permission !== 'granted') {
        console.log('❌ Sin permisos');
        return;
      }

      const now = new Date();

      const in2h = new Date(
        now.getTime() + 2 * 60 * 60 * 1000
      );

      console.log('⏰ Revisando eventos próximos...');

      const res = await eventosService.getAll({
        start: now.toISOString(),
        end: in2h.toISOString(),
        completado: false,
      });

      const eventos = res?.data?.data?.eventos || [];

      console.log('📚 Eventos encontrados:', eventos);

      const notified = JSON.parse(
        localStorage.getItem(CHECKED_KEY) || '[]'
      );

      eventos.forEach((ev) => {
        if (!ev.fecha_inicio) return;

        if (notified.includes(ev.id)) {
          return;
        }

        const fechaEvento = new Date(ev.fecha_inicio);

        const diffMin = Math.floor(
          (fechaEvento.getTime() - now.getTime()) / 60000
        );

        console.log(
          `📌 ${ev.titulo} faltan ${diffMin} minutos`
        );

        const recordatorio =
          ev.recordatorio_minutos || 30;

        if (
          diffMin <= recordatorio &&
          diffMin >= 0
        ) {
          showNotification(`📚 ${ev.titulo}`, {
            body:
              `${ev.tipo?.toUpperCase() || 'EVENTO'} ` +
              `en ${diffMin} minutos`,
            tag: ev.id,
          });

          notified.push(ev.id);

          localStorage.setItem(
            CHECKED_KEY,
            JSON.stringify(notified.slice(-50))
          );
        }
      });
    } catch (error) {
      console.error(
        '❌ Error verificando eventos:',
        error
      );
    }
  }, [showNotification]);

  // ─────────────────────────────────────────────
  // Inicialización
  // ─────────────────────────────────────────────
  useEffect(() => {
    requestPermission();

    // Primera revisión inmediata
    checkUpcomingEvents();

    // Revisar cada 1 minuto
    const interval = setInterval(() => {
      checkUpcomingEvents();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [checkUpcomingEvents, requestPermission]);

  return {
    requestPermission,
    showNotification,
  };
}