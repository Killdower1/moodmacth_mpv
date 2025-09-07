import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
import { prisma } from "@/lib/prisma";

type SocketServer = HTTPServer & { io?: IOServer };

declare global {
  // eslint-disable-next-line no-var
  var _moodmacth_io: IOServer | undefined;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const server = res.socket.server as unknown as SocketServer;
  if (!server.io) {
    const io = new IOServer(server, { path: "/api/socket/io" });
    server.io = io;
    global._moodmacth_io = io;

    io.on("connection", (socket) => {
      socket.on("join", (roomId: string) => socket.join(roomId));

      socket.on("message", async (payload: { conversationId: string; senderId: string; text: string }) => {
        try {
          const msg = await prisma.message.create({
            data: {
              conversationId: payload.conversationId,
              senderId: payload.senderId,
              text: payload.text,
            },
            include: { sender: { select: { id: true, name: true } } },
          });
          io.to(payload.conversationId).emit("message", msg);
        } catch (e) {
          console.error("socket message error", e);
        }
      });
    });
  }
  res.end();
}
export const config = { api: { bodyParser: false } };
