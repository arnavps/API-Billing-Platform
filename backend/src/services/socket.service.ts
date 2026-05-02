import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

export class SocketService {
  private static io: Server;

  public static init(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        (socket as any).userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      console.log(`User connected to socket: ${userId}`);
      socket.join(`user:${userId}`);

      socket.on('disconnect', () => {
        console.log(`User disconnected from socket: ${userId}`);
      });
    });

    return this.io;
  }

  public static emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  public static emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}
