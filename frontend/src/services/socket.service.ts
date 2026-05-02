import { io, Socket } from 'socket.io-client';
import { useNotificationStore } from '../store/useNotificationStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class SocketService {
  private static socket: Socket | null = null;

  public static connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('notification', (data) => {
      console.log('New notification received:', data);
      useNotificationStore.getState().addNotification(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  public static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public static on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  public static off(event: string, callback: (data: any) => void): void {
    this.socket?.off(event, callback);
  }
}
