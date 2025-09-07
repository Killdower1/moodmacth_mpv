
"use client";
import { io } from "socket.io-client";
import { useEffect, useRef } from "react";

export function useSocket(roomId: string | number) {
  const ref = useRef<ReturnType<typeof io> | null>(null);
  useEffect(() => {
    // Init the server side
    fetch("/api/socket/io");
    const s = io({ path: "/api/socket/io" });
    ref.current = s;
    s.emit("join", String(roomId));
    return () => { s.disconnect(); };
  }, [roomId]);
  return ref;
}
