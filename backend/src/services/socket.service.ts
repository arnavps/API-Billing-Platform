import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private static io: Server;

  static init(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Users should join a room based on their userId to receive specific updates
      socket.on('join', (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return this.io;
  }

  /**
   * Broadcast a real-time event to a specific user
   */
  static emitToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(userId.toString()).emit(event, data);
    }
  }

  /**
   * Broadcast a real-time event to all connected clients
   */
  static emitAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}
