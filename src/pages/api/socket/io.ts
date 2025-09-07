import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';
import { Server } from 'socket.io';

type ResWithSocket = NextApiResponse & { socket: any };

export const config = {
  api: { bodyParser: false }
};

export default function handler(req: NextApiRequest, res: ResWithSocket) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket/io',
      cors: { origin: '*', methods: ['GET','POST'] }
    });
    (global as any)._moodmacth_io = io;

    io.on('connection', (socket) => {
      socket.on('join', (room: string) => {
        socket.join(room);
      });
    });
    res.socket.server.io = io;
  }
  res.end();
}

