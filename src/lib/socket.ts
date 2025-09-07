import type { Server as IOServer } from 'socket.io';

declare global {
  // eslint-disable-next-line no-var
  var _moodmacth_io: IOServer | undefined;
}

export function getIO(): IOServer | undefined {
  return global._moodmacth_io;
}

