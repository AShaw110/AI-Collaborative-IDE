import React, { useState, useRef, useEffect } from 'react';

export default function Toolbar({
  language = 'javascript',
  onLanguageChange,
  onRun,
  onDebug,
  isRunning = false,
  isDebugging = false,
  roomId = '',
}) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyRoomId = async () => {
    if (!roomId) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomId);
      } else {
        // Fallback for non-HTTPS or legacy browser contexts without Clipboard API.
        const textarea = document.createElement('textarea');
        textarea.value = roomId;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to copy Room ID:', err);
    }
  };

  return (
    <nav
      aria-label="Editor toolbar"
      className="w-full bg-neutral-900 border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none z-10"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
            &lt;/&gt;
          </div>
          <span className="font-semibold text-sm tracking-wide text-white hidden sm:inline">
            CollabCode
          </span>
        </div>

        {roomId && (
          <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700/80 rounded-md px-2.5 py-1 text-xs">
            <span className="text-neutral-400">Room:</span>
            <span className="font-mono text-neutral-200 font-medium max-w-[120px] sm:max-w-none truncate">
              {roomId}
            </span>
            <button
              type="button"
              onClick={handleCopyRoomId}
              aria-label={copied ? 'Room ID copied to clipboard' : 'Copy Room ID to clipboard'}
              className="ml-1 p-1 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Copy Room ID"
            >
              {copied ? (
                <svg
                  className="w-3.5 h-3.5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>

            <span role="status" aria-live="polite" className="sr-only">
              {copied ? 'Room ID copied to clipboard' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        <div className="flex items-center gap-2">
          <label
            htmlFor="language-select"
            className="text-xs text-neutral-400 font-medium hidden sm:inline"
          >
            Language:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            aria-label="Select programming language"
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-md px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="cpp">C++ (G++ 17)</option>
            <option value="python">Python 3</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onDebug}
          disabled={isDebugging}
          aria-disabled={isDebugging}
          aria-busy={isDebugging}
          aria-label="Analyze code with AI Debugger"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {isDebugging ? (
            <>
              <svg
                className="w-3.5 h-3.5 animate-spin text-purple-300"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>AI Debug</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          aria-disabled={isRunning}
          aria-busy={isRunning}
          aria-label="Execute code on server"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
        >
          {isRunning ? (
            <>
              <svg
                className="w-3.5 h-3.5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Running...</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5 fill-current"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M4.5 3.5v13l11-6.5-11-6.5z" />
              </svg>
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
