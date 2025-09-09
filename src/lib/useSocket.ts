"use client";

export type SocketRef = { current: any; connected?: boolean };

/** Stub: terima roomId opsional, kembalikan objek mirip useRef */
export function useSocket(_roomId?: string): SocketRef {
  return { current: null, connected: false };
}
