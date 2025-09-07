
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
type SocketServer = HTTPServer & { io?: IOServer };
export default function handler(req:NextApiRequest,res:NextApiResponse){
  const server = res.socket.server as unknown as SocketServer;
  if(!server.io){
    const io = new IOServer(server, { path:"/api/socket/io" });
    server.io = io;
    io.on("connection",(socket)=>{
      socket.on("join",(roomId:string)=> socket.join(String(roomId)));
      socket.on("broadcast",(msg:any)=>{ io.to(String(msg.conversationId)).emit("message", msg); });
      socket.on("typing",(p:{conversationId:string|number; userId:string|number})=>{
        socket.to(String(p.conversationId)).emit("typing",{ userId:String(p.userId) });
      });
    });
  }
  res.end();
}
export const config = { api: { bodyParser: false } };

