"use client";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef } from "react";

export function useSocket(roomId: string) {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    fetch("/api/socket/io");
    const s = io({ path: "/api/socket/io" });
    socketRef.current = s;
    s.emit("join", roomId);
    return () => {
      s.disconnect();
    };
  }, [roomId]);
  return socketRef;
}
