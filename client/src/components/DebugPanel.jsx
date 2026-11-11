import React from 'react';

export default function DebugPanel({
  hints = '',
  isDebugging = false,
  onClose,
}) {
  if (!hints && !isDebugging) {
    return null;
  }

  return (
    <aside
      role="complementary"
      aria-label="AI debugging hints"
      aria-live="polite"
      className="flex flex-col bg-neutral-900 border-t border-purple-500/20 max-h-72 lg:max-h-80 shrink-0 text-xs overflow-hidden transition-all duration-300 ease-in-out"
    >
      <div className="h-8 bg-neutral-900 border-b border-purple-500/20 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
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
          <span className="font-semibold text-purple-300 uppercase tracking-wider text-[11px]">
            AI Debugger Diagnostics
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close debug panel"
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition focus:outline-none focus:ring-1 focus:ring-purple-500"
            title="Close"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-3.5 overflow-y-auto space-y-2.5">
        {isDebugging ? (
          <div
            role="status"
            aria-label="AI model analyzing code"
            className="flex items-center gap-3 text-purple-300 py-3"
          >
            <svg
              className="w-4 h-4 animate-spin text-purple-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs">Analyzing code for bugs and edge cases...</span>
          </div>
        ) : (
          <div className="text-neutral-200 leading-relaxed font-sans text-xs whitespace-pre-wrap break-words selection:bg-purple-900 selection:text-purple-100">
            {hints}
          </div>
        )}
      </div>
    </aside>
  );
}
