import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useRealtimeStore } from '../store/useRealtimeStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, user } = useAuthStore();
  const { addRequest, addAlert, updateRequestsPerMinute } = useRealtimeStore();

  useEffect(() => {
    if (!accessToken || !user) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Join user room
      newSocket.emit('join', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setIsConnected(false);
    });

    // Event listeners
    newSocket.on('new_request', (data) => {
      addRequest(data);
    });

    newSocket.on('rate_limit_hit', (data) => {
      addAlert({
        type: 'warning',
        title: 'Rate Limit Exceeded',
        message: `API "${data.apiName}" has hit its rate limit.`,
      });
    });

    newSocket.on('quota_warning', (data) => {
      addAlert({
        type: 'warning',
        title: 'Quota Warning',
        message: `API "${data.apiName}" has used ${data.percentage.toFixed(1)}% of its quota.`,
      });
    });

    newSocket.on('api_error', (data) => {
      addAlert({
        type: 'error',
        title: 'API Error',
        message: `Error in "${data.apiName}": ${data.error}`,
      });
    });

    setSocket(newSocket);

    // Update RPM buckets every second to slide the window
    const rpmInterval = setInterval(() => {
      updateRequestsPerMinute();
    }, 1000);

    return () => {
      clearInterval(rpmInterval);
      newSocket.close();
    };
  }, [accessToken, user, addRequest, addAlert, updateRequestsPerMinute]);

  return { socket, isConnected };
}
