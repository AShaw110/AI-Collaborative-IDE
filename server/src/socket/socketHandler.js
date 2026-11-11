/**
 * Registers Socket.io room join and real-time editor broadcast handlers.
 *
 * @param {import('socket.io').Server} io
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('join-room', (payload) => {
      // Accept both `{ roomId }` objects and raw roomId strings from clients.
      const roomId = typeof payload === 'object' && payload !== null ? payload.roomId : payload;

      if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
        console.warn(`[Socket.io] Client ${socket.id} attempted to join invalid room:`, payload);
        return;
      }

      const cleanRoomId = roomId.trim();
      socket.join(cleanRoomId);
      console.log(`[Socket.io] Socket ${socket.id} joined room '${cleanRoomId}'`);

      socket.emit('room-joined', {
        roomId: cleanRoomId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('code-change', (data) => {
      if (!data || typeof data !== 'object') return;

      const { roomId, code } = data;
      if (!roomId || typeof roomId !== 'string' || typeof code !== 'string') {
        return;
      }

      // Broadcast only to peers (excluding sender) to prevent cursor jumps and echo loops.
      socket.to(roomId).emit('code-update', {
        code,
        senderId: socket.id,
        timestamp: Date.now()
      });
    });

    socket.on('language-change', (data) => {
      if (!data || typeof data !== 'object') return;

      const { roomId, language } = data;
      if (!roomId || typeof roomId !== 'string' || typeof language !== 'string') {
        return;
      }

      socket.to(roomId).emit('language-update', {
        language,
        senderId: socket.id
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket.io] Socket ${socket.id} error:`, err);
    });
  });
};

module.exports = {
  initializeSocket
};
