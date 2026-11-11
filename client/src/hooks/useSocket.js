import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Manages a room-scoped Socket.io connection for real-time code and language sync.
 *
 * @param {string} roomId
 * @param {(code: string) => void} onCodeUpdate
 * @param {(language: string) => void} onLanguageUpdate
 */
export function useSocket(roomId, onCodeUpdate, onLanguageUpdate) {
  const socketRef = useRef(null);
  // Prevents re-emitting remote code updates when Monaco fires onChange after controlled value updates.
  const isRemoteUpdate = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  // Store latest handlers in refs so callback identity changes do not cycle the socket connection.
  const onCodeUpdateRef = useRef(onCodeUpdate);
  const onLanguageUpdateRef = useRef(onLanguageUpdate);

  useEffect(() => {
    onCodeUpdateRef.current = onCodeUpdate;
    onLanguageUpdateRef.current = onLanguageUpdate;
  });

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { roomId });
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.warn(`[Socket.io] Disconnected from room "${roomId}":`, reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket.io] Connection error:', err.message);
    });

    socket.on('code-update', (data) => {
      const newCode = typeof data === 'object' && data !== null ? data.code : data;

      if (typeof newCode === 'string') {
        isRemoteUpdate.current = true;
        if (onCodeUpdateRef.current) {
          onCodeUpdateRef.current(newCode);
        }
      }
    });

    socket.on('language-update', (data) => {
      const newLanguage = typeof data === 'object' && data !== null ? data.language : data;

      // Do not set isRemoteUpdate here: controlled <select> elements do not fire onChange
      // on prop updates, so leaving the flag true would swallow the next local editor keystroke.
      if (typeof newLanguage === 'string' && onLanguageUpdateRef.current) {
        onLanguageUpdateRef.current(newLanguage);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('code-update');
      socket.off('language-update');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [roomId]);

  const emitCodeChange = useCallback((code) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('code-change', {
        roomId,
        code,
      });
    }
  }, [roomId]);

  const emitLanguageChange = useCallback((language) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('language-change', {
        roomId,
        language,
      });
    }
  }, [roomId]);

  return {
    emitCodeChange,
    emitLanguageChange,
    isRemoteUpdate,
    isConnected,
  };
}

export default useSocket;
