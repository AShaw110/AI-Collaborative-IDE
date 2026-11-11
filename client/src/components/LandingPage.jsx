import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerateRandomId = () => {
    const randomId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).substring(2, 10);

    setRoomId(randomId);
    setError('');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();

    const trimmed = roomId.trim();

    if (!trimmed) {
      setError('Please enter a valid room ID or click "Generate ID".');
      return;
    }

    // Restrict characters so the room ID maps safely to a single URL path segment.
    if (!/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
      setError('Room ID may only contain letters, numbers, hyphens, and underscores.');
      return;
    }

    setError('');
    navigate(`/editor/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-neutral-950">
      <section
        aria-labelledby="landing-heading"
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600/10 text-blue-500 mb-2 border border-blue-500/20">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>

          <h1
            id="landing-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
          >
            CollabCode
          </h1>
          <p className="text-sm text-neutral-400">
            Real-time multi-user collaborative code editor with instant remote execution
            and AI diagnostic assistance.
          </p>
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="room-id-input"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-300"
            >
              Room Identifier
            </label>

            <input
              id="room-id-input"
              type="text"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. algorithm-study-group"
              aria-label="Room Identifier"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'room-id-error' : 'room-id-description'}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            <p id="room-id-description" className="text-xs text-neutral-500">
              Share this ID with teammates to collaborate in real-time.
            </p>

            {error && (
              <div
                id="room-id-error"
                role="alert"
                aria-live="assertive"
                className="mt-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 shrink-0 text-rose-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={handleGenerateRandomId}
              aria-label="Generate a random room identifier"
              className="flex-1 px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700 text-neutral-200 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Generate ID
            </button>

            <button
              type="submit"
              aria-label="Join or create collaborative room"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium shadow-md shadow-blue-600/20 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              Join Room
            </button>
          </div>
        </form>

        <div className="border-t border-neutral-800 pt-4 grid grid-cols-3 text-center text-[11px] text-neutral-400">
          <div>Real-time Sync</div>
          <div>Multi-Language</div>
          <div>AI Debugger</div>
        </div>
      </section>
    </div>
  );
}
