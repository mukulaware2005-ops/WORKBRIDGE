import { useEffect, useRef } from 'react';

const WS_BASE_URL = 'ws://127.0.0.1:8000/ws/bookings/';

export function useBookingSocket({ onBookingUpdate, onNotification } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('workbridge_access_token');
    if (!token) return;

    const socket = new WebSocket(`${WS_BASE_URL}?token=${token}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'booking_update') {
        onBookingUpdate?.(message.data);
      } else if (message.type === 'notification') {
        onNotification?.(message.data);
      }
    };

    socket.onerror = (err) => console.error('Booking socket error:', err);

    return () => socket.close();
  }, [onBookingUpdate, onNotification]);

  return socketRef;
}